import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { plainToClass } from "class-transformer";
import { ActionDto } from "../dtos/action.dto";
import { DataResponseMessageDto } from "../dtos/data.response.message";
import { DocumentEntityDto } from "../dtos/document.entity.dto";
import { ActionEntity } from "../entities/action.entity";
import { KpiEntity } from "../entities/kpi.entity";
import { LogEntity } from "../entities/log.entity";
import { User } from "../entities/user.entity";
import { CounterType } from "../enums/counter.type.enum";
import { EntityType, LogEventType } from "../enums/shared.enum";
import { CounterService } from "../util/counter.service";
import { HelperService } from "../util/helpers.service";
import { EntityManager, Repository } from "typeorm";
import { FileUploadService } from "../util/fileUpload.service";
import { PayloadValidator } from "../validation/payload.validator";
import { ProgrammeEntity } from "../entities/programme.entity";
import { QueryDto } from "../dtos/query.dto";
import { DataListResponseDto } from "../dtos/data.list.response";
import { ActionViewEntity } from "../entities/action.view.entity";
import { ActivityEntity } from "../entities/activity.entity";
import { LinkUnlinkService } from "../util/linkUnlink.service";
import { ActionUpdateDto } from "../dtos/actionUpdate.dto";
import { KpiService } from "../kpi/kpi.service";
import { AchievementEntity } from "../entities/achievement.entity";
import { ValidateDto } from "../dtos/validate.dto";
import { ProjectEntity } from "../entities/project.entity";
import { KPIAction } from "../enums/shared.enum";
import { DeleteDto } from "../dtos/delete.dto";
import { Role } from "../casl/role.enum";

