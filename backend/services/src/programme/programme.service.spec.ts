import { ActionService } from "../action/action.service";
import { CounterService } from "../util/counter.service";
import { FileUploadService } from "../util/fileUpload.service";
import { HelperService } from "../util/helpers.service";
import { PayloadValidator } from "../validation/payload.validator";
import { EntityManager, Repository, SelectQueryBuilder } from "typeorm";
import { ProgrammeService } from "./programme.service";
import { Test, TestingModule } from "@nestjs/testing";
import { DataResponseMessageDto } from "../dtos/data.response.message";
import { User } from "../entities/user.entity";
import { ProgrammeDto } from "../dtos/programme.dto";
import { Sector } from "../enums/sector.enum";
import { EntityType, IntImplementor, NatImplementor, Recipient, SubSector } from "../enums/shared.enum";
import { ProgrammeEntity } from "../entities/programme.entity";
import { ActionEntity } from "../entities/action.entity";
import { HttpException, HttpStatus } from "@nestjs/common";
import { DocumentDto } from "../dtos/document.dto";
import { KpiDto } from "../dtos/kpi.dto";
import { UnlinkProgrammesDto } from "../dtos/unlink.programmes.dto";
import { getRepositoryToken } from "@nestjs/typeorm";
import { LinkProgrammesDto } from "../dtos/link.programmes.dto";
import { ProgrammeViewDto } from "../dtos/programme.view.dto";
import { ProjectEntity } from "../entities/project.entity";
import { QueryDto } from "../dtos/query.dto";
import { FilterEntry } from "../dtos/filter.entry";
import { LinkUnlinkService } from "../util/linkUnlink.service";
import { ProgrammeUpdateDto } from "../dtos/programmeUpdate.dto";
import { KpiService } from "../kpi/kpi.service";
import { DocumentEntityDto } from "../dtos/document.entity.dto";
import { KpiEntity } from "../entities/kpi.entity";
import { KpiUpdateDto } from "../dtos/kpi.update.dto";
import { ProgrammeViewEntity } from "../entities/programme.view.entity";
import { ValidateDto } from "../dtos/validate.dto";
import { Role } from "../casl/role.enum";
import { ActivityEntity } from "../entities/activity.entity";

