import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { plainToClass } from "class-transformer";
import { ActionService } from "../action/action.service";
import { ActivityDto } from "../dtos/activity.dto";
import { DataResponseMessageDto } from "../dtos/data.response.message";
import { DocumentEntityDto } from "../dtos/document.entity.dto";
import { FilterEntry } from "../dtos/filter.entry";
import { QueryDto } from "../dtos/query.dto";
import { ActionEntity } from "../entities/action.entity";
import { ActivityEntity } from "../entities/activity.entity";
import { LogEntity } from "../entities/log.entity";
import { ProgrammeEntity } from "../entities/programme.entity";
import { User } from "../entities/user.entity";
import { CounterType } from "../enums/counter.type.enum";
import { LogEventType, EntityType } from "../enums/shared.enum";
import { ProgrammeService } from "../programme/programme.service";
import { ProjectService } from "../project/project.service";
import { CounterService } from "../util/counter.service";
import { FileUploadService } from "../util/fileUpload.service";
import { HelperService } from "../util/helpers.service";
import { LinkUnlinkService } from "../util/linkUnlink.service";
import { PayloadValidator } from "../validation/payload.validator";
import { EntityManager, Repository } from "typeorm";

@Injectable()
export class ActivityService {
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		private counterService: CounterService,
		private helperService: HelperService,
		private fileUploadService: FileUploadService,
		// private payloadValidator: PayloadValidator,
		// private linkUnlinkService: LinkUnlinkService,
		private projectService: ProjectService,
		private programmeService: ProgrammeService,
		private actionService: ActionService
	) { }

	async createActivity(activityDto: ActivityDto, user: User) {
		const activity: ActivityEntity = plainToClass(ActivityEntity, activityDto);

		const eventLog = [];

		activity.activityId = 'T' + await this.counterService.incrementCount(CounterType.ACTIVITY, 5);

		activity.path = "_._._"
		if (activityDto.parentId && activityDto.parentType) {
			switch (activityDto.parentType) {
				case EntityType.ACTION: {
					await this.isActionValid(activityDto.parentId);
					activity.path = `${activityDto.parentId}._._`;
					this.addEventLogEntry(eventLog, LogEventType.ACTIVITY_LINKED, EntityType.ACTION, activityDto.parentId, user.id, activity.activityId);
					this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_ACTION, EntityType.ACTIVITY, activity.activityId, user.id, activityDto.parentId);
					break;
				}
				case EntityType.PROGRAMME: {
					await this.isProgrammeValid(activityDto.parentId);
					activity.path = `_.${activityDto.parentId}._`;
					this.addEventLogEntry(eventLog, LogEventType.ACTIVITY_LINKED, EntityType.PROGRAMME, activityDto.parentId, user.id, activity.activityId);
					this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_PROGRAMME, EntityType.ACTIVITY, activity.activityId, user.id, activityDto.parentId);
					break;
				}
				case EntityType.PROJECT: {
					await this.isProjectValid(activityDto.parentId);
					activity.path = `_._.${activityDto.parentId}`;
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
					eventLog.forEach(async event => {
						await em.save<LogEntity>(event);
					});
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
	}

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
	}

	async isActionValid(actionId: string) {
		const action = await this.actionService.findActionById(actionId);
		if (!action) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"activity.actionNotFound",
					[actionId]
				),
				HttpStatus.BAD_REQUEST
			);
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

}