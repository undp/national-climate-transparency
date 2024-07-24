import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { CounterService } from "../util/counter.service";
import { HelperService } from "../util/helpers.service";
import { EntityManager, Repository } from "typeorm";
import { ProgrammeDto } from "../dtos/programme.dto";
import { User } from "../entities/user.entity";
import { plainToClass } from "class-transformer";
import { ProgrammeEntity } from "../entities/programme.entity";
import { CounterType } from "../enums/counter.type.enum";
import { FileUploadService } from "../util/fileUpload.service";
import { DocumentEntityDto } from "../dtos/document.entity.dto";
import { EntityType, IntImplementor, KPIAction, LogEventType, Recipient } from "../enums/shared.enum";
import { LogEntity } from "../entities/log.entity";
import { KpiEntity } from "../entities/kpi.entity";
import { PayloadValidator } from "../validation/payload.validator";
import { DataResponseMessageDto } from "../dtos/data.response.message";
import { ActionService } from "../action/action.service";
import { LinkProgrammesDto } from "../dtos/link.programmes.dto";
import { UnlinkProgrammesDto } from "../dtos/unlink.programmes.dto";
import { QueryDto } from "../dtos/query.dto";
import { DataListResponseDto } from "../dtos/data.list.response";
import { FilterEntry } from "../dtos/filter.entry";
import { ProgrammeViewDto } from "../dtos/programme.view.dto";
import { ActivityEntity } from "../entities/activity.entity";
import { ProjectEntity } from "../entities/project.entity";
import { LinkUnlinkService } from "../util/linkUnlink.service";
import { ProgrammeViewEntity } from "../entities/programme.view.entity";
import { ProgrammeUpdateDto } from "../dtos/programmeUpdate.dto";
import { KpiService } from "../kpi/kpi.service";
import { SupportEntity } from "../entities/support.entity";
import { ValidateDto } from "../dtos/validate.dto";
import { AchievementEntity } from "../entities/achievement.entity";
import { ActionEntity } from "../entities/action.entity";
import { DeleteDto } from "../dtos/delete.dto";
import { Role } from "../casl/role.enum";

