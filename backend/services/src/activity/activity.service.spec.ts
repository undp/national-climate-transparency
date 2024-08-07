import { HttpException, HttpStatus } from "@nestjs/common";
import { ActivityDto } from "../dtos/activity.dto";
import { User } from "../entities/user.entity";
import { CounterService } from "../util/counter.service";
import { FileUploadService } from "../util/fileUpload.service";
import { HelperService } from "../util/helpers.service";
import { EntityManager, Repository } from "typeorm";
import { ActivityService } from "./activity.service";
import { ProgrammeEntity } from "../entities/programme.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { ActivityStatus, ImpleMeans, Measure } from "../enums/activity.enum";
import { ProgrammeService } from "../programme/programme.service";
import { ProjectService } from "../project/project.service";
import { ActionService } from "../action/action.service";
import { EntityType, IntImplementor, NatImplementor } from "../enums/shared.enum";
import { DocumentDto } from "../dtos/document.dto";
import { Sector } from "../enums/sector.enum";
import { ActivityEntity } from "../entities/activity.entity";
import { LinkUnlinkService } from "../util/linkUnlink.service";
import { UnlinkActivitiesDto } from "../dtos/unlink.activities.dto";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataResponseMessageDto } from "../dtos/data.response.message";
import { LinkActivitiesDto } from "../dtos/link.activities.dto";
import { ActionEntity } from "../entities/action.entity";
import { ProjectEntity } from "../entities/project.entity";
import { ActivityUpdateDto } from "../dtos/activityUpdate.dto";
import { DocumentEntityDto } from "../dtos/document.entity.dto";
import { PayloadValidator } from "../validation/payload.validator";
import { KpiService } from "../kpi/kpi.service";
import { Role } from "../casl/role.enum";
import { SupportEntity } from "../entities/support.entity";
import { ValidateDto } from "../dtos/validate.dto";
import { ConfigurationSettingsEntity } from "../entities/configuration.settings.entity";

