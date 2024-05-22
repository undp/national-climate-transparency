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
import { ProjectUpdateDto } from "../dtos/projectUpdate.dto";
import { KpiService } from "../kpi/kpi.service";
import { ValidateDto } from "../dtos/validate.dto";
import { SupportEntity } from "../entities/support.entity";

@Injectable()
export class ProjectService {
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		@InjectRepository(ProjectEntity) private projectRepo: Repository<ProjectEntity>,
		@InjectRepository(ActivityEntity) private activityRepo: Repository<ActivityEntity>,
		private readonly programmeService: ProgrammeService,
		private counterService: CounterService,
		private helperService: HelperService,
		private fileUploadService: FileUploadService,
		private payloadValidator: PayloadValidator,
		private linkUnlinkService: LinkUnlinkService,
		private kpiService: KpiService,
	) { }

	async createProject(projectDto: ProjectDto, user: User) {

		const project: ProjectEntity = plainToClass(ProjectEntity, projectDto);

		const eventLog = [];

		project.projectId = 'J' + await this.counterService.incrementCount(CounterType.PROJECT, 3);
		this.addEventLogEntry(eventLog, LogEventType.PROJECT_CREATED, EntityType.PROJECT, project.projectId, user.id, projectDto);

		if (projectDto.endYear < projectDto.startYear) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"project.startYearCantBeLargerThanEndYear",
					[]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		project.path = "_._";
		project.expectedTimeFrame = projectDto.endYear - projectDto.startYear;

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

			if (!this.helperService.doesUserHaveSectorPermission(user, programme.sector)){
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"project.cannotLinkToUnrelatedProgramme",
						[programme.programmeId]
					),
					HttpStatus.FORBIDDEN
				);
			}

			project.programme = programme;
			project.path = programme.path && programme.path.trim() !== '' ? `${programme.path}.${programme.programmeId}` : `_.${programme.programmeId}`;
			project.sector = programme.sector;
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

		let activities: any;
		if (projectDto.linkedActivities) {
			activities = await this.findAllActivitiesByIds(projectDto.linkedActivities);
			for (const activity of activities) {
				if (activity.parentId || activity.parentType) {
					throw new HttpException(
						this.helperService.formatReqMessagesString(
							"project.activityAlreadyLinked",
							[project.projectId]
						),
						HttpStatus.BAD_REQUEST
					);
				}
			}
		}

		const proj = await this.entityManager
			.transaction(async (em) => {
				const savedProject = await em.save<ProjectEntity>(project);
				if (savedProject) {
					// linking activities and updating paths of projects and activities
					if (activities && activities.length > 0) {
						await this.linkUnlinkService.linkActivitiesToParent(savedProject, activities, {parentType: EntityType.PROJECT, parentId: savedProject.projectId, activityIds: activities}, user, em);
						this.addEventLogEntry(eventLog, LogEventType.ACTIVITY_LINKED, EntityType.PROJECT, project.projectId, user.id, projectDto);
					}
					
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
		const queryBuilder = this.projectRepo
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

		const queryBuilder = this.projectRepo
			.createQueryBuilder("project")
			.where('project.projectId = :projectId', { projectId })
			.leftJoinAndSelect("project.programme", "programme")
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
					"project.projectNotFound",
					[]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		return result;

	}

	async updateProject(projectUpdateDto: ProjectUpdateDto, user: User) {
		const projectUpdate: ProjectEntity = plainToClass(ProjectEntity, projectUpdateDto);
		const eventLog = [];
		let programme;

		const currentProject = await this.findProjectWithParentAndChildren(projectUpdateDto.projectId);
		
		if (!currentProject) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"project.projectNotFound",
					[projectUpdateDto.projectId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (!this.helperService.doesUserHaveSectorPermission(user, currentProject.sector)){
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"project.cannotUpdateNotRelatedProject",
					[currentProject.projectId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		if (projectUpdateDto.endYear < projectUpdateDto.startYear) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"project.startYearCantBeLargerThanEndYear",
					[]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (projectUpdateDto.programmeId) {
			programme = await this.programmeService.findProgrammeById(projectUpdateDto.programmeId);
			if (!programme) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"project.programmeNotFound",
						[projectUpdateDto.programmeId]
					),
					HttpStatus.BAD_REQUEST
				);
			}
			if (!this.helperService.doesUserHaveSectorPermission(user, programme.sector)){
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"project.cannotLinkToNotRelatedProgramme",
						[currentProject.projectId]
					),
					HttpStatus.FORBIDDEN
				);
			}
		}

		projectUpdate.path = currentProject.path;
		projectUpdate.programme = currentProject.programme;
		projectUpdate.sector = currentProject.sector;
		projectUpdate.activities = currentProject.activities;
		projectUpdate.expectedTimeFrame = projectUpdateDto.endYear - projectUpdateDto.startYear;
		
		// add new documents
		if (projectUpdateDto.newDocuments) {
			const documents = [];
			for (const documentItem of projectUpdateDto.newDocuments) {
				const response = await this.fileUploadService.uploadDocument(documentItem.data, documentItem.title, EntityType.PROJECT);
				const docEntity = new DocumentEntityDto();
				docEntity.title = documentItem.title;
				docEntity.url = response;
				docEntity.createdTime = new Date().getTime();
				documents.push(docEntity)
			};

			if (currentProject.documents) {
				projectUpdate.documents = projectUpdate.documents ? [...projectUpdate.documents, ...currentProject.documents] : [...currentProject.documents];
			} else if (projectUpdate.documents) {
				projectUpdate.documents = [...projectUpdate.documents];
			}

			if (documents) {
				projectUpdate.documents = projectUpdate.documents ? [...projectUpdate.documents, ...documents] : [...documents];
			}

		}

		// remove documents
		if (projectUpdateDto.removedDocuments && projectUpdateDto.removedDocuments.length > 0) {

			if (!currentProject.documents || currentProject.documents.length < 0) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"project.noDocumentsFound",
						[projectUpdateDto.projectId]
					),
					HttpStatus.BAD_REQUEST
				);
			}

			projectUpdate.documents = projectUpdate.documents ? projectUpdate.documents : currentProject.documents
			const updatedDocs = projectUpdate.documents.filter(
				item => !projectUpdateDto.removedDocuments.some(
					url => url === item.url
				)
			);
			projectUpdate.documents = (updatedDocs && updatedDocs.length > 0) ? updatedDocs : null;


		}

		const kpiList = [];
		const kpisToRemove = [];
		let kpisUpdated = false;

		if (projectUpdateDto.kpis && projectUpdateDto.kpis.length > 0) {
			const currentKpis = await this.kpiService.getKpisByCreatorTypeAndCreatorId(EntityType.PROJECT, projectUpdate.projectId);

			const addedKpis = projectUpdateDto.kpis.filter(kpi => !kpi.kpiId);

			if (addedKpis && addedKpis.length > 0) {
				for (const kpiItem of addedKpis) {
					this.payloadValidator.validateKpiPayload(kpiItem, EntityType.PROJECT);
					const kpi: KpiEntity = plainToClass(KpiEntity, kpiItem);
					kpi.kpiId = parseInt(await this.counterService.incrementCount(CounterType.KPI, 3));
					kpi.creatorId = projectUpdateDto.projectId;
					kpiList.push(kpi);
				}
				kpisUpdated = true;
			}

			for (const currentKpi of currentKpis) {
				const kpiToUpdate = projectUpdateDto.kpis.find(kpi => currentKpi.kpiId == kpi.kpiId);
				if (kpiToUpdate) {
					const kpi = new KpiEntity();
					kpi.kpiId = kpiToUpdate.kpiId;
					kpi.creatorId = kpiToUpdate.creatorId;
					kpi.creatorType = kpiToUpdate.creatorType;
					kpi.name = kpiToUpdate.name;
					kpi.expected = kpiToUpdate.expected;
					kpiList.push(kpi);
					kpisUpdated = true;
				} else {
					kpisToRemove.push(currentKpi);
					kpisUpdated = true;
				}
			}

		}

		this.addEventLogEntry(eventLog, LogEventType.PROJECT_UPDATED, EntityType.PROJECT, projectUpdate.projectId, user.id, projectUpdateDto);

		if (kpisUpdated) {
			// Add event log entry after the loop completes
			this.addEventLogEntry(eventLog, LogEventType.KPI_UPDATED, EntityType.PROJECT, projectUpdate.projectId, user.id, kpiList);
		}

		const proj = await this.entityManager
			.transaction(async (em) => {
				const savedProject = await em.save<ProjectEntity>(projectUpdate);
				if (savedProject) {
					// update linked programme
					if (!currentProject.programme && projectUpdateDto.programmeId) {
						await this.linkUnlinkService.linkProjectsToProgramme(programme, [projectUpdate], projectUpdateDto.programmeId, user, em);
					} else if (currentProject.programme && !projectUpdateDto.programmeId) {
						const achievementsToRemove = await this.kpiService.getAchievementsOfParentEntity(
							currentProject.programme.programmeId, 
							EntityType.PROGRAMME, 
							currentProject.projectId, 
							EntityType.PROJECT
						);
						await this.linkUnlinkService.unlinkProjectsFromProgramme([projectUpdate], projectUpdate.projectId, user, em, achievementsToRemove);
					} else if (currentProject.programme?.programmeId != projectUpdateDto.programmeId) {
						const achievementsToRemove = await this.kpiService.getAchievementsOfParentEntity(
							currentProject.programme.programmeId, 
							EntityType.PROGRAMME, 
							currentProject.projectId, 
							EntityType.PROJECT
						);
						await this.linkUnlinkService.unlinkProjectsFromProgramme([projectUpdate], projectUpdate.projectId, user, em, achievementsToRemove);
						await this.linkUnlinkService.linkProjectsToProgramme(programme, [projectUpdate], projectUpdateDto.programmeId, user, em);
					}

					// Save new KPIs
					if (kpiList.length > 0) {
						await Promise.all(kpiList.map(async kpi => {
							await em.save<KpiEntity>(kpi);
						}));
					}
					// Remove KPIs
					if (kpisToRemove.length > 0) {
						await Promise.all(kpisToRemove.map(async kpi => {
							await em.remove<KpiEntity>(kpi);
						}));
					}
					// Save event logs
					if (eventLog.length > 0) {
						await Promise.all(eventLog.map(async event => {
							await em.save<LogEntity>(event);
						}));
					}
				}
				return savedProject;
			})
			.catch((err: any) => {
				console.log(err);
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"project.projectUpdateFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("project.updateProjectSuccess", []),
			proj
		);



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

		if (!this.helperService.doesUserHaveSectorPermission(user, programme.sector)){
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"project.cannotLinkToNotRelatedProgramme",
					[programme.programmeId]
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

			if (!this.helperService.doesUserHaveSectorPermission(user, project.sector)){
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"project.cannotUnlinkNotRelatedProject",
						[project.projectId]
					),
					HttpStatus.BAD_REQUEST
				);
			}
		}
		
		const achievementsToRemove = [];
		for(const project of projects) {
			const projectAchievementsToRemove = await this.kpiService.getAchievementsOfParentEntity(
				project.programme.programmeId, 
				EntityType.PROGRAMME, 
				project.projectId, 
				EntityType.PROJECT
			);

			if (projectAchievementsToRemove) {
				achievementsToRemove.push(...projectAchievementsToRemove);
			}
		}

		const proj = await this.linkUnlinkService.unlinkProjectsFromProgramme(projects, unlinkProjectsDto, user, this.entityManager, achievementsToRemove);
		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("project.projectsUnlinkedFromProgramme", []),
			proj
		);

	}

	async findAllActivitiesByIds(activityIds: string[]) {
		return await this.activityRepo.createQueryBuilder('activity')
			.where('activity.activityId IN (:...activityIds)', { activityIds })
			.getMany();
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
				"activity.support",
				SupportEntity, 
				"support", 
				"support.activityId = activity.activityId" 
		)
			.where('project.projectId IN (:...projectIds)', { projectIds })
			.getMany();
	}

	async findProjectById(projectId: string) {
		return await this.projectRepo.findOneBy({
			projectId
		})
	}

	async findProjectWithParentAndChildren(projectId: string) {
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
				"activity.support",
				SupportEntity, 
				"support", 
				"support.activityId = activity.activityId" 
			)
			.where('project.projectId = :projectId', { projectId })
			.getOne();
	}

	async validateProject(validateDto: ValidateDto, user: User) {
		const project = await this.findProjectById(validateDto.entityId);
		if (!project) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"project.projectNotFound",
					[validateDto.entityId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (!this.helperService.doesUserHaveSectorPermission(user, project.sector)){
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"project.permissionDeniedForSector",
					[project.projectId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		if (project.validated) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"project.projectAlreadyValidated",
					[validateDto.entityId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		project.validated = true;
		const eventLog = this.buildLogEntity(LogEventType.PROJECT_VERIFIED,EntityType.PROJECT,project.projectId,user.id,validateDto)

		const proj = await this.entityManager
		.transaction(async (em) => {
			const savedProject = await em.save<ProjectEntity>(project);
			if (savedProject) {
				// Save event logs
				await em.save<LogEntity>(eventLog);
			}
			return savedProject;
		})
		.catch((err: any) => {
			console.log(err);
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"project.projectVerificationFailed",
					[err]
				),
				HttpStatus.BAD_REQUEST
			);
		});

		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("project.verifyProjectSuccess", []),
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