@Injectable()
export class ActionService {
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		@InjectRepository(ActionEntity) private actionRepo: Repository<ActionEntity>,
		@InjectRepository(ProgrammeEntity) private programmeRepo: Repository<ProgrammeEntity>,
		@InjectRepository(ProjectEntity) private projectRepo: Repository<ProjectEntity>,
		@InjectRepository(ActivityEntity) private activityRepo: Repository<ActivityEntity>,
		private counterService: CounterService,
		private helperService: HelperService,
		private fileUploadService: FileUploadService,
		private payloadValidator: PayloadValidator,
		private linkUnlinkService: LinkUnlinkService,
		private kpiService: KpiService,
		@InjectRepository(ActionViewEntity) private actionViewRepo: Repository<ActionViewEntity>,
	) { }

	async createAction(actionDto: ActionDto, user: User) {

		const action: ActionEntity = plainToClass(ActionEntity, actionDto);
		const eventLog = [];

		if (!this.helperService.doesUserHaveSectorPermission(user, action.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.cannotCreateNotRelatedAction",
					[action.actionId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		action.actionId = 'A' + await this.counterService.incrementCount(CounterType.ACTION, 3);

		// Checking for programmes having a  parent
		let programmes: ProgrammeEntity[];
		if (actionDto.linkedProgrammes) {
			programmes = await this.linkUnlinkService.findAllProgrammeByIds(actionDto.linkedProgrammes);
			for (const programme of programmes) {
				if (programme.action) {
					throw new HttpException(
						this.helperService.formatReqMessagesString(
							"action.programmeAlreadyLinked",
							[programme.programmeId]
						),
						HttpStatus.BAD_REQUEST
					);
				}
			}
		}

		// upload the documents and create the doc array here
		if (actionDto.documents) {
			const documents = [];
			for (const documentItem of actionDto.documents) {
				const response = await this.fileUploadService.uploadDocument(documentItem.data, documentItem.title, EntityType.ACTION);
				const docEntity = new DocumentEntityDto();
				docEntity.title = documentItem.title;
				docEntity.url = response;
				docEntity.createdTime = new Date().getTime();
				documents.push(docEntity)
			};
			action.documents = documents;

		}
		// Add event log entry
		this.addEventLogEntry(eventLog, LogEventType.ACTION_CREATED, EntityType.ACTION, action.actionId, user.id, actionDto);

		const kpiList = [];
		if (actionDto.kpis) {
			for (const kpiItem of actionDto.kpis) {
				this.payloadValidator.validateKpiPayload(kpiItem, EntityType.ACTION);
				const kpi: KpiEntity = plainToClass(KpiEntity, kpiItem);
				kpi.kpiId = parseInt(await this.counterService.incrementCount(CounterType.KPI, 3));
				kpi.creatorId = action.actionId;
				kpi.expected = parseFloat(kpiItem.expected.toFixed(2));
				kpiList.push(kpi);
			}
			// Add event log entry after the loop completes
			this.addEventLogEntry(eventLog, LogEventType.KPI_ADDED, EntityType.ACTION, action.actionId, user.id, kpiList);
		}

		const act = await this.entityManager
			.transaction(async (em) => {
				const savedAction = await em.save<ActionEntity>(action);
				if (savedAction) {
					await em.save<LogEntity>(eventLog);
					// link programmes here
					if (programmes && programmes.length > 0) {
						await this.linkUnlinkService.linkProgrammesToAction(savedAction, programmes, action.actionId, user, em);
					}

					if (actionDto.kpis) {
						await em.save<KpiEntity>(kpiList);
					}
				}
				return savedAction;
			})
			.catch((err: any) => {
				console.log(err);
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"action.actionCreationFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		await this.helperService.refreshMaterializedViews(this.entityManager);

		return new DataResponseMessageDto(
			HttpStatus.CREATED,
			this.helperService.formatReqMessagesString("action.createActionSuccess", []),
			act
		);

	}

	async findActionById(actionId: string) {
		return await this.actionRepo.findOneBy({
			actionId
		})
	}

	async findActionByIdWithAllLinkedChildren(actionId: string) {
		return await this.actionRepo.createQueryBuilder('action')
		.leftJoinAndSelect('action.programmes', 'programme')
		.leftJoinAndSelect('programme.projects', 'project')
		.leftJoinAndMapMany(
			"action.activities",
			ActivityEntity,
			"actionActivity", // Unique alias for action activities
			"actionActivity.parentType = :action AND actionActivity.parentId = :actionId",
			{ action: EntityType.ACTION, actionId }
		)
		.leftJoinAndMapMany(
			"programme.activities",
			ActivityEntity,
			"programmeActivity", // Unique alias for programme activities
			"programmeActivity.parentType = :programme AND programmeActivity.parentId = programme.programmeId",
			{ programme: EntityType.PROGRAMME }
		)
		.leftJoinAndMapMany(
			"project.activities",
			ActivityEntity,
			"projectActivity", // Unique alias for project activities
			"projectActivity.parentType = :project AND projectActivity.parentId = project.projectId",
			{ project: EntityType.PROJECT }
		)
		.where('action.actionId = :actionId', { actionId })
		.getOne();
	}

	async findAllActionsForAttaching() {
		const allActions = await this.actionRepo.find({
			select: ["actionId", "title", "instrumentType", "sector", "type"],
			order: {
				actionId: "ASC"
			}
		});

		if (allActions.length === 0){
			return [];
		}
	
		const actionIds = allActions.map(action => action.actionId);
	
		const programmeCounts = await this.programmeRepo
			.createQueryBuilder("programme")
			.select("programme.actionId", "actionId")
			.addSelect("COUNT(*)", "count")
			.where("programme.actionId IN (:...actionIds)", { actionIds })
			.groupBy("programme.actionId")
			.getRawMany();
	
		const activityCounts = await this.activityRepo
			.createQueryBuilder("activity")
			.select("activity.parentId", "parentId")
			.addSelect("COUNT(*)", "count")
			.where("activity.parentId IN (:...actionIds)", { actionIds })
			.groupBy("activity.parentId")
			.getRawMany();
	
		const programmeCountMap = new Map(programmeCounts.map(pc => [pc.actionId, parseInt(pc.count, 10)]));
		const activityCountMap = new Map(activityCounts.map(ac => [ac.parentId, parseInt(ac.count, 10)]));
	
		const attachingActionsDto = allActions.map(action => {
			const countOfChildProgrammes = programmeCountMap.get(action.actionId) || 0;
			const countOfChildActivities = activityCountMap.get(action.actionId) || 0;
	
			return {
				...action,
				hasChildProgrammes: countOfChildProgrammes > 0,
				hasChildActivities: countOfChildActivities > 0,
			};
		});
	
		return attachingActionsDto;
	}
	

	async findActionViewById(actionId: string) {
		return await this.actionViewRepo.findOneBy({
			id: actionId
		})
	}

	// adding find method to action service to avoid a circular dependency with programme service


	async findAllActionChildren(actionId: string) {

		let haveChildren: boolean = false;

		const programmeChildren: ProgrammeEntity[] =
			await this.programmeRepo.createQueryBuilder('programme')
				.where('programme.actionId = :actionId', { actionId })
				.getMany();

		const projectChildren: ProjectEntity[] =
			await this.projectRepo.createQueryBuilder('project')
				.where("subpath(project.path, 0, 1) = :actionId", { actionId })
				.getMany();

		const activityChildren: ActivityEntity[] =
			await this.activityRepo.createQueryBuilder('activity')
				.leftJoinAndSelect('activity.support', 'support')
				.where("subpath(activity.path, 0, 1) = :actionId", { actionId })
				.getMany();

		haveChildren = (programmeChildren.length > 0) || (projectChildren.length > 0) || (activityChildren.length > 0) ? true : false;

		return { haveChildren: haveChildren, programmeChildren: programmeChildren, projectChildren: projectChildren, activityChildren: activityChildren };
	}

	async getActionViewData(actionId: string) {

		const queryBuilder = this.actionRepo
			.createQueryBuilder("action")
			.where('action.actionId = :actionId', { actionId })
			.leftJoinAndMapOne(
				"action.migratedData",
				ActionViewEntity,
				"actionViewEntity",
				"actionViewEntity.id = action.actionId"
			);
		const result = await queryBuilder.getOne();

		if (!result) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.programmesNotFound",
					[]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		return result;

	}

	async query(query: QueryDto, abilityCondition: string): Promise<any> {
		// Subquery to get distinct action IDs
		const subQuery = this.actionRepo
			.createQueryBuilder("action")
			.select("action.actionId")
			.where(
				this.helperService.generateWhereSQL(
					query,
					this.helperService.parseMongoQueryToSQLWithTable(
						'"action"',
						abilityCondition
					),
					'"action"'
				)
			)
			.orderBy(
				query?.sort?.key ? `"action"."${query?.sort?.key}"` : `"action"."actionId"`,
				query?.sort?.order ? query?.sort?.order : "DESC"
			);

		if (query.size && query.page) {
			subQuery.offset(query.size * query.page - query.size)
				.limit(query.size);
		}

		// Main query to join with the subquery
		const queryBuilder = this.actionRepo
			.createQueryBuilder("action")
			.where(`action.actionId IN (${subQuery.getQuery()})`)
			.leftJoinAndSelect('action.programmes', 'programme')
			.leftJoinAndMapMany(
				"action.migratedData",
				ActionViewEntity,
				"actionViewEntity",
				"actionViewEntity.id = action.actionId"
			)
			.orderBy(
				query?.sort?.key ? `"action"."${query?.sort?.key}"` : `"action"."actionId"`,
				query?.sort?.order ? query?.sort?.order : "DESC"
			);

		const resp = await queryBuilder.getManyAndCount();
		const totalCount = await subQuery.getCount();

		return new DataListResponseDto(
			resp.length > 0 ? resp[0] : undefined,
			totalCount
		);
	}

	async updateAction(actionUpdateDto: ActionUpdateDto, user: User) {
		const actionUpdate: ActionEntity = plainToClass(ActionEntity, actionUpdateDto);
		const eventLog = [];

		this.addEventLogEntry(eventLog, LogEventType.ACTION_UPDATED, EntityType.ACTION, actionUpdate.actionId, user.id, actionUpdateDto);

		const currentAction = await this.findActionById(actionUpdateDto.actionId);
		if (!currentAction) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"action.actionNotFound",
					[actionUpdateDto.actionId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (!this.helperService.doesUserHaveSectorPermission(user, currentAction.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"action.permissionDeniedForSector",
					[currentAction.actionId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		if (!this.helperService.doesUserHaveSectorPermission(user, actionUpdate.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"action.permissionDeniedForSector",
					[currentAction.actionId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		// setting action to pending (Non-Validated) state
		if (currentAction.validated) {
			actionUpdate.validated = false;
			this.addEventLogEntry(eventLog, LogEventType.ACTION_UNVERIFIED_DUE_UPDATE, EntityType.ACTION, actionUpdate.actionId, 0, actionUpdateDto);
		}

		// Finding children to update their sector value
		const children = await this.findAllActionChildren(actionUpdateDto.actionId);

		// add new documents
		if (actionUpdateDto.newDocuments) {
			const documents = [];
			for (const documentItem of actionUpdateDto.newDocuments) {
				const response = await this.fileUploadService.uploadDocument(documentItem.data, documentItem.title, EntityType.ACTION);
				const docEntity = new DocumentEntityDto();
				docEntity.title = documentItem.title;
				docEntity.url = response;
				docEntity.createdTime = new Date().getTime();
				documents.push(docEntity)
			};

			if (currentAction.documents) {
				actionUpdate.documents = actionUpdate.documents ? [...actionUpdate.documents, ...currentAction.documents] : [...currentAction.documents];
			} else if (actionUpdate.documents) {
				actionUpdate.documents = [...actionUpdate.documents];
			}

			if (documents) {
				actionUpdate.documents = actionUpdate.documents ? [...actionUpdate.documents, ...documents] : [...documents];
			}

		}

		// remove documents
		if (actionUpdateDto.removedDocuments && actionUpdateDto.removedDocuments.length > 0) {

			if (!currentAction.documents || currentAction.documents.length < 0) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"action.noDocumentsFound",
						[actionUpdateDto.actionId]
					),
					HttpStatus.BAD_REQUEST
				);
			}

			actionUpdate.documents = actionUpdate.documents ? actionUpdate.documents : currentAction.documents
			const updatedDocs = actionUpdate.documents.filter(item => !actionUpdateDto.removedDocuments.some(url => url === item.url));
			actionUpdate.documents = (updatedDocs && updatedDocs.length > 0) ? updatedDocs : null;
		}

		const kpiList = [];
		const kpisToRemove = [];
		const achievementsToRemove = [];

		const currentKpis = await this.kpiService.getKpisByCreatorTypeAndCreatorId(EntityType.ACTION, actionUpdate.actionId);

		if (actionUpdateDto.kpis && actionUpdateDto.kpis.length > 0) {

			const addedKpis = actionUpdateDto.kpis.filter(kpi => !kpi.kpiId);

			if (addedKpis && addedKpis.length > 0) {
				for (const kpiItem of addedKpis) {
					this.payloadValidator.validateKpiPayload(kpiItem, EntityType.ACTION);
					const kpi: KpiEntity = plainToClass(KpiEntity, kpiItem);
					kpi.kpiId = parseInt(await this.counterService.incrementCount(CounterType.KPI, 3));
					kpi.creatorId = actionUpdateDto.actionId;
					kpi.expected = parseFloat(kpiItem.expected.toFixed(2));
					kpiList.push(kpi);
				}
			}

			for (const currentKpi of currentKpis) {
				const kpiToUpdate = actionUpdateDto.kpis.find(kpi => currentKpi.kpiId == kpi.kpiId);
				if (kpiToUpdate) {
					this.payloadValidator.validateKpiPayload(kpiToUpdate, EntityType.ACTION);
					const kpi = new KpiEntity();
					kpi.kpiId = kpiToUpdate.kpiId;
					kpi.creatorId = kpiToUpdate.creatorId;
					kpi.creatorType = kpiToUpdate.creatorType;
					kpi.name = kpiToUpdate.name;
					kpi.expected = parseFloat(kpiToUpdate.expected.toFixed(2));
					kpi.kpiUnit = kpiToUpdate.kpiUnit;
					kpiList.push(kpi);
				} else {
					kpisToRemove.push(currentKpi);
				}
			}
		}

		if (actionUpdateDto.kpis && actionUpdateDto.kpis.length <= 0) {
			kpisToRemove.push(...currentKpis);
		}

		if (kpisToRemove.length > 0) {
			const kpiIdsToRemove = kpisToRemove.map(kpi => kpi.kpiId);
			const achievements = await this.kpiService.findAchievementsByKpiIds(kpiIdsToRemove);

			if (achievements && achievements.length > 0) {
				achievementsToRemove.push(...achievements);
			}
		}

		if (actionUpdateDto.kpis && actionUpdateDto.kpis.some(kpi => kpi.kpiAction === KPIAction.UPDATED)) {
			// Add event log entry after the loop completes
			this.addEventLogEntry(eventLog, LogEventType.KPI_UPDATED, EntityType.ACTION, actionUpdateDto.actionId, user.id, kpiList);
		}

		if (actionUpdateDto.kpis && actionUpdateDto.kpis.some(kpi => kpi.kpiAction === KPIAction.CREATED)) {
			// Add event log entry after the loop completes
			this.addEventLogEntry(eventLog, LogEventType.KPI_ADDED, EntityType.ACTION, actionUpdateDto.actionId, user.id, kpiList);
		}

		const act = await this.entityManager
			.transaction(async (em) => {
				const savedAction = await em.save<ActionEntity>(actionUpdate);
				if (savedAction) {
					// Update children sector
					if (children.haveChildren && (actionUpdate.sector !== currentAction.sector)) {
						await this.linkUnlinkService.updateActionChildrenSector(actionUpdate.actionId, children, actionUpdate.sector, em);
					} else {
						await this.linkUnlinkService.updateAllValidatedChildrenStatusByActionId(actionUpdate.actionId, em);
					}

					// Save new KPIs
					if (kpiList.length > 0) {
						await em.save<KpiEntity>(kpiList);
					}
					// Remove KPIs
					if (kpisToRemove.length > 0) {
						await em.remove<AchievementEntity>(achievementsToRemove);
						await em.remove<KpiEntity>(kpisToRemove);
					}
					// Save event logs
					if (eventLog.length > 0) {
						await em.save<LogEntity>(eventLog);
					}
				}
				return savedAction;
			})
			.catch((err: any) => {
				console.log(err);
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"action.actionUpdateFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		await this.helperService.refreshMaterializedViews(this.entityManager);

		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("action.updateActionSuccess", []),
			act
		);
	}

	//MARK: Delete Action
	async deleteAction(deleteDto: DeleteDto, user: User) {
		if (user.role !== Role.Admin && user.role !== Role.Root) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"user.userUnAUth",
					[]
				),
				HttpStatus.FORBIDDEN
			);
		}

		const action = await this.findActionByIdWithAllLinkedChildren(deleteDto.entityId);
		if (!action) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"action.actionNotFound",
					[deleteDto.entityId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (!this.helperService.doesUserHaveSectorPermission(user, action.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"action.permissionDeniedForSector",
					[action.actionId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		const actionKPIs = await this.kpiService.getKpisByCreatorTypeAndCreatorId(EntityType.ACTION, action.actionId);

		const actionKpiIds = actionKPIs?.map(kpi => kpi.kpiId);

		const linkedActivityIds = action.activities?.map(activity => activity.activityId);


		const act = await this.entityManager
			.transaction(async (em) => {

				// related parent and children entity un-validation happens when projects are unlinking
				await this.linkUnlinkService.unlinkProgrammesFromAction(action.programmes, action, action.actionId, user, this.entityManager, [], true);
				const result = await em.delete<ActionEntity>(ActionEntity, action.actionId);

				if (result.affected > 0) {
					if (linkedActivityIds && linkedActivityIds.length > 0) {
						await em.delete<ActivityEntity>(ActivityEntity, linkedActivityIds);
					}

					if (actionKpiIds && actionKpiIds.length > 0) {
						await em.delete<KpiEntity>(KpiEntity, actionKpiIds);
					}
				}
				return result;
			})
			.catch((err: any) => {
				console.log(err);
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"action.actionDeletionFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("action.deleteActionSuccess", []),
			null
		);

	}

	async validateAction(validateDto: ValidateDto, user: User) {

		this.helperService.doesUserHaveValidatePermission(user);

		const action = await this.findActionById(validateDto.entityId);
		if (!action) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"action.actionNotFound",
					[validateDto.entityId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (!this.helperService.doesUserHaveSectorPermission(user, action.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"action.permissionDeniedForSector",
					[action.actionId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		action.validated = validateDto.validateStatus;
		const eventLog = this.buildLogEntity(
			(validateDto.validateStatus) ? LogEventType.ACTION_VERIFIED : LogEventType.ACTION_UNVERIFIED,
			EntityType.ACTION,
			action.actionId,
			user.id,
			validateDto
		);

		const act = await this.entityManager
			.transaction(async (em) => {
				const savedAction = await em.save<ActionEntity>(action);
				if (savedAction) {
					if (!validateDto.validateStatus) {
						await this.linkUnlinkService.updateAllValidatedChildrenStatusByActionId(action.actionId, em);
					}
					// Save event logs
					await em.save<LogEntity>(eventLog);
				}
				return savedAction;
			})
			.catch((err: any) => {
				console.log(err);
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"action.actionVerificationFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString((validateDto.validateStatus) ? "action.verifyActionSuccess" : "action.unverifyActionSuccess" , []),
			act
		);

	}

	private addEventLogEntry = (
		eventLog: any[],
		eventType: LogEventType,
		recordType: EntityType,
		recordId: any,
		userId: number,
		data: any) => {
		eventLog.push(
			this.buildLogEntity(
				eventType,
				recordType,
				recordId,
				userId,
				data));
		return eventLog;
	}

	private buildLogEntity = (
		eventType: LogEventType,
		recordType: EntityType,
		recordId: any,
		userId: number,
		data: any) => {
		const log = new LogEntity();
		log.eventType = eventType;
		log.recordType = recordType;
		log.recordId = recordId;
		log.userId = userId;
		log.logData = data;
		return log;
	}
}