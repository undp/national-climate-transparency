import { EntityManager, Repository, SelectQueryBuilder } from "typeorm";
import { ProjectService } from "./project.service";
import { ProgrammeService } from "../programme/programme.service";
import { ProjectEntity } from "../entities/project.entity";
import { TestingModule, Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ProgrammeEntity } from "../entities/programme.entity";
import { CounterService } from "../util/counter.service";
import { FileUploadService } from "../util/fileUpload.service";
import { HelperService } from "../util/helpers.service";
import { PayloadValidator } from "../validation/payload.validator";
import { IntImplementor, Recipient } from "../enums/shared.enum";
import { DataResponseMessageDto } from "../dtos/data.response.message";
import { ProjectDto } from "../dtos/project.dto";
import { User } from "../entities/user.entity";
import { ProjectStatus, ProjectType } from "../enums/project.enum";
import { HttpException, HttpStatus } from "@nestjs/common";
import { DocumentDto } from "../dtos/document.dto";
import { KpiDto } from "../dtos/kpi.dto";

describe('ProjectService', () => {
	let service: ProjectService;
	let entityManagerMock: Partial<EntityManager>;
	let projectRepositoryMock: Partial<Repository<ProjectEntity>>;
	let programmeServiceMock: Partial<ProgrammeService>;
	let counterServiceMock: Partial<CounterService>;
	let helperServiceMock: Partial<HelperService>;
	let fileUploadServiceMock: Partial<FileUploadService>;
	let payloadValidatorMock: Partial<PayloadValidator>;

	const documentData = "data:text/csv;base64,IlJlcXVlc3QgSWQiLCJQcm="

	beforeEach(async () => {
		entityManagerMock = {
			transaction: jest.fn(),
			save: jest.fn(),
		};

		projectRepositoryMock = {
			save: jest.fn(),
		};

		programmeServiceMock = {
			findProgrammeById: jest.fn(),
		};
		counterServiceMock = {
			incrementCount: jest.fn().mockResolvedValue(1),
		};
		helperServiceMock = {
			formatReqMessagesString: jest.fn(),
			parseMongoQueryToSQLWithTable: jest.fn(),
			generateWhereSQL: jest.fn(),
			refreshMaterializedViews: jest.fn()
		};
		fileUploadServiceMock = {
			uploadDocument: jest.fn().mockResolvedValue('http://test.com/documents/action_documents/test.csv'),
		};

		payloadValidatorMock = {
			validateKpiPayload: jest.fn(),
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
				ProjectService,
				{
					provide: EntityManager,
					useValue: entityManagerMock,
				},
				{
					provide: ProgrammeService,
					useValue: programmeServiceMock,
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
					provide: getRepositoryToken(ProjectEntity),
					useValue: projectRepositoryMock,
				},
			],
		}).compile();

		service = module.get<ProjectService>(ProjectService);
	});


	it('should create a project without programme id, documents and kpis', async () => {
		const user = new User();
		user.id = 2;

		const projectDto = new ProjectDto();
		projectDto.title = "Project 4";
		projectDto.description = "test description";
		projectDto.type = ProjectType.MITIGATION;
		projectDto.projectStatus = ProjectStatus.PLANNED;
		projectDto.startYear = 2025;
		projectDto.endYear = 2030;
		projectDto.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectDto.internationalImplementingEntities = [IntImplementor.NEFCO];
		projectDto.achievedGHGReduction = 5;
		projectDto.expectedGHGReduction = 1;
		projectDto.expectedTimeFrame = 25;

		const projectEntity = new ProjectEntity();
		projectEntity.projectId = "J001";
		projectEntity.title = "Project 4";
		projectEntity.description = "test description";
		projectEntity.type = ProjectType.MITIGATION;
		projectEntity.projectStatus = ProjectStatus.PLANNED;
		projectEntity.startYear = 2025;
		projectEntity.endYear = 2030;
		projectEntity.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectEntity.internationalImplementingEntities = [IntImplementor.NEFCO];
		projectEntity.achievedGHGReduction = 5;
		projectEntity.expectedGHGReduction = 1;
		projectEntity.expectedTimeFrame = 25;
		projectEntity.path = "";

		const expectedResponse = new DataResponseMessageDto(201, "project.createProjectSuccess", projectEntity)

		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce("2");

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(projectEntity),
				query: jest.fn().mockResolvedValueOnce(projectEntity),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenNthCalledWith(1, projectEntity);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedProgramme;
		});

		const result = await service.createProject(projectDto, user);

		expect(result.statusCode).toEqual(expectedResponse.statusCode);
		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1)
	});

	it('should throw an error when trying to create a project with incorrect programme id', async () => {
		const user = new User();
		user.id = 2;

		const projectDto = new ProjectDto();
		projectDto.title = "Project 4";
		projectDto.description = "test description";
		projectDto.type = ProjectType.MITIGATION;
		projectDto.projectStatus = ProjectStatus.PLANNED;
		projectDto.startYear = 2025;
		projectDto.endYear = 2030;
		projectDto.programmeId = "002"
		projectDto.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectDto.internationalImplementingEntities = [IntImplementor.NEFCO];
		projectDto.achievedGHGReduction = 5;
		projectDto.expectedGHGReduction = 1;
		projectDto.expectedTimeFrame = 25;

		const projectEntity = new ProjectEntity();
		projectEntity.projectId = "J001";
		projectEntity.title = "Project 4";
		projectEntity.description = "test description";
		projectEntity.type = ProjectType.MITIGATION;
		projectEntity.projectStatus = ProjectStatus.PLANNED;
		projectEntity.startYear = 2025;
		projectEntity.endYear = 2030;
		projectEntity.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectEntity.internationalImplementingEntities = [IntImplementor.NEFCO];
		projectEntity.achievedGHGReduction = 5;
		projectEntity.expectedGHGReduction = 1;
		projectEntity.expectedTimeFrame = 25;
		projectEntity.path = "";

		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce("2");
		jest.spyOn(programmeServiceMock, "findProgrammeById").mockResolvedValueOnce(null);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(projectEntity),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenNthCalledWith(1, projectEntity);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedProgramme;
		});


		try {
			await service.createProject(projectDto, user);
		} catch (error) {
			expect(error).toBeInstanceOf(HttpException);
			expect(error.status).toBe(HttpStatus.BAD_REQUEST);
		}

		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(0);
		expect(programmeServiceMock.findProgrammeById).toHaveBeenCalledTimes(1)
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0)
	});

	it('should create a project with programme id, documents and kpis', async () => {
		const user = new User();
		user.id = 2;

		const documentEntityDto = {
			"createdTime": 1712116527062,
			"title": "doc title",
			"url": "http://test.com/documents/action_documents/test.csv",
		}

		const kpiDto1 = new KpiDto();
		kpiDto1.name = "KPI 1";
		kpiDto1.creatorType = "project";
		kpiDto1.expected = 100;

		const kpiDto2 = new KpiDto();
		kpiDto2.name = "KPI 2";
		kpiDto2.creatorType = "project";
		kpiDto2.expected = 2553;

		const documentDto = new DocumentDto();
		documentDto.data = documentData;
		documentDto.title = "doc title"

		
		const programmeEntity = new ProgrammeEntity();
		programmeEntity.programmeId = "P001";
		programmeEntity.path = "A001"

		const projectDto = new ProjectDto();
		projectDto.title = "Project 4";
		projectDto.description = "test description";
		projectDto.type = ProjectType.MITIGATION;
		projectDto.projectStatus = ProjectStatus.PLANNED;
		projectDto.startYear = 2025;
		projectDto.endYear = 2030;
		projectDto.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectDto.internationalImplementingEntities = [IntImplementor.NEFCO];
		projectDto.achievedGHGReduction = 5;
		projectDto.expectedGHGReduction = 1;
		projectDto.expectedTimeFrame = 25;
		projectDto.kpis = [kpiDto1, kpiDto2];
		projectDto.documents = [documentDto];
		projectDto.programmeId = "P001";

		const projectEntity = new ProjectEntity();
		projectEntity.projectId = "J001";
		projectEntity.title = "Project 4";
		projectEntity.description = "test description";
		projectEntity.type = ProjectType.MITIGATION;
		projectEntity.projectStatus = ProjectStatus.PLANNED;
		projectEntity.startYear = 2025;
		projectEntity.endYear = 2030;
		projectEntity.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectEntity.internationalImplementingEntities = [IntImplementor.NEFCO];
		projectEntity.achievedGHGReduction = 5;
		projectEntity.expectedGHGReduction = 1;
		projectEntity.expectedTimeFrame = 25;
		projectEntity.path = "A001.P001";
		projectEntity.programme = programmeEntity;
		projectEntity.documents = [documentEntityDto]


		const expectedResponse = new DataResponseMessageDto(201, "project.createProjectSuccess", projectEntity)

		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce("2");
		jest.spyOn(programmeServiceMock, "findProgrammeById").mockResolvedValueOnce(programmeEntity);


		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(projectEntity),
				query: jest.fn().mockResolvedValueOnce(projectEntity),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(7);
			return savedProgramme;
		});

		const result = await service.createProject(projectDto, user);

		expect(result.statusCode).toEqual(expectedResponse.statusCode);
		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(1);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1)
	});

})