describe('ActivityService', () => {
	let service: ActivityService;
	let entityManagerMock: Partial<EntityManager>;
	let activityRepositoryMock: Partial<Repository<ActivityEntity>>;
	let counterServiceMock: Partial<CounterService>;
	let helperServiceMock: Partial<HelperService>;
	let fileUploadServiceMock: Partial<FileUploadService>;
	let programmeServiceMock: Partial<ProgrammeService>;
	let projectServiceMock: Partial<ProjectService>;
	let actionServiceMock: Partial<ActionService>;
	let linkUnlinkServiceMock: Partial<LinkUnlinkService>;
	let payloadValidatorServiceMock: Partial<PayloadValidator>;
	let kpiServiceMock: Partial<KpiService>;
	let configurationSettingsRepositoryMock: Partial<Repository<ConfigurationSettingsEntity>>;

	const documentData = "data:text/csv;base64,IlJlcXVlc3QgSWQiLCJQcm="

	beforeEach(async () => {
		entityManagerMock = {
			transaction: jest.fn(),
			save: jest.fn(),
			query: jest.fn(),

		};
		counterServiceMock = {
			incrementCount: jest.fn().mockResolvedValue(1),
		};
		activityRepositoryMock = {
			save: jest.fn(),
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
		linkUnlinkServiceMock = {
			linkActivitiesToParent: jest.fn(),
			unlinkActivitiesFromParent: jest.fn(),
			updateAllValidatedChildrenAndParentStatusByProject: jest.fn(),
			findActivityByIdWithSupports: jest.fn(),
			getParentIdFromPath: jest.fn(),
			findProjectById: jest.fn(),
			findProgrammeById: jest.fn(),
			updateAllValidatedChildrenAndParentStatusByProgrammeId: jest.fn(),
			updateAllValidatedChildrenStatusByActionId: jest.fn(),
		};
		programmeServiceMock = {
			findProgrammeById: jest.fn()
		};
		projectServiceMock = {
			findProjectById: jest.fn()
		};
		payloadValidatorServiceMock = {
			validateMitigationTimelinePayload: jest.fn()
		};
		kpiServiceMock = {
			getAchievementsOfParentEntity: jest.fn(),
			findAchievementsByActivityId: jest.fn(),
		};
		configurationSettingsRepositoryMock = {
			findOneBy: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ActivityService,
				{
					provide: EntityManager,
					useValue: entityManagerMock,
				},
				{
					provide: CounterService,
					useValue: counterServiceMock,
				},
				{
					provide: getRepositoryToken(ActivityEntity),
					useValue: activityRepositoryMock,
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
					provide: ProgrammeService,
					useValue: programmeServiceMock,
				},
				{
					provide: ProjectService,
					useValue: projectServiceMock,
				},
				{
					provide: ActionService,
					useValue: actionServiceMock,
				},
				{
					provide: LinkUnlinkService,
					useValue: linkUnlinkServiceMock,
				},
				{
					provide: PayloadValidator,
					useValue: payloadValidatorServiceMock,
				},
				{
					provide: KpiService,
					useValue: kpiServiceMock,
				},
				{
					provide: getRepositoryToken(ConfigurationSettingsEntity),
					useValue: configurationSettingsRepositoryMock,
				},
			],
		}).compile();

		service = module.get<ActivityService>(ActivityService);
	});

	describe('createActivity', () => {
		it('should create an activity without documents and migration data', async () => {
			const user = new User();
			user.id = 2;

			const activityDto = new ActivityDto();
			activityDto.title = "test";
			activityDto.description = "test description";
			activityDto.status = ActivityStatus.PLANNED;
			activityDto.measure = Measure.WITHOUT_MEASURES;

			jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
			jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockResolvedValueOnce("action.createActionSuccess");
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(new ProgrammeEntity()),
				};
				const savedAction = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(2);
				return savedAction;
			});

			const result = await service.createActivity(activityDto, user);

			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
			expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
		});

		it('should create an activity with incorrect project id', async () => {
			const user = new User();
			user.id = 2;

			const activityDto = new ActivityDto();
			activityDto.title = "test";
			activityDto.description = "test description";
			activityDto.status = ActivityStatus.PLANNED;
			activityDto.measure = Measure.WITHOUT_MEASURES;
			activityDto.parentType = EntityType.PROJECT;
			activityDto.parentId = "J001";

			jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
			jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockResolvedValueOnce("action.createActionSuccess");
			jest.spyOn(service, 'isProjectValid').mockRejectedValueOnce(new HttpException("Invalid Project", HttpStatus.BAD_REQUEST));


			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(new ProgrammeEntity()),
				};
				const savedAction = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(2);
				return savedAction;
			});

			try {
				await service.createActivity(activityDto, user);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.BAD_REQUEST);
			}

			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(0);
			expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
		});

		it('should create an activity with incorrect action id', async () => {
			const user = new User();
			user.id = 2;

			const activityDto = new ActivityDto();
			activityDto.title = "test";
			activityDto.description = "test description";
			activityDto.status = ActivityStatus.PLANNED;
			activityDto.measure = Measure.WITHOUT_MEASURES;
			activityDto.parentType = EntityType.ACTION;
			activityDto.parentId = "A001";

			jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
			jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockResolvedValueOnce("action.createActionSuccess");
			jest.spyOn(service, 'isActionValid').mockRejectedValueOnce(new HttpException("Invalid Action", HttpStatus.BAD_REQUEST));


			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(new ProgrammeEntity()),
				};
				const savedAction = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(2);
				return savedAction;
			});

			try {
				await service.createActivity(activityDto, user);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.BAD_REQUEST);
			}

			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(0);
			expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
		});

		it('should create an activity with incorrect programme id', async () => {
			const user = new User();
			user.id = 2;

			const activityDto = new ActivityDto();
			activityDto.title = "test";
			activityDto.description = "test description";
			activityDto.status = ActivityStatus.PLANNED;
			activityDto.measure = Measure.WITHOUT_MEASURES;
			activityDto.parentType = EntityType.PROGRAMME;
			activityDto.parentId = "P001";

			jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
			jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockResolvedValueOnce("action.createActionSuccess");
			jest.spyOn(service, 'isProgrammeValid').mockRejectedValueOnce(new HttpException("Invalid Programme", HttpStatus.BAD_REQUEST));


			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(new ProgrammeEntity()),
				};
				const savedAction = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(2);
				return savedAction;
			});

			try {
				await service.createActivity(activityDto, user);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.BAD_REQUEST);
			}

			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(0);
			expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
		});

		it('should create an activity with documents and migration data', async () => {
			const user = new User();
			user.id = 2;

			const documentDto = new DocumentDto();
			documentDto.data = documentData;
			documentDto.title = "doc title"

			const activityDto = new ActivityDto();
			activityDto.title = "test";
			activityDto.description = "test description";
			activityDto.status = ActivityStatus.PLANNED;
			activityDto.measure = Measure.WITHOUT_MEASURES;
			activityDto.documents = [documentDto];
			activityDto.mitigationInfo = {
				mitigationCalcEntity: "ABB",
				mitigationMethodology: "CO2",
				mitigationMethodologyDescription: "test"
			}

			jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
			jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockResolvedValueOnce("action.createActionSuccess");
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(new ProgrammeEntity()),
				};
				const savedAction = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(2);
				return savedAction;
			});

			const result = await service.createActivity(activityDto, user);

			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
			expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(1);
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
		});

	});

	describe('Update Activity', () => {
		it('should update an activity', async () => {
			const user = new User();
			user.id = 2;
			user.sector = [Sector.CrossCutting, Sector.Energy, Sector.Forestry]

			const documentDto = new DocumentDto();
			documentDto.data = documentData;
			documentDto.title = "doc title";

			const currentMitigationMethodologyDoc = new DocumentEntityDto();
			currentMitigationMethodologyDoc.title = "crr mit 01";
			currentMitigationMethodologyDoc.url = "www.test.com/crr_mit_01.pdf";

			const currentMitigationMethodologyDocToRemove = new DocumentEntityDto();
			currentMitigationMethodologyDocToRemove.title = "crr mit remove 01";
			currentMitigationMethodologyDocToRemove.url = "www.test.com/crr_mit_remove.pdf";

			const currentMitigationResultDoc = new DocumentEntityDto();
			currentMitigationResultDoc.title = "crr mit res 01";
			currentMitigationResultDoc.url = "www.test.com/crr_mit_res_01.pdf";

			const currentMitigationResultDocToRemove = new DocumentEntityDto();
			currentMitigationResultDocToRemove.title = "crr mit res remove 01";
			currentMitigationResultDocToRemove.url = "www.test.com/crr_mit_res_remove.pdf";

			const currentDoc = new DocumentEntityDto();
			currentDoc.title = "crr 01";
			currentDoc.url = "www.test.com/crr_01.pdf";

			const currentDocToRemove = new DocumentEntityDto();
			currentDocToRemove.title = "crr doc to remove 01";
			currentDocToRemove.url = "www.test.com/crr_to_remove_01.pdf";

			const programme = new ProgrammeEntity();
			programme.programmeId = "P001";
			programme.path = "A001";
			programme.sector = Sector.Forestry;

			const project = new ProjectEntity();
			project.projectId = "J001";
			project.path = "_._";
			project.sector = Sector.Forestry;

			const activityUpdateDto = new ActivityUpdateDto();
			activityUpdateDto.title = "test updated";
			activityUpdateDto.description = "test description updated";
			activityUpdateDto.parentType = EntityType.PROGRAMME;
			activityUpdateDto.parentId = "P001"
			activityUpdateDto.status = ActivityStatus.ONGOING;
			activityUpdateDto.measure = Measure.WITH_MEASURE;
			activityUpdateDto.nationalImplementingEntity = [NatImplementor.AGRI_DEPT, NatImplementor.CLIMATE_DEPT]
			activityUpdateDto.internationalImplementingEntity = [IntImplementor.AFC, IntImplementor.EBRD];
			activityUpdateDto.anchoredInNationalStrategy = false;
			activityUpdateDto.meansOfImplementation = ImpleMeans.FINANCE;
			activityUpdateDto.expectedGHGReduction = 22.25
			activityUpdateDto.achievedGHGReduction = 100.25
			activityUpdateDto.removedDocuments = ["www.test.com/crr_to_remove_01.pdf"]
			activityUpdateDto.newDocuments = [documentDto]
			activityUpdateDto.mitigationInfo = {
				mitigationCalcEntity: "ABB updated",
				mitigationMethodology: "CO2 updated",
				mitigationMethodologyDescription: "test updated",
				comments: "test mitigation comments updated",
				methodologyDocuments: [currentMitigationMethodologyDoc],
				resultDocuments: [currentMitigationResultDoc]
			}

			const activity = new ActivityEntity();
			activity.title = "test";
			activity.description = "test description";
			activity.parentType = EntityType.PROJECT;
			activity.parentId = "J001"
			activity.status = ActivityStatus.PLANNED;
			activity.measure = Measure.WITHOUT_MEASURES;
			activity.nationalImplementingEntity = [NatImplementor.CLIMATE_DEPT]
			activity.internationalImplementingEntity = [IntImplementor.IUCN];
			activity.anchoredInNationalStrategy = true;
			activity.meansOfImplementation = ImpleMeans.NONE;
			activity.expectedGHGReduction = 10.25
			activity.achievedGHGReduction = 10
			activity.documents = [currentDoc, currentDocToRemove];
			activity.mitigationInfo = {
				mitigationCalcEntity: "ABB",
				mitigationMethodology: "CO2",
				mitigationMethodologyDescription: "test",
				comments: "test mitigation comments",
				methodologyDocuments: [currentMitigationMethodologyDoc, currentMitigationMethodologyDocToRemove],
				resultDocuments: [currentMitigationResultDoc, currentMitigationResultDocToRemove]
			}
			activity.sector = Sector.Energy;
			activity.path = "_._.J001";

			const activityUpdated = {
				title: "test updated",
				description: "test description updated",
				parentType: EntityType.PROGRAMME,
				parentId: "P001",
				status: ActivityStatus.ONGOING,
				measure: Measure.WITH_MEASURE,
				nationalImplementingEntity: [NatImplementor.AGRI_DEPT, NatImplementor.CLIMATE_DEPT],
				internationalImplementingEntity: [IntImplementor.AFC, IntImplementor.EBRD],
				anchoredInNationalStrategy: false,
				meansOfImplementation: ImpleMeans.FINANCE,
				expectedGHGReduction: 22.25,
				achievedGHGReduction: 100.25,
				documents: [
					currentDoc,
					expect.objectContaining({
						createdTime: expect.any(Number), // Ignore the createdTime field
						title: "doc title",
						url: "http://test.com/documents/action_documents/test.csv",
					})
				],
				newDocuments: [
					{
						"data": "data:text/csv;base64,IlJlcXVlc3QgSWQiLCJQcm=",
						"title": "doc title",
					}
				],
				removedDocuments: ["www.test.com/crr_to_remove_01.pdf"],
				mitigationInfo: {
					mitigationCalcEntity: "ABB updated",
					mitigationMethodology: "CO2 updated",
					mitigationMethodologyDescription: "test updated",
					comments: "test mitigation comments updated",
				methodologyDocuments: [
					{
            createdTime: undefined,
            title: "crr mit 01",
            updatedTime: undefined,
            url: "www.test.com/crr_mit_01.pdf",
          }, 
				],
				resultDocuments: [
					{
            createdTime: undefined,
            title: "crr mit res 01",
            updatedTime: undefined,
            url: "www.test.com/crr_mit_res_01.pdf",
          }, 
				]
				},
				path: "A001.P001._",
				sector: Sector.Forestry
			};

			jest.spyOn(linkUnlinkServiceMock, "findActivityByIdWithSupports").mockResolvedValueOnce(activity);
			jest.spyOn(service, "findActivityById").mockResolvedValueOnce(activity);
			jest.spyOn(programmeServiceMock, "findProgrammeById").mockResolvedValueOnce(programme);
			jest.spyOn(projectServiceMock, "findProjectById").mockResolvedValueOnce(project);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);
			jest.spyOn(linkUnlinkServiceMock, "getParentIdFromPath").mockReturnValueOnce({parentId : "J001", rootEntityType: EntityType.PROJECT});
			jest.spyOn(linkUnlinkServiceMock, "getParentIdFromPath").mockReturnValueOnce({parentId : "P001", rootEntityType: EntityType.PROGRAMME});

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(activityUpdated),
				};
				const savedAction = await callback(emMock);
				expect(emMock.save).toHaveBeenNthCalledWith(1, activityUpdated);
				expect(emMock.save).toHaveBeenCalledTimes(2);
				return savedAction;
			});

			const result = await service.updateActivity(activityUpdateDto, user);

			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
			expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(1);
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProgrammeId).toHaveBeenCalledTimes(1);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProject).toHaveBeenCalledTimes(1);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenStatusByActionId).toHaveBeenCalledTimes(0);
		});


		it('should throw an error when activity is not found', async () => {
			const user = new User();
			user.id = 2;
			user.sector = [Sector.CrossCutting, Sector.Energy, Sector.Forestry]

			const activityUpdateDto = new ActivityUpdateDto();
			activityUpdateDto.activityId = "T0001"
			activityUpdateDto.title = "test updated";
			activityUpdateDto.description = "test description updated";
			activityUpdateDto.parentType = EntityType.PROGRAMME;
			activityUpdateDto.parentId = "P001"
			activityUpdateDto.status = ActivityStatus.ONGOING;
			activityUpdateDto.measure = Measure.WITH_MEASURE;
			activityUpdateDto.nationalImplementingEntity = [NatImplementor.AGRI_DEPT, NatImplementor.CLIMATE_DEPT]
			activityUpdateDto.internationalImplementingEntity = [IntImplementor.AFC, IntImplementor.EBRD];
			activityUpdateDto.anchoredInNationalStrategy = false;
			activityUpdateDto.meansOfImplementation = ImpleMeans.FINANCE;
			activityUpdateDto.expectedGHGReduction = 22.25
			activityUpdateDto.achievedGHGReduction = 100.25
			activityUpdateDto.mitigationInfo = {
				mitigationCalcEntity: "ABB updated",
				mitigationMethodology: "CO2 updated",
				mitigationMethodologyDescription: "test updated",
				comments: "test mitigation comments updated",
			}

			jest.spyOn(service, "findActivityById").mockResolvedValueOnce(null);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(new ActionEntity()),
				};
				const savedAction = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(0);
				return savedAction;
			});

			try {
				const result = await service.updateActivity(activityUpdateDto, user);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.BAD_REQUEST);
			}
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("activity.activityNotFound", ["T0001"]);
			
			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(0);
			expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
		});

		it('should throw an error when user dont have permission to the activity', async () => {
			const user = new User();
			user.id = 2;
			user.sector = [Sector.Agriculture]

			const activityUpdateDto = new ActivityUpdateDto();
			activityUpdateDto.activityId = "T0001"
			activityUpdateDto.title = "test updated";
			activityUpdateDto.description = "test description updated";
			activityUpdateDto.parentType = EntityType.PROGRAMME;
			activityUpdateDto.parentId = "P001"
			activityUpdateDto.status = ActivityStatus.ONGOING;
			activityUpdateDto.measure = Measure.WITH_MEASURE;
			activityUpdateDto.nationalImplementingEntity = [NatImplementor.AGRI_DEPT, NatImplementor.CLIMATE_DEPT]
			activityUpdateDto.internationalImplementingEntity = [IntImplementor.AFC, IntImplementor.EBRD];
			activityUpdateDto.anchoredInNationalStrategy = false;
			activityUpdateDto.meansOfImplementation = ImpleMeans.FINANCE;
			activityUpdateDto.expectedGHGReduction = 22.25
			activityUpdateDto.achievedGHGReduction = 100.25
			activityUpdateDto.mitigationInfo = {
				mitigationCalcEntity: "ABB updated",
				mitigationMethodology: "CO2 updated",
				mitigationMethodologyDescription: "test updated",
				comments: "test mitigation comments updated",
			}

			const activity = new ActivityEntity();
			activity.activityId = "T0001"
			activity.title = "test";
			activity.description = "test description";
			activity.parentType = EntityType.PROJECT;
			activity.parentId = "J001"
			activity.status = ActivityStatus.PLANNED;
			activity.measure = Measure.WITHOUT_MEASURES;
			activity.nationalImplementingEntity = [NatImplementor.CLIMATE_DEPT]
			activity.internationalImplementingEntity = [IntImplementor.IUCN];
			activity.anchoredInNationalStrategy = true;
			activity.meansOfImplementation = ImpleMeans.NONE;
			activity.expectedGHGReduction = 10.25
			activity.achievedGHGReduction = 10
			activity.mitigationInfo = {
				mitigationCalcEntity: "ABB",
				mitigationMethodology: "CO2",
				mitigationMethodologyDescription: "test",
				comments: "test mitigation comments",
			}
			activity.sector = Sector.Energy;
			activity.path = "_._.J001";

			jest.spyOn(linkUnlinkServiceMock, "findActivityByIdWithSupports").mockResolvedValueOnce(activity);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(false);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(new ActionEntity()),
				};
				const savedAction = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(0);
				return savedAction;
			});

			try {
				await service.updateActivity(activityUpdateDto, user);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.FORBIDDEN);
			}
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("activity.cannotUpdateNotRelatedActivity", ["T0001"]);
			
			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(0);
			expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
		});

		it('should throw an error when parent is not found', async () => {
			const user = new User();
			user.id = 2;
			user.sector = [Sector.CrossCutting, Sector.Energy, Sector.Forestry]

			const project = new ProjectEntity();
			project.projectId = "J001";
			project.path = "_._";
			project.sector = Sector.Forestry;

			const activityUpdateDto = new ActivityUpdateDto();
			activityUpdateDto.activityId = "T0001"
			activityUpdateDto.title = "test updated";
			activityUpdateDto.description = "test description updated";
			activityUpdateDto.parentType = EntityType.PROGRAMME;
			activityUpdateDto.parentId = "P001"
			activityUpdateDto.status = ActivityStatus.ONGOING;
			activityUpdateDto.measure = Measure.WITH_MEASURE;
			activityUpdateDto.nationalImplementingEntity = [NatImplementor.AGRI_DEPT, NatImplementor.CLIMATE_DEPT]
			activityUpdateDto.internationalImplementingEntity = [IntImplementor.AFC, IntImplementor.EBRD];
			activityUpdateDto.anchoredInNationalStrategy = false;
			activityUpdateDto.meansOfImplementation = ImpleMeans.FINANCE;
			activityUpdateDto.expectedGHGReduction = 22.25
			activityUpdateDto.achievedGHGReduction = 100.25
			activityUpdateDto.mitigationInfo = {
				mitigationCalcEntity: "ABB updated",
				mitigationMethodology: "CO2 updated",
				mitigationMethodologyDescription: "test updated",
				comments: "test mitigation comments updated",
			}

			const activity = new ActivityEntity();
			activity.title = "test";
			activity.description = "test description";
			activity.parentType = EntityType.PROJECT;
			activity.parentId = "J001"
			activity.status = ActivityStatus.PLANNED;
			activity.measure = Measure.WITHOUT_MEASURES;
			activity.nationalImplementingEntity = [NatImplementor.CLIMATE_DEPT]
			activity.internationalImplementingEntity = [IntImplementor.IUCN];
			activity.anchoredInNationalStrategy = true;
			activity.meansOfImplementation = ImpleMeans.NONE;
			activity.expectedGHGReduction = 10.25
			activity.achievedGHGReduction = 10
			activity.mitigationInfo = {
				mitigationCalcEntity: "ABB",
				mitigationMethodology: "CO2",
				mitigationMethodologyDescription: "test",
				comments: "test mitigation comments",
			}
			activity.sector = Sector.Energy;
			activity.path = "_._.J001";

			jest.spyOn(programmeServiceMock, "findProgrammeById").mockResolvedValueOnce(null);
			jest.spyOn(projectServiceMock, "findProjectById").mockResolvedValueOnce(project);
			jest.spyOn(linkUnlinkServiceMock, "findActivityByIdWithSupports").mockResolvedValueOnce(activity);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(new ActionEntity()),
				};
				const savedAction = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(0);
				return savedAction;
			});

			try {
				const result = await service.updateActivity(activityUpdateDto, user);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.BAD_REQUEST);
			}
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("activity.programmeNotFound", ["P001"]);
			
			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(0);
			expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
		});

		it('should throw an error when user do not have permission to parent', async () => {
			const user = new User();
			user.id = 2;
			user.sector = [Sector.CrossCutting, Sector.Energy, Sector.Forestry]

			const project = new ProjectEntity();
			project.projectId = "J002";
			project.sector = Sector.LandUse;

			const activityUpdateDto = new ActivityUpdateDto();
			activityUpdateDto.activityId = "T0001"
			activityUpdateDto.title = "test updated";
			activityUpdateDto.description = "test description updated";
			activityUpdateDto.parentType = EntityType.PROJECT;
			activityUpdateDto.parentId = "J002"
			activityUpdateDto.status = ActivityStatus.ONGOING;
			activityUpdateDto.measure = Measure.WITH_MEASURE;
			activityUpdateDto.nationalImplementingEntity = [NatImplementor.AGRI_DEPT, NatImplementor.CLIMATE_DEPT]
			activityUpdateDto.internationalImplementingEntity = [IntImplementor.AFC, IntImplementor.EBRD];
			activityUpdateDto.anchoredInNationalStrategy = false;
			activityUpdateDto.meansOfImplementation = ImpleMeans.FINANCE;
			activityUpdateDto.expectedGHGReduction = 22.25
			activityUpdateDto.achievedGHGReduction = 100.25
			activityUpdateDto.mitigationInfo = {
				mitigationCalcEntity: "ABB updated",
				mitigationMethodology: "CO2 updated",
				mitigationMethodologyDescription: "test updated",
				comments: "test mitigation comments updated",
			}

			const activity = new ActivityEntity();
			activity.title = "test";
			activity.description = "test description";
			activity.parentType = EntityType.PROJECT;
			activity.parentId = "J001"
			activity.status = ActivityStatus.PLANNED;
			activity.measure = Measure.WITHOUT_MEASURES;
			activity.nationalImplementingEntity = [NatImplementor.CLIMATE_DEPT]
			activity.internationalImplementingEntity = [IntImplementor.IUCN];
			activity.anchoredInNationalStrategy = true;
			activity.meansOfImplementation = ImpleMeans.NONE;
			activity.expectedGHGReduction = 10.25
			activity.achievedGHGReduction = 10
			activity.mitigationInfo = {
				mitigationCalcEntity: "ABB",
				mitigationMethodology: "CO2",
				mitigationMethodologyDescription: "test",
				comments: "test mitigation comments",
			}
			activity.sector = Sector.Energy;
			activity.path = "_._.J001";

			jest.spyOn(service, "findActivityById").mockResolvedValueOnce(activity);
			jest.spyOn(projectServiceMock, "findProjectById").mockResolvedValueOnce(project);
			jest.spyOn(linkUnlinkServiceMock, "findActivityByIdWithSupports").mockResolvedValueOnce(activity);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValueOnce(true);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValueOnce(false);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(new ActionEntity()),
				};
				const savedAction = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(0);
				return savedAction;
			});

			try {
				const result = await service.updateActivity(activityUpdateDto, user);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.FORBIDDEN);
			}
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("activity.cannotLinkToUnrelatedProject", ["J002"]);
			
			expect(entityManagerMock.transaction).toHaveBeenCalledTimes(0);
			expect(fileUploadServiceMock.uploadDocument).toHaveBeenCalledTimes(0);
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
		});

	});

	describe('linkActivity', () => {
		it('should link activities to action', async () => {
			const linkActivitiesDto: LinkActivitiesDto = { parentId: 'A1', parentType: EntityType.ACTION, activityIds: ['1', '2', '3'] };

			const user = new User();
			user.sector = [Sector.Industry, Sector.Agriculture]

			const action = new ActionEntity();
			action.actionId = "A1";

			const activity1 = new ActivityEntity();
			activity1.activityId = '1';

			const activity2 = new ActivityEntity();
			activity2.activityId = '2';

			const activity3 = new ActivityEntity();
			activity3.activityId = '3';

			jest.spyOn(service, 'findAllActivitiesByIds').mockResolvedValue([activity1, activity2, activity3]);
			jest.spyOn(service, 'isActionValid').mockResolvedValue(action);

			const result = await service.linkActivitiesToParent(linkActivitiesDto, user);

			// Assert the returned result
			expect(result).toEqual(expect.any(DataResponseMessageDto));
			expect(result.statusCode).toEqual(HttpStatus.OK);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("activity.activitiesLinked", []);
			expect(service.isActionValid).toBeCalledTimes(1);
			expect(linkUnlinkServiceMock.linkActivitiesToParent).toBeCalledTimes(1);
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);


		});

		it('should link activities to programme', async () => {
			const linkActivitiesDto: LinkActivitiesDto = { parentId: 'P1', parentType: EntityType.PROGRAMME, activityIds: ['1', '2', '3'] };

			const user = new User();
			user.sector = [Sector.Industry, Sector.Agriculture]

			const programme = new ProgrammeEntity();
			programme.programmeId = "P1";

			const activity1 = new ActivityEntity();
			activity1.activityId = '1';

			const activity2 = new ActivityEntity();
			activity2.activityId = '2';

			const activity3 = new ActivityEntity();
			activity3.activityId = '3';

			jest.spyOn(service, 'findAllActivitiesByIds').mockResolvedValue([activity1, activity2, activity3]);
			jest.spyOn(service, 'isProgrammeValid').mockResolvedValue(programme);

			const result = await service.linkActivitiesToParent(linkActivitiesDto, user);

			// Assert the returned result
			expect(result).toEqual(expect.any(DataResponseMessageDto));
			expect(result.statusCode).toEqual(HttpStatus.OK);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("activity.activitiesLinked", []);
			expect(service.isProgrammeValid).toBeCalledTimes(1);
			expect(linkUnlinkServiceMock.linkActivitiesToParent).toBeCalledTimes(1);
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);


		});

		it('should link activities to project', async () => {
			const linkActivitiesDto: LinkActivitiesDto = { parentId: 'P1', parentType: EntityType.PROJECT, activityIds: ['1', '2', '3'] };

			const user = new User();
			user.sector = [Sector.Industry, Sector.Agriculture]

			const project = new ProjectEntity();
			project.projectId = "P1";

			const activity1 = new ActivityEntity();
			activity1.activityId = '1';

			const activity2 = new ActivityEntity();
			activity2.activityId = '2';

			const activity3 = new ActivityEntity();
			activity3.activityId = '3';

			jest.spyOn(service, 'findAllActivitiesByIds').mockResolvedValue([activity1, activity2, activity3]);
			jest.spyOn(service, 'isProjectValid').mockResolvedValue(project);

			const result = await service.linkActivitiesToParent(linkActivitiesDto, user);

			// Assert the returned result
			expect(result).toEqual(expect.any(DataResponseMessageDto));
			expect(result.statusCode).toEqual(HttpStatus.OK);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("activity.activitiesLinked", []);
			expect(service.isProjectValid).toBeCalledTimes(1);
			expect(linkUnlinkServiceMock.linkActivitiesToParent).toBeCalledTimes(1);
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);


		});
	});

	describe('unlinkActivity', () => {
		it('should throw an error if try to unlink, not linked activities', async () => {
			const unlinkActivitiesDto: UnlinkActivitiesDto = { activityIds: ['1', '2', '3'] };

			const user = new User();
			user.sector = [Sector.Industry]

			const programme = new ProgrammeEntity();
			programme.programmeId = "P1";
			programme.sector = Sector.Agriculture;

			const activity1 = new ActivityEntity();
			activity1.activityId = '1';
			activity1.sector = Sector.Industry;

			const activity2 = new ActivityEntity();
			activity2.activityId = '2';
			activity2.sector = Sector.Agriculture;

			const activity3 = new ActivityEntity();
			activity3.activityId = '3';
			activity3.sector = Sector.Industry;

			jest.spyOn(service, 'findAllActivitiesByIds').mockResolvedValue([activity1, activity2, activity3]);


			try {
				await service.unlinkActivitiesFromParents(unlinkActivitiesDto, user);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.BAD_REQUEST);
			}
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("activity.activityIsNotLinked", ["1"]);
			expect(linkUnlinkServiceMock.unlinkActivitiesFromParent).toBeCalledTimes(0);
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
		});

		it('should throw an error if unrelated sector user try to unlink activities from programme', async () => {
			const unlinkActivitiesDto: UnlinkActivitiesDto = { activityIds: ['1', '2', '3'] };

			const user = new User();
			user.sector = [Sector.Industry]

			const programme = new ProgrammeEntity();
			programme.programmeId = "P1";
			programme.sector = Sector.Agriculture;

			const activity1 = new ActivityEntity();
			activity1.activityId = '1';
			activity1.sector = Sector.Agriculture;
			activity1.parentId = "P1";
			activity1.parentType = EntityType.PROGRAMME;

			const activity2 = new ActivityEntity();
			activity2.activityId = '2';
			activity2.sector = Sector.Agriculture;
			activity2.parentId = "P1";
			activity2.parentType = EntityType.PROGRAMME;

			const activity3 = new ActivityEntity();
			activity3.activityId = '3';
			activity3.sector = Sector.Industry;
			activity3.parentId = "P1";
			activity3.parentType = EntityType.PROGRAMME;

			jest.spyOn(service, 'findAllActivitiesByIds').mockResolvedValue([activity1, activity2, activity3]);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValueOnce(false);


			try {
				await service.unlinkActivitiesFromParents(unlinkActivitiesDto, user);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.BAD_REQUEST);
			}
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("activity.cannotUnlinkNotRelatedActivity", ["1"]);
			expect(linkUnlinkServiceMock.unlinkActivitiesFromParent).toBeCalledTimes(0);
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
		});

		it('should throw an error if activities not found', async () => {
			const unlinkActivitiesDto: UnlinkActivitiesDto = { activityIds: ['1', '2', '3'] };

			const user = new User();
			user.sector = [Sector.Industry]

			jest.spyOn(service, 'findAllActivitiesByIds').mockResolvedValue([]);

			try {
				await service.unlinkActivitiesFromParents(unlinkActivitiesDto, user);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.BAD_REQUEST);
			}
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("activity.activitiesNotFound", []);
			expect(linkUnlinkServiceMock.unlinkActivitiesFromParent).toBeCalledTimes(0);
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(0);
		});

		it('should unlink activities from programme', async () => {
			const unlinkActivitiesDto: UnlinkActivitiesDto = { activityIds: ['1', '2', '3'] };

			const user = new User();
			user.sector = [Sector.Industry, Sector.Agriculture]

			const programme = new ProgrammeEntity();
			programme.programmeId = "P1";
			programme.sector = Sector.Agriculture;

			const activity1 = new ActivityEntity();
			activity1.activityId = '1';
			activity1.sector = Sector.Industry;
			activity1.parentId = "P1";
			activity1.parentType = EntityType.PROGRAMME;

			const activity2 = new ActivityEntity();
			activity2.activityId = '2';
			activity2.sector = Sector.Agriculture;
			activity2.parentId = "P1";
			activity2.parentType = EntityType.PROGRAMME;

			const activity3 = new ActivityEntity();
			activity3.activityId = '3';
			activity3.sector = Sector.Industry;
			activity3.parentId = "P1";
			activity3.parentType = EntityType.PROGRAMME;

			jest.spyOn(service, 'findAllActivitiesByIds').mockResolvedValue([activity1, activity2, activity3]);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			const result = await service.unlinkActivitiesFromParents(unlinkActivitiesDto, user);
			

			// Assert the returned result
			expect(result).toEqual(expect.any(DataResponseMessageDto));
			expect(result.statusCode).toEqual(HttpStatus.OK);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("activity.activitiesUnlinked", []);
			expect(linkUnlinkServiceMock.unlinkActivitiesFromParent).toBeCalledTimes(1);
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
		});

	})

	describe('validateActivity', () => {
		it('should throw ForbiddenException if user does not have validate permission', async () => {
			const user = new User();
			user.id = 2;

			const validateDto = new ValidateDto();
			validateDto.entityId = 'T001';
			validateDto.validateStatus = true;
	
			jest.spyOn(helperServiceMock, 'doesUserHaveValidatePermission').mockImplementation(() => {
				throw new HttpException("HTTP Forbidden", 403);
			});

			try {
				await service.validateActivity(validateDto, user);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.FORBIDDEN);
			}
		});
		it('should throw an error when parent is not validated', async () => {
			const user = new User();
			user.id = 2;
	
			const action = new ActionEntity();
			action.actionId = 'A001';
			action.sector = Sector.Forestry;
			action.validated = false;

			const validateDto = new ValidateDto();
			validateDto.entityId = 'T001';
			validateDto.validateStatus = true;
	
			const activity = new ActivityEntity();
			activity.activityId = 'T001';
			activity.parentId = 'A001';
			activity.parentType = EntityType.ACTION;
			activity.sector = Sector.Forestry;
			activity.validated = false;
	
			jest.spyOn(linkUnlinkServiceMock, 'findActivityByIdWithSupports').mockResolvedValueOnce(activity);
			jest.spyOn(service, 'getParentEntity').mockResolvedValue(action);
			jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);
	
			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(activity),
				};
				const savedAction = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(0);
				return savedAction;
			});

			try {
				await service.validateActivity(validateDto, user);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.FORBIDDEN);
			}

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('activity.parentNotValidated', []);
	
		});

		it('should validate the activity', async () => {
			const user = new User();
			user.id = 2;
	
			const action = new ActionEntity();
			action.actionId = 'A001';
			action.sector = Sector.Forestry;
			action.validated = true;

			const validateDto = new ValidateDto();
			validateDto.entityId = 'T001';
			validateDto.validateStatus = true;
	
			const activity = new ActivityEntity();
			activity.activityId = 'T001';
			activity.parentId = 'A001';
			activity.parentType = EntityType.ACTION;
			activity.sector = Sector.Forestry;
			activity.validated = false;
	
			jest.spyOn(linkUnlinkServiceMock, 'findActivityByIdWithSupports').mockResolvedValueOnce(activity);
			jest.spyOn(service, 'getParentEntity').mockResolvedValue(action);
			jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);
	
			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(activity),
				};
				const savedActivity = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(2);
				return savedActivity;
			});
	
			await service.validateActivity(validateDto, user);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenStatusByActionId).toHaveBeenCalledTimes(0);
	
		});

		it('should unvalidate the activity', async () => {
			const user = new User();
			user.id = 2;
	
			const action = new ActionEntity();
			action.actionId = 'A001';
			action.sector = Sector.Forestry;
			action.validated = true;

			const validateDto = new ValidateDto();
			validateDto.entityId = 'T001';
			validateDto.validateStatus = false;
	
			const activity = new ActivityEntity();
			activity.activityId = 'T001';
			activity.parentId = 'A001';
			activity.parentType = EntityType.ACTION;
			activity.sector = Sector.Forestry;
			activity.validated = true;
	
			jest.spyOn(linkUnlinkServiceMock, 'findActivityByIdWithSupports').mockResolvedValueOnce(activity);
			jest.spyOn(service, 'getParentEntity').mockResolvedValue(action);
			jest.spyOn(helperServiceMock, 'doesUserHaveSectorPermission').mockReturnValueOnce(true);
	
			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(activity),
				};
				const savedActivity = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(2);
				return savedActivity;
			});
	
			await service.validateActivity(validateDto, user);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenStatusByActionId).toHaveBeenCalledTimes(0);
	
		});
	})

	describe('deleteActivity', () => {
		it('should throw ForbiddenException if user is not Admin or Root', async () => {
			const user = { role: Role.GovernmentUser } as User;
			const deleteDto = { entityId: '123' };

			await expect(service.deleteActivity(deleteDto, user))
				.rejects.toThrow(HttpException);

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('user.userUnAUth', []);
		});

		it('should throw BadRequest if activity not found', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: '123' };
			jest.spyOn(service, 'findActivityById').mockResolvedValue(null);

			await expect(service.deleteActivity(deleteDto, user))
				.rejects.toThrow(HttpException);

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('activity.activityNotFound', ["123"]);
		});

		it('should throw Forbidden if user does not have sector permission', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: 'T001' };

			const activity = new ActivityEntity();
			activity.activityId = 'T001';
			activity.sector = Sector.Forestry;
			activity.validated = true;

			jest.spyOn(service, 'findActivityById').mockResolvedValue(activity);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(false);

			await expect(service.deleteActivity(deleteDto, user))
				.rejects.toThrow(HttpException);

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('activity.permissionDeniedForSector', ["T001"]);
		});

		it('should successfully delete activity and associated entities, parent action, Root node action', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: '123' };

			const programme = new ProgrammeEntity;
			programme.programmeId = 'P1'

			const action = new ActionEntity();
			action.actionId = 'A001';
			action.sector = Sector.Forestry;
			action.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'A001';
			activity.parentType = EntityType.ACTION;
			activity.activityId = "T1"

			const support = new SupportEntity;
			support.supportId = "S001";
			support.activity = activity;

			jest.spyOn(service, 'findActivityById').mockResolvedValue(activity);
			jest.spyOn(service, 'getParentEntity').mockResolvedValue(action);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					delete: jest.fn().mockResolvedValueOnce({ affected: 1 }),
					save: jest.fn().mockResolvedValueOnce(null),
				};
				const savedAction = await callback(emMock);
				expect(emMock.delete).toHaveBeenCalledTimes(1);
				expect(emMock.save).toHaveBeenCalledTimes(2);
				return savedAction;
			});

			const result = await service.deleteActivity(deleteDto, user);

			expect(linkUnlinkServiceMock.updateAllValidatedChildrenStatusByActionId).toBeCalledTimes(1);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProgrammeId).toBeCalledTimes(0);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProject).toBeCalledTimes(0);

		});

		it('should successfully delete activity and associated entities, parent programme, Root node Action', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: '123' };

			const action = new ActionEntity();
			action.actionId = 'A001';
			action.sector = Sector.Forestry;
			action.validated = true;

			const programme = new ProgrammeEntity;
			programme.programmeId = 'P1'
			programme.validated = true;
			programme.action = action

			const activity = new ActivityEntity;
			activity.parentId = 'P1';
			activity.parentType = EntityType.PROGRAMME;
			activity.activityId = "T1"

			const support = new SupportEntity;
			support.supportId = "S001";
			support.activity = activity;

			jest.spyOn(service, 'findActivityById').mockResolvedValue(activity);
			jest.spyOn(service, 'getParentEntity').mockResolvedValue(programme);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					delete: jest.fn().mockResolvedValueOnce({ affected: 1 }),
					save: jest.fn().mockResolvedValueOnce(null),
				};
				const savedAction = await callback(emMock);
				expect(emMock.delete).toHaveBeenCalledTimes(1);
				expect(emMock.save).toHaveBeenCalledTimes(3);
				return savedAction;
			});

			const result = await service.deleteActivity(deleteDto, user);

			expect(linkUnlinkServiceMock.updateAllValidatedChildrenStatusByActionId).toBeCalledTimes(1);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProgrammeId).toBeCalledTimes(0);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProject).toBeCalledTimes(0);

		});

		it('should successfully delete activity and associated entities, parent programme, Root node programme', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: '123' };

			const action = new ActionEntity();
			action.actionId = 'A001';
			action.sector = Sector.Forestry;
			action.validated = false;

			const programme = new ProgrammeEntity;
			programme.programmeId = 'P1'
			programme.validated = true;
			programme.action = action

			const activity = new ActivityEntity;
			activity.parentId = 'P1';
			activity.parentType = EntityType.PROGRAMME;
			activity.activityId = "T1"

			const support = new SupportEntity;
			support.supportId = "S001";
			support.activity = activity;

			jest.spyOn(service, 'findActivityById').mockResolvedValue(activity);
			jest.spyOn(service, 'getParentEntity').mockResolvedValue(programme);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					delete: jest.fn().mockResolvedValueOnce({ affected: 1 }),
					save: jest.fn().mockResolvedValueOnce(null),
				};
				const savedAction = await callback(emMock);
				expect(emMock.delete).toHaveBeenCalledTimes(1);
				expect(emMock.save).toHaveBeenCalledTimes(2);
				return savedAction;
			});

			const result = await service.deleteActivity(deleteDto, user);

			expect(linkUnlinkServiceMock.updateAllValidatedChildrenStatusByActionId).toBeCalledTimes(0);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProgrammeId).toBeCalledTimes(1);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProject).toBeCalledTimes(0);

		});

		it('should successfully delete activity and associated entities, parent project, Root node project', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: '123' };

			const project = new ProjectEntity;
			project.projectId = 'J1'
			project.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J1';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"

			const support = new SupportEntity;
			support.supportId = "S001";
			support.activity = activity;

			jest.spyOn(service, 'findActivityById').mockResolvedValue(activity);
			jest.spyOn(service, 'getParentEntity').mockResolvedValue(project);
			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					delete: jest.fn().mockResolvedValueOnce({ affected: 1 }),
					save: jest.fn().mockResolvedValueOnce(null),
				};
				const savedAction = await callback(emMock);
				expect(emMock.delete).toHaveBeenCalledTimes(1);
				expect(emMock.save).toHaveBeenCalledTimes(2);
				return savedAction;
			});

			const result = await service.deleteActivity(deleteDto, user);

			expect(linkUnlinkServiceMock.updateAllValidatedChildrenStatusByActionId).toBeCalledTimes(0);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProgrammeId).toBeCalledTimes(0);
			expect(linkUnlinkServiceMock.updateAllValidatedChildrenAndParentStatusByProject).toBeCalledTimes(1);

		});

		it('should handle transaction errors', async () => {
			const user = { role: Role.Admin } as User;
			const deleteDto = { entityId: '123' };

			const activity = new ActivityEntity;
			activity.parentId = 'J1';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"

			jest.spyOn(service, 'findActivityById').mockResolvedValue(activity);


			jest.spyOn(helperServiceMock, "doesUserHaveSectorPermission").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				throw new Error('This is a test transaction error. This is expected');
			});

			await expect(service.deleteActivity(deleteDto, user))
				.rejects.toThrow(HttpException);

		});
	});
});