describe('ProgrammeService', () => {
	let service: ProgrammeService;
	let entityManagerMock: Partial<EntityManager>;
	let programmeRepositoryMock: Partial<Repository<ProgrammeEntity>>;
	let projectRepositoryMock: Partial<Repository<ProjectEntity>>;
	let actionServiceMock: Partial<ActionService>;
	let counterServiceMock: Partial<CounterService>;
	let helperServiceMock: Partial<HelperService>;
	let fileUploadServiceMock: Partial<FileUploadService>;
	let payloadValidatorMock: Partial<PayloadValidator>;
	let linkUnlinkServiceMock: Partial<LinkUnlinkService>;
	let programmeViewRepositoryMock: Partial<Repository<ProgrammeViewEntity>>;
	let kpiServiceMock: Partial<KpiService>;

	const documentData = "data:text/csv;base64,IlJlcXVlc3QgSWQiLCJQcm="

	beforeEach(async () => {
		entityManagerMock = {
			transaction: jest.fn(),
			save: jest.fn(),
		};

		programmeRepositoryMock = {
			save: jest.fn(),
		};

		actionServiceMock = {
			findActionById: jest.fn(),
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
			doesUserHaveValidatePermission: jest.fn(),
		};
		fileUploadServiceMock = {
			uploadDocument: jest.fn().mockResolvedValue('http://test.com/documents/action_documents/test.csv'),
		};

		payloadValidatorMock = {
			validateKpiPayload: jest.fn(),
		};

		linkUnlinkServiceMock = {
			linkProgrammesToAction: jest.fn(),
			linkProjectsToProgramme: jest.fn(),
			unlinkProgrammesFromAction: jest.fn(),
			findAllProgrammeByIds: jest.fn(),
			updateAllValidatedChildrenAndParentStatusByProgrammeId: jest.fn(),
			unlinkProjectsFromProgramme: jest.fn(),

		}

		kpiServiceMock = {
			getKpisByCreatorTypeAndCreatorId: jest.fn(),
			getAchievementsOfParentEntity: jest.fn(),
			findAchievementsByKpiIds: jest.fn(),
		};

		programmeRepositoryMock = {
			createQueryBuilder: jest.fn(() => ({
				select: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				leftJoinAndMapMany: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				offset: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				getManyAndCount: jest.fn(),
				getRawMany: jest.fn(),
			})) as unknown as () => SelectQueryBuilder<ProgrammeEntity>,
		};

		projectRepositoryMock = {
			createQueryBuilder: jest.fn(() => ({
				where: jest.fn().mockReturnThis(),
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				offset: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				getManyAndCount: jest.fn(),
			})) as unknown as () => SelectQueryBuilder<ProjectEntity>,
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProgrammeService,
				{
					provide: EntityManager,
					useValue: entityManagerMock,
				},
				// {
				// 	provide: OrganisationService,
				// 	useValue: organisationServiceMock,
				// },
				{
					provide: ActionService,
					useValue: actionServiceMock,
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
					provide: LinkUnlinkService,
					useValue: linkUnlinkServiceMock,
				},
				{
					provide: getRepositoryToken(ProgrammeViewEntity),
					useValue: programmeViewRepositoryMock,
				},
				{
					provide: KpiService,
					useValue: kpiServiceMock,
				},
			],
		}).compile();

		service = module.get<ProgrammeService>(ProgrammeService);
	});

	it('should create a programme without documents and kpis', async () => {
		const user = new User();
		user.id = 2;

		const programmeDto = new ProgrammeDto();
		programmeDto.title = "test";
		programmeDto.description = "test description";
		programmeDto.objective = "test objective";
		programmeDto.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeDto.startYear = 2024;
		programmeDto.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeDto.investment = 1000;
		programmeDto.comments = "test comment"

		const programmeEntity = new ProgrammeEntity();
		programmeEntity.title = "test";
		programmeEntity.description = "test description";
		programmeEntity.objective = "test objective";
		programmeEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeEntity.startYear = 2024;
		programmeEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeEntity.investment = 1000;
		programmeEntity.comments = "Test comment"
		programmeEntity.programmeId = "P001";

		const expectedResult = {
			"title": "test",
			"description": "test description",
			"objective": "test objective",
			"affectedSubSector": [
				"Agriculture", "Agroforestry"
			],
			"natImplementor": [
				"Agriculture Department"
			],
			"investment": 1000,
			"startYear": 2024,
			"comments": "Test comment",
			"programmeId": "P001",
		};

		const expectedResponse = new DataResponseMessageDto(201, "action.createActionSuccess", expectedResult)

		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce("2");

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(programmeEntity),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedProgramme;
		});

		const result = await service.createProgramme(programmeDto, user);

		expect(result.data).toEqual(expectedResponse.data);
		expect(result.statusCode).toEqual(expectedResponse.statusCode);
		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
	});

	it('should create a programme with actionId without documents and kpis', async () => {
		const user = new User();
		user.id = 2;

		const programmeDto = new ProgrammeDto();
		programmeDto.title = "test";
		programmeDto.description = "test description";
		programmeDto.objective = "test objective";
		programmeDto.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeDto.startYear = 2024;
		programmeDto.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeDto.investment = 1000;
		programmeDto.comments = "test comment";
		programmeDto.actionId = "A001";

		const programmeEntity = new ProgrammeEntity();
		programmeEntity.title = "test";
		programmeEntity.description = "test description";
		programmeEntity.objective = "test objective";
		programmeEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeEntity.startYear = 2024;
		programmeEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeEntity.investment = 1000;
		programmeEntity.comments = "Test comment"
		programmeEntity.programmeId = "P001";

		const expectedResult = {
			"title": "test",
			"description": "test description",
			"objective": "test objective",
			"affectedSubSector": [
				"Agriculture", "Agroforestry"
			],
			"natImplementor": [
				"Agriculture Department"
			],
			"investment": 1000,
			"startYear": 2024,
			"comments": "Test comment",
			"programmeId": "P001",
		};

		const expectedResponse = new DataResponseMessageDto(201, "action.createActionSuccess", expectedResult)

		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce("2");
		jest.spyOn(actionServiceMock, 'findActionById').mockResolvedValueOnce(new ActionEntity());
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(programmeEntity),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedProgramme;
		});

		const result = await service.createProgramme(programmeDto, user);

		expect(result.data).toEqual(expectedResponse.data);
		expect(result.statusCode).toEqual(expectedResponse.statusCode);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(actionServiceMock.findActionById).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
	});

	it('should throw an error when trying to create a programme with invalid action id', async () => {
		const user = new User();
		user.id = 2;

		const programmeDto = new ProgrammeDto();
		programmeDto.title = "test";
		programmeDto.description = "test description";
		programmeDto.objective = "test objective";
		programmeDto.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeDto.startYear = 2024;
		programmeDto.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeDto.investment = 1000;
		programmeDto.comments = "test comment";
		programmeDto.actionId = "A001";

		const programmeEntity = new ProgrammeEntity();
		programmeEntity.title = "test";
		programmeEntity.description = "test description";
		programmeEntity.objective = "test objective";
		programmeEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeEntity.startYear = 2024;
		programmeEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeEntity.investment = 1000;
		programmeEntity.comments = "Test comment"
		programmeEntity.programmeId = "P001";

		const expectedResult = {
			"title": "test",
			"description": "test description",
			"objective": "test objective",
			"affectedSubSector": [
				"Agriculture", "Agroforestry"
			],
			"natImplementor": [
				"Agriculture Department"
			],
			"investment": 1000,
			"startYear": 2024,
			"comments": "Test comment",
			"programmeId": "P001",
		};

		const expectedResponse = new DataResponseMessageDto(201, "action.createActionSuccess", expectedResult)

		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce("2");
		jest.spyOn(actionServiceMock, 'findActionById').mockResolvedValueOnce(null);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				query: jest.fn().mockResolvedValueOnce(programmeEntity),
				save: jest.fn().mockResolvedValueOnce(programmeEntity),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(4);
			return savedProgramme;
		});

		try {
			await service.createProgramme(programmeDto, user);
		} catch (error) {
			expect(error).toBeInstanceOf(HttpException);
			expect(error.status).toBe(HttpStatus.BAD_REQUEST);
		}

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(0);
		expect(actionServiceMock.findActionById).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
	});

	it('should create a programme with documents and kpis', async () => {
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

		const programmeDto = new ProgrammeDto();
		programmeDto.title = "test";
		programmeDto.description = "test description";
		programmeDto.objective = "test objective";
		programmeDto.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeDto.startYear = 2024;
		programmeDto.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeDto.investment = 1000;
		programmeDto.comments = "test comment";
		programmeDto.kpis = [kpiDto1, kpiDto2];
		programmeDto.documents = [documentDto];
		programmeDto.actionId = "A001";

		const programmeEntity = new ProgrammeEntity();
		programmeEntity.title = "test";
		programmeEntity.description = "test description";
		programmeEntity.objective = "test objective";
		programmeEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeEntity.startYear = 2024;
		programmeEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeEntity.investment = 1000;
		programmeEntity.comments = "Test comment"
		programmeEntity.programmeId = "P001";

		const expectedResult = {
			"title": "test",
			"description": "test description",
			"objective": "test objective",
			"affectedSubSector": [
				"Agriculture", "Agroforestry"
			],
			"natImplementor": [
				"Agriculture Department"
			],
			"investment": 1000,
			"startYear": 2024,
			"comments": "Test comment",
			"programmeId": "P001",
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
		jest.spyOn(actionServiceMock, 'findActionById').mockResolvedValueOnce(new ActionEntity());
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(expectedResult),
				query: jest.fn().mockResolvedValueOnce(expectedResult),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(3);
			return savedProgramme;
		});

		const result = await service.createProgramme(programmeDto, user);

		expect(result.data).toEqual(expectedResponse.data);
		expect(result.statusCode).toEqual(expectedResponse.statusCode);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(1);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
	});

	it('should throw an exception if user does not have sector permission', async () => {
		const user = new User();
		user.id = 1;

		const programmeDto = new ProgrammeDto();
		programmeDto.actionId = "A001";

		const action = new ActionEntity();
		action.actionId = "A001";
		action.sector = Sector.Agriculture;

		jest.spyOn(actionServiceMock, 'findActionById').mockResolvedValueOnce(action);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(false);
		jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockResolvedValueOnce("programme.cannotLinkToUnrelatedAction");

		await expect(service.createProgramme(programmeDto, user)).rejects.toThrow(HttpException);

		expect(actionServiceMock.findActionById).toHaveBeenCalledWith('A001');
		expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('programme.cannotLinkToUnrelatedAction', ['A001']);
	});

	it('should throw error if any linked project is already associated with another programme', async () => {
		const user = new User();
		user.id = 2;

		const programmeDto = new ProgrammeDto();
		programmeDto.linkedProjects = ['1'];

		const project = new ProjectEntity();
		project.projectId = '1';
		project.programme = { id: 'P001' } as unknown as ProgrammeEntity;

		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);
		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
		jest.spyOn(service, 'findAllProjectsByIds').mockResolvedValueOnce([project]);
		jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockResolvedValueOnce("programme.projectAlreadyLinked");

		await expect(service.createProgramme(programmeDto, user)).rejects.toThrow(HttpException);

		expect(service.findAllProjectsByIds).toHaveBeenCalledWith(programmeDto.linkedProjects);
	});

	it('should link programmes to action', async () => {
		const linkProgrammesDto: LinkProgrammesDto = { actionId: '1', programmes: ['1', '2', '3'] };
		const user = new User();
		user.sector = [Sector.Agriculture]

		const action = new ActionEntity();
		jest.spyOn(actionServiceMock, 'findActionById').mockResolvedValue(action);

		const programme1 = new ProgrammeEntity();
		programme1.programmeId = '1';
		programme1.action = null;

		const programme2 = new ProgrammeEntity();
		programme2.programmeId = '2';
		programme2.action = null;

		const programme3 = new ProgrammeEntity();
		programme3.programmeId = '3';
		programme3.action = null;

		jest.spyOn(linkUnlinkServiceMock, 'findAllProgrammeByIds').mockResolvedValue([programme1, programme2, programme3]);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
			};
			const updatedProgramme = await callback(emMock);

			expect(programme1.action).toBe(action);
			expect(programme1.path).toBe(action.actionId);
			expect(programme2.action).toBe(action);
			expect(programme2.path).toBe(action.actionId);
			expect(programme3.action).toBe(action);
			expect(programme3.path).toBe(action.actionId);

			expect(emMock.save).toHaveBeenCalledTimes(6);

			return updatedProgramme;
		});

		const result = await service.linkProgrammesToAction(linkProgrammesDto, user);

		// Assert the returned result
		expect(result).toEqual(expect.any(DataResponseMessageDto));
		expect(result.statusCode).toEqual(HttpStatus.OK);
		expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("programme.programmesLinkedToAction", []);
		expect(linkUnlinkServiceMock.linkProgrammesToAction).toHaveBeenCalled();
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
	});

	it('should throws an error when already linked programmeId sent', async () => {
		const linkProgrammesDto: LinkProgrammesDto = { actionId: '1', programmes: ['1', '2', '3'] };
		const user = new User();
		user.sector = [Sector.Agriculture]

		const action = new ActionEntity();
		jest.spyOn(actionServiceMock, 'findActionById').mockResolvedValue(action);

		const programme1 = new ProgrammeEntity();
		programme1.programmeId = '1';
		programme1.action = action;
		programme1.path = "path1";
		programme1.sector = Sector.Agriculture;

		const programme2 = new ProgrammeEntity();
		programme2.programmeId = '2';
		programme2.action = null;
		programme1.sector = Sector.Agriculture;

		const programme3 = new ProgrammeEntity();
		programme3.programmeId = '3';
		programme3.action = null;
		programme1.sector = Sector.Agriculture;

		jest.spyOn(linkUnlinkServiceMock, 'findAllProgrammeByIds').mockResolvedValue([programme1, programme2, programme3]);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
			};
			const updatedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(6);
			return updatedProgramme;
		});

		try {
			await service.linkProgrammesToAction(linkProgrammesDto, user);
		} catch (error) {
			expect(error).toBeInstanceOf(HttpException);
			expect(error.status).toBe(HttpStatus.BAD_REQUEST);
		}

		expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith(
			'programme.cannotLinkToNotRelatedAction',
			[],
		);
		expect(entityManagerMock.transaction).toBeCalledTimes(0);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
	});

	it('should unlink programmes from action', async () => {
		const unlinkProgrammesDto: UnlinkProgrammesDto = { programme: '1' };
		const user = new User();
		user.sector = [Sector.Agriculture]

		const programme1 = new ProgrammeEntity();
		programme1.programmeId = '1';
		programme1.action = new ActionEntity();
		programme1.path = 'path1';

		jest.spyOn(linkUnlinkServiceMock, 'findAllProgrammeByIds').mockResolvedValue([programme1]);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
			};
			const updatedProgrammes = await callback(emMock);

			expect(programme1.action).toBeNull();
			expect(programme1.path).toBe('');

			expect(emMock.save).toHaveBeenCalledTimes(6);

			return updatedProgrammes;
		});

		const result = await service.unlinkProgrammesFromAction(unlinkProgrammesDto, user);

		expect(result).toEqual(expect.any(DataResponseMessageDto));
		expect(result.statusCode).toEqual(HttpStatus.OK);
		expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("programme.programmesUnlinkedFromAction", []);
		expect(linkUnlinkServiceMock.unlinkProgrammesFromAction).toHaveBeenCalled();
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
	});

	it('should throw an exception when not linked programme sent for unlinking', async () => {
		const unlinkProgrammesDto: UnlinkProgrammesDto = { programme: '1' };
		const user = new User();
		user.sector = [Sector.Agriculture]

		const programme1 = new ProgrammeEntity();
		programme1.programmeId = '1';
		programme1.action = null;
		programme1.path = '';
		programme1.sector = Sector.Agriculture;

		jest.spyOn(linkUnlinkServiceMock, 'findAllProgrammeByIds').mockResolvedValue([programme1]);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
			};
			const updatedProgrammes = await callback(emMock);

			expect(emMock.save).toHaveBeenCalledTimes(0);
			return updatedProgrammes;
		});

		try {
			await service.unlinkProgrammesFromAction(unlinkProgrammesDto, user);
		} catch (error) {
			expect(error).toBeInstanceOf(HttpException);
			expect(error.status).toBe(HttpStatus.BAD_REQUEST);
		}

		expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith(
			'programme.cannotUnlinkNotRelatedProgrammes',
			["1"],
		);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
	});

	it('should throw an exception when mismatch sector user trying to link programme', async () => {
		const linkProgrammesDto: LinkProgrammesDto = { actionId: '1', programmes: ['1', '2', '3'] };
		const user = new User();
		user.sector = [Sector.Agriculture]

		const action = new ActionEntity();
		jest.spyOn(actionServiceMock, 'findActionById').mockResolvedValue(action);

		const programme1 = new ProgrammeEntity();
		programme1.programmeId = '1';
		programme1.action = null;
		programme1.sector = Sector.Agriculture;

		const programme2 = new ProgrammeEntity();
		programme2.programmeId = '2';
		programme2.action = null;
		programme2.sector = Sector.Agriculture;

		const programme3 = new ProgrammeEntity();
		programme3.programmeId = '3';
		programme3.action = null;
		programme3.sector = Sector.Agriculture;

		jest.spyOn(linkUnlinkServiceMock, 'findAllProgrammeByIds').mockResolvedValue([programme1, programme2, programme3]);
		jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockResolvedValueOnce("programme.cannotLinkToNotRelatedAction");

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
			};
			const updatedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(6);
			return updatedProgramme;
		});

		try {
			await service.linkProgrammesToAction(linkProgrammesDto, user);
		} catch (error) {
			expect(error).toBeInstanceOf(HttpException);
			expect(error.status).toBe(HttpStatus.BAD_REQUEST);
		}

		expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith(
			'programme.cannotLinkToNotRelatedAction',
			[],
		);
		expect(entityManagerMock.transaction).toBeCalledTimes(0);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
	});

	it('should throw an exception when mismatch sector user trying to unlink programme', async () => {
		const unlinkProgrammesDto: UnlinkProgrammesDto = { programme: '1' };
		const user = new User();
		user.sector = [Sector.Agriculture];

		const programme1 = new ProgrammeEntity();
		programme1.programmeId = '1';
		programme1.action = new ActionEntity();;
		programme1.path = 'path1';

		jest.spyOn(linkUnlinkServiceMock, 'findAllProgrammeByIds').mockResolvedValue([programme1]);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
			};
			const updatedProgrammes = await callback(emMock);

			expect(emMock.save).toHaveBeenCalledTimes(0);
			return updatedProgrammes;
		});

		try {
			await service.unlinkProgrammesFromAction(unlinkProgrammesDto, user);
		} catch (error) {
			expect(error).toBeInstanceOf(HttpException);
			expect(error.status).toBe(HttpStatus.BAD_REQUEST);
		}
		expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith(
			'programme.cannotUnlinkNotRelatedProgrammes',
			["1"],
		);
		expect(entityManagerMock.transaction).toBeCalledTimes(0);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
	});

	it('should return ProgrammeViewDto with migrating data', async () => {
		const programmeId = 'P001';
		const abilityCondition = 'someCondition';

		const project1 = new ProjectEntity();
		project1.recipientEntities = [Recipient.MIN_EDU];
		project1.internationalImplementingEntities = [IntImplementor.EBRD];

		const project2 = new ProjectEntity();
		project2.recipientEntities = [Recipient.MIN_FISH];
		project2.internationalImplementingEntities = [IntImplementor.GIZ];

		const programmeEntity = new ProgrammeEntity();
		programmeEntity.title = "test";
		programmeEntity.description = "test description";
		programmeEntity.objective = "test objective";
		programmeEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeEntity.startYear = 2024;
		programmeEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeEntity.investment = 1000;
		programmeEntity.comments = "Test comment"
		programmeEntity.programmeId = "P001";
		programmeEntity.projects = [project1, project2]


		jest.spyOn(service, 'query').mockResolvedValueOnce({ data: [programmeEntity] });

		const result = await service.getProgrammeViewData(programmeId, abilityCondition);

		expect(result).toBeInstanceOf(ProgrammeViewDto);
		expect(result.programmeId).toEqual("P001");

		expect(result.recipientEntity.length).toEqual(2);
		expect(result.recipientEntity).toContain("Ministry of Education");
		expect(result.recipientEntity).toContain("Ministry of Fisheries");

		expect(result.interNationalImplementor.length).toEqual(2);
		expect(result.interNationalImplementor).toContain("EBRD");
		expect(result.interNationalImplementor).toContain("GIZ");
	});

	it('should return ProgrammeViewDto with empty arrays when projects array is empty', async () => {
		const programmeId = 'P001';
		const abilityCondition = 'someCondition';

		const programmeEntity = new ProgrammeEntity();
		programmeEntity.title = "test";
		programmeEntity.description = "test description";
		programmeEntity.objective = "test objective";
		programmeEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeEntity.startYear = 2024;
		programmeEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeEntity.investment = 1000;
		programmeEntity.comments = "Test comment"
		programmeEntity.programmeId = "P001";


		jest.spyOn(service, 'query').mockResolvedValueOnce({ data: [programmeEntity] });

		const result = await service.getProgrammeViewData(programmeId, abilityCondition);

		expect(result).toBeInstanceOf(ProgrammeViewDto);
		expect(result.programmeId).toEqual("P001");
		expect(result.recipientEntity).toEqual([]);
		expect(result.interNationalImplementor).toEqual([]);
	});

	it('should throw HttpException when programme is null', async () => {
		const programmeId = '1';
		const abilityCondition = 'someCondition';

		jest.spyOn(service, 'query').mockResolvedValueOnce(null);

		try {
			await service.getProgrammeViewData(programmeId, abilityCondition);
		} catch (error) {
			expect(error).toBeInstanceOf(HttpException);
			expect(error.status).toBe(HttpStatus.NOT_FOUND);
		}

		expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith(
			'programme.programmeNotFound',
			["1"],
		);
	});

	it('should build the query correctly without size and page', async () => {
		const queryDto = new QueryDto();
		const filterAnd: FilterEntry[] = [];
		filterAnd.push({
			key: 'programmeId',
			operation: '=',
			value: 'P025',
		});
		queryDto.filterAnd = filterAnd;
		const abilityCondition = 'someCondition';
		const mockGetRawManyResponse = [{ programme_programmeId: 'P025' }];
    const mockGetCountResponse = 1;

		const mockQueryBuilder = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			select: jest.fn().mockReturnThis(),
			getManyAndCount: jest.fn().mockResolvedValue([]),
			getMany: jest.fn().mockResolvedValue([]),
			getRawMany: jest.fn().mockResolvedValue(mockGetRawManyResponse),
			getCount: jest.fn().mockResolvedValue(mockGetCountResponse),
		} as unknown as SelectQueryBuilder<ProgrammeEntity>;

		jest.spyOn(programmeRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);


		await service.query(queryDto, abilityCondition);

		expect(programmeRepositoryMock.createQueryBuilder).toHaveBeenCalledWith('programme');
		expect(programmeRepositoryMock.createQueryBuilder().where).toHaveBeenCalled();
		expect(programmeRepositoryMock.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledTimes(2);
		expect(programmeRepositoryMock.createQueryBuilder().orderBy).toHaveBeenCalled();
		expect(programmeRepositoryMock.createQueryBuilder().offset).toBeCalledTimes(0);
		expect(programmeRepositoryMock.createQueryBuilder().limit).toBeCalledTimes(0);
		expect(programmeRepositoryMock.createQueryBuilder().getManyAndCount).toHaveBeenCalled();
	});

	it('should build the query correctly with size and page', async () => {
		const queryDto = new QueryDto();
		const filterAnd: FilterEntry[] = [];
		filterAnd.push({
			key: 'programmeId',
			operation: '=',
			value: 'P025',
		});
		queryDto.filterAnd = filterAnd;
		queryDto.page = 10;
		queryDto.size = 20;
		const abilityCondition = 'someCondition';
		const mockGetRawManyResponse = [{ programme_programmeId: 'P025' }];
    const mockGetCountResponse = 1;

		const mockQueryBuilder = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			select: jest.fn().mockReturnThis(),
			getManyAndCount: jest.fn().mockResolvedValue([]),
			getRawMany: jest.fn().mockResolvedValue(mockGetRawManyResponse),
			getCount: jest.fn().mockResolvedValue(mockGetCountResponse),
		} as unknown as SelectQueryBuilder<ProgrammeEntity>;

		jest.spyOn(programmeRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);


		await service.query(queryDto, abilityCondition);

		expect(programmeRepositoryMock.createQueryBuilder).toHaveBeenCalledWith('programme');
		expect(programmeRepositoryMock.createQueryBuilder().where).toHaveBeenCalled();
		expect(programmeRepositoryMock.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledTimes(2); // Assuming there are two left join queries
		expect(programmeRepositoryMock.createQueryBuilder().orderBy).toHaveBeenCalled();
		expect(programmeRepositoryMock.createQueryBuilder().offset).toHaveBeenCalledWith(180);
		expect(programmeRepositoryMock.createQueryBuilder().limit).toHaveBeenCalledWith(20);
		expect(programmeRepositoryMock.createQueryBuilder().getManyAndCount).toHaveBeenCalled();
	});


	it('should update the programme without documents', async () => {
		const user = new User();
		user.id = 2;

		const programmeUpdateDto = new ProgrammeUpdateDto();
		programmeUpdateDto.title = "test";
		programmeUpdateDto.description = "test description";
		programmeUpdateDto.objective = "test objective";
		programmeUpdateDto.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeUpdateDto.startYear = 2024;
		programmeUpdateDto.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeUpdateDto.investment = 1000;
		programmeUpdateDto.comments = "test comment"

		jest.spyOn(service, 'findProgrammeWithParentChildren').mockResolvedValueOnce(new ProgrammeEntity());
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(programmeUpdateDto),
			};
			const savedAction = await callback(emMock);
			expect(emMock.save).toHaveBeenNthCalledWith(1, programmeUpdateDto);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedAction;
		});

		const result = await service.updateProgramme(programmeUpdateDto, user);
		expect(result.statusCode).toEqual(HttpStatus.OK);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(kpiServiceMock.getKpisByCreatorTypeAndCreatorId).toHaveBeenCalledTimes(1)
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);

	})

	it('should remove the programme documents when user remove the documents', async () => {
		const user = new User();
		user.id = 2;

		const programmeUpdateDto = new ProgrammeUpdateDto();
		programmeUpdateDto.title = "test";
		programmeUpdateDto.description = "test description";
		programmeUpdateDto.objective = "test objective";
		programmeUpdateDto.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeUpdateDto.startYear = 2024;
		programmeUpdateDto.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeUpdateDto.investment = 1000;
		programmeUpdateDto.comments = "test comment"
		programmeUpdateDto.removedDocuments = ["www.test.com/doc1"];

		const programmeUpdateEntity = new ProgrammeEntity();
		programmeUpdateEntity.title = "test";
		programmeUpdateEntity.description = "test description";
		programmeUpdateEntity.objective = "test objective";
		programmeUpdateEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeUpdateEntity.startYear = 2024;
		programmeUpdateEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeUpdateEntity.investment = 1000;
		programmeUpdateEntity.comments = "test comment"
		programmeUpdateEntity.documents = null;

		const documentDto = new DocumentEntityDto();
		documentDto.url = "www.test.com/doc1";
		documentDto.title = "doc title"

		const programmeEntity = new ProgrammeEntity();
		programmeEntity.title = "test";
		programmeEntity.description = "test description";
		programmeEntity.objective = "test objective";
		programmeEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeEntity.startYear = 2020;
		programmeEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeEntity.investment = 100;
		programmeEntity.comments = "test comment"
		programmeEntity.documents = [documentDto];


		jest.spyOn(service, 'findProgrammeWithParentChildren').mockResolvedValueOnce(programmeEntity);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(programmeUpdateEntity),
				remove: jest.fn().mockResolvedValueOnce(programmeUpdateDto),
			};
			const savedAction = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedAction;
		});

		const result = await service.updateProgramme(programmeUpdateDto, user);
		expect(result.statusCode).toEqual(HttpStatus.OK);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(kpiServiceMock.getKpisByCreatorTypeAndCreatorId).toHaveBeenCalledTimes(1)
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);

	})

	it('should update the documents in programme when user add new documents', async () => {
		const user = new User();
		user.id = 2;

		const documentDto = new DocumentEntityDto();
		documentDto.url = "www.test.com/doc1";
		documentDto.title = "doc title"

		const addedDocumentDto = new DocumentDto();
		addedDocumentDto.data = documentData;
		addedDocumentDto.title = "doc title"

		const programmeUpdateDto = new ProgrammeUpdateDto();
		programmeUpdateDto.title = "test";
		programmeUpdateDto.description = "test description";
		programmeUpdateDto.objective = "test objective";
		programmeUpdateDto.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeUpdateDto.startYear = 2024;
		programmeUpdateDto.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeUpdateDto.investment = 1000;
		programmeUpdateDto.comments = "test comment"
		programmeUpdateDto.newDocuments = [addedDocumentDto]

		const programmeUpdateEntity = new ProgrammeEntity();
		programmeUpdateEntity.title = "test";
		programmeUpdateEntity.description = "test description";
		programmeUpdateEntity.objective = "test objective";
		programmeUpdateEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeUpdateEntity.startYear = 2024;
		programmeUpdateEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeUpdateEntity.investment = 1000;
		programmeUpdateEntity.comments = "test comment"
		programmeUpdateEntity.documents = [documentDto, addedDocumentDto];


		const programmeEntity = new ProgrammeEntity();
		programmeEntity.title = "test";
		programmeEntity.description = "test description";
		programmeEntity.objective = "test objective";
		programmeEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeEntity.startYear = 2020;
		programmeEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeEntity.investment = 100;
		programmeEntity.comments = "test comment"
		programmeEntity.documents = [documentDto];

		jest.spyOn(service, 'findProgrammeWithParentChildren').mockResolvedValueOnce(programmeEntity);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(programmeUpdateEntity),
				remove: jest.fn().mockResolvedValueOnce(programmeUpdateDto),
			};
			const savedAction = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedAction;
		});

		const result = await service.updateProgramme(programmeUpdateDto, user);
		expect(result.statusCode).toEqual(HttpStatus.OK);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(1);
		expect(kpiServiceMock.getKpisByCreatorTypeAndCreatorId).toHaveBeenCalledTimes(1)
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);

	})

	it('should update kpis in programme when user updated the Kpis', async () => {
		const user = new User();
		user.id = 2;

		const kpiDto1 = new KpiUpdateDto();
		kpiDto1.kpiId = 1;
		kpiDto1.name = "KPI 1";
		kpiDto1.creatorType = "programme";
		kpiDto1.expected = 100;

		const kpi1 = new KpiEntity();
		kpi1.kpiId = 1;
		kpi1.name = "KPI 1";
		kpi1.creatorType = "programme";
		kpi1.expected = 100;

		const kpi2 = new KpiEntity();
		kpi2.kpiId = 2;
		kpi2.name = "KPI 2";
		kpi2.creatorType = "programme";
		kpi2.expected = 100;

		const kpiAdded = new KpiUpdateDto();
		kpiAdded.name = "KPI Added";
		kpiAdded.creatorType = "programme";
		kpiAdded.expected = 300;

		const programmeUpdateDto = new ProgrammeUpdateDto();
		programmeUpdateDto.title = "test";
		programmeUpdateDto.description = "test description";
		programmeUpdateDto.objective = "test objective";
		programmeUpdateDto.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeUpdateDto.startYear = 2024;
		programmeUpdateDto.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeUpdateDto.investment = 1000;
		programmeUpdateDto.comments = "test comment"
		programmeUpdateDto.kpis = [kpiDto1, kpiAdded]

		const programmeUpdateEntity = new ProgrammeEntity();
		programmeUpdateEntity.title = "test";
		programmeUpdateEntity.description = "test description";
		programmeUpdateEntity.objective = "test objective";
		programmeUpdateEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeUpdateEntity.startYear = 2024;
		programmeUpdateEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeUpdateEntity.investment = 1000;
		programmeUpdateEntity.comments = "test comment"

		const programmeEntity = new ProgrammeEntity();
		programmeEntity.title = "test";
		programmeEntity.description = "test description";
		programmeEntity.objective = "test objective";
		programmeEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeEntity.startYear = 2020;
		programmeEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeEntity.investment = 100;
		programmeEntity.comments = "test comment"


		jest.spyOn(service, 'findProgrammeWithParentChildren').mockResolvedValueOnce(programmeEntity);
		jest.spyOn(kpiServiceMock, 'getKpisByCreatorTypeAndCreatorId').mockResolvedValueOnce([kpi1, kpi2]);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(programmeUpdateEntity),
				remove: jest.fn().mockResolvedValueOnce(programmeUpdateDto),
			};
			const savedAction = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(3);
			expect(emMock.remove).toHaveBeenCalledTimes(2);
			return savedAction;
		});

		const result = await service.updateProgramme(programmeUpdateDto, user);
		expect(result.statusCode).toEqual(HttpStatus.OK);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(kpiServiceMock.getKpisByCreatorTypeAndCreatorId).toHaveBeenCalledTimes(1)
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);

	})

	it('should unvalidate the programme when updated', async () => {
		const user = new User();
		user.id = 2;

		const programmeUpdateDto = new ProgrammeUpdateDto();
		programmeUpdateDto.title = "test updated";
		programmeUpdateDto.description = "test description updated";
		programmeUpdateDto.objective = "test objective updated";
		programmeUpdateDto.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeUpdateDto.startYear = 2024;
		programmeUpdateDto.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeUpdateDto.investment = 1000;
		programmeUpdateDto.comments = "test comment"

		const programmeEntity = new ProgrammeEntity();
		programmeEntity.title = "test";
		programmeEntity.description = "test description";
		programmeEntity.objective = "test objective";
		programmeEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeEntity.startYear = 2020;
		programmeEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeEntity.investment = 100;
		programmeEntity.comments = "test comment"
		programmeEntity.validated = true;

		jest.spyOn(service, 'findProgrammeWithParentChildren').mockResolvedValueOnce(programmeEntity);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(programmeUpdateDto),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedProgramme;
		});

		const result = await service.updateProgramme(programmeUpdateDto, user);
		expect(result.statusCode).toEqual(HttpStatus.OK);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(kpiServiceMock.getKpisByCreatorTypeAndCreatorId).toHaveBeenCalledTimes(1)
		expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProgrammeId).toHaveBeenCalledTimes(1)
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);

	})

	it('should unvalidate the programme when updated', async () => {
		const user = new User();
		user.id = 2;

		const programmeUpdateDto = new ProgrammeUpdateDto();
		programmeUpdateDto.title = "test updated";
		programmeUpdateDto.description = "test description updated";
		programmeUpdateDto.objective = "test objective updated";
		programmeUpdateDto.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeUpdateDto.startYear = 2024;
		programmeUpdateDto.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeUpdateDto.investment = 1000;
		programmeUpdateDto.comments = "test comment"

		const programmeEntity = new ProgrammeEntity();
		programmeEntity.title = "test";
		programmeEntity.description = "test description";
		programmeEntity.objective = "test objective";
		programmeEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeEntity.startYear = 2020;
		programmeEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeEntity.investment = 100;
		programmeEntity.comments = "test comment"
		programmeEntity.validated = true;

		jest.spyOn(service, 'findProgrammeWithParentChildren').mockResolvedValueOnce(programmeEntity);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(programmeUpdateDto),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedProgramme;
		});

		const result = await service.updateProgramme(programmeUpdateDto, user);
		expect(result.statusCode).toEqual(HttpStatus.OK);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(kpiServiceMock.getKpisByCreatorTypeAndCreatorId).toHaveBeenCalledTimes(1)
		expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProgrammeId).toHaveBeenCalledTimes(1)
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);

	})

	it('should unlink from old action and then link to the new action when action is updated', async () => {
		const user = new User();
		user.id = 2;

		const action1 = new ActionEntity();
		action1.actionId = "A1";

		const action2 = new ActionEntity();
		action2.actionId = "A2";

		const programmeUpdateDto = new ProgrammeUpdateDto();
		programmeUpdateDto.title = "test updated";
		programmeUpdateDto.description = "test description updated";
		programmeUpdateDto.objective = "test objective updated";
		programmeUpdateDto.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeUpdateDto.startYear = 2024;
		programmeUpdateDto.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeUpdateDto.investment = 1000;
		programmeUpdateDto.comments = "test comment"
		programmeUpdateDto.actionId = "A2";

		const programmeEntity = new ProgrammeEntity();
		programmeEntity.title = "test";
		programmeEntity.description = "test description";
		programmeEntity.objective = "test objective";
		programmeEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeEntity.startYear = 2020;
		programmeEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeEntity.investment = 100;
		programmeEntity.comments = "test comment"
		programmeEntity.validated = true;
		programmeEntity.action = action1;

		jest.spyOn(service, 'findProgrammeWithParentChildren').mockResolvedValueOnce(programmeEntity);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);
		jest.spyOn(service, 'unlinkUpdatedProgrammeFromAction').mockResolvedValueOnce(new DataResponseMessageDto(HttpStatus.OK, "", null));
		jest.spyOn(service, 'linkUpdatedProgrammeToAction').mockResolvedValueOnce(new DataResponseMessageDto(HttpStatus.OK, "", null));

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(programmeUpdateDto),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedProgramme;
		});

		const result = await service.updateProgramme(programmeUpdateDto, user);
		expect(result.statusCode).toEqual(HttpStatus.OK);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(kpiServiceMock.getKpisByCreatorTypeAndCreatorId).toHaveBeenCalledTimes(1)
		expect(service.unlinkUpdatedProgrammeFromAction).toHaveBeenCalledTimes(1)
		expect(service.linkUpdatedProgrammeToAction).toHaveBeenCalledTimes(1)
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);

	})

	it('should unlink from action when action is removed in update', async () => {
		const user = new User();
		user.id = 2;

		const action1 = new ActionEntity();
		action1.actionId = "A1";

		const action2 = new ActionEntity();
		action2.actionId = "A2";

		const programmeUpdateDto = new ProgrammeUpdateDto();
		programmeUpdateDto.title = "test updated";
		programmeUpdateDto.description = "test description updated";
		programmeUpdateDto.objective = "test objective updated";
		programmeUpdateDto.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeUpdateDto.startYear = 2024;
		programmeUpdateDto.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeUpdateDto.investment = 1000;
		programmeUpdateDto.actionId = "A2";

		const programmeEntity = new ProgrammeEntity();
		programmeEntity.title = "test";
		programmeEntity.description = "test description";
		programmeEntity.objective = "test objective";
		programmeEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeEntity.startYear = 2020;
		programmeEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeEntity.investment = 100;
		programmeEntity.comments = "test comment"
		programmeEntity.validated = true;

		jest.spyOn(service, 'findProgrammeWithParentChildren').mockResolvedValueOnce(programmeEntity);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);
		jest.spyOn(service, 'unlinkUpdatedProgrammeFromAction').mockResolvedValueOnce(new DataResponseMessageDto(HttpStatus.OK, "", null));
		jest.spyOn(service, 'linkUpdatedProgrammeToAction').mockResolvedValueOnce(new DataResponseMessageDto(HttpStatus.OK, "", null));

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(programmeUpdateDto),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedProgramme;
		});

		const result = await service.updateProgramme(programmeUpdateDto, user);
		expect(result.statusCode).toEqual(HttpStatus.OK);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(kpiServiceMock.getKpisByCreatorTypeAndCreatorId).toHaveBeenCalledTimes(1)
		expect(service.unlinkUpdatedProgrammeFromAction).toHaveBeenCalledTimes(0)
		expect(service.linkUpdatedProgrammeToAction).toHaveBeenCalledTimes(1)
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);

	})

	it('should link to action when action is linked in update', async () => {
		const user = new User();
		user.id = 2;

		const action1 = new ActionEntity();
		action1.actionId = "A1";

		const action2 = new ActionEntity();
		action2.actionId = "A2";

		const programmeUpdateDto = new ProgrammeUpdateDto();
		programmeUpdateDto.title = "test updated";
		programmeUpdateDto.description = "test description updated";
		programmeUpdateDto.objective = "test objective updated";
		programmeUpdateDto.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeUpdateDto.startYear = 2024;
		programmeUpdateDto.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeUpdateDto.investment = 1000;
		programmeUpdateDto.comments = "test comment"

		const programmeEntity = new ProgrammeEntity();
		programmeEntity.title = "test";
		programmeEntity.description = "test description";
		programmeEntity.objective = "test objective";
		programmeEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeEntity.startYear = 2020;
		programmeEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeEntity.investment = 100;
		programmeEntity.comments = "test comment"
		programmeEntity.validated = true;
		programmeEntity.action = action1;

		jest.spyOn(service, 'findProgrammeWithParentChildren').mockResolvedValueOnce(programmeEntity);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);
		jest.spyOn(service, 'unlinkUpdatedProgrammeFromAction').mockResolvedValueOnce(new DataResponseMessageDto(HttpStatus.OK, "", null));
		jest.spyOn(service, 'linkUpdatedProgrammeToAction').mockResolvedValueOnce(new DataResponseMessageDto(HttpStatus.OK, "", null));

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(programmeUpdateDto),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedProgramme;
		});

		const result = await service.updateProgramme(programmeUpdateDto, user);
		expect(result.statusCode).toEqual(HttpStatus.OK);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(kpiServiceMock.getKpisByCreatorTypeAndCreatorId).toHaveBeenCalledTimes(1)
		expect(service.unlinkUpdatedProgrammeFromAction).toHaveBeenCalledTimes(1)
		expect(service.linkUpdatedProgrammeToAction).toHaveBeenCalledTimes(0)
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);

	})

	it('should validate the programme', async () => {
		const user = new User();
		user.id = 2;
	
		const validateDto = new ValidateDto();
		validateDto.entityId = 'P001';
		validateDto.validateStatus = true;
	
		const programme = new ProgrammeEntity();
		programme.programmeId = 'P001';
		programme.sector = Sector.Forestry;
		programme.validated = false;
	
		jest.spyOn(service, 'findProgrammeById').mockResolvedValueOnce(programme);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(programme),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedProgramme;
		});
	
		await service.validateProgramme(validateDto, user);
		expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProgrammeId).toHaveBeenCalledTimes(0);
	  })

		it('should unvalidate the programme', async () => {
			const user = new User();
			user.id = 2;
		
			const validateDto = new ValidateDto();
			validateDto.entityId = 'P001';
			validateDto.validateStatus = false;
		
			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.sector = Sector.Forestry;
			programme.validated = true;
		
			jest.spyOn(service, 'findProgrammeById').mockResolvedValueOnce(programme);
			jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);
	
			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(programme),
				};
				const savedProgramme = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(2);
				return savedProgramme;
			});
		
			await service.validateProgramme(validateDto, user);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProgrammeId).toHaveBeenCalledTimes(1);
			})

			describe('deleteProgramme', () => {
				it('should throw ForbiddenException if user is not Admin or Root', async () => {
					const user = { role: Role.GovernmentUser } as User;
					const deleteDto = { entityId: '123' };
		
					await expect(service.deleteProgramme(deleteDto, user))
						.rejects.toThrow(HttpException);
		
					expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('user.userUnAUth', []);
				});
		
				it('should throw BadRequest if programme not found', async () => {
					const user = { role: Role.Admin } as User;
					const deleteDto = { entityId: '123' };
					jest.spyOn(service, 'findProgrammeWithParentChildren').mockResolvedValue(null);
		
					await expect(service.deleteProgramme(deleteDto, user))
						.rejects.toThrow(HttpException);
		
					expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('programme.programmeNotFound', ["123"]);
				});
		
				it('should throw Forbidden if user does not have sector permission', async () => {
					const user = { role: Role.Admin } as User;
					const deleteDto = { entityId: 'A001' };
					const programme = new ProgrammeEntity();
					programme.programmeId = 'P001';
					programme.sector = Sector.Forestry;
					programme.validated = true;
		
					jest.spyOn(service, 'findProgrammeWithParentChildren').mockResolvedValue(programme);
					jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(false);
		
					await expect(service.deleteProgramme(deleteDto, user))
						.rejects.toThrow(HttpException);
		
					expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('programme.permissionDeniedForSector', ["P001"]);
				});
		
				it('should successfully delete action and associated entities', async () => {
					const user = { role: Role.Admin } as User;
					const deleteDto = { entityId: '123' };
		
					const activity = new ActivityEntity;
					activity.parentId = 'P1';
					activity.parentType = EntityType.PROGRAMME;
					activity.activityId = "T1"
		
					const project = new ProjectEntity;
					project.projectId = 'J1'
		
					const kpi1 = new KpiEntity();
					kpi1.kpiId = 1;
					kpi1.name = "KPI 1";
					kpi1.creatorType = "programme";
					kpi1.expected = 100;
		
					const kpi2 = new KpiEntity();
					kpi2.kpiId = 2;
					kpi2.name = "KPI 2";
					kpi2.creatorType = "programme";
					kpi2.expected = 100;
		
					const programme = new ProgrammeEntity;
					programme.programmeId = 'P1'
					programme.sector = Sector.Forestry;
					programme.validated = true;
					programme.activities = [activity];
					programme.projects = [project]
		
					const programmeKPIs = [kpi1, kpi2];
		
					jest.spyOn(service, 'findProgrammeWithParentChildren').mockResolvedValue(programme);
					jest.spyOn(kpiServiceMock, "getKpisByCreatorTypeAndCreatorId").mockResolvedValue(programmeKPIs);
					jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);
		
					entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
						const emMock = {
							delete: jest.fn().mockResolvedValueOnce({ affected: 1 }),
						};
						const savedProgramme = await callback(emMock);
						expect(emMock.delete).toHaveBeenCalledTimes(3);
						return savedProgramme;
					});
		
					const result = await service.deleteProgramme(deleteDto, user);
		
					expect(linkUnlinkServiceMock.unlinkProjectsFromProgramme).toBeCalledTimes(1);
		
				});
		
				it('should handle transaction errors', async () => {
					const user = { role: Role.Admin } as User;

					const deleteDto = { entityId: '123' };

					const programme = new ProgrammeEntity;
					programme.programmeId = 'P1'
					programme.sector = Sector.Forestry;
					programme.validated = true;

					jest.spyOn(service, 'findProgrammeWithParentChildren').mockResolvedValue(programme);
		
		
					jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);
		
					entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
						throw new Error('Transaction error');
					});
		
					await expect(service.deleteProgramme(deleteDto, user))
						.rejects.toThrow(HttpException);
		
				});
			});
})