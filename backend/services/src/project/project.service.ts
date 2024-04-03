import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { plainToClass } from "class-transformer";
import { DataResponseMessageDto } from "../dtos/data.response.message";
import { DocumentEntityDto } from "../dtos/document.entity.dto";
import { ProjectDto } from "../dtos/project.dto";
import { KpiEntity } from "../entities/kpi.entity";
import { LogEntity } from "../entities/log.entity";
import { ProjectEntity } from "../entities/project.entity";
import { User } from "../entities/user.entity";
import { CounterType } from "../enums/counter.type.enum";
import { EntityType, LogEventType } from "../enums/shared.enum";
import { ProgrammeService } from "../programme/programme.service";
import { CounterService } from "../util/counter.service";
import { FileUploadService } from "../util/fileUpload.service";
import { HelperService } from "../util/helpers.service";
import { PayloadValidator } from "../validation/payload.validator";
import { EntityManager, Repository } from "typeorm";

@Injectable()
export class ProjectService {
	constructor(
		@InjectEntityManager() private entityManger: EntityManager,
		@InjectRepository(ProjectEntity) private projectRepo: Repository<ProjectEntity>,
		private programmeService: ProgrammeService,
		private counterService: CounterService,
		private helperService: HelperService,
		private fileUploadService: FileUploadService,
		private payloadValidator: PayloadValidator
	) { }

	async createProject(projectDto: ProjectDto, user: User) {

		const project: ProjectEntity = plainToClass(ProjectEntity, projectDto);

		const eventLog = [];

		project.projectId = 'J' + await this.counterService.incrementCount(CounterType.PROJECT, 3);

		// upload the documents and create the doc array here
		if (projectDto.documents) {
			const documents = [];
			for (const documentItem of projectDto.documents) {
				const response = await this.fileUploadService.uploadDocument(documentItem.data, documentItem.title);
				const docEntity = new DocumentEntityDto();
				docEntity.title = documentItem.title;
				docEntity.url = response;
				docEntity.createdTime = new Date().getTime();
				documents.push(docEntity)
			};
			project.documents = documents;

		}
		this.addEventLogEntry(eventLog, LogEventType.PROJECT_CREATED, EntityType.PROJECT, project.projectId, user.id, projectDto);


		const kpiList = [];
		if (projectDto.kpis) {
			for (const kpiItem of projectDto.kpis) {
				this.payloadValidator.validateKpiPayload(kpiItem, EntityType.PROJECT);
				const kpi: KpiEntity = plainToClass(KpiEntity, kpiItem);
				kpi.kpiId = parseInt(await this.counterService.incrementCount(CounterType.KPI, 3));
				kpi.creatorId = project.projectId;
				kpiList.push(kpi);
			}
			// Add event log entry after the loop completes
			this.addEventLogEntry(eventLog, LogEventType.KPI_ADDED, EntityType.PROJECT, project.projectId, user.id, kpiList);
		}

		project.path = "";

		if (projectDto.programmeId) {
			const programme = await this.programmeService.findProgrammeById(projectDto.programmeId);
			if (!programme) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"project.programmeNotFound",
						[projectDto.programmeId]
					),
					HttpStatus.BAD_REQUEST
				);
			}
			project.programme = programme;
			project.path = `${programme.path}.${programme.programmeId}`;
			this.addEventLogEntry(eventLog, LogEventType.PROJECT_LINKED, EntityType.PROGRAMME, programme.programmeId, user.id, project.projectId);
			this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_PROGRAMME, EntityType.PROJECT,project.projectId, user.id, programme.programmeId);
		}

		const proj = await this.entityManger
			.transaction(async (em) => {
				const savedProject = await em.save<ProjectEntity>(project);
				if (savedProject) {
					if (projectDto.kpis) {
						kpiList.forEach(async kpi => {
							await em.save<KpiEntity>(kpi)
						});
					}

					eventLog.forEach(async event => {
						await em.save<LogEntity>(event);
					});
				}
				return savedProject;
			})
			.catch((err: any) => {
				console.log(err);
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"project.projectCreationFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		await this.helperService.refreshMaterializedViews(this.entityManger);
		return new DataResponseMessageDto(
			HttpStatus.CREATED,
			this.helperService.formatReqMessagesString("project.createProjectSuccess", []),
			proj
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