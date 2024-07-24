import { TestingModule, Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ActionEntity } from "../entities/action.entity";
import { CounterService } from "../util/counter.service";
import { HelperService } from "../util/helpers.service";
import { EntityManager, Repository, SelectQueryBuilder } from "typeorm";
import { ActionService } from "./action.service";
import { ActionDto } from "../dtos/action.dto";
import { ActionStatus, ActionType, InstrumentType, NatAnchor } from "../enums/action.enum";
import { User } from "../entities/user.entity";
import { DataResponseMessageDto } from "../dtos/data.response.message";
import { KpiDto } from "../dtos/kpi.dto";
import { HttpException, HttpStatus } from "@nestjs/common";
import { DocumentDto } from "../dtos/document.dto";
import { FileUploadService } from "../util/fileUpload.service";
import { PayloadValidator } from "../validation/payload.validator";
import { ProgrammeEntity } from "../entities/programme.entity";
import { QueryDto } from "../dtos/query.dto";
import { FilterEntry } from "../dtos/filter.entry";
import { LinkUnlinkService } from "../util/linkUnlink.service";
import { ActionUpdateDto } from "../dtos/actionUpdate.dto";
import { KpiService } from "../kpi/kpi.service";
import { DocumentEntityDto } from "../dtos/document.entity.dto";
import { KpiUpdateDto } from "../dtos/kpi.update.dto";
import { ActionViewEntity } from "../entities/action.view.entity";
import { ProjectEntity } from "../entities/project.entity";
import { ActivityEntity } from "../entities/activity.entity";
import { Sector } from "../enums/sector.enum";
import { ValidateDto } from "../dtos/validate.dto";
import { EntityType, KPIAction } from "../enums/shared.enum";
import { AchievementEntity } from "../entities/achievement.entity";
import { KpiEntity } from "../entities/kpi.entity";
import { Role } from "../casl/role.enum";

