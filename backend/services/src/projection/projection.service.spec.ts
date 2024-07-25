import { Test, TestingModule } from '@nestjs/testing';
import { GhgProjectionService } from './projection.service';
import { EntityManager, Repository } from 'typeorm';
import { HelperService } from '../util/helpers.service';
import { ProjectionEntity } from '../entities/projection.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { GHGInventoryManipulate } from '../enums/user.enum';
import { ProjectionDto, ProjectionValidateDto } from '../dtos/projection.dto';
import { ProjectionType } from '../enums/projection.enum';
import { GHGRecordState } from '../enums/ghg.state.enum';

describe('GhgEmissionsService', () => {
	let service: GhgProjectionService;
	let entityManagerMock: Partial<EntityManager>;
	let projectionRepoMock: Partial<Repository<ProjectionEntity>>;
	let helperServiceMock: Partial<HelperService>;
	let user: User;

	beforeEach(async () => {

		entityManagerMock = {
			transaction: jest.fn(),
			save: jest.fn(),
			query: jest.fn(),
		};

		projectionRepoMock = {
			findOne: jest.fn(),
			save: jest.fn(),
			update: jest.fn(),
		};

		helperServiceMock = {
			formatReqMessagesString: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GhgProjectionService,
				Logger,
				{
					provide: EntityManager,
					useValue: entityManagerMock
				},
				{
					provide: getRepositoryToken(ProjectionEntity),
					useValue: projectionRepoMock
				},
				{
					provide: HelperService,
					useValue: helperServiceMock
				},
			],
		}).compile();

		service = module.get<GhgProjectionService>(GhgProjectionService);
		user = new User();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('Create Projection', () => {
		it('should throw an exception if the user does not have GHG inventory manipulation permission', async () => {
			user.ghgInventoryPermission = GHGInventoryManipulate.CANNOT;
			const projectionDto = new ProjectionDto();
			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('Permission Denied');

			await expect(service.create(projectionDto, user)).rejects.toThrow(new HttpException('Permission Denied', HttpStatus.FORBIDDEN));
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('ghgInventory.ghgPermissionDenied', []);
		});

		it('should throw an exception if the projection for the type is finalized', async () => {
			const projectionDto = new ProjectionDto();
			projectionDto.projectionType = ProjectionType.WITHOUT_MEASURES;

			const existingProjection = new ProjectionEntity;
			existingProjection.id = "1";
			existingProjection.state = GHGRecordState.FINALIZED;


			jest.spyOn(projectionRepoMock, "findOne").mockResolvedValue(existingProjection);
			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('Cannot edit finalized projection');

			await expect(service.create(projectionDto, user)).rejects.toThrow('Cannot edit finalized projection');
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('ghgInventory.cannotEditProjectionFinalized', []);
		});

		it('should create and return a new projection if none exist for the type', async () => {
			const projectionDto = new ProjectionDto();
			projectionDto.projectionType = ProjectionType.WITHOUT_MEASURES;

			jest.spyOn(projectionRepoMock, "findOne").mockResolvedValue(null);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue({ ...projectionDto, id: "1", state: GHGRecordState.SAVED }),
				};
				return await callback(emMock);
			});

			const result = await service.create(projectionDto, user);

			expect(result.data).toBeDefined();
			expect(result.status).toBe(HttpStatus.CREATED);
		});

		it('should handle database errors during projection creation', async () => {
			const projectionDto = new ProjectionDto();
			projectionDto.projectionType = ProjectionType.WITHOUT_MEASURES;
			jest.spyOn(projectionRepoMock, "findOne").mockResolvedValue(null);
			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('Projection save failed');

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				throw new Error('This is a test transaction error. This is expected');
			});

			await expect(service.create(projectionDto, user)).rejects.toThrow('Projection save failed');
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('ghgInventory.projectionSaveFailed', []);
		});

	});

	describe('Update Projection', () => {
		it('should throw an exception if the user does not have GHG inventory manipulation permission', async () => {
			user.ghgInventoryPermission = GHGInventoryManipulate.CANNOT;
			const projectionDto = new ProjectionDto();
			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('Permission Denied');

			await expect(service.create(projectionDto, user)).rejects.toThrow(new HttpException('Permission Denied', HttpStatus.FORBIDDEN));
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('ghgInventory.ghgPermissionDenied', []);
		});

		it('should not update a projection if it is already finalized', async () => {
			const projectionDto = new ProjectionDto();
			projectionDto.projectionType = ProjectionType.WITHOUT_MEASURES;

			const existingProjection = new ProjectionEntity;
			existingProjection.id = "1";
			existingProjection.state = GHGRecordState.FINALIZED;

			jest.spyOn(projectionRepoMock, "findOne").mockResolvedValue(existingProjection);
			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('Cannot edit finalized projection');

			await expect(service.create(projectionDto, user)).rejects.toThrow('Cannot edit finalized projection');
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('ghgInventory.cannotEditProjectionFinalized', []);
		});

		it('should update and return an existing projection', async () => {
			const projectionDto = new ProjectionDto();
			projectionDto.projectionType = ProjectionType.WITHOUT_MEASURES;

			const existingProjection = new ProjectionEntity;
			existingProjection.id = "1";
			existingProjection.state = GHGRecordState.SAVED;

			jest.spyOn(projectionRepoMock, "findOne").mockResolvedValue(existingProjection);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					update: jest.fn().mockResolvedValue({ ...existingProjection[0], state: GHGRecordState.FINALIZED }),
				};
				return await callback(emMock);
			});

			const result = await service.create(projectionDto, user);

			expect(result.status).toBe(HttpStatus.OK);
			expect(result.data).toBeDefined();
		});

		it('should handle errors during the updating process', async () => {
			const projectionDto = new ProjectionDto();
			projectionDto.projectionType = ProjectionType.WITHOUT_MEASURES;

			const existingProjection = new ProjectionEntity;
			existingProjection.id = "1";
			existingProjection.state = GHGRecordState.SAVED;

			jest.spyOn(projectionRepoMock, "findOne").mockResolvedValue(existingProjection);

			jest.spyOn(entityManagerMock, "transaction").mockRejectedValue(new Error('Update failed'));
			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('Update failed');

			await expect(service.create(projectionDto, user)).rejects.toThrow('Update failed');
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('ghgInventory.projectionUpdateFailed', []);
		});



	})

	describe('Validate Projection', () => {
		it('should deny validation if the user lacks GHG inventory manipulation permission', async () => {
			user.ghgInventoryPermission = GHGInventoryManipulate.CANNOT;
			const projectionValidateDto = new ProjectionValidateDto();
			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('GHG manipulation permission denied');

			await expect(service.validate(projectionValidateDto, user)).rejects.toThrow(new HttpException('GHG manipulation permission denied', HttpStatus.FORBIDDEN));
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('ghgInventory.ghgPermissionDenied', []);
		});


		it('should prevent validation if the projection is already in the desired state', async () => {
			const projectionValidateDto = new ProjectionValidateDto();
			projectionValidateDto.projectionType = ProjectionType.WITHOUT_MEASURES;
			projectionValidateDto.state = GHGRecordState.FINALIZED;

			const existingProjection = new ProjectionEntity;
			existingProjection.id = "1";
			existingProjection.state = GHGRecordState.FINALIZED;

			jest.spyOn(projectionRepoMock, "findOne").mockResolvedValue(existingProjection);
			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('Projection already validated');

			await expect(service.validate(projectionValidateDto, user)).rejects.toThrow('Projection already validated');
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('ghgInventory.projectionAlreadyValidated', []);
		});

		it('should successfully update the state of a projection', async () => {
			const projectionValidateDto = new ProjectionValidateDto();
			projectionValidateDto.projectionType = ProjectionType.WITHOUT_MEASURES;
			projectionValidateDto.state = GHGRecordState.FINALIZED;

			const existingProjection = new ProjectionEntity;
			existingProjection.id = "1";
			existingProjection.state = GHGRecordState.SAVED;

			jest.spyOn(projectionRepoMock, "findOne").mockResolvedValue(existingProjection);
			jest.spyOn(projectionRepoMock, "save").mockResolvedValue({ ...existingProjection, state: GHGRecordState.FINALIZED });

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue({ ...existingProjection[0], state: GHGRecordState.FINALIZED }),
				};
				return await callback(emMock);
			});

			const result = await service.validate(projectionValidateDto, user);

			expect(result.status).toBe(HttpStatus.OK);
			expect(existingProjection.state).toBe(GHGRecordState.FINALIZED);
		});

		it('should handle errors during the validation process', async () => {
			const projectionValidateDto = new ProjectionValidateDto();
			projectionValidateDto.projectionType = ProjectionType.WITHOUT_MEASURES;
			projectionValidateDto.state = GHGRecordState.FINALIZED;

			const existingProjection = new ProjectionEntity;
			existingProjection.id = "1";
			existingProjection.state = GHGRecordState.SAVED;

			jest.spyOn(projectionRepoMock, "findOne").mockResolvedValue(existingProjection);
			jest.spyOn(helperServiceMock, "formatReqMessagesString").mockReturnValue('Projection validation failed');

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				throw new Error('This is a test transaction error. This is expected');
			});

			await expect(service.validate(projectionValidateDto, user)).rejects.toThrow(new HttpException('Projection validation failed', HttpStatus.BAD_REQUEST));
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('projection.projectionVerificationActionFailed', expect.any(Array));
		});

	})

});