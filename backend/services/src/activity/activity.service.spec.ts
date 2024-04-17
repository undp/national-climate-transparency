import { HttpException, HttpStatus } from "@nestjs/common";
import { ActivityDto } from "../dtos/activity.dto";
import { User } from "../entities/user.entity";
import { CounterService } from "../util/counter.service";
import { FileUploadService } from "../util/fileUpload.service";
import { HelperService } from "../util/helpers.service";
import { EntityManager, Repository } from "typeorm";
import { ActivityService } from "./activity.service";
import { ActionEntity } from "../entities/action.entity";
import { ProgrammeEntity } from "../entities/programme.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { ActivityStatus, Measure, SupportType } from "../enums/activity.enum";
import { DataResponseMessageDto } from "../dtos/data.response.message";
import { ProgrammeService } from "../programme/programme.service";
import { ProjectService } from "../project/project.service";
import { ActionService } from "../action/action.service";
import { EntityType } from "../enums/shared.enum";
import { DocumentDto } from "../dtos/document.dto";

describe('ActivityService', () => {
	let service: ActivityService;
	let entityManagerMock: Partial<EntityManager>;
	let counterServiceMock: Partial<CounterService>;
	let helperServiceMock: Partial<HelperService>;
	let fileUploadServiceMock: Partial<FileUploadService>;
	let programmeServiceMock: Partial<ProgrammeService>;
	let projectServiceMock: Partial<ProjectService>;
	let actionServiceMock: Partial<ActionService>;

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
		helperServiceMock = {
			formatReqMessagesString: jest.fn(),
			parseMongoQueryToSQLWithTable: jest.fn(),
			generateWhereSQL: jest.fn(),
			refreshMaterializedViews: jest.fn(),
		};
		fileUploadServiceMock = {
			uploadDocument: jest.fn().mockResolvedValue('http://test.com/documents/action_documents/test.csv'),
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
			activityDto.supportType = SupportType.MITIGATION;
			activityDto.status = ActivityStatus.PLANNED;
			activityDto.measure = Measure.WITHOUT_MEASURES;
	
			jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
			// jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce("2");
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
			activityDto.supportType = SupportType.MITIGATION;
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
			activityDto.supportType = SupportType.MITIGATION;
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
			activityDto.supportType = SupportType.MITIGATION;
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
			activityDto.supportType = SupportType.MITIGATION;
			activityDto.status = ActivityStatus.PLANNED;
			activityDto.measure = Measure.WITHOUT_MEASURES;
			activityDto.documents = [documentDto];
			activityDto.mitigationInfo = {
				mitigationCalcEntity: "ABB",
				mitigationMethodology: "CO2",
				mitigationMethodologyDescription: "test"
			}
	
			jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
			// jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce("2");
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
});