import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { plainToClass } from "class-transformer";
import { ActivityService } from "../activity/activity.service";
import { DataListResponseDto } from "../dtos/data.list.response";
import { DataResponseMessageDto } from "../dtos/data.response.message";
import { QueryDto } from "../dtos/query.dto";
import { SupportDto } from "../dtos/support.dto";
import { SupportUpdateDto } from "../dtos/supportUpdate.dto";
import { ValidateDto } from "../dtos/validate.dto";
import { LogEntity } from "../entities/log.entity";
import { SupportEntity } from "../entities/support.entity";
import { User } from "../entities/user.entity";
import { CounterType } from "../enums/counter.type.enum";
import { EntityType, LogEventType } from "../enums/shared.enum";
import { CounterService } from "../util/counter.service";
import { HelperService } from "../util/helpers.service";
import { EntityManager, Repository } from "typeorm";
import { ProjectEntity } from "../entities/project.entity";
import { ActivityEntity } from "../entities/activity.entity";
import { DeleteDto } from "../dtos/delete.dto";
import { Role } from "../casl/role.enum";
import { LinkUnlinkService } from "../util/linkUnlink.service";

@Injectable()
export class SupportService {
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		@InjectRepository(SupportEntity) private supportRepo: Repository<SupportEntity>,
		private counterService: CounterService,
		private helperService: HelperService,
		private activityService: ActivityService,
		private linkUnlinkService: LinkUnlinkService
	) { }

	//MARK: Create Support
	async createSupport(supportDto: SupportDto, user: User) {
		const support: SupportEntity = plainToClass(SupportEntity, supportDto);

		const eventLog = [];

		support.supportId = 'S' + await this.counterService.incrementCount(CounterType.SUPPORT, 5);

		const activity = await this.activityService.findActivityById(supportDto.activityId);
		if (!activity) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"support.activityNotFound",
					[supportDto.activityId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (!this.helperService.doesUserHaveSectorPermission(user, activity.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"support.cannotLinkToNotRelatedActivity",
					[supportDto.activityId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		const activitySupports = await this.findSupportsByActivityId(activity.activityId);

		let parentProject: ProjectEntity;
		if (activity.parentType == EntityType.PROJECT) {
			parentProject = await this.activityService.isProjectValid(activity.parentId, user);
		}

		support.requiredAmountDomestic = this.helperService.roundToTwoDecimals(support.requiredAmount / support.exchangeRate);
		support.receivedAmountDomestic = this.helperService.roundToTwoDecimals(support.receivedAmount / support.exchangeRate);
		support.sector = activity.sector;

		support.activity = activity;
		this.addEventLogEntry(eventLog, LogEventType.SUPPORT_CREATED, EntityType.SUPPORT, support.supportId, user.id, supportDto);
		this.addEventLogEntry(eventLog, LogEventType.SUPPORT_LINKED, EntityType.ACTIVITY, activity.activityId, user.id, support.supportId);
		this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_ACTIVITY, EntityType.SUPPORT, support.supportId, user.id, activity.activityId);

		const sup = await this.entityManager
			.transaction(async (em) => {
				const savedSupport = await em.save<SupportEntity>(support);
				if (savedSupport) {
					let unvalidateTree = false;

					if (activity.validated) {
						activity.validated = false;
						this.addEventLogEntry(
							eventLog, 
							LogEventType.ACTIVITY_UNVERIFIED_DUE_ATTACHMENT_CHANGE, 
							EntityType.ACTIVITY, 
							activity.activityId, 
							0, 
							support.supportId
						);
						await em.save<ActivityEntity>(activity);

						if (activitySupports && activitySupports.length > 0) {
							const supportsList = []
							for (const support of activitySupports) {
								if (support.validated) {
									support.validated = false;
									supportsList.push(support);
								}
							}
							em.save<SupportEntity>(supportsList);
						}

						if (parentProject && parentProject.validated) {
							parentProject.validated = false;
							this.addEventLogEntry(
								eventLog, 
								LogEventType.PROJECT_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE, 
								EntityType.PROJECT, 
								parentProject.projectId, 
								0, 
								activity.activityId
							);
							unvalidateTree = true;
							await em.save<ProjectEntity>(parentProject);
						}
					}

					await em.save<LogEntity>(eventLog);

					if (unvalidateTree) {
						await this.linkUnlinkService.updateAllValidatedChildrenAndParentStatusByProject(parentProject, em, true, [activity.activityId]);
					} else {
						await this.linkUnlinkService.updateAllValidatedChildrenAndParentStatusByActivityId(activity.activityId, em, [support.supportId]);
					}
				}
				return savedSupport;
			})
			.catch((err: any) => {
				console.log(err);
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"support.supportCreationFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.CREATED,
			this.helperService.formatReqMessagesString("support.createSupportSuccess", []),
			sup
		);

	}

	//MARK: Support Query
	async query(query: QueryDto, abilityCondition: string): Promise<any> {
		const queryBuilder = this.supportRepo
			.createQueryBuilder("support")
			.where(
				this.helperService.generateWhereSQL(
					query,
					this.helperService.parseMongoQueryToSQLWithTable(
						'"support"',
						abilityCondition
					),
					'"support"'
				)
			)
			.leftJoinAndSelect("support.activity", "activity")
			.orderBy(
				query?.sort?.key ? `"support"."${query?.sort?.key}"` : `"support"."supportId"`,
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

	//MARK: Find Support by Id with supports
	async findSupportByIdWithActivity(supportId: string) {
		return await this.supportRepo.createQueryBuilder('support')
			.leftJoinAndSelect('support.activity', 'activity')
			.where('support.supportId = :supportId', { supportId })
			.getOne();
	}

	//MARK: Find Supports by Activity Id
	async findSupportsByActivityId(activity: string) {
		return await this.supportRepo.createQueryBuilder('support')
			.where('support.activityId = :activity', { activity })
			.getMany();
	}

	//MARK: Update Support
	async updateSupport(supportUpdateDto: SupportUpdateDto, user: User) {
		const currentSupport = await this.findSupportByIdWithActivity(supportUpdateDto.supportId);
		if (!currentSupport) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"support.supportNotFound",
					[supportUpdateDto.supportId]
				),
				HttpStatus.BAD_REQUEST
			);
		}
		const eventLog = [];

		if (!this.helperService.doesUserHaveSectorPermission(user, currentSupport.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"support.cannotUpdateNotRelatedSupport",
					[currentSupport.supportId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		this.addEventLogEntry(eventLog, LogEventType.SUPPORT_UPDATED, EntityType.SUPPORT, supportUpdateDto.supportId, user.id, supportUpdateDto);

		const activityList: ActivityEntity[] = [];
		const projectList: ProjectEntity[] = [];

		const updatedProjectIds = [];
		const updatedActivityIds = [];

		if (currentSupport.activity.validated) {
			const currentActivity = currentSupport.activity;
			currentActivity.validated = false;
			this.addEventLogEntry(
				eventLog, 
				LogEventType.ACTIVITY_UNVERIFIED_DUE_ATTACHMENT_CHANGE, 
				EntityType.ACTIVITY, 
				currentActivity.activityId, 
				0, 
				currentSupport.supportId
			);
			activityList.push(currentActivity);
			updatedActivityIds.push(currentActivity.activityId);

			if (currentActivity.parentType == EntityType.PROJECT) {
				const currentParentProject = await this.activityService.isProjectValid(currentSupport.activity.parentId, user);
				if (currentParentProject.validated) {
					currentParentProject.validated = false;
					this.addEventLogEntry(
						eventLog, 
						LogEventType.PROJECT_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE, 
						EntityType.PROJECT, 
						currentParentProject.projectId, 
						0, 
						currentSupport.supportId
					);
					projectList.push(currentParentProject);
					updatedProjectIds.push(currentParentProject.projectId);
				}
			}

		}

		if (supportUpdateDto.activityId != currentSupport.activity.activityId) {

			const activity = await this.activityService.findActivityById(supportUpdateDto.activityId);
			if (!activity) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"support.activityNotFound",
						[supportUpdateDto.activityId]
					),
					HttpStatus.BAD_REQUEST
				);
			}
	
			if (!this.helperService.doesUserHaveSectorPermission(user, activity.sector)) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"support.cannotLinkToNotRelatedActivity",
						[supportUpdateDto.activityId]
					),
					HttpStatus.FORBIDDEN
				);
			}

			this.addEventLogEntry(eventLog, LogEventType.UNLINKED_FROM_ACTIVITY, EntityType.SUPPORT, currentSupport.supportId, user.id, currentSupport.activity.activityId);
			this.addEventLogEntry(eventLog, LogEventType.SUPPORT_LINKED, EntityType.ACTIVITY, activity.activityId, user.id, supportUpdateDto.supportId);
			this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_ACTIVITY, EntityType.SUPPORT, supportUpdateDto.supportId, user.id, activity.activityId);

			currentSupport.activity = activity;
			currentSupport.sector = activity.sector;

			if (activity.validated) {
				activity.validated = false;
				this.addEventLogEntry(
					eventLog, 
					LogEventType.ACTIVITY_UNVERIFIED_DUE_ATTACHMENT_CHANGE, 
					EntityType.ACTIVITY, 
					activity.activityId, 
					0, 
					currentSupport.supportId
				);
				activityList.push(activity);
				updatedActivityIds.push(activity.activityId);

				if (activity.parentType == EntityType.PROJECT) {
					const newParentProject = await this.activityService.isProjectValid(activity.parentId, user);
					if (newParentProject.validated) {
						newParentProject.validated = false;
						this.addEventLogEntry(
							eventLog, 
							LogEventType.PROJECT_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE, 
							EntityType.PROJECT, 
							newParentProject.projectId, 
							0, 
							activity.activityId
						);
						projectList.push(newParentProject);
						updatedProjectIds.push(newParentProject.projectId);
					}
				}
			}
	
			
		}

		currentSupport.direction = supportUpdateDto.direction;
		currentSupport.financeNature = supportUpdateDto.financeNature;
		currentSupport.internationalSupportChannel = supportUpdateDto.internationalSupportChannel;
		currentSupport.internationalFinancialInstrument = supportUpdateDto.internationalFinancialInstrument;
		currentSupport.nationalFinancialInstrument = supportUpdateDto.nationalFinancialInstrument;
		currentSupport.financingStatus = supportUpdateDto.financingStatus;
		currentSupport.internationalSource = supportUpdateDto.internationalSource;
		currentSupport.nationalSource = supportUpdateDto.nationalSource;
		currentSupport.requiredAmount = supportUpdateDto.requiredAmount;
		currentSupport.receivedAmount = supportUpdateDto.receivedAmount;
		currentSupport.exchangeRate = supportUpdateDto.exchangeRate;
		currentSupport.requiredAmountDomestic = this.helperService.roundToTwoDecimals(currentSupport.requiredAmount / currentSupport.exchangeRate);
		currentSupport.receivedAmountDomestic = this.helperService.roundToTwoDecimals(currentSupport.receivedAmount / currentSupport.exchangeRate);
		currentSupport.validated = false;

		const sup = await this.entityManager
			.transaction(async (em) => {
				const savedSupport = await em.save<SupportEntity>(currentSupport);
				if (savedSupport) {
					if (activityList && activityList.length > 0) {
						await em.save<ActivityEntity>(activityList)
					}

					if (projectList && projectList.length > 0) {
						await em.save<ProjectEntity>(projectList)
					}

					await em.save<LogEntity>(eventLog);

					if (projectList && projectList.length > 0) {
						for (const project of projectList) {
							await this.linkUnlinkService.updateAllValidatedChildrenAndParentStatusByProject(project, em, true, updatedActivityIds);
						}
						for (const activity of activityList) {
							await this.linkUnlinkService.updateAllValidatedChildrenAndParentStatusByActivityId(activity.activityId, em, [currentSupport.supportId]);
						}
					} else {
						for (const activity of activityList) {
							await this.linkUnlinkService.updateAllValidatedChildrenAndParentStatusByActivityId(activity.activityId, em, [currentSupport.supportId]);
						}
						
					}

					
				}
				return savedSupport;
			})
			.catch((err: any) => {
				console.log(err);
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"support.supportUpdateFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("support.updateSupportSuccess", []),
			sup
		);
	}

	//MARK: Delete Support
	async deleteSupport(deleteDto: DeleteDto, user: User) {

		if (user.role !== Role.Admin && user.role !== Role.Root) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"user.userUnAUth",
					[]
				),
				HttpStatus.FORBIDDEN
			);
		}

		const support = await this.findSupportByIdWithActivity(deleteDto.entityId);
		if (!support) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"support.supportNotFound",
					[deleteDto.entityId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (!this.helperService.doesUserHaveSectorPermission(user, support.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"support.permissionDeniedForSector",
					[support.supportId]
				),
				HttpStatus.FORBIDDEN
			);
		}
		
		const eventLog = [];
		const activity = support.activity;

		const sup = await this.entityManager
		.transaction(async (em) => {
			const result = await em.delete<SupportEntity>(SupportEntity, support.supportId);
			if (result.affected > 0) {
				if (activity.validated) {
					activity.validated = false;
					this.addEventLogEntry(
						eventLog, 
						LogEventType.ACTIVITY_UNVERIFIED_DUE_ATTACHMENT_DELETE, 
						EntityType.ACTIVITY, 
						activity.activityId, 
						0, 
						support.supportId
					);
					await em.save<ActivityEntity>(activity);

					if (activity.parentType == EntityType.PROJECT) {
						const parentProject = await this.activityService.isProjectValid(activity.parentId, user);
						if (parentProject.validated) {
							parentProject.validated = false;
							this.addEventLogEntry(
								eventLog, 
								LogEventType.PROJECT_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE, 
								EntityType.PROJECT, 
								parentProject.projectId, 
								0, 
								activity.activityId
							);
							await em.save<ProjectEntity>(parentProject);

							await this.linkUnlinkService.updateAllValidatedChildrenAndParentStatusByProject(parentProject, em, true, [activity.activityId]);
						} else {
							await this.linkUnlinkService.updateAllValidatedChildrenAndParentStatusByActivityId(activity.activityId, em, [support.supportId]);
						}
						
					} else {
						await this.linkUnlinkService.updateAllValidatedChildrenAndParentStatusByActivityId(activity.activityId, em, [support.supportId]);
					}
				}
				// Save event logs
				await em.save<LogEntity>(eventLog);
			}
			return result;
		})
		.catch((err: any) => {
			console.error(err);
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"support.supportDeleteFailed",
					[err]
				),
				HttpStatus.BAD_REQUEST
			);
		});

		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("support.deleteSupportSuccess", []),
			null
		);

	}

	//MARK: Validate Support
	async validateSupport(validateDto: ValidateDto, user: User) {

		this.helperService.doesUserHaveValidatePermission(user);

		const support = await this.findSupportByIdWithActivity(validateDto.entityId);
		if (!support) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"support.supportNotFound",
					[validateDto.entityId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (!this.helperService.doesUserHaveSectorPermission(user, support.sector)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"support.permissionDeniedForSector",
					[support.supportId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		if (validateDto.validateStatus && support.activity && !support.activity.validated) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"support.parentNotValidated",
					[support.activity?.activityId]
				),
				HttpStatus.FORBIDDEN
			);
		}

		support.validated = validateDto.validateStatus;
		const eventLog = this.buildLogEntity(
			(validateDto.validateStatus) ? LogEventType.SUPPORT_VERIFIED : LogEventType.SUPPORT_UNVERIFIED,
			EntityType.SUPPORT, 
			support.supportId, 
			user.id, 
			validateDto
		)

		const sup = await this.entityManager
			.transaction(async (em) => {
				const savedSupport = await em.save<SupportEntity>(support);
				if (savedSupport) {
					// Save event logs
					await em.save<LogEntity>(eventLog);
				}
				return savedSupport;
			})
			.catch((err: any) => {
				console.log(err);
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"support.supportVerificationFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("support.verifySupportSuccess", []),
			sup
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