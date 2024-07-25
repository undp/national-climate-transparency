import { Test, TestingModule } from '@nestjs/testing';
import { GhgEmissionsService } from './emission.service';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { EmissionEntity } from '../entities/emission.entity';
import { FileHandlerInterface } from '../file-handler/filehandler.interface';
import { HelperService } from '../util/helpers.service';
import { EntityManager, QueryFailedError, Repository, SelectQueryBuilder } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { GHGInventoryManipulate, ValidateEntity } from '../enums/user.enum';
import { EmissionDto, EmissionValidateDto } from '../dtos/emission.dto';
import { GHGRecordState } from '../enums/ghg.state.enum';

describe('GhgEmissionsService', () => {
	let service: GhgEmissionsService;
	let loggerMock: Partial<Logger>;
	let entityManagerMock: Partial<EntityManager>;
	let emissionRepoMock: Partial<Repository<EmissionEntity>>;
	let helperServiceMock: Partial<HelperService>;
	let fileHandlerMock: Partial<FileHandlerInterface>;
	let user: User;

	beforeEach(async () => {
		entityManagerMock = {
			transaction: jest.fn(),
			save: jest.fn(),
			query: jest.fn(),
		};

		emissionRepoMock = {
			find: jest.fn(),
			save: jest.fn(),
			update: jest.fn(),
			createQueryBuilder: jest.fn(() => ({
				select: jest.fn().mockReturnThis(),
				getRawMany: jest.fn().mockResolvedValue([
					{ year: '2021', state: 'SAVED' },
					{ year: '2022', state: 'FINALIZED' }
				])
			})) as unknown as () => SelectQueryBuilder<EmissionEntity>,
		};

		helperServiceMock = {
			formatReqMessagesString: jest.fn(),
			isValidYear: jest.fn(),
		};

		loggerMock = {
			error: jest.fn(),
		};
		
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GhgEmissionsService,
				{
					provide: getRepositoryToken(EmissionEntity),
					useValue: emissionRepoMock
				},
				{
					provide: Logger,
					useValue: loggerMock
				},
				{
					provide: EntityManager,
					useValue: entityManagerMock
				},
				{
					provide: HelperService,
					useValue: helperServiceMock
				},
				{
					provide: FileHandlerInterface,
					useValue: fileHandlerMock
				},
			],
		}).compile();

		service = module.get<GhgEmissionsService>(GhgEmissionsService);
		user = new User();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('Create Emission', () => {
		it('should throw an exception if the user does not have GHG inventory manipulation permission', async () => {
			user.ghgInventoryPermission = GHGInventoryManipulate.CANNOT;
			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('Permission Denied');

			await expect(service.create(new EmissionDto, user)).rejects.toThrow('Permission Denied');
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('ghgInventory.ghgPermissionDenied', []);
		});

		it('should throw an exception if the emission for the year is finalized', async () => {

			const emissionDto = new EmissionDto;
			emissionDto.year = "2021";

			user.ghgInventoryPermission = GHGInventoryManipulate.CAN;
			jest.spyOn(emissionRepoMock, "find").mockResolvedValue([{ id: "1", state: GHGRecordState.FINALIZED, year: "2021" }]);
			jest.spyOn(helperServiceMock, "isValidYear").mockReturnValue(true);
			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('Cannot edit finalized emission');

			await expect(service.create(emissionDto, user)).rejects.toThrow('Cannot edit finalized emission');
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('ghgInventory.cannotEditEmissionFinalized', []);
		});

		it('should create and return a new emission if none exist for the year', async () => {

			const emissionDto = new EmissionDto;
			emissionDto.year = "2022";
			emissionDto.totalCo2WithLand = { co2: 100, ch4: 20, n2o: 35, co2eq: 90 };

			user.ghgInventoryPermission = GHGInventoryManipulate.CAN;
			jest.spyOn(emissionRepoMock, "find").mockResolvedValue([]);
			jest.spyOn(helperServiceMock, "isValidYear").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce({ id: "1", state: GHGRecordState.SAVED, year: "2022" }),
				};
				const savedEmission = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(1);
				return savedEmission;
			});

			const result = await service.create(emissionDto, user);

			expect(result.data).toBeDefined();
			expect(result.status).toBe(HttpStatus.CREATED);
		});

		it('should handle database errors during emission creation', async () => {

			const emissionDto = new EmissionDto;
			emissionDto.year = "2022";

			user.ghgInventoryPermission = GHGInventoryManipulate.CAN;
			jest.spyOn(emissionRepoMock, "find").mockResolvedValue([]);
			jest.spyOn(helperServiceMock, "isValidYear").mockReturnValue(true);
			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('Emission save failed');

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				throw new QueryFailedError('This is a test transaction error. This is expected', ["null"], "null");
			});

			await expect(service.create(emissionDto, user)).rejects.toThrow(HttpException);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('ghgInventory.emissionSaveFailed', []);
		});

		it('should handle non-database errors during emission creation', async () => {

			const emissionDto = new EmissionDto;
			emissionDto.year = "2022";

			user.ghgInventoryPermission = GHGInventoryManipulate.CAN;
			jest.spyOn(emissionRepoMock, "find").mockResolvedValue([]);
			jest.spyOn(helperServiceMock, "isValidYear").mockReturnValue(true);
			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('Emission save failed');

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				throw new Error('This is a test transaction error. This is expected');
			});

			await expect(service.create(emissionDto, user)).rejects.toThrow(HttpException);
			expect(loggerMock.error).toHaveBeenCalledWith(expect.anything());
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('ghgInventory.emissionSaveFailed', []);
		});

	});

	describe('Update Emission', () => {
		it('should not update an emission if it is already finalized', async () => {
			const emissionEntity = new EmissionEntity;
			emissionEntity.id = "1";
			emissionEntity.year = '2022';
			emissionEntity.state = GHGRecordState.FINALIZED;

			const emissionDto = new EmissionDto;
			emissionDto.year = "2022";
			emissionDto.totalCo2WithLand = { co2: 100, ch4: 20, n2o: 35, co2eq: 90 };

			user.ghgInventoryPermission = GHGInventoryManipulate.CAN;

			jest.spyOn(emissionRepoMock, "find").mockResolvedValue([emissionEntity]);
			jest.spyOn(helperServiceMock, "isValidYear").mockReturnValue(true);
			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('Cannot edit finalized emission');

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce({ id: "1", state: GHGRecordState.SAVED, year: "2022" }),
				};
				const savedEmission = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(0);
				return savedEmission;
			});

			await expect(service.create(emissionDto, user)).rejects.toThrow('Cannot edit finalized emission');
		});


		it('should handle errors during the updating of an existing emission', async () => {
			user.ghgInventoryPermission = GHGInventoryManipulate.CAN;

			const emissionEntity = new EmissionEntity;
			emissionEntity.id = "1";
			emissionEntity.year = '2022';
			emissionEntity.state = GHGRecordState.SAVED;

			const emissionDto = new EmissionDto;
			emissionDto.year = "2022";
			emissionDto.totalCo2WithLand = { co2: 100, ch4: 20, n2o: 35, co2eq: 90 };

			jest.spyOn(emissionRepoMock, "find").mockResolvedValue([emissionEntity]);
			jest.spyOn(helperServiceMock, "isValidYear").mockReturnValue(true);
			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('Emission update failed');

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				throw new Error('This is a test transaction error. This is expected');
			});

			await expect(service.create(emissionDto, user)).rejects.toThrow(HttpException);
			expect(loggerMock.error).toHaveBeenCalledWith(expect.anything());
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('ghgInventory.emissionSaveFailed', []);
		});

		it('should update an existing, non-finalized emission', async () => {
			const emissionEntity = new EmissionEntity;
			emissionEntity.id = "1";
			emissionEntity.year = '2022';
			emissionEntity.state = GHGRecordState.SAVED;

			const emissionDto = new EmissionDto;
			emissionDto.year = "2022";
			emissionDto.totalCo2WithLand = { co2: 100, ch4: 20, n2o: 35, co2eq: 90 };

			user.ghgInventoryPermission = GHGInventoryManipulate.CAN;

			jest.spyOn(emissionRepoMock, "find").mockResolvedValue([emissionEntity]);
			jest.spyOn(helperServiceMock, "isValidYear").mockReturnValue(true);

			const updatedEmission = {
				...emissionEntity[0],
				totalCo2WithoutLand: { co2: 100, ch4: 20, n2o: 35, co2eq: 90 },
			};

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					update: jest.fn().mockResolvedValueOnce(updatedEmission),
				};
				const savedEmission = await callback(emMock);
				expect(emMock.update).toHaveBeenCalledTimes(1);
				return savedEmission;
			});

			const result = await service.create(emissionDto, user);

			expect(result.data).toEqual(updatedEmission);
			expect(result.status).toBe(HttpStatus.OK);
		});

	});

	describe('validate method tests', () => {
		it('should deny validation if the user does not have validate permission', async () => {
			user.ghgInventoryPermission = GHGInventoryManipulate.CANNOT;
			user.validatePermission = ValidateEntity.CANNOT;

			const emissionDto = new EmissionValidateDto;
			emissionDto.year = "2022";
			emissionDto.state = GHGRecordState.SAVED

			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('Permission denied');

			await expect(service.validate(emissionDto, user)).rejects.toThrow('Permission denied');
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('ghgInventory.ghgPermissionDenied', []);
		});

		it('should deny validation if the user does not have GHG manipulation permission', async () => {
			user.ghgInventoryPermission = GHGInventoryManipulate.CANNOT;
			user.validatePermission = ValidateEntity.CAN;

			const emissionValidateDto = new EmissionValidateDto();
			emissionValidateDto.year = "2023";
			emissionValidateDto.state = GHGRecordState.FINALIZED;

			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('GHG manipulation permission denied');

			await expect(service.validate(emissionValidateDto, user)).rejects.toThrow('GHG manipulation permission denied');
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('ghgInventory.ghgPermissionDenied', []);
		});

		it('should reject the request if the emission year is invalid', async () => {
			user.ghgInventoryPermission = GHGInventoryManipulate.CAN;
			user.validatePermission = ValidateEntity.CAN;

			const emissionValidateDto = new EmissionValidateDto();
			emissionValidateDto.year = "202X"; // Invalid year
			emissionValidateDto.state = GHGRecordState.FINALIZED;

			jest.spyOn(helperServiceMock, "isValidYear").mockReturnValue(false);
			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('Invalid year format');

			await expect(service.validate(emissionValidateDto, user)).rejects.toThrow('Invalid year format');
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('ghgInventory.invalidEmissionYear', []);
		});


		it('should prevent validation if the emission is already in the desired state', async () => {
			user.ghgInventoryPermission = GHGInventoryManipulate.CAN;
			user.validatePermission = ValidateEntity.CAN;

			const existingEmissions = new EmissionEntity;
			existingEmissions.id = "1";
			existingEmissions.year = '2022';
			existingEmissions.state = GHGRecordState.FINALIZED;

			const emissionValidateDto = new EmissionValidateDto();
			emissionValidateDto.year = "2022";
			emissionValidateDto.state = GHGRecordState.FINALIZED;

			jest.spyOn(emissionRepoMock, "find").mockResolvedValue([existingEmissions]);
			jest.spyOn(helperServiceMock, "isValidYear").mockReturnValue(true);
			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('Emission already validated');

			await expect(service.validate(emissionValidateDto, user)).rejects.toThrow('Emission already validated');
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('ghgInventory.emissionAlreadyValidated', []);
		});

		it('should successfully update the emission state', async () => {
			user.ghgInventoryPermission = GHGInventoryManipulate.CAN;
			user.validatePermission = ValidateEntity.CAN;

			const existingEmissions = new EmissionEntity;
			existingEmissions.id = "1";
			existingEmissions.year = '2022';
			existingEmissions.state = GHGRecordState.SAVED;

			const emissionValidateDto = new EmissionValidateDto();
			emissionValidateDto.year = "2022";
			emissionValidateDto.state = GHGRecordState.FINALIZED;

			jest.spyOn(emissionRepoMock, "find").mockResolvedValue([existingEmissions]);
			jest.spyOn(helperServiceMock, "isValidYear").mockReturnValue(true);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue({ ...existingEmissions[0], state: GHGRecordState.FINALIZED }),
				};
				return await callback(emMock);
			});

			const result = await service.validate(emissionValidateDto, user);

			expect(result.status).toBe(HttpStatus.OK);
			expect(existingEmissions.state).toBe(GHGRecordState.FINALIZED);
			expect(entityManagerMock.transaction).toHaveBeenCalled();
		});

		it('should handle transaction errors during emission state update', async () => {
			user.ghgInventoryPermission = GHGInventoryManipulate.CAN;
			user.validatePermission = ValidateEntity.CAN;

			const existingEmissions = new EmissionEntity;
			existingEmissions.id = "1";
			existingEmissions.year = '2022';
			existingEmissions.state = GHGRecordState.SAVED;

			const emissionValidateDto = new EmissionValidateDto();
			emissionValidateDto.year = "2022";
			emissionValidateDto.state = GHGRecordState.FINALIZED;

			jest.spyOn(emissionRepoMock, "find").mockResolvedValue([existingEmissions]);
			jest.spyOn(helperServiceMock, "isValidYear").mockReturnValue(true);
			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('This is a test transaction error. This is expected');

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				throw new Error('This is a test transaction error. This is expected');
			});

			await expect(service.validate(emissionValidateDto, user)).rejects.toThrow('This is a test transaction error. This is expected');

		});


	});

	describe('getEmissionReportSummary', () => {
		it('should fetch emission summary data correctly', async () => {
			const expectedResult = [
				{ year: '2021', state: 'SAVED' },
				{ year: '2022', state: 'FINALIZED' }
			];

			const result = await service.getEmissionReportSummary(user);
			expect(result).toEqual(expectedResult);
			expect(emissionRepoMock.createQueryBuilder).toHaveBeenCalledTimes(1);
		});
	});

});