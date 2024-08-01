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
import { EntityType, KPIAction, LogEventType } from "../enums/shared.enum";
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
import { AchievementEntity } from "../entities/achievement.entity";
import { ProgrammeEntity } from "../entities/programme.entity";
import { ActionEntity } from "../entities/action.entity";
import { DeleteDto } from "../dtos/delete.dto";
import { Role } from "../casl/role.enum";

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

	//MARK: Create Project
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

		let programme: ProgrammeEntity;

		if (projectDto.programmeId) {
			programme = await this.programmeService.findProgrammeById(projectDto.programmeId);
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
				kpi.expected = parseFloat(kpiItem.expected.toFixed(2));
				kpiList.push(kpi);
			}
			// Add event log entry after the loop completes
			this.addEventLogEntry(eventLog, LogEventType.KPI_ADDED, EntityType.PROJECT, project.projectId, user.id, kpiList);
		}

		const proj = await this.entityManager
			.transaction(async (em) => {
				const savedProject = await em.save<ProjectEntity>(project);
				if (savedProject) {
					const updatedProgrammeIds = [];
					let rootNodeType: EntityType;

					if (projectDto.programmeId) {
						const action = programme.action;
						if (programme.validated) {
							programme.validated = false;
							this.addEventLogEntry(
								eventLog, 
								LogEventType.PROGRAMME_UNVERIFIED_DUE_ATTACHMENT_CHANGE, 
								EntityType.PROGRAMME, 
								programme.programmeId, 
								0, 
								project.projectId
							);
							updatedProgrammeIds.push(programme.programmeId);
							rootNodeType = EntityType.PROGRAMME;

							await em.save<ProgrammeEntity>(programme)

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
								rootNodeType = EntityType.ACTION;

								await em.save<ActionEntity>(action)
							}
						}
					}
					await em.save<LogEntity>(eventLog);

					if (projectDto.kpis) {
						await em.save<KpiEntity>(kpiList);
					}

					if (rootNodeType && rootNodeType == EntityType.ACTION) {
						await this.linkUnlinkService.updateAllValidatedChildrenStatusByActionId(programme.action?.actionId, em, updatedProgrammeIds);
					} else if (rootNodeType && rootNodeType == EntityType.PROGRAMME) {
						await this.linkUnlinkService.updateAllValidatedChildrenAndParentStatusByProgrammeId(programme, em, true)
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

	//MARK: Query Project
	async query(query: QueryDto, abilityCondition: string): Promise<any> {
		// Subquery to get distinct project IDs
		const subQuery = this.projectRepo
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
		.orderBy(
			query?.sort?.key ? `"project"."${query?.sort?.key}"` : `"project"."projectId"`,
			query?.sort?.order ? query?.sort?.order : "DESC"
		);

    if (query.size && query.page) {
        subQuery.offset(query.size * query.page - query.size)
            .limit(query.size);
    }

    const projectIds = await subQuery.getRawMany();
    const projectIdsArray = projectIds.map(item => item.project_projectId);

    if (projectIdsArray.length === 0) {
        return new DataListResponseDto([], 0);
    }

		// Main query to join with the subquery
		const queryBuilder = this.projectRepo
			.createQueryBuilder("project")
			.where("project.projectId IN (:...projectIds)", { projectIds: projectIdsArray })
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

		const resp = await queryBuilder.getManyAndCount();
		const totalCount = await subQuery.getCount();

		return new DataListResponseDto(
			resp.length > 0 ? resp[0] : undefined,
			totalCount
		);
	}

	//MARK: Get Project View Data
	async getProjectViewData(projectId: string, abilityCondition: string) {

		const queryBuilder = this.projectRepo
			.createQueryBuilder("project")
			.where('project.projectId = :projectId', { projectId })
			.leftJoinAndMapOne(
				"project.migratedData",
				ProjectViewEntity,
				"projectViewEntity",
				"projectViewEntity.id = project.projectId"
			);
		const result = await queryBuilder.getOne();

		if (result && result.path) {
			const programmeId: string = result.path.split(".")[1];
			const programme = await this.programmeService.findProgrammeById(programmeId);
			result.programme = programme
		}

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

	//MARK: Update Project
	async updateProject(projectUpdateDto: ProjectUpdateDto, user: User) {
		const projectUpdate: ProjectEntity = plainToClass(ProjectEntity, projectUpdateDto);
		const eventLog = [];
		let programme;

		this.addEventLogEntry(eventLog, LogEventType.PROJECT_UPDATED, EntityType.PROJECT, projectUpdate.projectId, user.id, projectUpdateDto);

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

		// setting project to pending (Non-Validated) state
		if (currentProject.validated) {
			projectUpdate.validated = false;
			this.addEventLogEntry(eventLog, LogEventType.PROJECT_UNVERIFIED_DUE_UPDATE, EntityType.PROJECT, projectUpdate.projectId, 0, projectUpdateDto);
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
		const achievementsToRemove = [];

		const currentKpis = await this.kpiService.getKpisByCreatorTypeAndCreatorId(EntityType.PROJECT, projectUpdate.projectId);

		if (projectUpdateDto.kpis && projectUpdateDto.kpis.length > 0) {
			
			const addedKpis = projectUpdateDto.kpis.filter(kpi => !kpi.kpiId);

			if (addedKpis && addedKpis.length > 0) {
				for (const kpiItem of addedKpis) {
					this.payloadValidator.validateKpiPayload(kpiItem, EntityType.PROJECT);
					const kpi: KpiEntity = plainToClass(KpiEntity, kpiItem);
					kpi.kpiId = parseInt(await this.counterService.incrementCount(CounterType.KPI, 3));
					kpi.creatorId = projectUpdateDto.projectId;
					kpi.expected = parseFloat(kpiItem.expected.toFixed(2));
					kpiList.push(kpi);
				}
			}

			for (const currentKpi of currentKpis) {
				const kpiToUpdate = projectUpdateDto.kpis.find(kpi => currentKpi.kpiId == kpi.kpiId);
				if (kpiToUpdate) {
					this.payloadValidator.validateKpiPayload(kpiToUpdate, EntityType.PROJECT);
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

		if (projectUpdateDto.kpis && projectUpdateDto.kpis.length <= 0) {
			kpisToRemove.push(...currentKpis);
		}

		if (kpisToRemove.length > 0) {
			const kpiIdsToRemove = kpisToRemove.map(kpi => kpi.kpiId);
			const achievements = await this.kpiService.findAchievementsByKpiIds(kpiIdsToRemove);

			if (achievements && achievements.length > 0) {
				achievementsToRemove.push(...achievements);
			}
		}

		if (projectUpdateDto.kpis && projectUpdateDto.kpis.some(kpi => kpi.kpiAction===KPIAction.UPDATED)) {
			// Add event log entry after the loop completes
			this.addEventLogEntry(eventLog, LogEventType.KPI_UPDATED, EntityType.PROJECT, projectUpdate.projectId, user.id, kpiList);
		}

		if (projectUpdateDto.kpis && projectUpdateDto.kpis.some(kpi => kpi.kpiAction===KPIAction.CREATED)) {
			// Add event log entry after the loop completes
			this.addEventLogEntry(eventLog, LogEventType.KPI_ADDED, EntityType.PROJECT, projectUpdate.projectId, user.id, kpiList);
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
						await this.linkUnlinkService.unlinkProjectsFromProgramme([projectUpdate], projectUpdate.projectId, user, em, achievementsToRemove, false);
					} else if (currentProject.programme?.programmeId != projectUpdateDto.programmeId) {
						const achievementsToRemove = await this.kpiService.getAchievementsOfParentEntity(
							currentProject.programme.programmeId, 
							EntityType.PROGRAMME, 
							currentProject.projectId, 
							EntityType.PROJECT
						);
						await this.linkUnlinkService.unlinkProjectsFromProgramme([projectUpdate], projectUpdate.projectId, user, em, achievementsToRemove, false);
						await this.linkUnlinkService.linkProjectsToProgramme(programme, [projectUpdate], projectUpdateDto.programmeId, user, em);
					} else {
						await this.linkUnlinkService.updateAllValidatedChildrenAndParentStatusByProject(projectUpdate, em, false);
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

	//MARK: Delete Project
	async deleteProject(deleteDto: DeleteDto, user: User) {
		if (user.role !== Role.Admin && user.role !== Role.Root) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"user.userUnAUth",
					[]
				),
				HttpStatus.FORBIDDEN
			);
		}

		const project = await this.findProjectWithParentAndChildren(deleteDto.entityId);
		if (!project) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"project.projectNotFound",
					[deleteDto.entityId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (!this.helperService.doesUserHaveSectorPermission(user, project.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"project.permissionDeniedForSector",
					[project.projectId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		const eventLog = [];

		const projectKPIs = await this.kpiService.getKpisByCreatorTypeAndCreatorId(EntityType.PROJECT, project.projectId);

		const projectKpiIds = projectKPIs.map(kpi => kpi.kpiId);

		const linkedActivityIds = project.activities?.map(activity => activity.activityId);

		const proj = await this.entityManager
			.transaction(async (em) => {
				const programme = project.programme;
				const action = programme?.action;
				let rootNodeType: EntityType;
				const updatedProgrammeIds = [];

				const result = await em.delete<ProjectEntity>(ProjectEntity, project.projectId);
				if (result.affected > 0) {
					if (linkedActivityIds && linkedActivityIds.length > 0) {
						await em.delete<ActivityEntity>(ActivityEntity, linkedActivityIds);
					}

					if (projectKpiIds && projectKpiIds.length > 0) {
						await em.delete<KpiEntity>(KpiEntity, projectKpiIds);
					}

					if (programme && programme.validated) {
						programme.validated = false;
						eventLog.push(
							this.buildLogEntity(
								LogEventType.PROGRAMME_UNVERIFIED_DUE_ATTACHMENT_DELETE,
								EntityType.PROGRAMME,
								programme.programmeId,
								0,
								project.projectId
							)
						)
						rootNodeType = EntityType.PROGRAMME;
						updatedProgrammeIds.push(programme.programmeId);
						await em.save<ProgrammeEntity>(programme);

						if (action && action.validated) {
							action.validated = false;
							eventLog.push(
								this.buildLogEntity(
									LogEventType.ACTION_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
									EntityType.ACTION,
									action.actionId,
									0,
									programme.programmeId
								)
							)
	
							rootNodeType = EntityType.ACTION;
	
							await em.save<ActionEntity>(action);
						} 
					}

					// Save event logs
					if (eventLog.length > 0) {
						await em.save<LogEntity>(eventLog);
					}

					if (rootNodeType && rootNodeType == EntityType.ACTION) {
						await this.linkUnlinkService.updateAllValidatedChildrenStatusByActionId(action.actionId, em, updatedProgrammeIds, [project.projectId], linkedActivityIds)
					} else if (rootNodeType && rootNodeType == EntityType.PROGRAMME) {
						await this.linkUnlinkService.updateAllValidatedChildrenAndParentStatusByProgrammeId(programme, em, true);
					}
				}
				return result;
			})
			.catch((err: any) => {
				console.log(err);
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"project.projectDeletionFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("project.deleteProjectSuccess", []),
			null
		);
	}

	//MARK: Find Projects for Linking
	async findProjectsEligibleForLinking() {
		return await this.projectRepo.createQueryBuilder('project')
			.select(['"projectId"', 'title'])
			.where('project.programmeId IS NULL')
			.orderBy('project.projectId', 'ASC')
			.getRawMany();
	}

	//MARK: Link Projects
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

	//MARK: Unlink Projects
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

		const proj = await this.linkUnlinkService.unlinkProjectsFromProgramme(projects, unlinkProjectsDto, user, this.entityManager, achievementsToRemove, false);
		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("project.projectsUnlinkedFromProgramme", []),
			proj
		);

	}

	//MARK: Find Activities by Id
	async findAllActivitiesByIds(activityIds: string[]) {
		return await this.activityRepo.createQueryBuilder('activity')
			.where('activity.activityId IN (:...activityIds)', { activityIds })
			.getMany();
	}

	//MARK: Find Projects by Id
	async findAllProjectsByIds(projectIds: string[]) {
		return await this.projectRepo.createQueryBuilder('project')
			.leftJoinAndSelect('project.programme', 'programme')
			.leftJoinAndSelect('programme.action', 'action')
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

	//MARK: Find Project by Id
	async findProjectById(projectId: string) {
		return await this.projectRepo.createQueryBuilder('project')
			.leftJoinAndSelect('project.programme', 'programme')
			.leftJoinAndSelect('programme.action', 'action')
			.where('project.projectId = :projectId', { projectId })
			.getOne();
	}

	//MARK: Find Projects with parents children
	async findProjectWithParentAndChildren(projectId: string) {
		return await this.projectRepo.createQueryBuilder('project')
			.leftJoinAndSelect('project.programme', 'programme')
			.leftJoinAndSelect('programme.action', 'action')
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

	//MARK: Validate Project
	async validateProject(validateDto: ValidateDto, user: User) {

		this.helperService.doesUserHaveValidatePermission(user);

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

		if (validateDto.validateStatus && project.programme && !project.programme.validated) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"project.parentNotValidated",
					[project.programme?.programmeId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		project.validated = validateDto.validateStatus;
		const eventLog = this.buildLogEntity(
			(validateDto.validateStatus) ? LogEventType.PROJECT_VERIFIED : LogEventType.PROJECT_UNVERIFIED,
			EntityType.PROJECT,
			project.projectId,
			user.id,
			validateDto
		)

		const proj = await this.entityManager
		.transaction(async (em) => {
			const savedProject = await em.save<ProjectEntity>(project);
			if (savedProject) {
				if (!validateDto.validateStatus) {
					await this.linkUnlinkService.updateAllValidatedChildrenAndParentStatusByProject(project, em, true);
				}
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

	//MARK: Add Event Log Entry
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