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

@Injectable()
export class ActionService {
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		@InjectRepository(ActionEntity) private actionRepo: Repository<ActionEntity>,
		@InjectRepository(ProgrammeEntity) private programmeRepo: Repository<ProgrammeEntity>,
		private counterService: CounterService,
		private helperService: HelperService,
		private fileUploadService: FileUploadService,
		private payloadValidator: PayloadValidator,
		private linkUnlinkService: LinkUnlinkService
	) { }

	async createAction(actionDto: ActionDto, user: User) {

		const action: ActionEntity = plainToClass(ActionEntity, actionDto);
		const eventLog = [];

		action.actionId = 'A' + await this.counterService.incrementCount(CounterType.ACTION, 3);

		const linkedProgrammeList = [];
		let programmes;
		if (actionDto.linkedProgrammes) {
			programmes = await this.findAllProgrammeByIds(actionDto.linkedProgrammes);
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
		this.addEventLogEntry(eventLog, LogEventType.ACTION_CREATED, EntityType.ACTION, action.actionId, user.id, actionDto);

		const kpiList = [];
		if (actionDto.kpis) {
			for (const kpiItem of actionDto.kpis) {
				this.payloadValidator.validateKpiPayload(kpiItem, EntityType.ACTION);
				const kpi: KpiEntity = plainToClass(KpiEntity, kpiItem);
				kpi.kpiId = parseInt(await this.counterService.incrementCount(CounterType.KPI, 3));
				kpi.creatorId = action.actionId;
				kpiList.push(kpi);
			}
			// Add event log entry after the loop completes
			this.addEventLogEntry(eventLog, LogEventType.KPI_ADDED, EntityType.ACTION, action.actionId, user.id, kpiList);
		}

		const act = await this.entityManager
			.transaction(async (em) => {
				const savedAction = await em.save<ActionEntity>(action);
				if (savedAction) {
					// link programmes here
					if (programmes && programmes.length > 0) {
						await this.linkUnlinkService.linkProgrammesToAction(savedAction, programmes, actionDto, user, em);
					}
					if (actionDto.kpis) {
						kpiList.forEach(async kpi => {
							await em.save<KpiEntity>(kpi)
						});
					}

					eventLog.forEach(async event => {
						await em.save<LogEntity>(event);
					});
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

	// adding find method to action service to avoid a circular dependency with programme service
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

	async getActionViewData(actionId: string, abilityCondition: string) {

		const queryBuilder = await this.actionRepo
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
		const queryBuilder = await this.actionRepo
			.createQueryBuilder("action")
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

	private addEventLogEntry = (
		eventLog: any[],
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

		eventLog.push(log);
		return eventLog;
	}
}