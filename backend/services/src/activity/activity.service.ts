import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { plainToClass } from "class-transformer";
import { ActionService } from "../action/action.service";
import { ActivityDto } from "../dtos/activity.dto";
import { DataResponseMessageDto } from "../dtos/data.response.message";
import { DocumentEntityDto } from "../dtos/document.entity.dto";
import { QueryDto } from "../dtos/query.dto";
import { ActivityEntity } from "../entities/activity.entity";
import { LogEntity } from "../entities/log.entity";
import { User } from "../entities/user.entity";
import { CounterType } from "../enums/counter.type.enum";
import { LogEventType, EntityType } from "../enums/shared.enum";
import { ProgrammeService } from "../programme/programme.service";
import { ProjectService } from "../project/project.service";
import { CounterService } from "../util/counter.service";
import { FileUploadService } from "../util/fileUpload.service";
import { HelperService } from "../util/helpers.service";
import { LinkUnlinkService } from "../util/linkUnlink.service";
import { EntityManager, Repository } from "typeorm";
import { LinkActivitiesDto } from "../dtos/link.activities.dto";
import { UnlinkActivitiesDto } from "../dtos/unlink.activities.dto";
import { DataListResponseDto } from "../dtos/data.list.response";
import { ActivityResponseDto } from "../dtos/activity.response.dto";
import { ActivityUpdateDto } from "../dtos/activityUpdate.dto";
import { ValidateDto } from "src/dtos/validate.dto";
import { KpiService } from "src/kpi/kpi.service";