describe('ActionService', () => {
	let service: ActionService;
	let entityManagerMock: Partial<EntityManager>;
	let actionRepositoryMock: Partial<Repository<ActionEntity>>;
	let programmeRepositoryMock: Partial<Repository<ProgrammeEntity>>;
	let projectRepositoryMock: Partial<Repository<ProjectEntity>>;
	let activityRepositoryMock: Partial<Repository<ActivityEntity>>;
	let counterServiceMock: Partial<CounterService>;
	let helperServiceMock: Partial<HelperService>;
	let fileUploadServiceMock: Partial<FileUploadService>;
	let payloadValidatorMock: Partial<PayloadValidator>;
	let linkUnlinkServiceMock: Partial<LinkUnlinkService>;
	let kpiServiceMock: Partial<KpiService>;
	let actionViewRepositoryMock: Partial<Repository<ActionViewEntity>>;

	const documentData = "data:text/csv;base64,IlJlcXVlc3QgSWQiLCJQcm="

	beforeEach(async () => {
		entityManagerMock = {
			transaction: jest.fn(),
			save: jest.fn(),
			query: jest.fn(),
			remove: jest.fn(),

		};
		actionRepositoryMock = {
			save: jest.fn(),
			createQueryBuilder: jest.fn(() => ({
				where: jest.fn().mockReturnThis(),
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				leftJoinAndMapMany: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				offset: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				getManyAndCount: jest.fn(),
			})) as unknown as () => SelectQueryBuilder<ActionEntity>,
		};
		programmeRepositoryMock = {
			save: jest.fn(),
			createQueryBuilder: jest.fn(() => ({
				where: jest.fn().mockReturnThis(),
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				leftJoinAndMapMany: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				offset: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				getManyAndCount: jest.fn(),
			})) as unknown as () => SelectQueryBuilder<ProgrammeEntity>,
		};
		projectRepositoryMock = {
			save: jest.fn(),
			createQueryBuilder: jest.fn(() => ({
				where: jest.fn().mockReturnThis(),
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				leftJoinAndMapMany: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				offset: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				getManyAndCount: jest.fn(),
			})) as unknown as () => SelectQueryBuilder<ProjectEntity>,
		};
		activityRepositoryMock = {
			save: jest.fn(),
			createQueryBuilder: jest.fn(() => ({
				where: jest.fn().mockReturnThis(),
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				leftJoinAndMapMany: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				offset: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				getManyAndCount: jest.fn(),
			})) as unknown as () => SelectQueryBuilder<ActivityEntity>,
		};
		counterServiceMock = {
			incrementCount: jest.fn().mockResolvedValue(1),
		};
		helperServiceMock = {
			formatReqMessagesString: jest.fn(),
			parseMongoQueryToSQLWithTable: jest.fn(),
			generateWhereSQL: jest.fn(),
			refreshMaterializedViews: jest.fn(),
			doesUserHaveSectorPermission: jest.fn(),
			doesUserHaveValidatePermission: jest.fn()
		};
		fileUploadServiceMock = {
			uploadDocument: jest.fn().mockResolvedValue('http://test.com/documents/action_documents/test.csv'),
		};

		payloadValidatorMock = {
			validateKpiPayload: jest.fn(),
		};

		linkUnlinkServiceMock = {
			linkProgrammesToAction: jest.fn(),
			findAllProgrammeByIds: jest.fn(),
			updateAllValidatedChildrenStatusByActionId: jest.fn(),
			unlinkProgrammesFromAction: jest.fn(),
		};
		kpiServiceMock = {
			getKpisByCreatorTypeAndCreatorId: jest.fn(),
			findAchievementsByKpiIds: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ActionService,
				{
					provide: EntityManager,
					useValue: entityManagerMock,
				},
				{
					provide: getRepositoryToken(ActionEntity),
					useValue: actionRepositoryMock,
				},
				{
					provide: CounterService,
					useValue: counterServiceMock,
				},
				{
					provide: HelperService,
					useValue: helperServiceMock,
				},
				{
					provide: FileUploadService,
					useValue: fileUploadServiceMock,
				},
				{
					provide: PayloadValidator,
					useValue: payloadValidatorMock,
				},
				{
					provide: getRepositoryToken(ProgrammeEntity),
					useValue: programmeRepositoryMock,
				},
				{
					provide: getRepositoryToken(ProjectEntity),
					useValue: projectRepositoryMock,
				},
				{
					provide: getRepositoryToken(ActivityEntity),
					useValue: activityRepositoryMock,
				},
				{
					provide: LinkUnlinkService,
					useValue: linkUnlinkServiceMock,
				},
				{
					provide: KpiService,
					useValue: kpiServiceMock,
				},
				{
					provide: getRepositoryToken(ActionViewEntity),
					useValue: actionViewRepositoryMock,
				},
			],
		}).compile();

		service = module.get<ActionService>(ActionService);
	});

	it('should create an action without documents and kpis', async () => {
		const user = new User();
		user.id = 2;

		const actionDto = new ActionDto();
		actionDto.title = "test";
		actionDto.description = "test description";
		actionDto.objective = "test objective";
		actionDto.instrumentType = [InstrumentType.POLICY];
		actionDto.status = ActionStatus.PLANNED;
		actionDto.type = ActionType.MITIGATION;
		actionDto.startYear = 2024;
		actionDto.natAnchor = [NatAnchor.NDC];

		const actionEntity = new ActionEntity();
		actionEntity.title = "test";
		actionEntity.description = "test description";
		actionEntity.objective = "test objective";
		actionEntity.instrumentType = [InstrumentType.POLICY];
		actionEntity.status = ActionStatus.PLANNED;
		actionEntity.type = ActionType.MITIGATION;
		actionEntity.startYear = 2024;
		actionEntity.natAnchor = [NatAnchor.NDC];
		actionEntity.actionId = "A001";

		const expectedResult = {
			"title": "test",
			"description": "test description",
			"objective": "test objective",
			"instrumentType": ["Policy"],
			"status": "Planned",
			"type": "Mitigation",
			"startYear": 2024,
			"natAnchor": ["NDC"],
			"actionId": "A001"
		};

		const expectedResponse = new DataResponseMessageDto(201, "action.createActionSuccess", expectedResult)

		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce("2");
		jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockResolvedValueOnce("action.createActionSuccess");
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(actionEntity),
			};
			const savedAction = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedAction;
		});

		const result = await service.createAction(actionDto, user);

		expect(result.data).toEqual(expectedResponse.data);
		expect(result.statusCode).toEqual(expectedResponse.statusCode);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
	});

	it('should create an action with documents, kpis and link programmes', async () => {
		const user = new User();
		user.id = 2;

		const kpiDto1 = new KpiDto();
		kpiDto1.name = "KPI 1";
		kpiDto1.creatorType = "action";
		kpiDto1.expected = 100;

		const kpiDto2 = new KpiDto();
		kpiDto2.name = "KPI 2";
		kpiDto2.creatorType = "action";
		kpiDto2.expected = 2553;

		const documentDto = new DocumentDto();
		documentDto.data = documentData;
		documentDto.title = "doc title"

		const programme1 = new ProgrammeEntity();
		programme1.programmeId = '1';
		programme1.action = null;

		const programme2 = new ProgrammeEntity();
		programme2.programmeId = '2';
		programme2.action = null;

		const programme3 = new ProgrammeEntity();
		programme3.programmeId = '3';
		programme3.action = null;

		const actionDto = new ActionDto();
		actionDto.title = "test";
		actionDto.description = "test description";
		actionDto.objective = "test objective";
		actionDto.instrumentType = [InstrumentType.POLICY];
		actionDto.status = ActionStatus.PLANNED;
		actionDto.type = ActionType.MITIGATION;
		actionDto.startYear = 2024;
		actionDto.natAnchor = [NatAnchor.NDC];
		actionDto.kpis = [kpiDto1, kpiDto2];
		actionDto.documents = [documentDto];
		actionDto.linkedProgrammes = ['1', '2', '3'];

		const expectedResult = {
			"title": "test",
			"description": "test description",
			"objective": "test objective",
			"instrumentType": "Policy",
			"status": "Planned",
			"type": "Mitigation",
			"startYear": 2024,
			"natAnchor": "NDC",
			"actionId": "A001",
			"kpis": [
				{
					"name": "KPI 1",
					"creatorType": "action",
					"expected": 100
				},
				{
					"name": "KPI 2",
					"creatorType": "action",
					"expected": 2553
				}
			],
			"documents": [
				{
					"title": "doc title",
					"url": "http://test.com/documents/action_documents/test.csv",
					"createdTime": 1710498127409
				},
			]

		};

		const expectedResponse = new DataResponseMessageDto(201, "action.createActionSuccess", expectedResult)


		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce("2");
		jest.spyOn(linkUnlinkServiceMock, 'findAllProgrammeByIds').mockResolvedValue([programme1, programme2, programme3]);
		jest.spyOn(linkUnlinkServiceMock, 'linkProgrammesToAction').mockResolvedValue();
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValue(true);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(expectedResult),
				query: jest.fn().mockResolvedValueOnce(expectedResult),
			};
			const savedAction = await callback(emMock);

			expect(emMock.save).toHaveBeenCalledTimes(3);
			return savedAction;
		});


		const result = await service.createAction(actionDto, user);

		expect(result.data).toEqual(expectedResponse.data);
		expect(result.statusCode).toEqual(expectedResponse.statusCode);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(linkUnlinkServiceMock.findAllProgrammeByIds).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(1);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);

	});

	it('should throws an error when creating action with incorrect kpis', async () => {
		const user = new User();
		user.id = 2;

		const kpiDto1 = new KpiDto();
		kpiDto1.name = "KPI 1";
		// kpiDto1.creatorType = "action";
		kpiDto1.expected = 100;

		const actionDto = new ActionDto();
		actionDto.title = "test";
		actionDto.description = "test description";
		actionDto.objective = "test objective";
		actionDto.instrumentType = [InstrumentType.POLICY];
		actionDto.status = ActionStatus.PLANNED;
		actionDto.startYear = 2024;
		actionDto.natAnchor = [NatAnchor.NDC];
		actionDto.kpis = [kpiDto1]

		const expectedResult = {
			"title": "test",
			"description": "test description",
			"objective": "test objective",
			"instrumentType": "Policy",
			"status": "Planned",
			"startYear": 2024,
			"natAnchor": "NDC",
			"actionId": "A001",
			"kpis": [
				{
					"name": "KPI 1",
					"creatorType": "action",
					"expected": 100
				},
				{
					"name": "KPI 2",
					"creatorType": "action",
					"expected": 2553
				}
			],

		};

		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce("2");
		jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockResolvedValueOnce("action.createActionSuccess");

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(expectedResult),
			};
			const savedAction = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(0);
			return savedAction;
		});

		try {
			await service.createAction(actionDto, user);
		} catch (error) {
			expect(error).toBeInstanceOf(HttpException);
		}

		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
	});

	it('should throw an exception if user does not have sector permission', async () => {
		const user = new User();
		user.id = 2;

		const actionDto = new ActionDto();
		actionDto.actionId = "A001";
		actionDto.title = "test";
		actionDto.sector = Sector.Energy;

		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(false);
		jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockResolvedValueOnce("activity.cannotCreateNotRelatedAction");

		await expect(service.createAction(actionDto, user)).rejects.toThrow(HttpException);

		expect(helperServiceMock.doesUserHaveSectorPermission).toHaveBeenCalledWith(user, actionDto.sector);
		expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("activity.cannotCreateNotRelatedAction", ["A001"]);
	});

	it('should throw an exception if linked programmes are already linked to an action', async () => {
		const user = new User();
		user.id = 2;

		const actionDto = new ActionDto();
		actionDto.linkedProgrammes = ['P001'];

		const programme = new ProgrammeEntity();
		programme.programmeId = 'P001';
		programme.action = { id: 'A001' } as unknown as ActionEntity;

		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);
		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
		jest.spyOn(linkUnlinkServiceMock, 'findAllProgrammeByIds').mockResolvedValueOnce([programme]);
		jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockResolvedValueOnce("action.programmeAlreadyLinked");

		await expect(service.createAction(actionDto, user)).rejects.toThrow(HttpException);

		expect(linkUnlinkServiceMock.findAllProgrammeByIds).toHaveBeenCalledWith(actionDto.linkedProgrammes);
		expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("action.programmeAlreadyLinked", ['P001']);
	});

	it('should refresh materialized views after successful action creation', async () => {
		const user = new User();
		user.id = 2;

		const actionDto = new ActionDto();
		const actionEntity = new ActionEntity();
		actionEntity.actionId = 'A001';

		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);
		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
		jest.spyOn(linkUnlinkServiceMock, 'findAllProgrammeByIds').mockResolvedValueOnce([]);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(actionEntity),
			};
			const savedAction = await callback(emMock);
			return savedAction;
		});

		const result = await service.createAction(actionDto, user);

		expect(helperServiceMock.refreshMaterializedViews).toHaveBeenCalledWith(entityManagerMock);
	});

	it('should have been called query method correctly when get action data requested', async () => {
		const mockQueryBuilder = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndMapOne: jest.fn().mockReturnThis(),
			getOne: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ActionEntity>;

		jest.spyOn(actionRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);

		// testing whether query method called correctly
		const result = await service.getActionViewData('1');
		expect(actionRepositoryMock.createQueryBuilder).toHaveBeenCalledWith('action');
		expect(actionRepositoryMock.createQueryBuilder().where).toHaveBeenCalledWith("action.actionId = :actionId", { "actionId": "1" });
		expect(actionRepositoryMock.createQueryBuilder().leftJoinAndMapOne).toHaveBeenCalledTimes(1); // Assuming there are two left join queries
		expect(actionRepositoryMock.createQueryBuilder().getOne).toHaveBeenCalled();
	});

	it('should build the query correctly with size and page', async () => {
		const queryDto = new QueryDto();
		const filterAnd: FilterEntry[] = [];
		filterAnd.push({
			key: 'actionId',
			operation: '=',
			value: 'A025',
		});
		queryDto.filterAnd = filterAnd;
		queryDto.page = 10;
		queryDto.size = 20;
		const abilityCondition = 'someCondition';

		const mockQueryBuilder = {
			where: jest.fn().mockReturnThis(),
			select: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			getQuery: jest.fn().mockReturnThis(),
			getCount: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getManyAndCount: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ActionEntity>;

		jest.spyOn(actionRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);

		await service.query(queryDto, abilityCondition);

		expect(actionRepositoryMock.createQueryBuilder).toHaveBeenCalledWith('action');
		expect(actionRepositoryMock.createQueryBuilder().where).toHaveBeenCalled();
		expect(actionRepositoryMock.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledTimes(1);
		expect(actionRepositoryMock.createQueryBuilder().orderBy).toHaveBeenCalled();
		expect(actionRepositoryMock.createQueryBuilder().offset).toHaveBeenCalledWith(180);
		expect(actionRepositoryMock.createQueryBuilder().limit).toHaveBeenCalledWith(20);
		expect(actionRepositoryMock.createQueryBuilder().getManyAndCount).toHaveBeenCalled();
	});

	it('should build the query correctly without size and page', async () => {
		const queryDto = new QueryDto();
		const filterAnd: FilterEntry[] = [];
		filterAnd.push({
			key: 'actionId',
			operation: '=',
			value: 'A025',
		});
		const abilityCondition = 'someCondition';

		const mockQueryBuilder = {
			where: jest.fn().mockReturnThis(),
			select: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			getQuery: jest.fn().mockReturnThis(),
			getCount: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getManyAndCount: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ActionEntity>;

		jest.spyOn(actionRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);


		await service.query(queryDto, abilityCondition);

		expect(actionRepositoryMock.createQueryBuilder).toHaveBeenCalledWith('action');
		expect(actionRepositoryMock.createQueryBuilder().where).toHaveBeenCalled();
		expect(actionRepositoryMock.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledTimes(1);
		expect(actionRepositoryMock.createQueryBuilder().orderBy).toHaveBeenCalled();
		expect(actionRepositoryMock.createQueryBuilder().offset).toHaveBeenCalledTimes(0);
		expect(actionRepositoryMock.createQueryBuilder().limit).toHaveBeenCalledTimes(0);
		expect(actionRepositoryMock.createQueryBuilder().getManyAndCount).toHaveBeenCalled();
	});

	it('should update the action without documents', async () => {
		const user = new User();
		user.id = 2;

		const actionUpdateDto = new ActionUpdateDto();
		actionUpdateDto.title = "test Updated";
		actionUpdateDto.description = "test description Updated";
		actionUpdateDto.objective = "test objective Updated";
		actionUpdateDto.instrumentType = [InstrumentType.ECONOMIC];
		actionUpdateDto.status = ActionStatus.IMPLEMENTED;
		actionUpdateDto.type = ActionType.MITIGATION;
		actionUpdateDto.startYear = 2025;
		actionUpdateDto.natAnchor = [NatAnchor.OTHER];

		const actionDto = new ActionDto();
		actionDto.title = "test";
		actionDto.description = "test description";
		actionDto.objective = "test objective";
		actionDto.instrumentType = [InstrumentType.POLICY];
		actionDto.status = ActionStatus.PLANNED;
		actionUpdateDto.type = ActionType.MITIGATION;
		actionDto.startYear = 2024;
		actionDto.natAnchor = [NatAnchor.NDC];

		const mockQueryBuilder1 = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getMany: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ProgrammeEntity>;

		const mockQueryBuilder2 = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getMany: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ProjectEntity>;

		const mockQueryBuilder3 = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getMany: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ActivityEntity>;

		jest.spyOn(service, 'findActionById').mockResolvedValueOnce(new ActionEntity());
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValue(true);
		jest.spyOn(programmeRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder1);
		jest.spyOn(projectRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder2);
		jest.spyOn(activityRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder3);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(actionUpdateDto),
			};
			const savedAction = await callback(emMock);
			expect(emMock.save).toHaveBeenNthCalledWith(1, actionUpdateDto);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedAction;
		});

		const result = await service.updateAction(actionUpdateDto, user);
		expect(result.statusCode).toEqual(HttpStatus.OK);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(kpiServiceMock.getKpisByCreatorTypeAndCreatorId).toHaveBeenCalledTimes(1)
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);

	})

	it('should remove the action documents when user remove the documents', async () => {
		const user = new User();
		user.id = 2;

		const actionUpdateDto = new ActionUpdateDto();
		actionUpdateDto.title = "test Updated";
		actionUpdateDto.description = "test description Updated";
		actionUpdateDto.objective = "test objective Updated";
		actionUpdateDto.instrumentType = [InstrumentType.ECONOMIC];
		actionUpdateDto.status = ActionStatus.IMPLEMENTED;
		actionUpdateDto.type = ActionType.MITIGATION;
		actionUpdateDto.startYear = 2025;
		actionUpdateDto.natAnchor = [NatAnchor.OTHER];
		actionUpdateDto.removedDocuments = ["www.test.com/doc1"];

		const actionUpdateEntity = new ActionEntity();
		actionUpdateEntity.title = "test Updated";
		actionUpdateEntity.description = "test description Updated";
		actionUpdateEntity.objective = "test objective Updated";
		actionUpdateEntity.instrumentType = [InstrumentType.ECONOMIC];
		actionUpdateEntity.status = ActionStatus.IMPLEMENTED;
		actionUpdateEntity.type = ActionType.MITIGATION;
		actionUpdateEntity.startYear = 2025;
		actionUpdateEntity.natAnchor = [NatAnchor.OTHER];
		actionUpdateEntity.documents = null;

		const documentDto = new DocumentEntityDto();
		documentDto.url = "www.test.com/doc1";
		documentDto.title = "doc title"

		const actionEntity = new ActionEntity();
		actionEntity.title = "test";
		actionEntity.description = "test description";
		actionEntity.objective = "test objective";
		actionEntity.instrumentType = [InstrumentType.POLICY];
		actionEntity.status = ActionStatus.PLANNED;
		actionEntity.startYear = 2024;
		actionEntity.natAnchor = [NatAnchor.NDC];
		actionEntity.documents = [documentDto];

		const mockQueryBuilder1 = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getMany: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ProgrammeEntity>;

		const mockQueryBuilder2 = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getMany: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ProjectEntity>;

		const mockQueryBuilder3 = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getMany: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ActivityEntity>;


		jest.spyOn(service, 'findActionById').mockResolvedValueOnce(actionEntity);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValue(true);
		jest.spyOn(programmeRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder1);
		jest.spyOn(projectRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder2);
		jest.spyOn(activityRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder3);



		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(actionUpdateEntity),
				remove: jest.fn().mockResolvedValueOnce(actionUpdateDto),
			};
			const savedAction = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedAction;
		});

		const result = await service.updateAction(actionUpdateDto, user);
		expect(result.statusCode).toEqual(HttpStatus.OK);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(kpiServiceMock.getKpisByCreatorTypeAndCreatorId).toHaveBeenCalledTimes(1)
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);

	})

	it('should update the documents in action when user add new documents', async () => {
		const user = new User();
		user.id = 2;

		const documentDto = new DocumentEntityDto();
		documentDto.url = "www.test.com/doc1";
		documentDto.title = "doc title"

		const addedDocumentDto = new DocumentDto();
		addedDocumentDto.data = documentData;
		addedDocumentDto.title = "doc title"

		const actionUpdateDto = new ActionUpdateDto();
		actionUpdateDto.title = "test Updated";
		actionUpdateDto.description = "test description Updated";
		actionUpdateDto.objective = "test objective Updated";
		actionUpdateDto.instrumentType = [InstrumentType.ECONOMIC];
		actionUpdateDto.status = ActionStatus.IMPLEMENTED;
		actionUpdateDto.startYear = 2025;
		actionUpdateDto.natAnchor = [NatAnchor.OTHER];
		actionUpdateDto.newDocuments = [addedDocumentDto]

		const actionUpdateEntity = new ActionEntity();
		actionUpdateEntity.title = "test Updated";
		actionUpdateEntity.description = "test description Updated";
		actionUpdateEntity.objective = "test objective Updated";
		actionUpdateEntity.instrumentType = [InstrumentType.ECONOMIC];
		actionUpdateEntity.status = ActionStatus.IMPLEMENTED;
		actionUpdateEntity.startYear = 2025;
		actionUpdateEntity.natAnchor = [NatAnchor.OTHER];
		actionUpdateEntity.documents = [documentDto, addedDocumentDto];

		const actionEntity = new ActionEntity();
		actionEntity.title = "test";
		actionEntity.description = "test description";
		actionEntity.objective = "test objective";
		actionEntity.instrumentType = [InstrumentType.POLICY];
		actionEntity.status = ActionStatus.PLANNED;
		actionEntity.startYear = 2024;
		actionEntity.natAnchor = [NatAnchor.NDC];
		actionEntity.documents = [documentDto];

		const mockQueryBuilder1 = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getMany: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ProgrammeEntity>;

		const mockQueryBuilder2 = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getMany: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ProjectEntity>;

		const mockQueryBuilder3 = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getMany: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ActivityEntity>;


		jest.spyOn(service, 'findActionById').mockResolvedValueOnce(actionEntity);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValue(true);
		jest.spyOn(programmeRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder1);
		jest.spyOn(projectRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder2);
		jest.spyOn(activityRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder3);


		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(actionUpdateEntity),
				remove: jest.fn().mockResolvedValueOnce(actionUpdateDto),
			};
			const savedAction = await callback(emMock);
			// expect(emMock.save).toHaveBeenNthCalledWith(1, actionUpdateEntity);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			// expect(emMock.remove).toHaveBeenCalledTimes(1);
			return savedAction;
		});

		const result = await service.updateAction(actionUpdateDto, user);
		expect(result.statusCode).toEqual(HttpStatus.OK);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(1);
		expect(kpiServiceMock.getKpisByCreatorTypeAndCreatorId).toHaveBeenCalledTimes(1)
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);

	})

	it('should update kpis in action when user updated the Kpis', async () => {
		const user = new User();
		user.id = 2;

		const achEntity = new AchievementEntity();

		const kpiDto1 = new KpiUpdateDto();
		kpiDto1.kpiId = 1;
		kpiDto1.name = "KPI 1";
		kpiDto1.creatorType = "action";
		kpiDto1.expected = 100;
		kpiDto1.kpiAction = KPIAction.NONE;

		const kpiDto2 = new KpiUpdateDto();
		kpiDto2.kpiId = 2;
		kpiDto2.name = "KPI 2";
		kpiDto2.creatorType = "action";
		kpiDto2.expected = 100;
		kpiDto2.kpiAction = KPIAction.NONE;

		const kpi1 = new KpiEntity();
		kpi1.kpiId = 1;
		kpi1.name = "KPI 1";
		kpi1.creatorType = "action";
		kpi1.expected = 100;

		const kpi2 = new KpiEntity();
		kpi2.kpiId = 2;
		kpi2.name = "KPI 2";
		kpi2.creatorType = "action";
		kpi2.expected = 100;

		const kpiAdded = new KpiUpdateDto();
		kpiAdded.name = "KPI Added";
		kpiAdded.creatorType = "action";
		kpiAdded.expected = 300;
		kpiAdded.kpiAction = KPIAction.CREATED;

		const actionUpdateDto = new ActionUpdateDto();
		actionUpdateDto.title = "test Updated";
		actionUpdateDto.description = "test description Updated";
		actionUpdateDto.objective = "test objective Updated";
		actionUpdateDto.instrumentType = [InstrumentType.ECONOMIC];
		actionUpdateDto.status = ActionStatus.IMPLEMENTED;
		actionUpdateDto.startYear = 2025;
		actionUpdateDto.natAnchor = [NatAnchor.OTHER];
		actionUpdateDto.kpis = [kpiDto1, kpiAdded]

		const actionUpdateEntity = new ActionEntity();
		actionUpdateEntity.title = "test Updated";
		actionUpdateEntity.description = "test description Updated";
		actionUpdateEntity.objective = "test objective Updated";
		actionUpdateEntity.instrumentType = [InstrumentType.ECONOMIC];
		actionUpdateEntity.status = ActionStatus.IMPLEMENTED;
		actionUpdateEntity.startYear = 2025;
		actionUpdateEntity.natAnchor = [NatAnchor.OTHER];

		const actionEntity = new ActionEntity();
		actionEntity.title = "test";
		actionEntity.description = "test description";
		actionEntity.objective = "test objective";
		actionEntity.instrumentType = [InstrumentType.POLICY];
		actionEntity.status = ActionStatus.PLANNED;
		actionEntity.startYear = 2024;
		actionEntity.natAnchor = [NatAnchor.NDC];

		const mockQueryBuilder1 = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getMany: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ProgrammeEntity>;

		const mockQueryBuilder2 = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getMany: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ProjectEntity>;

		const mockQueryBuilder3 = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getMany: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ActivityEntity>;


		jest.spyOn(service, 'findActionById').mockResolvedValueOnce(actionEntity);
		jest.spyOn(kpiServiceMock, 'getKpisByCreatorTypeAndCreatorId').mockResolvedValueOnce([kpi1, kpi2]);
		jest.spyOn(kpiServiceMock, 'findAchievementsByKpiIds').mockResolvedValueOnce([achEntity]);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValue(true);
		jest.spyOn(programmeRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder1);
		jest.spyOn(projectRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder2);
		jest.spyOn(activityRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder3);


		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(actionUpdateEntity),
				remove: jest.fn().mockResolvedValueOnce(actionUpdateDto),
			};
			const savedAction = await callback(emMock);
			// expect(emMock.save).toHaveBeenNthCalledWith(1, actionUpdateEntity);
			expect(emMock.save).toHaveBeenCalledTimes(3);
			expect(emMock.remove).toHaveBeenCalledTimes(2);
			return savedAction;
		});

		const result = await service.updateAction(actionUpdateDto, user);
		expect(result.statusCode).toEqual(HttpStatus.OK);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(kpiServiceMock.getKpisByCreatorTypeAndCreatorId).toHaveBeenCalledTimes(1)
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);

	})

	it('should throw an exception if action is not found when user update action', async () => {
		const user = new User();
		user.id = 2;

		const actionUpdateDto = new ActionUpdateDto();
		actionUpdateDto.actionId = 'A001';

		jest.spyOn(service, 'findActionById').mockResolvedValueOnce(null);
		jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockReturnValue('action.actionNotFound');

		await expect(service.updateAction(actionUpdateDto, user)).rejects.toThrow(HttpException);

		expect(service.findActionById).toHaveBeenCalledWith('A001');
		expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('action.actionNotFound', ['A001']);
	});

	it('should validate the action', async () => {
		const user = new User();
		user.id = 2;

		const validateDto = new ValidateDto();
		validateDto.entityId = 'A001';
		validateDto.validateStatus = true;

		const action = new ActionEntity();
		action.actionId = 'A001';
		action.sector = Sector.Forestry;
		action.validated = false;

		jest.spyOn(service, 'findActionById').mockResolvedValueOnce(action);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(action),
			};
			const savedAction = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedAction;
		});

		await service.validateAction(validateDto, user);
		expect(linkUnlinkServiceMock.updateAllValidatedChildrenStatusByActionId).toHaveBeenCalledTimes(0);

	});

	it('should unvalidate the action', async () => {
		const user = new User();
		user.id = 2;

		const validateDto = new ValidateDto();
		validateDto.entityId = 'A001';
		validateDto.validateStatus = false;

		const action = new ActionEntity();
		action.actionId = 'A001';
		action.sector = Sector.Forestry;
		action.validated = true;

		jest.spyOn(service, 'findActionById').mockResolvedValueOnce(action);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(action),
			};
			const savedAction = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedAction;
		});

		await service.validateAction(validateDto, user);
		expect(linkUnlinkServiceMock.updateAllValidatedChildrenStatusByActionId).toHaveBeenCalledTimes(1);

	});

	describe('deleteAction', () => {
		it('should throw ForbiddenException if user is not Admin or Root', async () => {
			const user = { role: Role.GovernmentUser } as User;
			const deleteDto = { entityId: '123' };

			await expect(service.deleteAction(deleteDto, user))
				.rejects.toThrow(HttpException);

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('user.userUnAUth', []);
		});

		it('should throw BadRequest if action not found', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: '123' };
			jest.spyOn(service, 'findActionByIdWithAllLinkedChildren').mockResolvedValue(null);

			await expect(service.deleteAction(deleteDto, user))
				.rejects.toThrow(HttpException);

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('action.actionNotFound', ["123"]);
		});

		it('should throw Forbidden if user does not have sector permission', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: 'A001' };
			const action = new ActionEntity();
			action.actionId = 'A001';
			action.sector = Sector.Forestry;
			action.validated = true;

			jest.spyOn(service, 'findActionByIdWithAllLinkedChildren').mockResolvedValue(action);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(false);

			await expect(service.deleteAction(deleteDto, user))
				.rejects.toThrow(HttpException);

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('action.permissionDeniedForSector', ["A001"]);
		});

		it('should successfully delete action and associated entities', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: '123' };

			const activity = new ActivityEntity;
			activity.parentId = 'A001';
			activity.parentType = EntityType.ACTION;
			activity.activityId = "T1"

			const programme = new ProgrammeEntity;
			programme.programmeId = 'P1'

			const kpi1 = new KpiEntity();
			kpi1.kpiId = 1;
			kpi1.name = "KPI 1";
			kpi1.creatorType = "action";
			kpi1.expected = 100;

			const kpi2 = new KpiEntity();
			kpi2.kpiId = 2;
			kpi2.name = "KPI 2";
			kpi2.creatorType = "action";
			kpi2.expected = 100;

			const action = new ActionEntity();
			action.actionId = 'A001';
			action.sector = Sector.Forestry;
			action.validated = true;
			action.activities = [activity];
			action.programmes = [programme]

			const actionKPIs = [kpi1, kpi2];

			jest.spyOn(service, 'findActionByIdWithAllLinkedChildren').mockResolvedValue(action);
			jest.spyOn(kpiServiceMock, "getKpisByCreatorTypeAndCreatorId").mockResolvedValue(actionKPIs);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					delete: jest.fn().mockResolvedValueOnce({ affected: 1 }),
				};
				const savedAction = await callback(emMock);
				expect(emMock.delete).toHaveBeenCalledTimes(3);
				return savedAction;
			});

			const result = await service.deleteAction(deleteDto, user);

			expect(linkUnlinkServiceMock.unlinkProgrammesFromAction).toBeCalledTimes(1);

		});

		it('should handle transaction errors', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: '123' };
			const action = new ActionEntity();
			action.actionId = 'A001';
			action.sector = Sector.Forestry;
			action.validated = true;
			jest.spyOn(service, 'findActionByIdWithAllLinkedChildren').mockResolvedValue(action);


			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				throw new Error('Transaction error');
			});

			await expect(service.deleteAction(deleteDto, user))
				.rejects.toThrow(HttpException);

		});
	});
});