@Injectable()
export class ProgrammeService {
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		@InjectRepository(ProgrammeEntity) private programmeRepo: Repository<ProgrammeEntity>,
		@InjectRepository(ProjectEntity) private projectRepo: Repository<ProjectEntity>,
		private actionService: ActionService,
		private counterService: CounterService,
		private helperService: HelperService,
		private fileUploadService: FileUploadService,
		private payloadValidator: PayloadValidator,
		private linkUnlinkService: LinkUnlinkService,
		private kpiService: KpiService,
	) { }

	//MARK: Create Programme
	async createProgramme(programmeDto: ProgrammeDto, user: User) {

		const programme: ProgrammeEntity = plainToClass(ProgrammeEntity, programmeDto);

		const eventLog = [];

		programme.programmeId = 'P' + await this.counterService.incrementCount(CounterType.PROGRAMME, 3);
		this.addEventLogEntry(eventLog, LogEventType.PROGRAMME_CREATED, EntityType.PROGRAMME, programme.programmeId, user.id, programmeDto);

		// upload the documents and create the doc array here
		if (programmeDto.documents) {
			const documents = [];
			for (const documentItem of programmeDto.documents) {
				const response = await this.fileUploadService.uploadDocument(documentItem.data, documentItem.title, EntityType.PROGRAMME);
				const docEntity = new DocumentEntityDto();
				docEntity.title = documentItem.title;
				docEntity.url = response;
				docEntity.createdTime = new Date().getTime();
				documents.push(docEntity)
			};
			programme.documents = documents;

		}

		const kpiList = [];
		if (programmeDto.kpis) {
			for (const kpiItem of programmeDto.kpis) {
				this.payloadValidator.validateKpiPayload(kpiItem, EntityType.PROGRAMME);
				const kpi: KpiEntity = plainToClass(KpiEntity, kpiItem);
				kpi.kpiId = parseInt(await this.counterService.incrementCount(CounterType.KPI, 3));
				kpi.creatorId = programme.programmeId;
				kpi.expected = parseFloat(kpiItem.expected.toFixed(2));
				kpiList.push(kpi);
			}
			// Add event log entry after the loop completes
			this.addEventLogEntry(eventLog, LogEventType.KPI_ADDED, EntityType.PROGRAMME, programme.programmeId, user.id, kpiList);
		}

		programme.path = "";

		let action: ActionEntity;

		if (programmeDto.actionId) {
			action = await this.actionService.findActionById(programmeDto.actionId);
			if (!action) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"programme.actionNotFound",
						[programmeDto.actionId]
					),
					HttpStatus.BAD_REQUEST
				);
			}

			if (!this.helperService.doesUserHaveSectorPermission(user, action.sector)) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"programme.cannotLinkToUnrelatedAction",
						[action.actionId]
					),
					HttpStatus.FORBIDDEN
				);
			}

			programme.action = action;
			programme.path = programmeDto.actionId;
			programme.sector = action.sector;

			this.addEventLogEntry(eventLog, LogEventType.PROGRAMME_LINKED, EntityType.ACTION, action.actionId, user.id, programme.programmeId);
			this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_ACTION, EntityType.PROGRAMME, programme.programmeId, user.id, action.actionId);
		}

		// Checking for projects having a parent
		let projects: ProjectEntity[];
		if (programmeDto.linkedProjects) {
			projects = await this.findAllProjectsByIds(programmeDto.linkedProjects);
			for (const project of projects) {
				if (project.programme) {
					throw new HttpException(
						this.helperService.formatReqMessagesString(
							"programme.projectAlreadyLinked",
							[project.projectId]
						),
						HttpStatus.BAD_REQUEST
					);
				}
			}
		}

		const prog = await this.entityManager
			.transaction(async (em) => {
				const savedProgramme = await em.save<ProgrammeEntity>(programme);
				if (savedProgramme) {

					// linking projects and updating paths of projects and activities
					if (projects && projects.length > 0) {
						await this.linkUnlinkService.linkProjectsToProgramme(savedProgramme, projects, programme.programmeId, user, em);
					} else if (programmeDto.actionId && action && action.validated) {
						action.validated = false;
						this.addEventLogEntry(
							eventLog, 
							LogEventType.ACTION_UNVERIFIED_DUE_ATTACHMENT_CHANGE, 
							EntityType.ACTION, 
							action.actionId, 
							0, 
							programme.programmeId
						);
						await em.save<ActionEntity>(action)
						await this.linkUnlinkService.updateAllValidatedChildrenStatusByActionId(action.actionId, em);
					}

					await em.save<LogEntity>(eventLog);

					if (programmeDto.kpis) {
						await em.save<KpiEntity>(kpiList);
					}
				}
				return savedProgramme;
			})
			.catch((err: any) => {
				console.log(err);
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"programme.programmeCreationFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		await this.helperService.refreshMaterializedViews(this.entityManager);

		return new DataResponseMessageDto(
			HttpStatus.CREATED,
			this.helperService.formatReqMessagesString("programme.createProgrammeSuccess", []),
			prog
		);

	}

	//MARK: Get Programme View Data
	async getProgrammeViewData(programmeId: string, abilityCondition: string) {
		const filterAnd: FilterEntry[] = [];
		filterAnd.push({
			key: 'programmeId',
			operation: '=',
			value: programmeId,
		});

		const queryDto = new QueryDto();
		queryDto.filterAnd = filterAnd;

		const programme = await this.query(queryDto, abilityCondition);

		if (!programme || programme.data.length <= 0) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.programmeNotFound",
					[programmeId]
				),
				HttpStatus.NOT_FOUND
			);
		}

		return this.getProgrammeViewDto(programme.data[0]);
	}

	//MARK: Query Programme
	async query(query: QueryDto, abilityCondition: string): Promise<any> {
		// Subquery to get distinct programme IDs
		const subQuery = this.programmeRepo
        .createQueryBuilder("programme")
        .select("programme.programmeId")
        .where(
            this.helperService.generateWhereSQL(
                query,
                this.helperService.parseMongoQueryToSQLWithTable(
                    '"programme"',
                    abilityCondition
                ),
                '"programme"'
            )
        )
        .orderBy(
            query?.sort?.key ? `"programme"."${query?.sort?.key}"` : `"programme"."programmeId"`,
            query?.sort?.order ? query?.sort?.order : "DESC"
        );

    if (query.size && query.page) {
        subQuery.offset(query.size * query.page - query.size)
            .limit(query.size);
    }

    const programmeIds = await subQuery.getRawMany();
    const programmeIdsArray = programmeIds.map(item => item.programme_programmeId);

    if (programmeIdsArray.length === 0) {
        return new DataListResponseDto([], 0);
    }

		// Main query to join with the subquery
		const queryBuilder = this.programmeRepo
			.createQueryBuilder("programme")
			.where("programme.programmeId IN (:...programmeIds)", { programmeIds: programmeIdsArray })
			.leftJoinAndSelect("programme.action", "action")
			.leftJoinAndSelect("programme.projects", "projects")
			.leftJoinAndMapMany(
				"programme.migratedData",
				ProgrammeViewEntity,
				"programmeViewEntity",
				"programmeViewEntity.id = programme.programmeId"
			)
			.orderBy(
				query?.sort?.key ? `"programme"."${query?.sort?.key}"` : `"programme"."programmeId"`,
				query?.sort?.order ? query?.sort?.order : "DESC"
			);

		const resp = await queryBuilder.getManyAndCount();
		const totalCount = await subQuery.getCount();

		return new DataListResponseDto(
			resp.length > 0 ? resp[0] : undefined,
			totalCount
		);
	}

	//MARK: Update Programme
	async updateProgramme(programmeUpdateDto: ProgrammeUpdateDto, user: User) {
		const programmeUpdate: ProgrammeEntity = plainToClass(ProgrammeEntity, programmeUpdateDto);
		const eventLog = [];
		
		this.addEventLogEntry(eventLog, LogEventType.PROGRAMME_UPDATED, EntityType.PROGRAMME, programmeUpdate.programmeId, user.id, programmeUpdateDto);

		const currentProgramme = await this.findProgrammeWithParentChildren(programmeUpdateDto.programmeId);
		if (!currentProgramme) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.programmeNotFound",
					[programmeUpdateDto.programmeId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (!this.helperService.doesUserHaveSectorPermission(user, currentProgramme.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.cannotUpdateNotRelatedProgramme",
					[currentProgramme.programmeId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		programmeUpdate.action = currentProgramme.action;
		programmeUpdate.path = currentProgramme.path;
		programmeUpdate.sector = currentProgramme.sector;
		programmeUpdate.projects = currentProgramme.projects;
		programmeUpdate.activities = currentProgramme.activities;

		// setting programme to pending (Non-Validated) state
		if (currentProgramme.validated) {
			programmeUpdate.validated = false;
			this.addEventLogEntry(eventLog, LogEventType.PROGRAMME_UNVERIFIED_DUE_UPDATE, EntityType.PROGRAMME, programmeUpdate.programmeId, 0, programmeUpdateDto);
		}

		// add new documents
		if (programmeUpdateDto.newDocuments) {
			const documents = [];
			for (const documentItem of programmeUpdateDto.newDocuments) {
				const response = await this.fileUploadService.uploadDocument(documentItem.data, documentItem.title, EntityType.PROGRAMME);
				const docEntity = new DocumentEntityDto();
				docEntity.title = documentItem.title;
				docEntity.url = response;
				docEntity.createdTime = new Date().getTime();
				documents.push(docEntity)
			};

			if (currentProgramme.documents) {
				programmeUpdate.documents = programmeUpdate.documents ? [...programmeUpdate.documents, ...currentProgramme.documents] : [...currentProgramme.documents];
			} else if (programmeUpdate.documents) {
				programmeUpdate.documents = [...programmeUpdate.documents];
			}

			if (documents) {
				programmeUpdate.documents = programmeUpdate.documents ? [...programmeUpdate.documents, ...documents] : [...documents];
			}

		}

		// remove documents
		if (programmeUpdateDto.removedDocuments && programmeUpdateDto.removedDocuments.length > 0) {

			if (!currentProgramme.documents || currentProgramme.documents.length < 0) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"programme.noDocumentsFound",
						[programmeUpdateDto.programmeId]
					),
					HttpStatus.BAD_REQUEST
				);
			}

			programmeUpdate.documents = programmeUpdate.documents ? programmeUpdate.documents : currentProgramme.documents
			const updatedDocs = programmeUpdate.documents.filter(
				item => !programmeUpdateDto.removedDocuments.some(
					url => url === item.url
				)
			);
			programmeUpdate.documents = (updatedDocs && updatedDocs.length > 0) ? updatedDocs : null;

		}

		// KPI Update resolve

		const kpiList = [];
		const kpisToRemove = [];
		const achievementsToRemove = [];
		const currentKpis = await this.kpiService.getKpisByCreatorTypeAndCreatorId(EntityType.PROGRAMME, programmeUpdate.programmeId);

		if (programmeUpdateDto.kpis && programmeUpdateDto.kpis.length > 0) {
			
			const addedKpis = programmeUpdateDto.kpis.filter(kpi => !kpi.kpiId);

			if (addedKpis && addedKpis.length > 0) {
				for (const kpiItem of addedKpis) {
					this.payloadValidator.validateKpiPayload(kpiItem, EntityType.PROGRAMME);
					const kpi: KpiEntity = plainToClass(KpiEntity, kpiItem);
					kpi.kpiId = parseInt(await this.counterService.incrementCount(CounterType.KPI, 3));
					kpi.creatorId = programmeUpdateDto.programmeId;
					kpi.expected = parseFloat(kpiItem.expected.toFixed(2));
					kpiList.push(kpi);
				}
			}

			for (const currentKpi of currentKpis) {
				const kpiToUpdate = programmeUpdateDto.kpis.find(kpi => currentKpi.kpiId == kpi.kpiId);
				if (kpiToUpdate) {
					this.payloadValidator.validateKpiPayload(kpiToUpdate, EntityType.PROGRAMME);
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

		if (programmeUpdateDto.kpis && programmeUpdateDto.kpis.length <= 0) {
			kpisToRemove.push(...currentKpis);
		}

		if (kpisToRemove.length > 0) {
			const kpiIdsToRemove = kpisToRemove.map(kpi => kpi.kpiId);
			const achievements = await this.kpiService.findAchievementsByKpiIds(kpiIdsToRemove);

			if (achievements && achievements.length > 0) {
				achievementsToRemove.push(...achievements);
			}
		}

		if (programmeUpdateDto.kpis && programmeUpdateDto.kpis.some(kpi => kpi.kpiAction===KPIAction.UPDATED)) {
			// Add event log entry after the loop completes
			this.addEventLogEntry(eventLog, LogEventType.KPI_UPDATED, EntityType.PROGRAMME, programmeUpdate.programmeId, user.id, kpiList);
		}

		if (programmeUpdateDto.kpis && programmeUpdateDto.kpis.some(kpi => kpi.kpiAction===KPIAction.CREATED)) {
			// Add event log entry after the loop completes
			this.addEventLogEntry(eventLog, LogEventType.KPI_ADDED, EntityType.PROGRAMME, programmeUpdate.programmeId, user.id, kpiList);
		}

		const prg = await this.entityManager
			.transaction(async (em) => {
				const savedProgramme = await em.save<ProgrammeEntity>(programmeUpdate);
				if (savedProgramme) {

					// Update Parent
					if (!currentProgramme.action && programmeUpdateDto.actionId) {
						await this.linkUpdatedProgrammeToAction(programmeUpdateDto.actionId, programmeUpdate, user, em);
					} else if (currentProgramme.action && !programmeUpdateDto.actionId) {
						await this.unlinkUpdatedProgrammeFromAction(programmeUpdate, user, em);
					} else if (currentProgramme.action?.actionId != programmeUpdateDto.actionId) {
						await this.unlinkUpdatedProgrammeFromAction(programmeUpdate, user, em);
						await this.linkUpdatedProgrammeToAction(programmeUpdateDto.actionId, programmeUpdate, user, em);
					} else {
						await this.linkUnlinkService.updateAllValidatedChildrenAndParentStatusByProgrammeId(programmeUpdate, em, false);
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
				return savedProgramme;
			})
			.catch((err: any) => {
				console.log(err);
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"programme.programmeUpdateFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		await this.helperService.refreshMaterializedViews(this.entityManager);

		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("programme.updateProgrammeSuccess", []),
			prg
		);
	}

	//MARK: Delete Programme
	async deleteProgramme(deleteDto: DeleteDto, user: User) {
		if (user.role !== Role.Admin && user.role !== Role.Root) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"user.userUnAUth",
					[]
				),
				HttpStatus.FORBIDDEN
			);
		}

		const programme = await this.findProgrammeWithParentChildren(deleteDto.entityId);
		if (!programme) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.programmeNotFound",
					[deleteDto.entityId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (!this.helperService.doesUserHaveSectorPermission(user, programme.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.permissionDeniedForSector",
					[programme.programmeId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		const programmeKPIs = await this.kpiService.getKpisByCreatorTypeAndCreatorId(EntityType.PROGRAMME, programme.programmeId);

		const programmeKpiIds = programmeKPIs?.map(kpi => kpi.kpiId);

		const linkedActivityIds = programme.activities?.map(activity => activity.activityId);

		// creating project payload expected by unlinkProjectsFromProgramme method
		if (programme.projects && programme.projects.length > 0) {
			for (const project of programme.projects) {
				project.programme = programme;
			}
		}
		

		const pro = await this.entityManager
			.transaction(async (em) => {

				// related parent and children entity un-validation happens when projects are unlinking
				if (programme.projects && programme.projects.length > 0) {
					await this.linkUnlinkService.unlinkProjectsFromProgramme(programme.projects, null, user, this.entityManager, [], true);
				}
				const result = await em.delete<ProgrammeEntity>(ProgrammeEntity, programme.programmeId);

				if (result.affected > 0) {
					if (linkedActivityIds && linkedActivityIds.length > 0) {
						await em.delete<ActivityEntity>(ActivityEntity, linkedActivityIds);
					}

					if (programmeKpiIds && programmeKpiIds.length > 0) {
						await em.delete<KpiEntity>(KpiEntity, programmeKpiIds);
					}
				}
				return result;
			})
			.catch((err: any) => {
				console.log(err);
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"programme.programmeDeletionFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("programme.deleteProgrammeSuccess", []),
			null
		);

	}

	//MARK: Link Updated Programme
	async linkUpdatedProgrammeToAction(actionId: string, updatedProgramme: ProgrammeEntity, user: User, em: EntityManager) {
		const action = await this.actionService.findActionById(actionId);
		if (!action) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.actionNotFound",
					[actionId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (updatedProgramme.action) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.programmeAlreadyLinked",
					[updatedProgramme.programmeId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (!this.helperService.doesUserHaveSectorPermission(user, action.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.cannotLinkToUnrelatedAction",
					[updatedProgramme.programmeId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		const prog = await this.linkUnlinkService.linkProgrammesToAction(action, [updatedProgramme], actionId, user, em);

		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("programme.programmesLinkedToAction", []),
			prog
		);
	}

	//MARK: Unlink Updated Programme
	async unlinkUpdatedProgrammeFromAction(updatedProgramme: ProgrammeEntity, user: User, em?: EntityManager) {

		if (!updatedProgramme.action) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.programmeIsNotLinked",
					[updatedProgramme.programmeId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		const achievementsToRemove = await this.kpiService.getAchievementsOfParentEntity(
			updatedProgramme.action.actionId,
			EntityType.ACTION,
			updatedProgramme.programmeId,
			EntityType.PROGRAMME
		);

		const prog = await this.linkUnlinkService.unlinkProgrammesFromAction(
			[updatedProgramme],
			updatedProgramme.action,
			updatedProgramme.programmeId,
			user,
			em ? em : this.entityManager,
			achievementsToRemove,
			false
		);

		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("programme.programmesUnlinkedFromAction", []),
			prog
		);
	}

	//MARK: Link Programme
	async linkProgrammesToAction(linkProgrammesDto: LinkProgrammesDto, user: User) {
		const action = await this.actionService.findActionById(linkProgrammesDto.actionId);
		if (!action) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.actionNotFound",
					[linkProgrammesDto.actionId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (!this.helperService.doesUserHaveSectorPermission(user, action.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.cannotLinkToNotRelatedAction",
					[action.actionId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		const programmes = await this.linkUnlinkService.findAllProgrammeByIds(linkProgrammesDto.programmes);

		if (!programmes || programmes.length <= 0) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.programmesNotFound",
					[]
				),
				HttpStatus.BAD_REQUEST
			);
		}
		for (const programme of programmes) {
			if (programme.action) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"programme.programmeAlreadyLinked",
						[programme.programmeId]
					),
					HttpStatus.BAD_REQUEST
				);
			}
		}
		const prog = await this.linkUnlinkService.linkProgrammesToAction(action, programmes, linkProgrammesDto.actionId, user, this.entityManager);

		await this.helperService.refreshMaterializedViews(this.entityManager);

		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("programme.programmesLinkedToAction", []),
			prog
		);
	}

	//MARK: Unlink Programme
	async unlinkProgrammesFromAction(unlinkProgrammesDto: UnlinkProgrammesDto, user: User) {

		const programmes = await this.linkUnlinkService.findAllProgrammeByIds([unlinkProgrammesDto.programme]);

		if (!programmes || programmes.length <= 0) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.programmesNotFound",
					[]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		const programme = programmes[0];


		if (!this.helperService.doesUserHaveSectorPermission(user, programme.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.cannotUnlinkNotRelatedProgrammes",
					[programme.programmeId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (!programme.action || programme.action == null) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.programmeIsNotLinked",
					[programme.programmeId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		const achievementsToRemove = await this.kpiService.getAchievementsOfParentEntity(
			programme.action.actionId,
			EntityType.ACTION,
			programme.programmeId,
			EntityType.PROGRAMME
		);

		const prog = await this.linkUnlinkService.unlinkProgrammesFromAction(
			[programme],
			programme.action,
			unlinkProgrammesDto,
			user,
			this.entityManager,
			achievementsToRemove,
			false
		);

		await this.helperService.refreshMaterializedViews(this.entityManager);

		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("programme.programmesUnlinkedFromAction", []),
			prog
		);
	}

	//MARK: Validate Programme
	async validateProgramme(validateDto: ValidateDto, user: User) {

		this.helperService.doesUserHaveValidatePermission(user);

		const programme = await this.findProgrammeById(validateDto.entityId);
		if (!programme) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.programmeNotFound",
					[validateDto.entityId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (!this.helperService.doesUserHaveSectorPermission(user, programme.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.permissionDeniedForSector",
					[programme.programmeId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		if (validateDto.validateStatus && programme.action && !programme.action.validated) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"programme.parentNotValidated",
					[programme.action?.actionId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		programme.validated = validateDto.validateStatus;
		const eventLog = this.buildLogEntity(
			(validateDto.validateStatus) ? LogEventType.PROGRAMME_VERIFIED : LogEventType.PROGRAMME_UNVERIFIED,
			EntityType.PROGRAMME, 
			programme.programmeId, 
			user.id, 
			validateDto
		);

		const prog = await this.entityManager
			.transaction(async (em) => {
				const savedProgramme = await em.save<ProgrammeEntity>(programme);
				if (savedProgramme) {
					if (!validateDto.validateStatus) {
						await this.linkUnlinkService.updateAllValidatedChildrenAndParentStatusByProgrammeId(programme, em, true);
					}
					await em.save<LogEntity>(eventLog);
				}
				return savedProgramme;
			})
			.catch((err: any) => {
				console.log(err);
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"programme.programmeVerificationFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		await this.helperService.refreshMaterializedViews(this.entityManager);

		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString((validateDto.validateStatus) ? "programme.verifyProgrammeSuccess" : "programme.unverifyProgrammeSuccess" , []),
			prog
		);

	}

	async findProgrammeById(programmeId: string) {
		return await this.programmeRepo.createQueryBuilder('programme')
			.leftJoinAndSelect('programme.action', 'action')
			.where('programme.programmeId = :programmeId', { programmeId })
			.getOne();
	}

	async findProgrammeWithParentChildren(programmeId: string) {
		return await this.programmeRepo.createQueryBuilder('programme')
			.leftJoinAndSelect('programme.action', 'action')
			.leftJoinAndSelect('programme.projects', 'project')
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
			.leftJoinAndMapMany(
				"projectActivity.support",
				SupportEntity, 
				"support", 
				"support.activityId = projectActivity.activityId" 
		)
			.where('programme.programmeId = :programmeId', { programmeId })
			.getOne();
	}

	async findAllProjectsByIds(projectIds: string[]) {
		return await this.projectRepo.createQueryBuilder('project')
			.leftJoinAndSelect('project.programme', 'programme')
			.leftJoinAndMapMany(
				"project.activities",
				ActivityEntity,
				"activity",
				"activity.parentType = :project AND activity.parentId = project.projectId",
				{ project: EntityType.PROJECT }
			)
			.leftJoinAndMapMany(
				"activity.supports",
				SupportEntity,
				"support",
				"support.activityId = activity.activityId"
			)
			.where('project.projectId IN (:...projectIds)', { projectIds })
			.getMany();
	}

	async findProgrammesEligibleForLinking() {
		return await this.programmeRepo.createQueryBuilder('programme')
			.select(['"programmeId"', 'title'])
			.where('programme.actionId IS NULL')
			.orderBy('programme.programmeId', 'ASC')
			.getRawMany();
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

	getProgrammeViewDto(programme: ProgrammeEntity) {

		let type: string = null;
		const recipientEntitySet: Set<Recipient> = new Set();
		const interNationalImplementorSet: Set<IntImplementor> = new Set();

		if (programme.projects && programme.projects.length > 0) {
			for (const project of programme.projects) {
				if (project.recipientEntities) {
					project.recipientEntities.forEach(recipient => {
						recipientEntitySet.add(recipient);
					});
				}
				if (project.internationalImplementingEntities) {
					project.internationalImplementingEntities.forEach(internationalImplementer => {
						interNationalImplementorSet.add(internationalImplementer);
					});
				};
			}
		}

		if (programme.action) {
			type = programme.action.type;
		}

		
		const recipientEntity: string[] = Array.from(recipientEntitySet);
		const interNationalImplementor: string[] = Array.from(interNationalImplementorSet);

		const programmeViewDto = new ProgrammeViewDto();
		programmeViewDto.programmeId = programme.programmeId;
		programmeViewDto.actionId = programme.action?.actionId;
		programmeViewDto.type = type;
		programmeViewDto.title = programme.title;
		programmeViewDto.description = programme.description;
		programmeViewDto.objectives = programme.objective;
		programmeViewDto.instrumentType = programme.action?.instrumentType;
		programmeViewDto.sector = programme.sector;
		programmeViewDto.affectedSubSector = programme.affectedSubSector;
		programmeViewDto.programmeStatus = programme.programmeStatus;
		programmeViewDto.recipientEntity = recipientEntity;
		programmeViewDto.startYear = programme.startYear;
		programmeViewDto.interNationalImplementor = interNationalImplementor;
		programmeViewDto.nationalImplementor = programme.natImplementor;
		programmeViewDto.investment = programme.investment;
		programmeViewDto.documents = programme.documents;
		programmeViewDto.comments = programme.comments;
		programmeViewDto.validated = programme.validated;

		return programmeViewDto;

	}
}