@Injectable()
export class ActivityService {
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		@InjectRepository(ActivityEntity) private activityRepo: Repository<ActivityEntity>,
		private counterService: CounterService,
		private helperService: HelperService,
		private fileUploadService: FileUploadService,
		private linkUnlinkService: LinkUnlinkService,
		private projectService: ProjectService,
		private programmeService: ProgrammeService,
		private actionService: ActionService,
		private kpiService: KpiService,
	) { }

	//MARK: Activity Create
	async createActivity(activityDto: ActivityDto, user: User) {
		const activity: ActivityEntity = plainToClass(ActivityEntity, activityDto);

		const eventLog = [];

		activity.activityId = 'T' + await this.counterService.incrementCount(CounterType.ACTIVITY, 5);

		activity.path = "_._._"
		if (activityDto.parentId && activityDto.parentType) {
			switch (activityDto.parentType) {
				case EntityType.ACTION: {
					const action = await this.isActionValid(activityDto.parentId);
					activity.path = `${activityDto.parentId}._._`;
					activity.sectors = action.sectors;
					this.addEventLogEntry(eventLog, LogEventType.ACTIVITY_LINKED, EntityType.ACTION, activityDto.parentId, user.id, activity.activityId);
					this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_ACTION, EntityType.ACTIVITY, activity.activityId, user.id, activityDto.parentId);
					break;
				}
				case EntityType.PROGRAMME: {
					const programme = await this.isProgrammeValid(activityDto.parentId);
					activity.path = programme.path ? `${programme.path}.${activityDto.parentId}._` : `_.${activityDto.parentId}._`;
					activity.sectors = programme.affectedSectors;
					this.addEventLogEntry(eventLog, LogEventType.ACTIVITY_LINKED, EntityType.PROGRAMME, activityDto.parentId, user.id, activity.activityId);
					this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_PROGRAMME, EntityType.ACTIVITY, activity.activityId, user.id, activityDto.parentId);
					break;
				}
				case EntityType.PROJECT: {
					const project = await this.isProjectValid(activityDto.parentId);
					activity.path = project.path ? `${project.path}.${activityDto.parentId}` : `_._.${activityDto.parentId}`;
					activity.sectors = project.sectors;
					this.addEventLogEntry(eventLog, LogEventType.ACTIVITY_LINKED, EntityType.PROJECT, activityDto.parentId, user.id, activity.activityId);
					this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_PROJECT, EntityType.ACTIVITY, activity.activityId, user.id, activityDto.parentId);
					break;
				}
			}
		}

		if (activityDto.documents) {
			activity.documents = await this.uploadDocuments(activityDto.documents);

		}
		this.addEventLogEntry(eventLog, LogEventType.ACTIVITY_CREATED, EntityType.ACTIVITY, activity.activityId, user.id, activityDto);

		if (activityDto.mitigationInfo && activityDto.mitigationInfo.methodologyDocuments) {
			activity.mitigationInfo.methodologyDocuments = await this.uploadDocuments(activityDto.mitigationInfo.methodologyDocuments);
		}

		if (activityDto.mitigationInfo && activityDto.mitigationInfo.resultDocuments) {
			activity.mitigationInfo.resultDocuments = await this.uploadDocuments(activityDto.mitigationInfo.resultDocuments);
		}


		const activ = await this.entityManager
			.transaction(async (em) => {
				const savedActivity = await em.save<ActivityEntity>(activity);
				if (savedActivity) {
					em.save<LogEntity>(eventLog);
				}
				return savedActivity;
			})
			.catch((err: any) => {
				console.log(err);
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"activity.activityCreationFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.CREATED,
			this.helperService.formatReqMessagesString("activity.createActivitySuccess", []),
			activ
		);
	}

	//MARK: Activity Update
	async updateActivity(activityUpdateDto: ActivityUpdateDto, user: User) {
		const activityUpdate: ActivityEntity = plainToClass(ActivityEntity, activityUpdateDto);
		const eventLog = [];

		this.addEventLogEntry(eventLog, LogEventType.ACTIVITY_UPDATED, EntityType.ACTIVITY, activityUpdate.activityId, user.id, activityUpdateDto);

		const currentActivity = await this.findActivityById(activityUpdateDto.activityId);

		if (!currentActivity) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.activityNotFound",
					[activityUpdate.activityId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (user.sector && user.sector.length > 0 && currentActivity.sectors && currentActivity.sectors.length > 0) {
			const commonSectors = currentActivity.sectors.filter(sector => user.sector.includes(sector));
			if (commonSectors.length === 0) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"activity.cannotUpdateNotRelatedActivity",
						[currentActivity.activityId]
					),
					HttpStatus.FORBIDDEN
				);
			}
		}

		let isActivityLinked = false;
		let logEventType;

		if (currentActivity.parentType && currentActivity.parentId) {
			isActivityLinked = true;
			logEventType = (currentActivity.parentType === EntityType.ACTION) ? LogEventType.UNLINKED_FROM_ACTION :
				(currentActivity.parentType === EntityType.PROGRAMME) ? LogEventType.UNLINKED_FROM_PROGRAMME : LogEventType.UNLINKED_FROM_PROJECT;
		}

		activityUpdate.path = currentActivity.path;

		if (isActivityLinked && (!activityUpdateDto.parentType || !activityUpdateDto.parentId)) {
			this.addEventLogEntry(eventLog, logEventType, EntityType.ACTIVITY, activityUpdate.activityId, user.id, currentActivity.parentId);
			activityUpdate.parentId = null;
			activityUpdate.parentType = null;
			activityUpdate.sectors = null;
			activityUpdate.path = '_._._';
		}

		if (activityUpdateDto.parentType && activityUpdateDto.parentId && activityUpdateDto.parentId != currentActivity.parentId) {
			if (isActivityLinked) {
				this.addEventLogEntry(eventLog, logEventType, EntityType.ACTIVITY, activityUpdate.activityId, user.id, currentActivity.parentId);
			}
			switch (activityUpdateDto.parentType) {
				case EntityType.ACTION: {
					const action = await this.isActionValid(activityUpdateDto.parentId);

					if (user.sector && user.sector.length > 0 && action.sectors && action.sectors.length > 0) {
						const commonSectors = action.sectors.filter(sector => user.sector.includes(sector));
						if (commonSectors.length === 0) {
							throw new HttpException(
								this.helperService.formatReqMessagesString(
									"activity.cannotLinkToNotRelatedAction",
									[activityUpdate.parentId]
								),
								HttpStatus.FORBIDDEN
							);
						}
					}

					activityUpdate.path = `${activityUpdateDto.parentId}._._`;
					activityUpdate.sectors = action.sectors;
					this.addEventLogEntry(eventLog, LogEventType.ACTIVITY_LINKED, EntityType.ACTION, activityUpdateDto.parentId, user.id, activityUpdate.activityId);
					this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_ACTION, EntityType.ACTIVITY, activityUpdate.activityId, user.id, activityUpdateDto.parentId);
					break;
				}
				case EntityType.PROGRAMME: {
					const programme = await this.isProgrammeValid(activityUpdateDto.parentId);

					if (user.sector && user.sector.length > 0) {
						const commonSectors = programme.affectedSectors.filter(sector => user.sector.includes(sector));
						if (commonSectors.length === 0) {
							throw new HttpException(
								this.helperService.formatReqMessagesString(
									"activity.cannotLinkToNotRelatedProgramme",
									[activityUpdate.parentId]
								),
								HttpStatus.FORBIDDEN
							);
						}
					}

					activityUpdate.path = programme.path ? `${programme.path}.${activityUpdateDto.parentId}._` : `_.${activityUpdateDto.parentId}._`;
					activityUpdate.sectors = programme.affectedSectors;
					this.addEventLogEntry(eventLog, LogEventType.ACTIVITY_LINKED, EntityType.PROGRAMME, activityUpdateDto.parentId, user.id, activityUpdate.activityId);
					this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_PROGRAMME, EntityType.ACTIVITY, activityUpdate.activityId, user.id, activityUpdateDto.parentId);
					break;
				}
				case EntityType.PROJECT: {
					const project = await this.isProjectValid(activityUpdateDto.parentId);

					if (user.sector && user.sector.length > 0 && project.sectors && project.sectors.length > 0) {
						const commonSectors = project.sectors.filter(sector => user.sector.includes(sector));
						if (commonSectors.length === 0) {
							throw new HttpException(
								this.helperService.formatReqMessagesString(
									"activity.cannotLinkToNotRelatedProject",
									[activityUpdate.parentId]
								),
								HttpStatus.FORBIDDEN
							);
						}
					}

					activityUpdate.path = project.path ? `${project.path}.${activityUpdateDto.parentId}` : `_._.${activityUpdateDto.parentId}`;
					activityUpdate.sectors = project.sectors;
					this.addEventLogEntry(eventLog, LogEventType.ACTIVITY_LINKED, EntityType.PROJECT, activityUpdateDto.parentId, user.id, activityUpdate.activityId);
					this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_PROJECT, EntityType.ACTIVITY, activityUpdate.activityId, user.id, activityUpdateDto.parentId);
					break;
				}
			}
		}

		// add new documents
		if (activityUpdateDto.newDocuments) {
			const documents = [];
			for (const documentItem of activityUpdateDto.newDocuments) {
				const response = await this.fileUploadService.uploadDocument(documentItem.data, documentItem.title, EntityType.ACTIVITY);
				const docEntity = new DocumentEntityDto();
				docEntity.title = documentItem.title;
				docEntity.url = response;
				docEntity.createdTime = new Date().getTime();
				documents.push(docEntity)
			};

			if (currentActivity.documents) {
				activityUpdate.documents = activityUpdate.documents ? [...activityUpdate.documents, ...currentActivity.documents] : [...currentActivity.documents];
			} else if (activityUpdate.documents) {
				activityUpdate.documents = [...activityUpdate.documents];
			}

			if (documents) {
				activityUpdate.documents = activityUpdate.documents ? [...activityUpdate.documents, ...documents] : [...documents];
			}
		}

		// remove documents
		if (activityUpdateDto.removedDocuments && activityUpdateDto.removedDocuments.length > 0) {

			if (!currentActivity.documents || currentActivity.documents.length < 0) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"activity.noDocumentsFound",
						[activityUpdateDto.activityId]
					),
					HttpStatus.BAD_REQUEST
				);
			}

			activityUpdate.documents = activityUpdate.documents ? activityUpdate.documents : currentActivity.documents
			const updatedDocs = activityUpdate.documents.filter(item => !activityUpdateDto.removedDocuments.some(url => url === item.url));
			activityUpdate.documents = (updatedDocs && updatedDocs.length > 0) ? updatedDocs : null;
		}

		if (activityUpdateDto.mitigationInfo && activityUpdateDto.mitigationInfo.methodologyDocuments) {
			activityUpdate.mitigationInfo.methodologyDocuments =
				await this.updateDocumentList(
					activityUpdateDto.mitigationInfo.methodologyDocuments,
					currentActivity?.mitigationInfo?.methodologyDocuments
				)
		}

		if (activityUpdateDto.mitigationInfo && activityUpdateDto.mitigationInfo.resultDocuments) {
			activityUpdate.mitigationInfo.resultDocuments =
				await this.updateDocumentList(
					activityUpdateDto.mitigationInfo.resultDocuments,
					currentActivity?.mitigationInfo?.resultDocuments
				)
		}

		const acti = await this.entityManager
			.transaction(async (em) => {
				const savedActivity = await em.save<ActivityEntity>(activityUpdate);
				if (savedActivity) {
					// Save event logs
					if (eventLog.length > 0) {
						await em.save<LogEntity>(eventLog);
					}
				}
				return savedActivity;
			})
			.catch((err: any) => {
				console.log(err);
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"activity.activityUpdateFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("activity.updateActivitySuccess", []),
			acti
		);

	}

	//MARK: updateDocumentList
	async updateDocumentList(updatedDocList: any, currentDocs: any) {

		let finalDocList = [];
		const addedDocs = updatedDocList.filter(doc => !doc.url);

		if (addedDocs && addedDocs.length > 0) {
			finalDocList = await this.uploadDocuments(addedDocs)
		}

		for (const currentDoc of currentDocs) {
			const docToKeep = updatedDocList.find(doc => currentDoc.url == doc.url);
			if (docToKeep) {
				const doc = new DocumentEntityDto();
				doc.createdTime = docToKeep.createdTime;
				doc.title = docToKeep.title;
				doc.updatedTime = docToKeep.updatedTime;
				doc.url = docToKeep.url;
				finalDocList.push(doc);
			}
		}

		return finalDocList;

	}

	//MARK: uploadDocuments
	async uploadDocuments(documentsArr: any) {
		const documentEntityDtos = [];
		for (const documentItem of documentsArr) {
			const response = await this.fileUploadService.uploadDocument(documentItem.data, documentItem.title, EntityType.ACTIVITY);
			const docEntity = new DocumentEntityDto();
			docEntity.title = documentItem.title;
			docEntity.url = response;
			docEntity.createdTime = new Date().getTime();
			documentEntityDtos.push(docEntity)
		};
		return documentEntityDtos;
	}

	//MARK: isProjectValid
	async isProjectValid(projectId: string) {
		const project = await this.projectService.findProjectById(projectId);
		if (!project) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.projectNotFound",
					[projectId]
				),
				HttpStatus.BAD_REQUEST
			);
		}
		return project;
	}

	//MARK: isProgrammeValid
	async isProgrammeValid(programmeId: string) {
		const programme = await this.programmeService.findProgrammeById(programmeId);
		if (!programme) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.programmeNotFound",
					[programmeId]
				),
				HttpStatus.BAD_REQUEST
			);
		}
		return programme;
	}

	//MARK: isActionValid
	async isActionValid(actionId: string) {
		const action = await this.actionService.getActionViewData(actionId);
		if (!action) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.actionNotFound",
					[actionId]
				),
				HttpStatus.BAD_REQUEST
			);
		}
		return action;
	}

	//MARK: Find Eligible for Linking
	async findActivitiesEligibleForLinking() {
		return await this.activityRepo.createQueryBuilder('activity')
			.select(['"activityId"', 'title'])
			.where('activity.parentType IS NULL AND activity.parentId IS NULL')
			.orderBy('activity.activityId', 'ASC')
			.getRawMany();
	}

	//MARK: Activity Link
	async linkActivitiesToParent(linkActivitiesDto: LinkActivitiesDto, user: User) {
		let parentEntity: any;

		switch (linkActivitiesDto.parentType) {
			case EntityType.ACTION: {
				parentEntity = await this.isActionValid(linkActivitiesDto.parentId);
				break;
			}
			case EntityType.PROGRAMME: {
				parentEntity = await this.isProgrammeValid(linkActivitiesDto.parentId);
				break;
			}
			case EntityType.PROJECT: {
				parentEntity = await this.isProjectValid(linkActivitiesDto.parentId);
				break;
			}
		}

		const activities = await this.findAllActivitiesByIds(linkActivitiesDto.activityIds);

		if (!activities || activities.length <= 0) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.activitiesNotFound",
					[]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		// let achievementList: any[] = [];

		for (const activity of activities) {
			if (activity.parentId || activity.parentType) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"activity.activityAlreadyLinked",
						[activity.activityId]
					),
					HttpStatus.BAD_REQUEST
				);
			}
		}

		const act = await this.linkUnlinkService.linkActivitiesToParent(
			parentEntity,
			activities,
			linkActivitiesDto,
			user,
			this.entityManager
		);

		await this.helperService.refreshMaterializedViews(this.entityManager);

		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("activity.activitiesLinked", []),
			act
		);

	}

	//MARK: Activity Unlink
	async unlinkActivitiesFromParents(unlinkActivitiesDto: UnlinkActivitiesDto, user: User) {
		const activities = await this.findAllActivitiesByIds(unlinkActivitiesDto.activityIds);

		if (!activities || activities.length <= 0) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.activitiesNotFound",
					[]
				),
				HttpStatus.BAD_REQUEST
			);
		}
		const achievements = [];
		for (const activity of activities) {
			if (!activity.parentId && !activity.parentType) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"activity.activityIsNotLinked",
						[activity.activityId]
					),
					HttpStatus.BAD_REQUEST
				);
			}

			if (user.sector && user.sector.length > 0) {
				const commonSectors = activity.sectors.filter(sector => user.sector.includes(sector));
				if (commonSectors.length === 0) {
					throw new HttpException(
						this.helperService.formatReqMessagesString(
							"activity.cannotUnlinkNotRelatedActivity",
							[activity.activityId]
						),
						HttpStatus.BAD_REQUEST
					);
				}
			}

			const activityAchievements = await this.kpiService.findAchievementsByActivityId(activity.activityId);
			achievements.push(...activityAchievements);
		}

		const proj = await this.linkUnlinkService.unlinkActivitiesFromParent(activities, unlinkActivitiesDto, user, this.entityManager, achievements);
		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("activity.activitiesUnlinked", []),
			proj
		);

	}

	//MARK: Activity Query
	async query(query: QueryDto, abilityCondition: string): Promise<any> {
		const queryBuilder = await this.activityRepo
			.createQueryBuilder("activity")
			.where(
				this.helperService.generateWhereSQL(
					query,
					this.helperService.parseMongoQueryToSQLWithTable(
						'"activity"',
						abilityCondition
					),
					'"activity"'
				)
			)
			.orderBy(
				query?.sort?.key ? `"activity"."${query?.sort?.key}"` : `"activity"."activityId"`,
				query?.sort?.order ? query?.sort?.order : "DESC"
			);

		if (query.size && query.page) {
			queryBuilder.offset(query.size * query.page - query.size)
				.limit(query.size);
		}

		const resp = await queryBuilder.getManyAndCount();

		const final = [];
		for (const activity of resp[0]) {
			let migratedData;
			const activityResponseDto: ActivityResponseDto = plainToClass(ActivityResponseDto, activity);
			if (activity.parentId && activity.parentType) {
				migratedData = await this.getParentEntity(activity.parentType, activity.parentId)
				activityResponseDto.migratedData = migratedData
			}
			final.push(activityResponseDto);
		}

		return new DataListResponseDto(
			resp.length > 0 ? final : undefined,
			resp.length > 1 ? resp[1] : undefined
		);
	}

	//MARK: Activity Get View Data
	async getActivityViewData(activityId: string, user: User) {
		const activity = await this.findActivityById(activityId);

		if (!activity) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.activityNotFound",
					[]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (!this.checkSectorPermissions(activity.sectors, user.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.userDoesNotHavePermission",
					[activity.activityId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		const activityResponseDto: ActivityResponseDto = plainToClass(ActivityResponseDto, activity);
		if (activity && activity.parentId && activity.parentType) {
			const migratedData = await this.getParentEntity(activity.parentType, activity.parentId)
			activityResponseDto.migratedData = migratedData
		}
		return activityResponseDto;
	}

	//MARK: Validate Activity
	async validateActivity(validateDto: ValidateDto, user: User) {
		const activity = await this.findActivityById(validateDto.entityId);
		if (!activity) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.activityNotFound",
					[validateDto.entityId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (activity.validated) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.activityAlreadyValidated",
					[validateDto.entityId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		activity.validated = true;
		const eventLog = this.buildLogEntity(LogEventType.ACTION_VERIFIED, EntityType.ACTIVITY, activity.activityId, user.id, validateDto)

		const act = await this.entityManager
			.transaction(async (em) => {
				const savedActivity = await em.save<ActivityEntity>(activity);
				if (savedActivity) {
					// Save event logs
					await em.save<LogEntity>(eventLog);
				}
				return savedActivity;
			})
			.catch((err: any) => {
				console.log(err);
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"activity.activityVerificationFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("activity.verifyActivitySuccess", []),
			act
		);

	}

	async findActivityById(activityId: string) {
		return await this.activityRepo.findOneBy({
			activityId
		})
	}

	async findAllActivitiesByIds(activityIds: string[]) {
		return await this.activityRepo.createQueryBuilder('activity')
			.leftJoinAndSelect('activity.support', 'support')
			.where('activity.activityId IN (:...activityIds)', { activityIds })
			.getMany();
	}

	async getParentEntity(parentType: string, parentId: string): Promise<any> {
		switch (parentType) {
			case "action":
				return await this.actionService.findActionViewById(parentId);
			case "programme":
				return await this.programmeService.findProgrammeViewById(parentId);
			case "project":
				return await this.projectService.findProjectById(parentId);
			default:
				throw new Error("Invalid parent type");
		}
	}

	checkSectorPermissions(activitySectors: any, userSectors: any) {
		let canAccess = true;
		if (userSectors && userSectors.length > 0 && activitySectors && activitySectors.length > 0) {
			const commonSectors = activitySectors.filter(sector => userSectors.includes(sector));
			if (commonSectors.length === 0) {
				canAccess = false;
			}
		}
		return canAccess;
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