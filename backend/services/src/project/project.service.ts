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
import { LinkProjectsDto } from "../dtos/link.projects.dto";
import { UnlinkProjectsDto } from "../dtos/unlink.projects.dto";
import { ActivityEntity } from "../entities/activity.entity";
import { LinkUnlinkService } from "../util/linkUnlink.service";
import { QueryDto } from "../dtos/query.dto";
import { DataListResponseDto } from "../dtos/data.list.response";
import { ProjectViewEntity } from "../entities/project.view.entity";

@Injectable()
export class ProjectService {
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		@InjectRepository(ProjectEntity) private projectRepo: Repository<ProjectEntity>,
		private readonly programmeService: ProgrammeService,
		private counterService: CounterService,
		private helperService: HelperService,
		private fileUploadService: FileUploadService,
		private payloadValidator: PayloadValidator,
		private linkUnlinkService: LinkUnlinkService
	) { }

	async createProject(projectDto: ProjectDto, user: User) {

		const project: ProjectEntity = plainToClass(ProjectEntity, projectDto);

		const eventLog = [];

		project.projectId = 'J' + await this.counterService.incrementCount(CounterType.PROJECT, 3);

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
			this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_PROGRAMME, EntityType.PROJECT, project.projectId, user.id, programme.programmeId);
		}

		// upload the documents and create the doc array here
		if (projectDto.documents) {
			const documents = [];
			for (const documentItem of projectDto.documents) {
				const response = await this.fileUploadService.uploadDocument(documentItem.data, documentItem.title, EntityType.PROJECT);
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

		const proj = await this.entityManager
			.transaction(async (em) => {
				const savedProject = await em.save<ProjectEntity>(project);
				if (savedProject) {
					if (projectDto.kpis) {
						for (const kpi of kpiList) {
							await em.save<KpiEntity>(kpi);
						}
					}

					for (const event of eventLog) {
						await em.save<LogEntity>(event);
					}
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

		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.CREATED,
			this.helperService.formatReqMessagesString("project.createProjectSuccess", []),
			proj
		);

	}

	async query(query: QueryDto, abilityCondition: string): Promise<any> {
		const queryBuilder = await this.projectRepo
			.createQueryBuilder("project")
			.where(
				this.helperService.generateWhereSQL(
					query,
					this.helperService.parseMongoQueryToSQLWithTable(
						'"project"',
						abilityCondition
					),
					'"project"'
				)
			)
			.leftJoinAndSelect("project.programme", "programme")
			.leftJoinAndMapMany(
				"project.migratedData",
				ProjectViewEntity,
				"projectViewEntity",
				"projectViewEntity.id = project.projectId"
			)
			.orderBy(
				query?.sort?.key ? `"project"."${query?.sort?.key}"` : `"project"."projectId"`,
				query?.sort?.order ? query?.sort?.order : "DESC"
			);

		if (query.size && query.page) {
			queryBuilder.offset(query.size * query.page - query.size)
				.limit(query.size);
		}

		const resp = await queryBuilder.getManyAndCount();

		return new DataListResponseDto(
			resp.length > 0 ? resp[0] : undefined,
			resp.length > 1 ? resp[1] : undefined
		);
	}

	async getProjectViewData(projectId: string, abilityCondition: string) {

		const queryBuilder = await this.projectRepo
			.createQueryBuilder("project")
			.where('project.projectId = :projectId', { projectId })
			.leftJoinAndMapOne(
				"project.migratedData",
				ProjectViewEntity,
				"projectViewEntity",
				"projectViewEntity.id = project.projectId"
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

	async findProjectsEligibleForLinking() {
    return await this.projectRepo.createQueryBuilder('project')
        .select(['"projectId"', 'title'])
        .where('project.programmeId IS NULL')
        .orderBy('project.projectId', 'ASC') 
        .getRawMany();
}

	async linkProjectsToProgramme(linkProjectsDto: LinkProjectsDto, user: User) {
		const programme = await this.programmeService.findProgrammeById(linkProjectsDto.programmeId);
		if (!programme) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"project.programmeNotFound",
					[linkProjectsDto.programmeId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		const projects = await this.findAllProjectsByIds(linkProjectsDto.projectIds);

		if (!projects || projects.length <= 0) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"project.projectsNotFound",
					[]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		for (const project of projects) {
			if (project.programme) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"project.projectAlreadyLinked",
						[project.projectId]
					),
					HttpStatus.BAD_REQUEST
				);
			}
		}
		const proj = await this.linkUnlinkService.linkProjectsToProgramme(programme, projects, linkProjectsDto.programmeId, user, this.entityManager);

		await this.helperService.refreshMaterializedViews(this.entityManager);

		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("project.projectsLinkedToProgramme", []),
			proj
		);

	}

	async unlinkProjectsFromProgramme(unlinkProjectsDto: UnlinkProjectsDto, user: User) {
		const projects = await this.findAllProjectsByIds(unlinkProjectsDto.projects);

		if (!projects || projects.length <= 0) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"project.projectsNotFound",
					[]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		for (const project of projects) {
			if (!project.programme) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"project.projectIsNotLinked",
						[project.projectId]
					),
					HttpStatus.BAD_REQUEST
				);
			}
			if (user.sector && user.sector.length > 0) {
				const commonSectors = project.programme.affectedSectors.filter(sector => user.sector.includes(sector));
				if (commonSectors.length === 0) {
					throw new HttpException(
						this.helperService.formatReqMessagesString(
							"project.cannotUnlinkNotRelatedProject",
							[project.projectId]
						),
						HttpStatus.BAD_REQUEST
					);
				}
			}
		}

		const proj = await this.linkUnlinkService.unlinkProjectsFromProgramme(projects, unlinkProjectsDto, user, this.entityManager);
		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("project.projectsUnlinkedFromProgramme", []),
			proj
		);

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
			.where('project.projectId IN (:...projectIds)', { projectIds })
			.getMany();
	}

	async findProjectById(projectId: string) {
		return await this.projectRepo.findOneBy({
			projectId
		})
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