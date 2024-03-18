import { TestingModule, Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ActionEntity } from "../entities/action.entity";
import { CounterService } from "../util/counter.service";
import { HelperService } from "../util/helpers.service";
import { EntityManager, Repository } from "typeorm";
import { ActionService } from "./action.service";
import { ActionDto } from "../dtos/action.dto";
import { ActionStatus, InstrumentType, NatAnchor } from "../enums/action.enum";
import { User } from "../entities/user.entity";
import { FileHandlerInterface } from "../file-handler/filehandler.interface";
import { DataResponseMessageDto } from "../dtos/data.response.message";
import { KpiDto } from "../dtos/kpi.dto";
import { HttpException, HttpStatus } from "@nestjs/common";
import { DocumentDto } from "../dtos/document.dto";

describe('ActionService', () => {
    let service: ActionService;
    let entityManagerMock: Partial<EntityManager>;
    let actionRepositoryMock: Partial<Repository<ActionEntity>>;
    let counterServiceMock: Partial<CounterService>;
    let helperServiceMock: Partial<HelperService>;
    let fileHandlerMock: Partial<FileHandlerInterface>;

    const documentData = "data:text/csv;base64,IlJlcXVlc3QgSWQiLCJQcm="

    beforeEach(async () => {
        entityManagerMock = {
            transaction: jest.fn(),
            save: jest.fn(),
        };

        actionRepositoryMock = {
            save: jest.fn(),
        };
        counterServiceMock = {
            incrementCount: jest.fn().mockResolvedValue(1),
        };
        helperServiceMock = {
            formatReqMessagesString: jest.fn(),
        };
        fileHandlerMock = {
            uploadFile: jest.fn().mockResolvedValue('http://test.com/documents/action_documents/test.csv'),
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
                    provide: FileHandlerInterface,
                    useValue: fileHandlerMock,
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
        actionDto.instrumentType = InstrumentType.POLICY;
        actionDto.status = ActionStatus.PLANNED;
        actionDto.startYear = "2024";
        actionDto.natAnchor = NatAnchor.NDC;

        const actionEntity = new ActionEntity();
        actionEntity.title = "test";
        actionEntity.description = "test description";
        actionEntity.objective = "test objective";
        actionEntity.instrumentType = InstrumentType.POLICY;
        actionEntity.status = ActionStatus.PLANNED;
        actionEntity.startYear = "2024";
        actionEntity.natAnchor = NatAnchor.NDC;
        actionEntity.actionId = "A001";

        const expectedResult = {
            "title": "test",
            "description": "test description",
            "objective": "test objective",
            "instrumentType": "Policy",
            "status": "Planned",
            "startYear": "2024",
            "natAnchor": "NDC",
            "actionId": "A001"
        };

        const expectedResponse = new DataResponseMessageDto(201, "action.createActionSuccess", expectedResult)

        jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce('001');
        jest.spyOn(counterServiceMock, 'incrementCount').mockResolvedValueOnce("2");
        jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockResolvedValueOnce("action.createActionSuccess");

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

        expect(fileHandlerMock.uploadFile).toHaveBeenCalledTimes(0);
    });

    it('should create an action with documents and kpis', async () => {
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

        const actionDto = new ActionDto();
        actionDto.title = "test";
        actionDto.description = "test description";
        actionDto.objective = "test objective";
        actionDto.instrumentType = InstrumentType.POLICY;
        actionDto.status = ActionStatus.PLANNED;
        actionDto.startYear = "2024";
        actionDto.natAnchor = NatAnchor.NDC;
        actionDto.kpis = [kpiDto1, kpiDto2];
        actionDto.documents = [documentDto];

        const expectedResult = {
            "title": "test",
            "description": "test description",
            "objective": "test objective",
            "instrumentType": "Policy",
            "status": "Planned",
            "startYear": "2024",
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

        entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
            const emMock = {
                save: jest.fn().mockResolvedValueOnce(expectedResult),
            };
            const savedAction = await callback(emMock);
            expect(emMock.save).toHaveBeenCalledTimes(5);
            return savedAction;
        });

        const result = await service.createAction(actionDto, user);

        expect(result.data).toEqual(expectedResponse.data);
        expect(result.statusCode).toEqual(expectedResponse.statusCode);

        expect(entityManagerMock.transaction).toHaveBeenCalledTimes(1);
        expect(fileHandlerMock.uploadFile).toHaveBeenCalledTimes(1);

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
        actionDto.instrumentType = InstrumentType.POLICY;
        actionDto.status = ActionStatus.PLANNED;
        actionDto.startYear = "2024";
        actionDto.natAnchor = NatAnchor.NDC;
        actionDto.kpis = [kpiDto1]

        const expectedResult = {
            "title": "test",
            "description": "test description",
            "objective": "test objective",
            "instrumentType": "Policy",
            "status": "Planned",
            "startYear": "2024",
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
            expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        }
    });

    it('should upload document successfully', async () => {
        const data = 'base64_encoded_data';
        const fileName = 'test';
        const fileType = 'pdf';
        const expectedUrl = 'http://example.com/document.pdf';

        jest.spyOn(service, 'getFileExtension').mockReturnValueOnce(fileType);

        fileHandlerMock.uploadFile = jest.fn().mockImplementation(async (path: string, content: string) => {
            const expectedUrl = "http://example.com/document.pdf"; 
            return expectedUrl;
        });

        const response = await service.uploadDocument(data, fileName);

        expect(fileHandlerMock.uploadFile).toBeCalledTimes(1);
        expect(response).toBe(expectedUrl);
    });

    it('should throw unknown file type error', async () => {
        const data = 'base64_encoded_data';
        const fileName = 'test';
        const fileType = 'pdf';
        const expectedUrl = 'http://example.com/document.pdf';

        jest.spyOn(service, 'getFileExtension').mockReturnValueOnce(null);

        fileHandlerMock.uploadFile = jest.fn().mockImplementation(async (path: string, content: string) => {
            const expectedUrl = "http://example.com/document.pdf";
            return expectedUrl;
        });

        try {
            await service.uploadDocument(data, fileName);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        }
    });
});


