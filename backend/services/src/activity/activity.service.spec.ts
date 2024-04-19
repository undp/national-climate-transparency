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
import { ActivityStatus, Measure } from "../enums/activity.enum";
import { ProgrammeService } from "../programme/programme.service";
import { ProjectService } from "../project/project.service";
import { ActionService } from "../action/action.service";
import { EntityType } from "../enums/shared.enum";
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
		};
		fileUploadServiceMock = {
			uploadDocument: jest.fn().mockResolvedValue('http://test.com/documents/action_documents/test.csv'),
		};
		linkUnlinkServiceMock = {
			linkActivitiesToParent: jest.fn(),
			unlinkActivitiesFromParent: jest.fn(),
		}

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
			programme.affectedSectors = [Sector.Agriculture];

			const activity1 = new ActivityEntity();
			activity1.activityId = '1';
			activity1.sectors = [Sector.Industry];

			const activity2 = new ActivityEntity();
			activity2.activityId = '2';
			activity2.sectors = [Sector.Agriculture];

			const activity3 = new ActivityEntity();
			activity3.activityId = '3';
			activity3.sectors = [Sector.Industry];

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
			programme.affectedSectors = [Sector.Agriculture];

			const activity1 = new ActivityEntity();
			activity1.activityId = '1';
			activity1.sectors = [Sector.Industry];
			activity1.parentId = "P1";
			activity1.parentType = EntityType.PROGRAMME;

			const activity2 = new ActivityEntity();
			activity2.activityId = '2';
			activity2.sectors = [Sector.Agriculture];
			activity2.parentId = "P1";
			activity2.parentType = EntityType.PROGRAMME;

			const activity3 = new ActivityEntity();
			activity3.activityId = '3';
			activity3.sectors = [Sector.Industry];
			activity3.parentId = "P1";
			activity3.parentType = EntityType.PROGRAMME;

			jest.spyOn(service, 'findAllActivitiesByIds').mockResolvedValue([activity1, activity2, activity3]);

			try {
				await service.unlinkActivitiesFromParents(unlinkActivitiesDto, user);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.BAD_REQUEST);
			}
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("activity.cannotUnlinkNotRelatedActivity", ["2"]);
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
			programme.affectedSectors = [Sector.Agriculture];

			const activity1 = new ActivityEntity();
			activity1.activityId = '1';
			activity1.sectors = [Sector.Industry];
			activity1.parentId = "P1";
			activity1.parentType = EntityType.PROGRAMME;

			const activity2 = new ActivityEntity();
			activity2.activityId = '2';
			activity2.sectors = [Sector.Agriculture];
			activity2.parentId = "P1";
			activity2.parentType = EntityType.PROGRAMME;

			const activity3 = new ActivityEntity();
			activity3.activityId = '3';
			activity3.sectors = [Sector.Industry];
			activity3.parentId = "P1";
			activity3.parentType = EntityType.PROGRAMME;

			jest.spyOn(service, 'findAllActivitiesByIds').mockResolvedValue([activity1, activity2, activity3]);

			const result = await service.unlinkActivitiesFromParents(unlinkActivitiesDto, user);

			// Assert the returned result
			expect(result).toEqual(expect.any(DataResponseMessageDto));
			expect(result.statusCode).toEqual(HttpStatus.OK);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("activity.activitiesUnlinked", []);
			expect(linkUnlinkServiceMock.unlinkActivitiesFromParent).toBeCalledTimes(1);
			expect(helperServiceMock.refreshMaterializedViews).toBeCalledTimes(1);
		});

	})
});