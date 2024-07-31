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
import { EntityType, IntImplementor, Recipient, SubSector } from "../enums/shared.enum";
import { DataResponseMessageDto } from "../dtos/data.response.message";
import { ProjectDto } from "../dtos/project.dto";
import { User } from "../entities/user.entity";
import { ProjectStatus } from "../enums/project.enum";
import { HttpException, HttpStatus } from "@nestjs/common";
import { DocumentDto } from "../dtos/document.dto";
import { KpiDto } from "../dtos/kpi.dto";
import { LinkProjectsDto } from "../dtos/link.projects.dto";
import { Sector } from "../enums/sector.enum";
import { LinkUnlinkService } from "../util/linkUnlink.service";
import { UnlinkProjectsDto } from "../dtos/unlink.projects.dto";
import { ProjectUpdateDto } from "../dtos/projectUpdate.dto";
import { KpiService } from "../kpi/kpi.service";
import { ActivityEntity } from "../entities/activity.entity";
import { Role } from "../casl/role.enum";
import { KpiEntity } from "../entities/kpi.entity";
import { ActionEntity } from "../entities/action.entity";

describe('ProjectService', () => {
	let service: ProjectService;
	let entityManagerMock: Partial<EntityManager>;
	let projectRepositoryMock: Partial<Repository<ProjectEntity>>;
	let activityRepositoryMock: Partial<Repository<ActivityEntity>>;
	let programmeServiceMock: Partial<ProgrammeService>;
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

		activityRepositoryMock = {
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
			refreshMaterializedViews: jest.fn(),
			doesUserHaveSectorPermission: jest.fn(),
		};
		fileUploadServiceMock = {
			uploadDocument: jest.fn().mockResolvedValue('http://test.com/documents/action_documents/test.csv'),
		};

		payloadValidatorMock = {
			validateKpiPayload: jest.fn(),
		};

		linkUnlinkServiceMock = {
			linkProjectsToProgramme: jest.fn(),
			unlinkProjectsFromProgramme: jest.fn(),
			updateAllValidatedChildrenAndParentStatusByProject: jest.fn(),
			updateAllValidatedChildrenAndParentStatusByProgrammeId: jest.fn(),
			updateAllValidatedChildrenStatusByActionId: jest.fn(),
		}

		projectRepositoryMock = {
			save: jest.fn(),
			createQueryBuilder: jest.fn(() => ({
				where: jest.fn().mockReturnThis(),
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				offset: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				getManyAndCount: jest.fn(),
				getOne: jest.fn(),
			})) as unknown as () => SelectQueryBuilder<ProjectEntity>,
		};

		kpiServiceMock = {
			getKpisByCreatorTypeAndCreatorId: jest.fn(),
			getAchievementsOfParentEntity: jest.fn(),
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
		projectDto.projectStatus = ProjectStatus.PLANNED;
		projectDto.startYear = 2025;
		projectDto.endYear = 2030;
		projectDto.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectDto.internationalImplementingEntities = [IntImplementor.NEFCO];

		const projectEntity = new ProjectEntity();
		projectEntity.projectId = "J001";
		projectEntity.title = "Project 4";
		projectEntity.description = "test description";
		projectEntity.projectStatus = ProjectStatus.PLANNED;
		projectEntity.startYear = 2025;
		projectEntity.endYear = 2030;
		projectEntity.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectEntity.internationalImplementingEntities = [IntImplementor.NEFCO];
		projectEntity.expectedTimeFrame = 5;
		projectEntity.path = "_._";

		const expectedResponse = new DataResponseMessageDto(201, "project.createProjectSuccess", projectEntity)

		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce("2");
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);

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
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
	});

	it('should throw an error when trying to create a project with incorrect programme id', async () => {
		const user = new User();
		user.id = 2;

		const projectDto = new ProjectDto();
		projectDto.title = "Project 4";
		projectDto.description = "test description";
		projectDto.projectStatus = ProjectStatus.PLANNED;
		projectDto.startYear = 2025;
		projectDto.endYear = 2030;
		projectDto.programmeId = "002"
		projectDto.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectDto.internationalImplementingEntities = [IntImplementor.NEFCO];

		const projectEntity = new ProjectEntity();
		projectEntity.projectId = "J001";
		projectEntity.title = "Project 4";
		projectEntity.description = "test description";
		projectEntity.projectStatus = ProjectStatus.PLANNED;
		projectEntity.startYear = 2025;
		projectEntity.endYear = 2030;
		projectEntity.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectEntity.internationalImplementingEntities = [IntImplementor.NEFCO];
		projectEntity.expectedTimeFrame = 5;
		projectEntity.path = "";

		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce("2");
		jest.spyOn(programmeServiceMock, "findProgrammeById").mockResolvedValueOnce(null);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(projectEntity),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(0);
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
		projectDto.projectStatus = ProjectStatus.PLANNED;
		projectDto.startYear = 2025;
		projectDto.endYear = 2030;
		projectDto.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectDto.internationalImplementingEntities = [IntImplementor.NEFCO];
		projectDto.kpis = [kpiDto1, kpiDto2];
		projectDto.documents = [documentDto];
		projectDto.programmeId = "P001";

		const projectEntity = new ProjectEntity();
		projectEntity.projectId = "J001";
		projectEntity.title = "Project 4";
		projectEntity.description = "test description";
		projectEntity.projectStatus = ProjectStatus.PLANNED;
		projectEntity.startYear = 2025;
		projectEntity.endYear = 2030;
		projectEntity.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectEntity.internationalImplementingEntities = [IntImplementor.NEFCO];
		projectEntity.expectedTimeFrame = 25;
		projectEntity.path = "A001.P001";
		projectEntity.programme = programmeEntity;
		projectEntity.documents = [documentEntityDto]


		const expectedResponse = new DataResponseMessageDto(201, "project.createProjectSuccess", projectEntity)

		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
		jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce("2");
		jest.spyOn(programmeServiceMock, "findProgrammeById").mockResolvedValueOnce(programmeEntity);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);


		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(projectEntity),
				query: jest.fn().mockResolvedValueOnce(projectEntity),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(3);
			return savedProgramme;
		});

		const result = await service.createProject(projectDto, user);

		expect(result.statusCode).toEqual(expectedResponse.statusCode);
		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(1);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1)
	});

	it('should link projects to programme', async () => {
		const linkProjectsDto: LinkProjectsDto = { programmeId: '1', projectIds: ['1', '2', '3'] };
		const user = new User();
		user.sector = [Sector.Agriculture]

		const programme = new ProgrammeEntity();
		programme.programmeId = "P1";
		jest.spyOn(programmeServiceMock, 'findProgrammeById').mockResolvedValue(programme);

		const project1 = new ProjectEntity();
		project1.projectId = '1';
		project1.programme = null;

		const project2 = new ProjectEntity();
		project2.projectId = '2';
		project2.programme = null;

		const project3 = new ProjectEntity();
		project3.projectId = '3';
		project3.programme = null;

		jest.spyOn(service, 'findAllProjectsByIds').mockResolvedValue([project1, project2, project3]);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValue([new ProjectEntity()]),
			};
			const updatedProjects = await callback(emMock);

			expect(project1.programme).toBe(programme);
			expect(project1.path).toBe(programme.programmeId);
			expect(project2.programme).toBe(programme);
			expect(project2.path).toBe(programme.programmeId);
			expect(project3.programme).toBe(programme);
			expect(project3.path).toBe(programme.programmeId);

			expect(emMock.save).toHaveBeenCalledTimes(6);

			return updatedProjects;
		});

		const result = await service.linkProjectsToProgramme(linkProjectsDto, user);

		// Assert the returned result
		expect(result).toEqual(expect.any(DataResponseMessageDto));
		expect(result.statusCode).toEqual(HttpStatus.OK);
		expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("project.projectsLinkedToProgramme", []);
		expect(linkUnlinkServiceMock.linkProjectsToProgramme).toHaveBeenCalled();
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
	});

	it('should unlink projects from programme', async () => {
		const unlinkProjectsDto: UnlinkProjectsDto = { projects: ['1', '2', '3'] };
		const user = new User();
		user.sector = [Sector.Agriculture]

		const programme = new ProgrammeEntity();
		programme.programmeId = "P1";
		programme.sector = Sector.Agriculture;
		jest.spyOn(programmeServiceMock, 'findProgrammeById').mockResolvedValue(programme);

		const project1 = new ProjectEntity();
		project1.projectId = '1';
		project1.programme = programme;

		const project2 = new ProjectEntity();
		project2.projectId = '2';
		project2.programme = programme;

		const project3 = new ProjectEntity();
		project3.projectId = '3';
		project3.programme = programme;

		jest.spyOn(service, 'findAllProjectsByIds').mockResolvedValue([project1, project2, project3]);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValue(true);
		jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockReturnValueOnce('project.cannotUnlinkNotRelatedProject');

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValue([new ProjectEntity()]),
			};
			const updatedProjects = await callback(emMock);

			expect(project1.programme).toBe(programme);
			expect(project1.path).toBe(programme.programmeId);
			expect(project2.programme).toBe(programme);
			expect(project2.path).toBe(programme.programmeId);
			expect(project3.programme).toBe(programme);
			expect(project3.path).toBe(programme.programmeId);

			expect(emMock.save).toHaveBeenCalledTimes(6);

			return updatedProjects;
		});

		const result = await service.unlinkProjectsFromProgramme(unlinkProjectsDto, user);

		// Assert the returned result
		expect(result).toEqual(expect.any(DataResponseMessageDto));
		expect(result.statusCode).toEqual(HttpStatus.OK);
		expect(linkUnlinkServiceMock.unlinkProjectsFromProgramme).toHaveBeenCalled();
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
	});

	it('should throw an error if unrelated sector user try to unlink projects from programme', async () => {
		const unlinkProjectsDto: UnlinkProjectsDto = { projects: ['1', '2', '3'] };
		const user = new User();
		user.sector = [Sector.Industry]

		const programme = new ProgrammeEntity();
		programme.programmeId = "P1";
		programme.sector = Sector.Agriculture;
		jest.spyOn(programmeServiceMock, 'findProgrammeById').mockResolvedValue(programme);

		const project1 = new ProjectEntity();
		project1.projectId = '1';
		project1.programme = programme;

		const project2 = new ProjectEntity();
		project2.projectId = '2';
		project2.programme = programme;

		const project3 = new ProjectEntity();
		project3.projectId = '3';
		project3.programme = programme;

		jest.spyOn(service, 'findAllProjectsByIds').mockResolvedValue([project1, project2, project3]);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValue([new ProjectEntity()]),
			};
			const updatedProjects = await callback(emMock);

			expect(project1.programme).toBe(programme);
			expect(project1.path).toBe(programme.programmeId);
			expect(project2.programme).toBe(programme);
			expect(project2.path).toBe(programme.programmeId);
			expect(project3.programme).toBe(programme);
			expect(project3.path).toBe(programme.programmeId);

			expect(emMock.save).toHaveBeenCalledTimes(6);

			return updatedProjects;
		});


		try {
			await service.unlinkProjectsFromProgramme(unlinkProjectsDto, user);
		} catch (error) {
			expect(error).toBeInstanceOf(HttpException);
			expect(error.status).toBe(HttpStatus.BAD_REQUEST);
		}
		expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("project.cannotUnlinkNotRelatedProject", ["1"]);
		expect(linkUnlinkServiceMock.unlinkProjectsFromProgramme).toBeCalledTimes(0);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
	});

	it('should update a project without programme id, documents and kpis', async () => {
		const user = new User();
		user.id = 2;

		const projectDto = new ProjectUpdateDto();
		projectDto.projectId = "J001";
		projectDto.title = "Project 4";
		projectDto.description = "test description";
		projectDto.projectStatus = ProjectStatus.PLANNED;
		projectDto.startYear = 2025;
		projectDto.endYear = 2030;
		projectDto.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectDto.internationalImplementingEntities = [IntImplementor.NEFCO];

		const projectEntity = new ProjectEntity();
		projectEntity.projectId = "J001";
		projectEntity.title = "Project 4";
		projectEntity.sector = Sector.Agriculture;
		projectEntity.description = "test description";
		projectEntity.projectStatus = ProjectStatus.PLANNED;
		projectEntity.startYear = 2025;
		projectEntity.endYear = 2030;
		projectEntity.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectEntity.internationalImplementingEntities = [IntImplementor.NEFCO];
		projectEntity.path = "";

		const mockQueryBuilder = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getOne: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ProjectEntity  >;

		jest.spyOn(projectRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);
		jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockResolvedValueOnce("project.cannotUpdateNotRelatedProject: J001'");

		const expectedResponse = new DataResponseMessageDto(200, "project.createProjectSuccess", projectEntity)
		// jest.spyOn(service, 'findProjectWithLinkedProgrammeByProjectId').mockResolvedValue(projectEntity);


		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(projectEntity),
				query: jest.fn().mockResolvedValueOnce(projectEntity),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedProgramme;
		});

		const result = await service.updateProject(projectDto, user);

		expect(result.statusCode).toEqual(expectedResponse.statusCode);
		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(linkUnlinkServiceMock.linkProjectsToProgramme).toHaveBeenCalledTimes(0);
		expect(linkUnlinkServiceMock.unlinkProjectsFromProgramme).toHaveBeenCalledTimes(0);
		expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProject).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
	});


	it('should update a not attached project with programme id', async () => {
		const user = new User();
		user.id = 2;
		user.sector = [Sector.Agriculture]

		const projectDto = new ProjectUpdateDto();
		projectDto.projectId = "J001";
		projectDto.title = "Project 4";
		projectDto.description = "test description";
		projectDto.projectStatus = ProjectStatus.PLANNED;
		projectDto.startYear = 2025;
		projectDto.endYear = 2030;
		projectDto.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectDto.internationalImplementingEntities = [IntImplementor.NEFCO];
		projectDto.programmeId = "P001"

		const projectEntity = new ProjectEntity();
		projectEntity.projectId = "J001";
		projectEntity.title = "Project 4";
		projectEntity.description = "test description";
		projectEntity.projectStatus = ProjectStatus.PLANNED;
		projectEntity.startYear = 2025;
		projectEntity.endYear = 2030;
		projectEntity.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectEntity.internationalImplementingEntities = [IntImplementor.NEFCO];
		projectEntity.expectedTimeFrame = 25;
		projectEntity.path = "";

		const programme = new ProgrammeEntity();
		programme.programmeId = "P001";
		programme.sector = Sector.Agriculture;

		const mockQueryBuilder = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getOne: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ProjectEntity>;

		jest.spyOn(projectRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
		jest.spyOn(programmeServiceMock, 'findProgrammeById').mockResolvedValue(programme);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValue(true);

		const expectedResponse = new DataResponseMessageDto(200, "project.createProjectSuccess", projectEntity)


		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(projectEntity),
				query: jest.fn().mockResolvedValueOnce(projectEntity),
			};
			const savedProgramme = await callback(emMock);
			// expect(emMock.save).toHaveBeenNthCalledWith(1, projectEntity);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedProgramme;
		});

		const result = await service.updateProject(projectDto, user);

		expect(result.statusCode).toEqual(expectedResponse.statusCode);
		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(linkUnlinkServiceMock.linkProjectsToProgramme).toHaveBeenCalledTimes(1);
		expect(linkUnlinkServiceMock.unlinkProjectsFromProgramme).toHaveBeenCalledTimes(0);
		expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProject).toHaveBeenCalledTimes(0);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);

	});

	it('should update an attached project without programme id', async () => {
		const user = new User();
		user.id = 2;
		user.sector = [Sector.Agriculture]

		const programme = new ProgrammeEntity();
		programme.programmeId = "P001";
		programme.sector = Sector.Agriculture;

		const projectDto = new ProjectUpdateDto();
		projectDto.projectId = "J001";
		projectDto.title = "Project 4";
		projectDto.description = "test description";
		projectDto.projectStatus = ProjectStatus.PLANNED;
		projectDto.startYear = 2025;
		projectDto.endYear = 2030;
		projectDto.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectDto.internationalImplementingEntities = [IntImplementor.NEFCO];

		const projectEntity = new ProjectEntity();
		projectEntity.projectId = "J001";
		projectEntity.title = "Project 4";
		projectEntity.description = "test description";
		projectEntity.projectStatus = ProjectStatus.PLANNED;
		projectEntity.startYear = 2025;
		projectEntity.endYear = 2030;
		projectEntity.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectEntity.internationalImplementingEntities = [IntImplementor.NEFCO];
		projectEntity.expectedTimeFrame = 25;
		projectEntity.path = "";
		projectEntity.programme = programme;

		const mockQueryBuilder = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getOne: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ProjectEntity  >;

		jest.spyOn(projectRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
		jest.spyOn(programmeServiceMock, 'findProgrammeById').mockResolvedValue(programme);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);

		const expectedResponse = new DataResponseMessageDto(200, "project.createProjectSuccess", projectEntity)
		// jest.spyOn(service, 'findProjectWithLinkedProgrammeByProjectId').mockResolvedValue(projectEntity);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(projectEntity),
				query: jest.fn().mockResolvedValueOnce(projectEntity),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedProgramme;
		});

		const result = await service.updateProject(projectDto, user);

		expect(result.statusCode).toEqual(expectedResponse.statusCode);
		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(linkUnlinkServiceMock.linkProjectsToProgramme).toHaveBeenCalledTimes(0);
		expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProject).toHaveBeenCalledTimes(1);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1)
	});

	it('should update an attached project with new programme id', async () => {
		const user = new User();
		user.id = 2;
		user.sector = [Sector.Agriculture]

		const programme = new ProgrammeEntity();
		programme.programmeId = "P001";
		programme.sector = Sector.Agriculture;

		const newProgramme = new ProgrammeEntity();
		newProgramme.programmeId = "P002";
		newProgramme.sector = Sector.Agriculture;

		const projectDto = new ProjectUpdateDto();
		projectDto.projectId = "J001";
		projectDto.title = "Project 4";
		projectDto.description = "test description";
		projectDto.projectStatus = ProjectStatus.PLANNED;
		projectDto.startYear = 2025;
		projectDto.endYear = 2030;
		projectDto.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectDto.internationalImplementingEntities = [IntImplementor.NEFCO];
		projectDto.programmeId = "P002"

		const projectEntity = new ProjectEntity();
		projectEntity.projectId = "J001";
		projectEntity.title = "Project 4";
		projectEntity.description = "test description";
		projectEntity.projectStatus = ProjectStatus.PLANNED;
		projectEntity.startYear = 2025;
		projectEntity.endYear = 2030;
		projectEntity.recipientEntities = [Recipient.MIN_AGRI_CLIM_ENV, Recipient.OFF_PRESIDENT];
		projectEntity.internationalImplementingEntities = [IntImplementor.NEFCO];
		projectEntity.expectedTimeFrame = 25;
		projectEntity.path = "";
		projectEntity.programme = programme;

		const mockQueryBuilder = {
			where: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			leftJoinAndMapMany: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			offset: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			getOne: jest.fn().mockResolvedValue([]),
		} as unknown as SelectQueryBuilder<ProjectEntity  >;

		jest.spyOn(projectRepositoryMock, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
		jest.spyOn(programmeServiceMock, 'findProgrammeById').mockResolvedValue(newProgramme);
		jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValue(true);

		const expectedResponse = new DataResponseMessageDto(200, "project.createProjectSuccess", projectEntity)
		// jest.spyOn(service, 'findProjectWithLinkedProgrammeByProjectId').mockResolvedValue(projectEntity);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValueOnce(projectEntity),
				query: jest.fn().mockResolvedValueOnce(projectEntity),
			};
			const savedProgramme = await callback(emMock);
			expect(emMock.save).toHaveBeenCalledTimes(2);
			return savedProgramme;
		});

		const result = await service.updateProject(projectDto, user);

		expect(result.statusCode).toEqual(expectedResponse.statusCode);
		expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
		expect(linkUnlinkServiceMock.linkProjectsToProgramme).toHaveBeenCalledTimes(1);
		expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProject).toHaveBeenCalledTimes(0);
		expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
		expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1)
	});

	describe('deleteProject', () => {
		it('should throw ForbiddenException if user is not Admin or Root', async () => {
			const user = { role: Role.GovernmentUser } as User;
			const deleteDto = { entityId: '123' };

			await expect(service.deleteProject(deleteDto, user))
				.rejects.toThrow(HttpException);

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('user.userUnAUth', []);
		});

		it('should throw BadRequest if project not found', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: '123' };
			jest.spyOn(service, 'findProjectWithParentAndChildren').mockResolvedValue(null);

			await expect(service.deleteProject(deleteDto, user))
				.rejects.toThrow(HttpException);

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('project.projectNotFound', ["123"]);
		});

		it('should throw Forbidden if user does not have sector permission', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: 'J001' };

			const project = new ProjectEntity();
			project.projectId = 'J001';
			project.sector = Sector.Forestry;
			project.validated = true;

			jest.spyOn(service, 'findProjectWithParentAndChildren').mockResolvedValue(project);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(false);

			await expect(service.deleteProject(deleteDto, user))
				.rejects.toThrow(HttpException);

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('project.permissionDeniedForSector', ["J001"]);
		});

		it('should successfully delete project, associated entities and parent programme is not validated', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: 'J001' };

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"

			const programme = new ProgrammeEntity;
			programme.programmeId = 'P1'

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

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;
			project.activities = [activity];
			project.programme = programme

			const programmeKPIs = [kpi1, kpi2];

			jest.spyOn(service, 'findProjectWithParentAndChildren').mockResolvedValue(project);
			jest.spyOn(kpiServiceMock, "getKpisByCreatorTypeAndCreatorId").mockResolvedValue(programmeKPIs);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					delete: jest.fn().mockResolvedValueOnce({ affected: 1 }),
				};
				const savedProject = await callback(emMock);
				expect(emMock.delete).toHaveBeenCalledTimes(3);
				return savedProject;
			});

			const result = await service.deleteProject(deleteDto, user);

			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProgrammeId).toBeCalledTimes(0);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenStatusByActionId).toBeCalledTimes(0);

		});

		it('should successfully delete project, associated entities and parent programme validated, parent node programme', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: 'J001' };

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"

			const programme = new ProgrammeEntity;
			programme.programmeId = 'P1'
			programme.validated = true;

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

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;
			project.activities = [activity];
			project.programme = programme

			const programmeKPIs = [kpi1, kpi2];

			jest.spyOn(service, 'findProjectWithParentAndChildren').mockResolvedValue(project);
			jest.spyOn(kpiServiceMock, "getKpisByCreatorTypeAndCreatorId").mockResolvedValue(programmeKPIs);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					delete: jest.fn().mockResolvedValueOnce({ affected: 1 }),
					save: jest.fn().mockResolvedValueOnce(null),
				};
				const savedProject = await callback(emMock);
				expect(emMock.delete).toHaveBeenCalledTimes(3);
				return savedProject;
			});

			const result = await service.deleteProject(deleteDto, user);

			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProgrammeId).toBeCalledTimes(1);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenStatusByActionId).toBeCalledTimes(0);

		});

		it('should successfully delete project, associated entities and parent programme action validated, parent node action', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: 'J001' };

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"

			const action = new ActionEntity;
			action.actionId = 'A1'
			action.validated = true;

			const programme = new ProgrammeEntity;
			programme.programmeId = 'P1'
			programme.validated = true;
			programme.action = action;

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

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;
			project.activities = [activity];
			project.programme = programme

			const programmeKPIs = [kpi1, kpi2];

			jest.spyOn(service, 'findProjectWithParentAndChildren').mockResolvedValue(project);
			jest.spyOn(kpiServiceMock, "getKpisByCreatorTypeAndCreatorId").mockResolvedValue(programmeKPIs);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					delete: jest.fn().mockResolvedValueOnce({ affected: 1 }),
					save: jest.fn().mockResolvedValueOnce(null),
				};
				const savedProject = await callback(emMock);
				expect(emMock.delete).toHaveBeenCalledTimes(3);
				return savedProject;
			});

			const result = await service.deleteProject(deleteDto, user);

			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProgrammeId).toBeCalledTimes(0);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenStatusByActionId).toBeCalledTimes(1);

		});

		it('should handle transaction errors', async () => {
			const user = { role: Role.Admin } as User;

			const deleteDto = { entityId: '123' };

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;

			jest.spyOn(service, 'findProjectWithParentAndChildren').mockResolvedValue(project);


			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				throw new Error('This is a test transaction error. This is expected');
			});

			await expect(service.deleteProject(deleteDto, user))
				.rejects.toThrow(HttpException);

		});
	});

})