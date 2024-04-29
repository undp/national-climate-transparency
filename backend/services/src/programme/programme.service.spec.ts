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
import { IntImplementor, NatImplementor, Recipient, SubSector } from "../enums/shared.enum";
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
import { ProjectType } from "../enums/project.enum";
import { QueryDto } from "../dtos/query.dto";
import { FilterEntry } from "../dtos/filter.entry";
import { LinkUnlinkService } from "../util/linkUnlink.service";
import { ProgrammeUpdateDto } from "../dtos/programmeUpdate.dto";
import { KpiService } from "../kpi/kpi.service";
import { DocumentEntityDto } from "../dtos/document.entity.dto";
import { KpiEntity } from "../entities/kpi.entity";
import { KpiUpdateDto } from "../dtos/kpi.update.dto";

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
		}

		kpiServiceMock = {
			findKpisByCreatorTypeAndCreatorId: jest.fn(),
		};

		programmeRepositoryMock = {
			createQueryBuilder: jest.fn(() => ({
				where: jest.fn().mockReturnThis(),
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				offset: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				getManyAndCount: jest.fn(),
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
		programmeDto.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
		programmeDto.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeDto.startYear = 2024;
		programmeDto.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeDto.investment = 1000;
		programmeDto.comments = "test comment"

		const programmeEntity = new ProgrammeEntity();
		programmeEntity.title = "test";
		programmeEntity.description = "test description";
		programmeEntity.objective = "test objective";
		programmeEntity.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
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
			"affectedSectors": [
				"Agriculture", "Cross-cutting"
			],
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
		programmeDto.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
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
		programmeEntity.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
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
			"affectedSectors": [
				"Agriculture", "Cross-cutting"
			],
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

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(programmeEntity),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(4);
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
		programmeDto.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
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
		programmeEntity.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
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
			"affectedSectors": [
				"Agriculture", "Cross-cutting"
			],
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
		programmeDto.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
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
		programmeEntity.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
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
			"affectedSectors": [
				"Agriculture", "Cross-cutting"
			],
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

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(expectedResult),
				query: jest.fn().mockResolvedValueOnce(expectedResult),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(7);
			return savedProgramme;
		});

		const result = await service.createProgramme(programmeDto, user);

		expect(result.data).toEqual(expectedResponse.data);
		expect(result.statusCode).toEqual(expectedResponse.statusCode);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(1);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
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
		programme1.affectedSectors = [Sector.Agriculture];

		const programme2 = new ProgrammeEntity();
		programme2.programmeId = '2';
		programme2.action = null;
		programme2.affectedSectors = [Sector.Agriculture];

		const programme3 = new ProgrammeEntity();
		programme3.programmeId = '3';
		programme3.action = null;
		programme3.affectedSectors = [Sector.Agriculture];

		jest.spyOn(service, 'findAllProgrammeByIds').mockResolvedValue([programme1, programme2, programme3]);

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
		programme1.path = "path1"
		programme1.affectedSectors = [Sector.Agriculture];

		const programme2 = new ProgrammeEntity();
		programme2.programmeId = '2';
		programme2.action = null;
		programme2.affectedSectors = [Sector.Agriculture];

		const programme3 = new ProgrammeEntity();
		programme3.programmeId = '3';
		programme3.action = null;
		programme3.affectedSectors = [Sector.Agriculture];

		jest.spyOn(service, 'findAllProgrammeByIds').mockResolvedValue([programme1, programme2, programme3]);

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
			'programme.programmeAlreadyLinked',
			["1"],
		);
		expect(entityManagerMock.transaction).toBeCalledTimes(0);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
	});

	it('should unlink programmes from action', async () => {
		const unlinkProgrammesDto: UnlinkProgrammesDto = { programmes: ['1', '2', '3'] };
		const user = new User();
		user.sector = [Sector.Agriculture]

		const programme1 = new ProgrammeEntity();
		programme1.programmeId = '1';
		programme1.action = new ActionEntity();
		programme1.path = 'path1';
		programme1.affectedSectors = [Sector.Agriculture];

		const programme2 = new ProgrammeEntity();
		programme2.programmeId = '2';
		programme2.action = new ActionEntity();
		programme2.path = 'path2';
		programme2.affectedSectors = [Sector.Agriculture];

		const programme3 = new ProgrammeEntity();
		programme3.programmeId = '3';
		programme3.action = new ActionEntity();
		programme3.path = 'path3';
		programme3.affectedSectors = [Sector.Agriculture];

		jest.spyOn(service, 'findAllProgrammeByIds').mockResolvedValue([programme1, programme2, programme3]);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
			};
			const updatedProgrammes = await callback(emMock);

			expect(programme1.action).toBeNull();
			expect(programme1.path).toBe('');
			expect(programme2.action).toBeNull();
			expect(programme2.path).toBe('');
			expect(programme3.action).toBeNull();
			expect(programme3.path).toBe('');

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
		const unlinkProgrammesDto: UnlinkProgrammesDto = { programmes: ['1', '2', '3'] };
		const user = new User();
		user.sector = [Sector.Agriculture]
		
		const programme1 = new ProgrammeEntity();
		programme1.programmeId = '1';
		programme1.action = null;
		programme1.path = '';
		programme1.affectedSectors = [Sector.Agriculture];

		const programme2 = new ProgrammeEntity();
		programme2.programmeId = '2';
		programme2.action = new ActionEntity();
		programme2.path = 'path2';
		programme2.affectedSectors = [Sector.Agriculture];

		const programme3 = new ProgrammeEntity();
		programme3.programmeId = '3';
		programme3.action = new ActionEntity();
		programme3.path = 'path3';
		programme3.affectedSectors = [Sector.Agriculture];

		jest.spyOn(service, 'findAllProgrammeByIds').mockResolvedValue([programme1, programme2, programme3]);

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
			'programme.programmeIsNotLinked',
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
		programme1.affectedSectors = [Sector.Agriculture];

		const programme2 = new ProgrammeEntity();
		programme2.programmeId = '2';
		programme2.action = null;
		programme2.affectedSectors = [Sector.Industry];

		const programme3 = new ProgrammeEntity();
		programme3.programmeId = '3';
		programme3.action = null;
		programme3.affectedSectors = [Sector.Agriculture];

		jest.spyOn(service, 'findAllProgrammeByIds').mockResolvedValue([programme1, programme2, programme3]);

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
			'programme.cannotLinkNotRelatedProgrammes',
			["2"],
		);
		expect(entityManagerMock.transaction).toBeCalledTimes(0);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
	});

	it('should throw an exception when mismatch sector user trying to unlink programme', async () => {
		const unlinkProgrammesDto: UnlinkProgrammesDto = { programmes: ['1', '2', '3'] };
		const user = new User();
		user.sector = [Sector.Agriculture];

		const programme1 = new ProgrammeEntity();
		programme1.programmeId = '1';
		programme1.action = new ActionEntity();;
		programme1.path = 'path1';
		programme1.affectedSectors = [Sector.Agriculture];

		const programme2 = new ProgrammeEntity();
		programme2.programmeId = '2';
		programme2.action = new ActionEntity();
		programme2.path = 'path2';
		programme2.affectedSectors = [Sector.Energy];

		const programme3 = new ProgrammeEntity();
		programme3.programmeId = '3';
		programme3.action = new ActionEntity();
		programme3.path = 'path3';
		programme3.affectedSectors = [Sector.Agriculture];

		jest.spyOn(service, 'findAllProgrammeByIds').mockResolvedValue([programme1, programme2, programme3]);

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
			["2"],
		);
		expect(entityManagerMock.transaction).toBeCalledTimes(0);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
	});

	it('should return ProgrammeViewDto with migrating data', async () => {
		const programmeId = 'P001';
		const abilityCondition = 'someCondition';

		const project1 = new ProjectEntity();
		project1.type = ProjectType.MITIGATION;
		project1.recipientEntities = [ Recipient.MIN_EDU ];
		project1.internationalImplementingEntities = [ IntImplementor.EBRD ];

		const project2 = new ProjectEntity();
		project2.type = ProjectType.MITIGATION;
		project2.recipientEntities = [Recipient.MIN_FISH];
		project2.internationalImplementingEntities = [ IntImplementor.GIZ ];

		const programmeEntity = new ProgrammeEntity();
		programmeEntity.title = "test";
		programmeEntity.description = "test description";
		programmeEntity.objective = "test objective";
		programmeEntity.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
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

		expect(result.types.length).toEqual(1);
		expect(result.types).toContain("Mitigation");

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
		programmeEntity.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
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
		expect(result.types).toEqual([]);
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

		const mockQueryBuilder = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getManyAndCount: jest.fn().mockResolvedValue([]),
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

		const mockQueryBuilder = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getManyAndCount: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ProgrammeEntity>;

		jest.spyOn(programmeRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);


		await service.query(queryDto, abilityCondition);

		expect(programmeRepositoryMock.createQueryBuilder).toHaveBeenCalledWith('programme');
		expect(programmeRepositoryMock.createQueryBuilder().where).toHaveBeenCalled();
		expect(programmeRepositoryMock.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledTimes(2); // Assuming there are two left join queries
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

		const mockQueryBuilder = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getManyAndCount: jest.fn().mockResolvedValue([]),
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
		programmeUpdateDto.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
		programmeUpdateDto.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeUpdateDto.startYear = 2024;
		programmeUpdateDto.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeUpdateDto.investment = 1000;
		programmeUpdateDto.comments = "test comment"

		jest.spyOn(service, 'findProgrammeById').mockResolvedValueOnce(new ProgrammeEntity());

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
		expect(kpiServiceMock.findKpisByCreatorTypeAndCreatorId).toHaveBeenCalledTimes(0)
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);

	})

	it('should remove the action documents when user remove the documents', async () => {
		const user = new User();
		user.id = 2;

		const programmeUpdateDto = new ProgrammeUpdateDto();
		programmeUpdateDto.title = "test";
		programmeUpdateDto.description = "test description";
		programmeUpdateDto.objective = "test objective";
		programmeUpdateDto.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
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
		programmeUpdateEntity.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
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
		programmeEntity.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
		programmeEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeEntity.startYear = 2020;
		programmeEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeEntity.investment = 100;
		programmeEntity.comments = "test comment"
		programmeEntity.documents = [documentDto];


		jest.spyOn(service, 'findProgrammeById').mockResolvedValueOnce(programmeEntity);

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
		expect(kpiServiceMock.findKpisByCreatorTypeAndCreatorId).toHaveBeenCalledTimes(0)
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

		const programmeUpdateDto = new ProgrammeUpdateDto();
		programmeUpdateDto.title = "test";
		programmeUpdateDto.description = "test description";
		programmeUpdateDto.objective = "test objective";
		programmeUpdateDto.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
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
		programmeUpdateEntity.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
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
		programmeEntity.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
		programmeEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeEntity.startYear = 2020;
		programmeEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeEntity.investment = 100;
		programmeEntity.comments = "test comment"
		programmeEntity.documents = [documentDto];

		jest.spyOn(service, 'findProgrammeById').mockResolvedValueOnce(programmeEntity);

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
		expect(kpiServiceMock.findKpisByCreatorTypeAndCreatorId).toHaveBeenCalledTimes(0)
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);

	})

	it('should update kpis in action when user updated the Kpis', async () => {
		const user = new User();
		user.id = 2;

		const kpiDto1 = new KpiEntity();
		kpiDto1.kpiId = 1;
		kpiDto1.name = "KPI 1";
		kpiDto1.creatorType = "action";
		kpiDto1.expected = 100;

		const kpiDto2 = new KpiEntity();
		kpiDto2.kpiId = 2;
		kpiDto2.name = "KPI 2";
		kpiDto2.creatorType = "action";
		kpiDto2.expected = 100;

		const kpiAdded = new KpiUpdateDto();
		kpiDto2.name = "KPI Added";
		kpiDto2.creatorType = "action";
		kpiDto2.expected = 300;

		const programmeUpdateDto = new ProgrammeUpdateDto();
		programmeUpdateDto.title = "test";
		programmeUpdateDto.description = "test description";
		programmeUpdateDto.objective = "test objective";
		programmeUpdateDto.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
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
		programmeUpdateEntity.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
		programmeUpdateEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeUpdateEntity.startYear = 2024;
		programmeUpdateEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeUpdateEntity.investment = 1000;
		programmeUpdateEntity.comments = "test comment"

		const programmeEntity = new ProgrammeEntity();
		programmeEntity.title = "test";
		programmeEntity.description = "test description";
		programmeEntity.objective = "test objective";
		programmeEntity.affectedSectors = [Sector.Agriculture, Sector.CrossCutting];
		programmeEntity.affectedSubSector = [SubSector.AGRICULTURE, SubSector.AGR_FORESTRY];
		programmeEntity.startYear = 2020;
		programmeEntity.natImplementor = [NatImplementor.AGRI_DEPT];
		programmeEntity.investment = 100;
		programmeEntity.comments = "test comment"


		jest.spyOn(service, 'findProgrammeById').mockResolvedValueOnce(programmeEntity);
		jest.spyOn(kpiServiceMock, 'findKpisByCreatorTypeAndCreatorId').mockResolvedValueOnce([kpiDto1, kpiDto2])

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(programmeUpdateEntity),
				remove: jest.fn().mockResolvedValueOnce(programmeUpdateDto),
			};
			const savedAction = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(5);
			expect(emMock.remove).toHaveBeenCalledTimes(1);
			return savedAction;
		});

		const result = await service.updateProgramme(programmeUpdateDto, user);
		expect(result.statusCode).toEqual(HttpStatus.OK);

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(kpiServiceMock.findKpisByCreatorTypeAndCreatorId).toHaveBeenCalledTimes(1)
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);

	})
})