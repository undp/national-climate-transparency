import { ActionService } from "../action/action.service";
import { CounterService } from "../util/counter.service";
import { FileUploadService } from "../util/fileUpload.service";
import { HelperService } from "../util/helpers.service";
import { PayloadValidator } from "../validation/payload.validator";
import { EntityManager } from "typeorm";
import { ProgrammeService } from "./programme.service";
import { Test, TestingModule } from "@nestjs/testing";
import { DataResponseMessageDto } from "../dtos/data.response.message";
import { User } from "../entities/user.entity";
import { ProgrammeDto } from "../dtos/programme.dto";
import { Sector } from "../enums/sector.enum";
import { NatImplementor, SubSector } from "../enums/shared.enum";
import { ProgrammeEntity } from "../entities/programme.entity";
import { ActionEntity } from "../entities/action.entity";
import { HttpException, HttpStatus } from "@nestjs/common";

import { DocumentDto } from "../dtos/document.dto";
import { KpiDto } from "../dtos/kpi.dto";

describe('ProgrammeService', () => {
    let service: ProgrammeService;
    let entityManagerMock: Partial<EntityManager>;
    let actionServiceMock: Partial<ActionService>;
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

        actionServiceMock = {
            findActionById: jest.fn(),
        };
        counterServiceMock = {
            incrementCount: jest.fn().mockResolvedValue(1),
        };
        helperServiceMock = {
            formatReqMessagesString: jest.fn(),
        };
        fileUploadServiceMock = {
            uploadDocument: jest.fn().mockResolvedValue('http://test.com/documents/action_documents/test.csv'),
        };

        payloadValidatorMock = {
            validateKpiPayload: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProgrammeService,
                {
                    provide: EntityManager,
                    useValue: entityManagerMock,
                },
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
    });
})