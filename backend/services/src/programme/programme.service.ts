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
import { EntityType, IntImplementor, LogEventType, Recipient } from "../enums/shared.enum";
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

	) { }

	async createProgramme(programmeDto: ProgrammeDto, user: User) {

		const programme: ProgrammeEntity = plainToClass(ProgrammeEntity, programmeDto);

		const eventLog = [];

		programme.programmeId = 'P' + await this.counterService.incrementCount(CounterType.PROGRAMME, 3);

		// upload the documents and create the doc array here
		if (programmeDto.documents) {
			const documents = [];
			for (const documentItem of programmeDto.documents) {
				const response = await this.fileUploadService.uploadDocument(documentItem.data, documentItem.title);
				const docEntity = new DocumentEntityDto();
				docEntity.title = documentItem.title;
				docEntity.url = response;
				docEntity.createdTime = new Date().getTime();
				documents.push(docEntity)
			};
			programme.documents = documents;

		}
		this.addEventLogEntry(eventLog, LogEventType.PROGRAMME_CREATED, EntityType.PROGRAMME, programme.programmeId, user.id, programmeDto);

		const kpiList = [];
		if (programmeDto.kpis) {
			for (const kpiItem of programmeDto.kpis) {
				this.payloadValidator.validateKpiPayload(kpiItem, EntityType.PROGRAMME);
				const kpi: KpiEntity = plainToClass(KpiEntity, kpiItem);
				kpi.kpiId = parseInt(await this.counterService.incrementCount(CounterType.KPI, 3));
				kpi.creatorId = programme.programmeId;
				kpiList.push(kpi);
			}
			// Add event log entry after the loop completes
			this.addEventLogEntry(eventLog, LogEventType.KPI_ADDED, EntityType.PROGRAMME, programme.programmeId, user.id, kpiList);
		}

		programme.path = "";

		if (programmeDto.actionId) {
			const action = await this.actionService.findActionById(programmeDto.actionId);
			if (!action) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"programme.actionNotFound",
						[programmeDto.actionId]
					),
					HttpStatus.BAD_REQUEST
				);
			}
			programme.action = action;
			programme.path = programmeDto.actionId;
			this.addEventLogEntry(eventLog, LogEventType.PROGRAMME_LINKED, EntityType.ACTION, action.actionId, user.id, programme.programmeId);
			this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_ACTION, EntityType.PROGRAMME, programme.programmeId, user.id, action.actionId);
		}

		let projects;
		if (programmeDto.linkedProjects) {
			projects = await this.findAllProjectsByIds(programmeDto.linkedProjects);

		}

		const prog = await this.entityManager
			.transaction(async (em) => {
				const savedProgramme = await em.save<ProgrammeEntity>(programme);
				if (savedProgramme) {
					if (programmeDto.kpis) {
						kpiList.forEach(async kpi => {
							await em.save<KpiEntity>(kpi)
						});
					}
					eventLog.forEach(async event => {
						await em.save<LogEntity>(event);
					});
					// linking projects and updating paths of projects and activities
					if (projects && projects.length > 0) {
						await this.linkUnlinkService.linkProjectsToProgramme(savedProgramme, projects, programmeDto, user, em);
					}

					// if (programmeDto.linkedProjects) {
					// 	await this.projectService.linkProjectsToProgramme({
					// 		programmeId: savedProgramme.programmeId,
					// 		projectIds: programmeDto.linkedProjects

					// 	}, user)
					// }

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

	async query(query: QueryDto, abilityCondition: string): Promise<any> {
		const queryBuilder = await this.programmeRepo
			.createQueryBuilder("programme")
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
			.leftJoinAndSelect("programme.action", "action")
			.leftJoinAndSelect("programme.projects", "projects")
			.orderBy(
				query?.sort?.key ? `"programme"."${query?.sort?.key}"` : `"programme"."programmeId"`,
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

		const programmes = await this.findAllProgrammeByIds(linkProgrammesDto.programmes);

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
			if (user.sector && user.sector.length > 0) {
				const commonSectors = programme.affectedSectors.filter(sector => user.sector.includes(sector));
				if (commonSectors.length === 0) {
					throw new HttpException(
						this.helperService.formatReqMessagesString(
							"programme.cannotLinkNotRelatedProgrammes",
							[programme.programmeId]
						),
						HttpStatus.BAD_REQUEST
					);
				}
			}
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

		const prog = await this.linkUnlinkService.linkProgrammesToAction(action, programmes, linkProgrammesDto, user, this.entityManager);

		await this.helperService.refreshMaterializedViews(this.entityManager);

		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("programme.programmesLinkedToAction", []),
			prog
		);
	}

	async unlinkProgrammesFromAction(unlinkProgrammesDto: UnlinkProgrammesDto, user: User) {
		const programmes = await this.findAllProgrammeByIds(unlinkProgrammesDto.programmes);

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
			if (user.sector && user.sector.length > 0) {
				const commonSectors = programme.affectedSectors.filter(sector => user.sector.includes(sector));
				if (commonSectors.length === 0) {
					throw new HttpException(
						this.helperService.formatReqMessagesString(
							"programme.cannotUnlinkNotRelatedProgrammes",
							[programme.programmeId]
						),
						HttpStatus.BAD_REQUEST
					);
				}
			}
			if (!programme.action) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"programme.programmeIsNotLinked",
						[programme.programmeId]
					),
					HttpStatus.BAD_REQUEST
				);
			}
		}
		const prog = await this.linkUnlinkService.unlinkProgrammesFromAction(programmes, unlinkProgrammesDto, user, this.entityManager);

		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("programme.programmesUnlinkedFromAction", []),
			prog
		);
	}

	async findAllProgrammeByIds(programmeIds: string[]) {
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
			.where('programme.programmeId IN (:...programmeIds)', { programmeIds })
			.getMany();
	}

	async findProgrammeById(programmeId: string) {
		return await this.programmeRepo.findOneBy({
			programmeId
		})
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

		const typesSet: Set<string> = new Set();
		const recipientEntitySet: Set<Recipient> = new Set();
		const interNationalImplementorSet: Set<IntImplementor> = new Set();

		if (programme.projects && programme.projects.length > 0) {
			for (const project of programme.projects) {
				if (project.type) typesSet.add(project.type);
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

		const types: string[] = Array.from(typesSet);
		const recipientEntity: string[] = Array.from(recipientEntitySet);
		const interNationalImplementor: string[] = Array.from(interNationalImplementorSet);

		const programmeViewDto = new ProgrammeViewDto();
		programmeViewDto.programmeId = programme.programmeId;
		programmeViewDto.actionId = programme.action?.actionId;
		programmeViewDto.types = types;
		programmeViewDto.title = programme.title;
		programmeViewDto.description = programme.description;
		programmeViewDto.objectives = programme.objective;
		programmeViewDto.instrumentType = programme.action?.instrumentType;
		programmeViewDto.affectedSectors = programme.affectedSectors;
		programmeViewDto.affectedSubSector = programme.affectedSubSector;
		programmeViewDto.programmeStatus = null;
		programmeViewDto.recipientEntity = recipientEntity;
		programmeViewDto.startYear = programme.startYear;
		programmeViewDto.interNationalImplementor = interNationalImplementor;
		programmeViewDto.nationalImplementor = programme.natImplementor;
		programmeViewDto.investment = programme.investment;
		programmeViewDto.documents = programme.documents;
		programmeViewDto.comments = programme.comments;

		return programmeViewDto;

	}
}