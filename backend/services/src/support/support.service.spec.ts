import { EntityManager, Repository } from "typeorm";
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

describe('SupportService', () => {
	let service: SupportService;
	let entityManagerMock: Partial<EntityManager>;
	let supportRepositoryMock: Partial<Repository<SupportEntity>>;
	let counterServiceMock: Partial<CounterService>;
	let helperServiceMock: Partial<HelperService>;
	let activityServiceMock: Partial<ActivityService>;


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
		};
		helperServiceMock = {
			formatReqMessagesString: jest.fn(),
			parseMongoQueryToSQLWithTable: jest.fn(),
			generateWhereSQL: jest.fn(),
			refreshMaterializedViews: jest.fn(),
			doesUserHaveSectorPermission: jest.fn()
		};
		activityServiceMock = {
			findActivityById: jest.fn()
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
			// supportDto.financeNature = "National";
			supportDto.internationalSupportChannel = IntSupChannel.MULTILATERAL;
			supportDto.otherInternationalSupportChannel = "TEST";
			supportDto.internationalFinancialInstrument = IntFinInstrument.GRANT;
			supportDto.otherInternationalFinancialInstrument = "TEST";
			// supportDto.nationalFinancialInstrument = "Equity";
			// supportDto.otherNationalFinancialInstrument = "Test";
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
			// supportDto.financeNature = "National";
			supportDto.internationalSupportChannel = IntSupChannel.MULTILATERAL;
			supportDto.otherInternationalSupportChannel = "TEST";
			supportDto.internationalFinancialInstrument = IntFinInstrument.GRANT;
			supportDto.otherInternationalFinancialInstrument = "TEST";
			// supportDto.nationalFinancialInstrument = "Equity";
			// supportDto.otherNationalFinancialInstrument = "Test";
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
			// supportDto.financeNature = "National";
			supportDto.internationalSupportChannel = IntSupChannel.MULTILATERAL;
			supportDto.otherInternationalSupportChannel = "TEST";
			supportDto.internationalFinancialInstrument = IntFinInstrument.GRANT;
			supportDto.otherInternationalFinancialInstrument = "TEST";
			// supportDto.nationalFinancialInstrument = "Equity";
			// supportDto.otherNationalFinancialInstrument = "Test";
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
			// supportDto.financeNature = "National";
			supportDto.internationalSupportChannel = IntSupChannel.MULTILATERAL;
			supportDto.otherInternationalSupportChannel = "TEST";
			supportDto.internationalFinancialInstrument = IntFinInstrument.GRANT;
			supportDto.otherInternationalFinancialInstrument = "TEST";
			// supportDto.nationalFinancialInstrument = "Equity";
			// supportDto.otherNationalFinancialInstrument = "Test";
			supportDto.financingStatus = FinancingStatus.COMMITTED;
			supportDto.internationalSource = [IntSource.AFC];
			supportDto.nationalSource = "ASD";
			supportDto.requiredAmount = 100;
			supportDto.receivedAmount = 100;
			supportDto.exchangeRate = 200;

			jest.spyOn(service, 'findSupportById').mockResolvedValueOnce(null);
			// jest.spyOn(activityServiceMock, 'findActivityById').mockResolvedValueOnce(activity);
			// jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValue(false);

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
			expect(service.findSupportById).toHaveBeenCalledTimes(1)
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
			supportDto.otherInternationalSupportChannel = "TEST";
			supportDto.internationalFinancialInstrument = IntFinInstrument.GRANT;
			supportDto.otherInternationalFinancialInstrument = "TEST";
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
			support.otherInternationalSupportChannel = "TEST";
			support.internationalFinancialInstrument = IntFinInstrument.GRANT;
			support.otherInternationalFinancialInstrument = "TEST";
			support.financingStatus = FinancingStatus.COMMITTED;
			support.internationalSource = [IntSource.AFC];
			support.nationalSource = "ASD";
			support.requiredAmount = 100;
			support.receivedAmount = 100;
			support.exchangeRate = 200;

			jest.spyOn(service, 'findSupportById').mockResolvedValueOnce(support);
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
			expect(service.findSupportById).toHaveBeenCalledTimes(1)
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
			supportDto.activityId = "T00003";
			supportDto.direction = SupportDirection.RECEIVED;
			supportDto.financeNature = FinanceNature.INTERNATIONAL;
			supportDto.internationalSupportChannel = IntSupChannel.MULTILATERAL;
			supportDto.otherInternationalSupportChannel = "TEST";
			supportDto.internationalFinancialInstrument = IntFinInstrument.GRANT;
			supportDto.otherInternationalFinancialInstrument = "TEST";
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
			support.otherInternationalSupportChannel = "TEST";
			support.internationalFinancialInstrument = IntFinInstrument.GRANT;
			support.otherInternationalFinancialInstrument = "TEST";
			support.financingStatus = FinancingStatus.COMMITTED;
			support.internationalSource = [IntSource.AFC];
			support.nationalSource = "ASD";
			support.requiredAmount = 100;
			support.receivedAmount = 100;
			support.exchangeRate = 200;

			jest.spyOn(service, 'findSupportById').mockResolvedValueOnce(support);
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

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("support.activityNotFound", ["T00003"]);
			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(0);
			expect(service.findSupportById).toHaveBeenCalledTimes(1)
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
		});

	})
})