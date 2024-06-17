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
import { mitigationTimelineDto } from "../dtos/mitigationTimeline.dto";
import { ResponseMessageDto } from "../dtos/response.message";
import { LinkActivitiesDto } from "../dtos/link.activities.dto";
import { UnlinkActivitiesDto } from "../dtos/unlink.activities.dto";
import { DataListResponseDto } from "../dtos/data.list.response";
import { ActivityResponseDto } from "../dtos/activity.response.dto";
import { ActivityUpdateDto } from "../dtos/activityUpdate.dto";
import { ValidateDto } from "../dtos/validate.dto";
import { KpiService } from "../kpi/kpi.service";
import { PayloadValidator } from "../validation/payload.validator";
import { ProgrammeEntity } from "../entities/programme.entity";
import { ProjectEntity } from "../entities/project.entity";
import { ActionEntity } from "../entities/action.entity";

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
		private payloadValidator: PayloadValidator,
	) { }

	//MARK: Activity Create
	async createActivity(activityDto: ActivityDto, user: User) {
		const activity: ActivityEntity = plainToClass(ActivityEntity, activityDto);

		const eventLog = [];

		activity.activityId = 'T' + await this.counterService.incrementCount(CounterType.ACTIVITY, 5);
		this.addEventLogEntry(eventLog, LogEventType.ACTIVITY_CREATED, EntityType.ACTIVITY, activity.activityId, user.id, activityDto);

		activity.path = "_._._"

		let action: ActionEntity;
		let programme: ProgrammeEntity;
		let project: ProjectEntity;

		if (activityDto.parentId && activityDto.parentType) {
			switch (activityDto.parentType) {
				case EntityType.ACTION: {
					action = await this.isActionValid(activityDto.parentId, user);
					activity.path = `${activityDto.parentId}._._`;
					activity.sector = action.sector;
					this.addEventLogEntry(eventLog, LogEventType.ACTIVITY_LINKED, EntityType.ACTION, activityDto.parentId, user.id, activity.activityId);
					this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_ACTION, EntityType.ACTIVITY, activity.activityId, user.id, activityDto.parentId);
					break;
				}
				case EntityType.PROGRAMME: {
					programme = await this.isProgrammeValid(activityDto.parentId, user);
					action = programme.action;
					activity.path = programme.path && programme.path.trim() !== '' ? `${programme.path}.${activityDto.parentId}._` : `_.${activityDto.parentId}._`;
					activity.sector = programme.sector;
					this.addEventLogEntry(eventLog, LogEventType.ACTIVITY_LINKED, EntityType.PROGRAMME, activityDto.parentId, user.id, activity.activityId);
					this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_PROGRAMME, EntityType.ACTIVITY, activity.activityId, user.id, activityDto.parentId);
					break;
				}
				case EntityType.PROJECT: {
					project = await this.isProjectValid(activityDto.parentId, user);
					programme = project.programme;
					action = programme?.action;
					activity.path = project.path && project.path.trim() !== '' ? `${project.path}.${activityDto.parentId}` : `_._.${activityDto.parentId}`;
					activity.sector = project.sector;
					this.addEventLogEntry(eventLog, LogEventType.ACTIVITY_LINKED, EntityType.PROJECT, activityDto.parentId, user.id, activity.activityId);
					this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_PROJECT, EntityType.ACTIVITY, activity.activityId, user.id, activityDto.parentId);
					break;
				}
			}
		}

		if (activityDto.documents) {
			activity.documents = await this.uploadDocuments(activityDto.documents);

		}

		if (activityDto.mitigationInfo && activityDto.mitigationInfo.methodologyDocuments) {
			activity.mitigationInfo.methodologyDocuments = await this.uploadDocuments(activityDto.mitigationInfo.methodologyDocuments);
		}

		if (activityDto.mitigationInfo && activityDto.mitigationInfo.resultDocuments) {
			activity.mitigationInfo.resultDocuments = await this.uploadDocuments(activityDto.mitigationInfo.resultDocuments);
		}

		if (activityDto.mitigationTimeline) {
			this.payloadValidator.validateMitigationTimelinePayload(activityDto, 'create');
		}

		const activ = await this.entityManager
			.transaction(async (em) => {
				const savedActivity = await em.save<ActivityEntity>(activity);
				if (savedActivity) {
					if (project && project.validated) {
						project.validated = false;
						this.addEventLogEntry(
							eventLog, 
							LogEventType.PROJECT_UNVERIFIED_DUE_ATTACHMENT_CHANGE, 
							EntityType.PROJECT, 
							project.projectId, 
							0, 
							activity.activityId
						);
						await em.save<ProjectEntity>(project);
					}
					if (programme && programme.validated) {
						programme.validated = false;
						this.addEventLogEntry(
							eventLog,
							(activity.parentType == EntityType.PROGRAMME) ?
								LogEventType.PROGRAMME_UNVERIFIED_DUE_ATTACHMENT_CHANGE : LogEventType.PROGRAMME_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
							EntityType.PROGRAMME,
							programme.programmeId,
							0,
							project.projectId
						);
						await em.save<ProgrammeEntity>(programme);
					}
					if (action && action.validated) {
						action.validated = false;
						this.addEventLogEntry(
							eventLog,
							(activity.parentType == EntityType.ACTION) ?
								LogEventType.ACTION_UNVERIFIED_DUE_ATTACHMENT_CHANGE : LogEventType.ACTION_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
							EntityType.ACTION,
							action.actionId,
							0,
							programme.programmeId
						);
						await em.save<ActionEntity>(action);
					}
					await em.save<LogEntity>(eventLog);
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

		if (!this.helperService.doesUserHaveSectorPermission(user, currentActivity.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.cannotUpdateNotRelatedActivity",
					[currentActivity.activityId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		if (currentActivity.validated) {
			activityUpdate.validated = false;
			this.addEventLogEntry(eventLog, LogEventType.ACTIVITY_UNVERIFIED_DUE_UPDATE, EntityType.ACTIVITY, activityUpdate.activityId, 0, activityUpdateDto);
		}

		let isActivityLinked = false;
		let logEventType: any;

		if (currentActivity.parentType && currentActivity.parentId) {
			isActivityLinked = true;
			logEventType = (currentActivity.parentType === EntityType.ACTION) ? LogEventType.UNLINKED_FROM_ACTION :
				(currentActivity.parentType === EntityType.PROGRAMME) ? LogEventType.UNLINKED_FROM_PROGRAMME : LogEventType.UNLINKED_FROM_PROJECT;
		}

		activityUpdate.path = currentActivity.path;

		const actionList: ActionEntity[] = [];
		const programmeList: ProgrammeEntity[] = [];
		const projectList: ProjectEntity[] = [];

		if (isActivityLinked) {
			
			// update validation status of previously linked parents
			switch (currentActivity.parentType) {
				case EntityType.ACTION: {
					const action = await this.isActionValid(currentActivity.parentId, user);
					if (action.validated) {
						action.validated = false;
						this.addEventLogEntry(
							eventLog, 
							LogEventType.ACTION_UNVERIFIED_DUE_ATTACHMENT_CHANGE, 
							EntityType.ACTION, 
							action.actionId, 
							0, 
							activityUpdate.activityId
						);
						actionList.push(action);
					}
					break;
				}
				case EntityType.PROGRAMME: {
					const programme = await this.isProgrammeValid(currentActivity.parentId, user);
					const action = programme.action;

					if (programme.validated) {
						programme.validated = false;
						this.addEventLogEntry(
							eventLog, 
							LogEventType.PROGRAMME_UNVERIFIED_DUE_ATTACHMENT_CHANGE, 
							EntityType.PROGRAMME, 
							programme.programmeId, 
							0, 
							activityUpdate.activityId
						);
						programmeList.push(programme);
					}

					if (action && action.validated) {
						action.validated = false;
						this.addEventLogEntry(
							eventLog, 
							LogEventType.ACTION_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE, 
							EntityType.ACTION, 
							action.actionId, 
							0, 
							programme.programmeId
						);
						actionList.push(action);
					}
					break;
				}
				case EntityType.PROJECT: {
					const project = await this.isProjectValid(currentActivity.parentId, user);
					const programme = project.programme;
					const action = programme?.action;

					if (project.validated) {
						project.validated = false;
						this.addEventLogEntry(
							eventLog, 
							LogEventType.PROJECT_UNVERIFIED_DUE_ATTACHMENT_CHANGE, 
							EntityType.PROJECT, 
							project.projectId, 
							0, 
							activityUpdate.activityId
						);
						projectList.push(project);
					}

					if (programme && programme.validated) {
						programme.validated = false;
						this.addEventLogEntry(
							eventLog, 
							LogEventType.PROGRAMME_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE, 
							EntityType.PROGRAMME, 
							programme.programmeId, 
							0, 
							project.projectId
						);
						programmeList.push(programme);
					}

					if (action && action.validated) {
						action.validated = false;
						this.addEventLogEntry(
							eventLog, 
							LogEventType.ACTION_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE, 
							EntityType.ACTION, 
							action.actionId, 
							0, 
							programme.programmeId
						);
						actionList.push(action);
					}
					break;
				}
			}

			if (!activityUpdateDto.parentType || !activityUpdateDto.parentId) {
			this.addEventLogEntry(eventLog, logEventType, EntityType.ACTIVITY, activityUpdate.activityId, user.id, currentActivity.parentId);
			activityUpdate.parentId = null;
			activityUpdate.parentType = null;
			activityUpdate.sector = null;
			activityUpdate.path = '_._._';
		}
	}

		if (activityUpdateDto.parentType && activityUpdateDto.parentId && activityUpdateDto.parentId != currentActivity.parentId) {
			if (isActivityLinked) {
				this.addEventLogEntry(eventLog, logEventType, EntityType.ACTIVITY, activityUpdate.activityId, user.id, currentActivity.parentId);
			}
			switch (activityUpdateDto.parentType) {
				case EntityType.ACTION: {
					const action = await this.isActionValid(activityUpdateDto.parentId, user);

					// update validation status of linking action
					if (action && action.validated) {
						action.validated = false;
						this.addEventLogEntry(
							eventLog, 
							LogEventType.ACTION_UNVERIFIED_DUE_ATTACHMENT_CHANGE, 
							EntityType.ACTION, 
							action.actionId, 
							0, 
							activityUpdate.activityId
						);
						actionList.push(action);
					}

					activityUpdate.path = `${activityUpdateDto.parentId}._._`;
					activityUpdate.sector = action.sector;
					this.addEventLogEntry(eventLog, LogEventType.ACTIVITY_LINKED, EntityType.ACTION, activityUpdateDto.parentId, user.id, activityUpdate.activityId);
					this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_ACTION, EntityType.ACTIVITY, activityUpdate.activityId, user.id, activityUpdateDto.parentId);
					break;
				}
				case EntityType.PROGRAMME: {
					const programme = await this.isProgrammeValid(activityUpdateDto.parentId, user);
					const action = programme.action;

					// update validation status of linking parents
					if (programme.validated) {
						programme.validated = false;
						this.addEventLogEntry(
							eventLog, 
							LogEventType.PROGRAMME_UNVERIFIED_DUE_ATTACHMENT_CHANGE, 
							EntityType.PROGRAMME, 
							programme.programmeId, 
							0, 
							activityUpdate.activityId
						);
						programmeList.push(programme);
					}

					if (action && action.validated) {
						action.validated = false;
						this.addEventLogEntry(
							eventLog, 
							LogEventType.ACTION_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE, 
							EntityType.ACTION, 
							action.actionId, 
							0, 
							programme.programmeId
						);
						actionList.push(action);
					}

					activityUpdate.path = programme.path && programme.path.trim() !== '' ? `${programme.path}.${activityUpdateDto.parentId}._` : `_.${activityUpdateDto.parentId}._`;
					activityUpdate.sector = programme.sector;
					this.addEventLogEntry(eventLog, LogEventType.ACTIVITY_LINKED, EntityType.PROGRAMME, activityUpdateDto.parentId, user.id, activityUpdate.activityId);
					this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_PROGRAMME, EntityType.ACTIVITY, activityUpdate.activityId, user.id, activityUpdateDto.parentId);
					break;
				}
				case EntityType.PROJECT: {
					const project = await this.isProjectValid(activityUpdateDto.parentId, user);
					const programme = project.programme;
					const action = programme?.action;

					if (project.validated) {
						project.validated = false;
						this.addEventLogEntry(
							eventLog, 
							LogEventType.PROJECT_UNVERIFIED_DUE_ATTACHMENT_CHANGE, 
							EntityType.PROJECT, 
							project.projectId, 
							0, 
							activityUpdate.activityId
						);
						projectList.push(project);
					}

					if (programme && programme.validated) {
						programme.validated = false;
						this.addEventLogEntry(
							eventLog, 
							LogEventType.PROGRAMME_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE, 
							EntityType.PROGRAMME, 
							programme.programmeId, 
							0, 
							project.projectId
						);
						programmeList.push(programme);
					}

					if (action && action.validated) {
						action.validated = false;
						this.addEventLogEntry(
							eventLog, 
							LogEventType.ACTION_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE, 
							EntityType.ACTION, 
							action.actionId, 
							0, 
							programme.programmeId
						);
						actionList.push(action);
					}

					activityUpdate.path = project.path && project.path.trim() !== '' ? `${project.path}.${activityUpdateDto.parentId}` : `_._.${activityUpdateDto.parentId}`;
					activityUpdate.sector = project.sector;
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

					if (projectList.length > 0) {
						em.save<ProjectEntity>(projectList);
					}
					if (programmeList.length > 0) {
						em.save<ProgrammeEntity>(programmeList);
					}
					if (actionList.length > 0) {
						em.save<ActionEntity>(actionList);
					}

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
	async isProjectValid(projectId: string, user: User) {
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
		if (!this.helperService.doesUserHaveSectorPermission(user, project.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.cannotLinkToUnrelatedProject",
					[project.projectId]
				),
				HttpStatus.FORBIDDEN
			);
		}
		return project;
	}

	//MARK: isProgrammeValid
	async isProgrammeValid(programmeId: string, user: User) {
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
		if (!this.helperService.doesUserHaveSectorPermission(user, programme.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.cannotLinkToUnrelatedProgramme",
					[programme.programmeId]
				),
				HttpStatus.FORBIDDEN
			);
		}
		return programme;
	}

	//MARK: isActionValid
	async isActionValid(actionId: string, user: User) {
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
		if (!this.helperService.doesUserHaveSectorPermission(user, action.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.cannotLinkToUnrelatedAction",
					[action.actionId]
				),
				HttpStatus.FORBIDDEN
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
				parentEntity = await this.isActionValid(linkActivitiesDto.parentId, user);
				break;
			}
			case EntityType.PROGRAMME: {
				parentEntity = await this.isProgrammeValid(linkActivitiesDto.parentId, user);
				break;
			}
			case EntityType.PROJECT: {
				parentEntity = await this.isProjectValid(linkActivitiesDto.parentId, user);
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

			if (!this.helperService.doesUserHaveSectorPermission(user, activity.sector)) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"activity.cannotUnlinkNotRelatedActivity",
						[activity.activityId]
					),
					HttpStatus.BAD_REQUEST
				);
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
		const queryBuilder = this.activityRepo
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
			let migratedData: any;
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

		if (!this.helperService.doesUserHaveSectorPermission(user, activity.sector)) {
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

	//MARK: Get Activities of Parent
	async getActivitiesOfParentByPath(parentType: EntityType, parentId: string, user: User) {
		let entityLevel = EntityType.ACTION === parentType ? 0 : EntityType.PROGRAMME === parentType ? 1 : 2;
		const queryBuilder = this.activityRepo
			.createQueryBuilder()
			.where(
				this.helperService.generateSubPathSQL({
					match: parentId,
					ltree: 'path',
					startLevel: entityLevel,
					traverseDepth: 1,
				}),
			);

		const query = queryBuilder.getQueryAndParameters();
		console.log("Generated SQL Query:", query[0]);
		console.log("Query Parameters:", query[1]);

		const result = await queryBuilder.getMany();
		return result;
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

		if (!this.helperService.doesUserHaveSectorPermission(user, activity.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.permissionDeniedForSector",
					[activity.activityId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		activity.validated = validateDto.validateStatus;
		const eventLog = this.buildLogEntity(
			(validateDto.validateStatus) ? LogEventType.ACTIVITY_VERIFIED : LogEventType.ACTIVITY_UNVERIFIED,
			EntityType.ACTIVITY, 
			activity.activityId, 
			user.id, 
			validateDto
		)

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

	//MARK: update mitigation timeline Data
	async updateMitigationTimeline(mitigationTimelineDto: mitigationTimelineDto, user: User) {
		this.payloadValidator.validateMitigationTimelinePayload(mitigationTimelineDto, 'update');
		const { activityId, mitigationTimeline } = mitigationTimelineDto;
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

		if (!this.helperService.doesUserHaveSectorPermission(user, activity.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.userDoesNotHavePermission",
					[activity.activityId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		const currentMitigationTimeline = activity.mitigationTimeline;

		const updatedMitigationTimeline = {
			...currentMitigationTimeline,
			expected: mitigationTimeline.expected,
			actual: mitigationTimeline.actual
		};

		const activ = await this.entityManager
			.transaction(async (em) => {
				await em
					.createQueryBuilder()
					.update(ActivityEntity)
					.set({ mitigationTimeline: updatedMitigationTimeline})
					.where('activityId = :activityId', { activityId })
					.execute();

				const logEntity =
					this.buildLogEntity(
						LogEventType.MTG_UPDATED,
						EntityType.ACTIVITY,
						activity.activityId,
						user.id,
						mitigationTimelineDto
					);

				await em.save<LogEntity>(logEntity);
				return activity;
			})
			.catch((err: any) => {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"activity.mtgUpdateFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		return new ResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("activity.mtgUpdateSuccess", []),
		);
	}

	//MARK: get mitigation timeline Data
	async getActivityMitigationTimeline(activityId: string, user: User) {
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

		if (!this.helperService.doesUserHaveSectorPermission(user, activity.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.userDoesNotHavePermission",
					[activity.activityId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		return activity.mitigationTimeline;
	}
}