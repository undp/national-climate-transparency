import { EntityManager, Repository, SelectQueryBuilder } from "typeorm";
import { SupportService } from "./support.service";
import { SupportEntity } from "../entities/support.entity";
import { HelperService } from "../util/helpers.service";
import { CounterService } from "../util/counter.service";
import { ActivityService } from "../activity/activity.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { ActivityEntity } from "../entities/activity.entity";
import { ActivityStatus, Measure } from "../enums/activity.enum";
import { SupportDto } from "../dtos/support.dto";
import { FinanceNature, FinancingStatus, IntFinInstrument, IntSource, IntSupChannel, SupportDirection } from "../enums/support.enum";
import { Sector } from "../enums/sector.enum";
import { HttpException, HttpStatus } from "@nestjs/common";
import { DataResponseMessageDto } from "../dtos/data.response.message";
import { ValidateDto } from "../dtos/validate.dto";
import { LinkUnlinkService } from "../util/linkUnlink.service";
import { Role } from "../casl/role.enum";
import { EntityType } from "../enums/shared.enum";
import { ProjectEntity } from "../entities/project.entity";

describe('SupportService', () => {
	let service: SupportService;
	let entityManagerMock: Partial<EntityManager>;
	let supportRepositoryMock: Partial<Repository<SupportEntity>>;
	let counterServiceMock: Partial<CounterService>;
	let helperServiceMock: Partial<HelperService>;
	let activityServiceMock: Partial<ActivityService>;
	let linkUnlinkServiceMock: Partial<LinkUnlinkService>;


	beforeEach(async () => {
		entityManagerMock = {
			transaction: jest.fn(),
			save: jest.fn(),
			query: jest.fn(),

		};
		counterServiceMock = {
			incrementCount: jest.fn().mockResolvedValue(1),
		};
		supportRepositoryMock = {
			save: jest.fn(),
			createQueryBuilder: jest.fn(() => ({
				where: jest.fn().mockReturnThis(),
				getMany: jest.fn(),
			})) as unknown as () => SelectQueryBuilder<SupportEntity>,
		};
		helperServiceMock = {
			formatReqMessagesString: jest.fn(),
			parseMongoQueryToSQLWithTable: jest.fn(),
			generateWhereSQL: jest.fn(),
			refreshMaterializedViews: jest.fn(),
			doesUserHaveSectorPermission: jest.fn(),
			roundToTwoDecimals: jest.fn(),
			doesUserHaveValidatePermission: jest.fn(),
		};
		activityServiceMock = {
			findActivityById: jest.fn(),
			isProjectValid: jest.fn()
		}
		linkUnlinkServiceMock = {
			updateAllValidatedChildrenAndParentStatusByActivityId: jest.fn(),
			updateAllValidatedChildrenAndParentStatusByProject: jest.fn(),
		}

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SupportService,
				{
					provide: EntityManager,
					useValue: entityManagerMock,
				},
				{
					provide: CounterService,
					useValue: counterServiceMock,
				},
				{
					provide: getRepositoryToken(SupportEntity),
					useValue: supportRepositoryMock,
				},
				{
					provide: HelperService,
					useValue: helperServiceMock,
				},
				{
					provide: ActivityService,
					useValue: activityServiceMock,
				},
				{
					provide: LinkUnlinkService,
					useValue: linkUnlinkServiceMock,
				},
			],
		}).compile();

		service = module.get<SupportService>(SupportService);
	});

	describe('createSupport', () => {
		it('should create an international support successfully', async () => {
			const user = new User();
			user.id = 2;
			user.sector = [Sector.Energy];

			const activity = new ActivityEntity();
			activity.activityId = "T00003";
			activity.title = "test";
			activity.description = "test description";
			activity.status = ActivityStatus.PLANNED;
			activity.measure = Measure.WITHOUT_MEASURES;

			const supportDto = new SupportDto();
			supportDto.activityId = "T00003";
			supportDto.direction = SupportDirection.RECEIVED;
			supportDto.financeNature = FinanceNature.INTERNATIONAL;
			supportDto.internationalSupportChannel = IntSupChannel.MULTILATERAL;
			supportDto.internationalFinancialInstrument = IntFinInstrument.GRANT;
			supportDto.financingStatus = FinancingStatus.COMMITTED;
			supportDto.internationalSource = [IntSource.AFC];
			supportDto.nationalSource = "ASD";
			supportDto.requiredAmount = 100;
			supportDto.receivedAmount = 100;
			supportDto.exchangeRate = 200;

			jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
			jest.spyOn(activityServiceMock, 'findActivityById').mockResolvedValueOnce(activity);
			jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(new SupportEntity()),
				};
				const savedSupport = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(2);
				return savedSupport;
			});

			const result = await service.createSupport(supportDto, user);

			expect(result).toEqual(expect.any(DataResponseMessageDto));
			expect(result.statusCode).toEqual(HttpStatus.CREATED);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("support.createSupportSuccess", []);
			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
			expect(activityServiceMock.findActivityById).toHaveBeenCalledTimes(1)
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
		});

		it('should throw an error when trying to create support with invalid Activity id', async () => {
			const user = new User();
			user.id = 2;
			user.sector = [Sector.Energy];

			const supportDto = new SupportDto();
			supportDto.activityId = "T00003";
			supportDto.direction = SupportDirection.RECEIVED;
			supportDto.financeNature = FinanceNature.INTERNATIONAL;
			supportDto.internationalSupportChannel = IntSupChannel.MULTILATERAL;
			supportDto.internationalFinancialInstrument = IntFinInstrument.GRANT;
			supportDto.financingStatus = FinancingStatus.COMMITTED;
			supportDto.internationalSource = [IntSource.AFC];
			supportDto.nationalSource = "ASD";
			supportDto.requiredAmount = 100;
			supportDto.receivedAmount = 100;
			supportDto.exchangeRate = 200;

			jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
			jest.spyOn(activityServiceMock, 'findActivityById').mockResolvedValueOnce(null);
			jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(new SupportEntity()),
				};
				const savedSupport = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(0);
				return savedSupport;
			});

			try {
				await service.createSupport(supportDto, user);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.BAD_REQUEST);
			}

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("support.activityNotFound", ["T00003"]);
			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(0);
			expect(activityServiceMock.findActivityById).toHaveBeenCalledTimes(1)
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
		});

		it('should throw an error when user do not have permission to link activity to support', async () => {
			const user = new User();
			user.id = 2;
			user.sector = [Sector.Energy];

			const activity = new ActivityEntity();
			activity.activityId = "T00003";
			activity.title = "test";
			activity.description = "test description";
			activity.status = ActivityStatus.PLANNED;
			activity.measure = Measure.WITHOUT_MEASURES;

			const supportDto = new SupportDto();
			supportDto.activityId = "T00003";
			supportDto.direction = SupportDirection.RECEIVED;
			supportDto.financeNature = FinanceNature.INTERNATIONAL;
			supportDto.internationalSupportChannel = IntSupChannel.MULTILATERAL;
			supportDto.internationalFinancialInstrument = IntFinInstrument.GRANT;
			supportDto.financingStatus = FinancingStatus.COMMITTED;
			supportDto.internationalSource = [IntSource.AFC];
			supportDto.nationalSource = "ASD";
			supportDto.requiredAmount = 100;
			supportDto.receivedAmount = 100;
			supportDto.exchangeRate = 200;

			jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
			jest.spyOn(activityServiceMock, 'findActivityById').mockResolvedValueOnce(activity);
			jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValue(false);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(new SupportEntity()),
				};
				const savedSupport = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(0);
				return savedSupport;
			});

			try {
				await service.createSupport(supportDto, user);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.FORBIDDEN);
			}

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("support.cannotLinkToNotRelatedActivity", ["T00003"]);
			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(0);
			expect(activityServiceMock.findActivityById).toHaveBeenCalledTimes(1)
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
		});


	})

	describe('updateSupport', () => {
		it('should throw an error when user try to update incorrect support', async () => {
			const user = new User();
			user.id = 2;
			user.sector = [Sector.Energy];

			const activity = new ActivityEntity();
			activity.activityId = "T00003";
			activity.title = "test";
			activity.description = "test description";
			activity.status = ActivityStatus.PLANNED;
			activity.measure = Measure.WITHOUT_MEASURES;

			const supportDto = new SupportDto();
			supportDto.activityId = "T00003";
			supportDto.direction = SupportDirection.RECEIVED;
			supportDto.financeNature = FinanceNature.INTERNATIONAL;
			supportDto.internationalSupportChannel = IntSupChannel.MULTILATERAL;
			supportDto.internationalFinancialInstrument = IntFinInstrument.GRANT;
			supportDto.financingStatus = FinancingStatus.COMMITTED;
			supportDto.internationalSource = [IntSource.AFC];
			supportDto.nationalSource = "ASD";
			supportDto.requiredAmount = 100;
			supportDto.receivedAmount = 100;
			supportDto.exchangeRate = 200;

			jest.spyOn(service, 'findSupportByIdWithActivity').mockResolvedValueOnce(null);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(new SupportEntity()),
				};
				const savedSupport = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(0);
				return savedSupport;
			});

			try {
				await service.updateSupport(supportDto, user);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.BAD_REQUEST);
			}

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("support.supportNotFound", []);
			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(0);
			expect(service.findSupportByIdWithActivity).toHaveBeenCalledTimes(1)
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
		});

		it('should throw an error when user do not have permission to update support', async () => {
			const user = new User();
			user.id = 2;
			user.sector = [Sector.Energy];

			const activity = new ActivityEntity();
			activity.activityId = "T00003";
			activity.title = "test";
			activity.description = "test description";
			activity.status = ActivityStatus.PLANNED;
			activity.measure = Measure.WITHOUT_MEASURES;

			const supportDto = new SupportDto();
			supportDto.activityId = "T00003";
			supportDto.direction = SupportDirection.RECEIVED;
			supportDto.financeNature = FinanceNature.INTERNATIONAL;
			supportDto.internationalSupportChannel = IntSupChannel.MULTILATERAL;
			supportDto.internationalFinancialInstrument = IntFinInstrument.GRANT;
			supportDto.financingStatus = FinancingStatus.COMMITTED;
			supportDto.internationalSource = [IntSource.AFC];
			supportDto.nationalSource = "ASD";
			supportDto.requiredAmount = 100;
			supportDto.receivedAmount = 100;
			supportDto.exchangeRate = 200;

			const support = new SupportEntity();
			support.activity = activity;
			support.direction = SupportDirection.RECEIVED;
			support.financeNature = FinanceNature.INTERNATIONAL;
			support.internationalSupportChannel = IntSupChannel.MULTILATERAL;
			support.internationalFinancialInstrument = IntFinInstrument.GRANT;
			support.financingStatus = FinancingStatus.COMMITTED;
			support.internationalSource = [IntSource.AFC];
			support.nationalSource = "ASD";
			support.requiredAmount = 100;
			support.receivedAmount = 100;
			support.exchangeRate = 200;

			jest.spyOn(service, 'findSupportByIdWithActivity').mockResolvedValueOnce(support);
			// jest.spyOn(activityServiceMock, 'findActivityById').mockResolvedValueOnce(activity);
			jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValue(false);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(new SupportEntity()),
				};
				const savedSupport = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(0);
				return savedSupport;
			});

			try {
				await service.updateSupport(supportDto, user);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.FORBIDDEN);
			}

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("support.cannotUpdateNotRelatedSupport", []);
			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(0);
			expect(service.findSupportByIdWithActivity).toHaveBeenCalledTimes(1)
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
		});


		it('should throw an error when trying to link support to incorrect activity', async () => {
			const user = new User();
			user.id = 2;
			user.sector = [Sector.Energy];

			const activity = new ActivityEntity();
			activity.activityId = "T00003";
			activity.title = "test";
			activity.description = "test description";
			activity.status = ActivityStatus.PLANNED;
			activity.measure = Measure.WITHOUT_MEASURES;

			const supportDto = new SupportDto();
			supportDto.activityId = "T00004";
			supportDto.direction = SupportDirection.RECEIVED;
			supportDto.financeNature = FinanceNature.INTERNATIONAL;
			supportDto.internationalSupportChannel = IntSupChannel.MULTILATERAL;
			supportDto.internationalFinancialInstrument = IntFinInstrument.GRANT;
			supportDto.financingStatus = FinancingStatus.COMMITTED;
			supportDto.internationalSource = [IntSource.AFC];
			supportDto.nationalSource = "ASD";
			supportDto.requiredAmount = 100;
			supportDto.receivedAmount = 100;
			supportDto.exchangeRate = 200;

			const support = new SupportEntity();
			support.activity = activity;
			support.direction = SupportDirection.RECEIVED;
			support.financeNature = FinanceNature.INTERNATIONAL;
			support.internationalSupportChannel = IntSupChannel.MULTILATERAL;
			support.internationalFinancialInstrument = IntFinInstrument.GRANT;
			support.financingStatus = FinancingStatus.COMMITTED;
			support.internationalSource = [IntSource.AFC];
			support.nationalSource = "ASD";
			support.requiredAmount = 100;
			support.receivedAmount = 100;
			support.exchangeRate = 200;

			jest.spyOn(service, 'findSupportByIdWithActivity').mockResolvedValueOnce(support);
			jest.spyOn(activityServiceMock, 'findActivityById').mockResolvedValueOnce(null);
			jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(new SupportEntity()),
				};
				const savedSupport = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(0);
				return savedSupport;
			});

			try {
				await service.updateSupport(supportDto, user);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.BAD_REQUEST);
			}

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("support.activityNotFound", ["T00004"]);
			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(0);
			expect(service.findSupportByIdWithActivity).toHaveBeenCalledTimes(1)
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
		});

		it('should update the support correctly', async () => {
			const user = new User();
			user.id = 2;
			user.sector = [Sector.Energy];

			const activity = new ActivityEntity();
			activity.activityId = "T00003";
			activity.title = "test";
			activity.description = "test description";
			activity.status = ActivityStatus.PLANNED;
			activity.measure = Measure.WITHOUT_MEASURES;

			const supportDto = new SupportDto();
			supportDto.supportId = "S00001";
			supportDto.activityId = "T00003";
			supportDto.direction = SupportDirection.RECEIVED;
			supportDto.financeNature = FinanceNature.INTERNATIONAL;
			supportDto.internationalSupportChannel = IntSupChannel.MULTILATERAL;
			supportDto.internationalFinancialInstrument = IntFinInstrument.GRANT;
			supportDto.financingStatus = FinancingStatus.COMMITTED;
			supportDto.internationalSource = [IntSource.AFC];
			supportDto.nationalSource = "ASD";
			supportDto.requiredAmount = 100;
			supportDto.receivedAmount = 100;
			supportDto.exchangeRate = 200;

			const support = new SupportEntity();
			support.supportId = "S00001";
			support.activity = activity;
			support.direction = SupportDirection.NEEDED;
			support.financeNature = FinanceNature.INTERNATIONAL;
			support.internationalSupportChannel = IntSupChannel.BILATERAL;
			support.internationalFinancialInstrument = IntFinInstrument.GRANT;
			support.financingStatus = FinancingStatus.COMMITTED;
			support.internationalSource = [IntSource.AFC];
			support.nationalSource = "ASD";
			support.requiredAmount = 100;
			support.receivedAmount = 100;
			support.exchangeRate = 200;

			jest.spyOn(service, 'findSupportByIdWithActivity').mockResolvedValueOnce(support);
			jest.spyOn(activityServiceMock, 'findActivityById').mockResolvedValueOnce(activity);
			jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(new SupportEntity()),
				};
				const savedSupport = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(2);
				return savedSupport;
			});


			const result = await service.updateSupport(supportDto, user);
			expect(result.statusCode).toEqual(HttpStatus.OK);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("support.updateSupportSuccess", []);
			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
			expect(service.findSupportByIdWithActivity).toHaveBeenCalledTimes(1)
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
		});

	})

	describe('validateSupport', () => {
		it('should validate the support', async () => {
			const user = new User();
			user.id = 2;
			user.sector = [Sector.Energy];

			const validateDto = new ValidateDto();
			validateDto.entityId = "S00001";
			validateDto.validateStatus = true;

			const support = new SupportEntity();
			support.validated = false;

			jest.spyOn(service, 'findSupportByIdWithActivity').mockResolvedValueOnce(support);
			// jest.spyOn(activityServiceMock, 'findActivityById').mockResolvedValueOnce(activity);
			jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(new SupportEntity()),
				};
				const savedSupport = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(2);
				return savedSupport;
			});


			const result = await service.validateSupport(validateDto, user);
			expect(result.statusCode).toEqual(HttpStatus.OK);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("support.verifySupportSuccess", []);
			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
			expect(service.findSupportByIdWithActivity).toHaveBeenCalledTimes(1)
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
		});

		it('unvalidated support', async () => {
			const user = new User();
			user.id = 2;
			user.sector = [Sector.Energy];

			const validateDto = new ValidateDto();
			validateDto.entityId = "S00001";
			validateDto.validateStatus = false;

			const support = new SupportEntity();
			support.validated = true;

			jest.spyOn(service, 'findSupportByIdWithActivity').mockResolvedValueOnce(support);
			// jest.spyOn(activityServiceMock, 'findActivityById').mockResolvedValueOnce(activity);
			jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(new SupportEntity()),
				};
				const savedSupport = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(2);
				return savedSupport;
			});


			const result = await service.validateSupport(validateDto, user);
			expect(result.statusCode).toEqual(HttpStatus.OK);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("support.unverifySupportSuccess", []);
			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
			expect(service.findSupportByIdWithActivity).toHaveBeenCalledTimes(1)
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
		});

	})

	describe('deleteSupport', () => {
		it('should throw ForbiddenException if user is not Admin or Root', async () => {
			const user = { role: Role.GovernmentUser } as User;
			const deleteDto = { entityId: '123' };

			await expect(service.deleteSupport(deleteDto, user))
				.rejects.toThrow(HttpException);

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('user.userUnAUth', []);
		});

		it('should throw BadRequest if support not found', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: '123' };
			jest.spyOn(service, 'findSupportByIdWithActivity').mockResolvedValue(null);

			await expect(service.deleteSupport(deleteDto, user))
				.rejects.toThrow(HttpException);

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('support.supportNotFound', ["123"]);
		});

		it('should throw Forbidden if user does not have sector permission', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: 'J001' };

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			jest.spyOn(service, 'findSupportByIdWithActivity').mockResolvedValue(support);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(false);

			await expect(service.deleteSupport(deleteDto, user))
				.rejects.toThrow(HttpException);

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('support.permissionDeniedForSector', ["S001"]);
		});

		it('should successfully delete support and parent activity validated, activity parent is project', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: 'S001' };

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;
			support.activity = activity;

			jest.spyOn(service, 'findSupportByIdWithActivity').mockResolvedValue(support);
			jest.spyOn(activityServiceMock, "isProjectValid").mockResolvedValue(project);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					delete: jest.fn().mockResolvedValueOnce({ affected: 1 }),
					save: jest.fn().mockResolvedValueOnce(null),
				};
				const savedProject = await callback(emMock);
				expect(emMock.delete).toHaveBeenCalledTimes(1);
				expect(emMock.save).toHaveBeenCalledTimes(3);
				return savedProject;
			});

			const result = await service.deleteSupport(deleteDto, user);

			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProject).toBeCalledTimes(1);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByActivityId).toBeCalledTimes(0);

		});

		it('should successfully delete support and parent activity not-validated, activity parent is project', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: 'S001' };

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = false;

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;
			support.activity = activity;

			jest.spyOn(service, 'findSupportByIdWithActivity').mockResolvedValue(support);
			jest.spyOn(activityServiceMock, "isProjectValid").mockResolvedValue(project);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					delete: jest.fn().mockResolvedValueOnce({ affected: 1 }),
					save: jest.fn().mockResolvedValueOnce(null),
				};
				const savedProject = await callback(emMock);
				expect(emMock.delete).toHaveBeenCalledTimes(1);
				expect(emMock.save).toHaveBeenCalledTimes(1);
				return savedProject;
			});

			const result = await service.deleteSupport(deleteDto, user);

			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProject).toBeCalledTimes(0);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByActivityId).toBeCalledTimes(0);

		});

		it('should successfully delete support and parent activity validated, activity parent not project', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: 'S001' };

			const activity = new ActivityEntity;
			activity.parentId = 'P001';
			activity.parentType = EntityType.PROGRAMME;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = false;

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;
			support.activity = activity;

			jest.spyOn(service, 'findSupportByIdWithActivity').mockResolvedValue(support);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					delete: jest.fn().mockResolvedValueOnce({ affected: 1 }),
					save: jest.fn().mockResolvedValueOnce(null),
				};
				const savedProject = await callback(emMock);
				expect(emMock.delete).toHaveBeenCalledTimes(1);
				expect(emMock.save).toHaveBeenCalledTimes(1);
				return savedProject;
			});

			const result = await service.deleteSupport(deleteDto, user);

			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProject).toBeCalledTimes(0);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByActivityId).toBeCalledTimes(0);

		});

		it('should successfully delete support and parent activity validated, activity parent project, project not validated', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: 'S001' };

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = false;

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;
			support.activity = activity;

			jest.spyOn(service, 'findSupportByIdWithActivity').mockResolvedValue(support);
			jest.spyOn(activityServiceMock, "isProjectValid").mockResolvedValue(project);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					delete: jest.fn().mockResolvedValueOnce({ affected: 1 }),
					save: jest.fn().mockResolvedValueOnce(null),
				};
				const savedProject = await callback(emMock);
				expect(emMock.delete).toHaveBeenCalledTimes(1);
				expect(emMock.save).toHaveBeenCalledTimes(2);
				return savedProject;
			});

			const result = await service.deleteSupport(deleteDto, user);

			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProject).toBeCalledTimes(0);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByActivityId).toBeCalledTimes(1);

		});

		it('should handle transaction errors', async () => {
			const user = { role: Role.Admin } as User;

			const deleteDto = { entityId: '123' };

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			jest.spyOn(service, 'findSupportByIdWithActivity').mockResolvedValue(support);


			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				throw new Error('This is a test transaction error. This is expected');
			});

			await expect(service.deleteSupport(deleteDto, user))
				.rejects.toThrow(HttpException);

		});
	});
})