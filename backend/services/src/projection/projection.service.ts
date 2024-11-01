import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { instanceToPlain, plainToClass } from "class-transformer";
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import { HelperService } from '../util/helpers.service';
import { User } from '../entities/user.entity';
import { ProjectionEntity } from '../entities/projection.entity';
import { ProjectionDto, ProjectionValidateDto } from '../dtos/projection.dto';
import { ExtendedProjectionType, ProjectionType } from '../enums/projection.enum';
import { GHGRecordState } from '../enums/ghg.state.enum';
import { GHGInventoryManipulate, ValidateEntity } from '../enums/user.enum';

@Injectable()
export class GhgProjectionService {

	constructor(
		private logger: Logger,
		@InjectEntityManager() private entityManager: EntityManager,
		@InjectRepository(ProjectionEntity) private projectionRepo: Repository<ProjectionEntity>,
		private helperService: HelperService,
	) { };

	//MARK: Create Projection
	async create(projectionDto: ProjectionDto, user: User) {

		if (user.ghgInventoryPermission === GHGInventoryManipulate.CANNOT) {
			throw new HttpException(this.helperService.formatReqMessagesString("ghgInventory.ghgPermissionDenied", []), HttpStatus.FORBIDDEN);
		}

		// Projection Type will be validated inside getActualProjection(projection.projectionType, user);

		const projection: ProjectionEntity = this.toProjection(projectionDto);

		let savedProjection: any;
		const result = await this.getActualProjection(projection.projectionType, user);

		if (result) {
			if (result.state === GHGRecordState.FINALIZED) {
				throw new HttpException(
					this.helperService.formatReqMessagesString("ghgInventory.cannotEditProjectionFinalized", []),
					HttpStatus.FORBIDDEN
				);
			}

			projection.id = result?.id;

			savedProjection = await this.entityManager
				.transaction(async (em) => {
					const updatedData = await em.update<ProjectionEntity>(ProjectionEntity, {
						id: projection.id,
					},
						{
							projectionData: projection.projectionData,
							state: projection.state,
						});
					return updatedData;
				})
				.catch((err: any) => {
					console.log(err);
					if (err instanceof QueryFailedError) {
						throw new HttpException(this.helperService.formatReqMessagesString("ghgInventory.projectionUpdateFailed", []), HttpStatus.BAD_REQUEST);
					} else {
						this.logger.error(`Projection updating error ${err}`);
						throw new HttpException(this.helperService.formatReqMessagesString("ghgInventory.projectionUpdateFailed", []), HttpStatus.INTERNAL_SERVER_ERROR);
					}
				});

			return { status: HttpStatus.OK, data: savedProjection };
		}

		savedProjection = await this.entityManager
			.transaction(async (em) => {
				const savedData = await em.save<ProjectionEntity>(projection);
				return savedData;
			})
			.catch((err: any) => {
				console.log(err);
				if (err instanceof QueryFailedError) {
					throw new HttpException(this.helperService.formatReqMessagesString("ghgInventory.projectionSaveFailed", []), HttpStatus.BAD_REQUEST);
				} else {
					this.logger.error(`Emission add error ${err}`);
					throw new HttpException(this.helperService.formatReqMessagesString("ghgInventory.projectionSaveFailed", []), HttpStatus.INTERNAL_SERVER_ERROR);
				}
			});

		return { status: HttpStatus.CREATED, data: savedProjection };
	}

	//MARK: Validate Projection
	async validate(projectionValidateDto: ProjectionValidateDto, user: User) {

		if (user.ghgInventoryPermission === GHGInventoryManipulate.CANNOT) {
			throw new HttpException(this.helperService.formatReqMessagesString("ghgInventory.ghgPermissionDenied", []), HttpStatus.FORBIDDEN);
		}

		if (user.validatePermission === ValidateEntity.CANNOT) {
			throw new HttpException(this.helperService.formatReqMessagesString("ghgInventory.validatePermissionDenied", []), HttpStatus.FORBIDDEN);
		}

		// Projection Type will be validated inside getActualProjection(projectionValidateDto.projectionType, user);

		const result = await this.getActualProjection(projectionValidateDto.projectionType, user);

		if (result) {
			if (result.state === GHGRecordState.FINALIZED && projectionValidateDto.state === GHGRecordState.FINALIZED) {
				throw new HttpException(
					this.helperService.formatReqMessagesString("ghgInventory.projectionAlreadyValidated", []),
					HttpStatus.FORBIDDEN
				);
			}

			if (result.state === GHGRecordState.SAVED && projectionValidateDto.state === GHGRecordState.SAVED) {
				throw new HttpException(
					this.helperService.formatReqMessagesString("ghgInventory.projectionAlreadyUnvalidated", []),
					HttpStatus.FORBIDDEN
				);
			}

			result.state = projectionValidateDto.state;

			const savedProjection = await this.entityManager
				.transaction(async (em) => {
					return await em.save<ProjectionEntity>(result);
				})
				.catch((err: any) => {
					console.log(err);
					throw new HttpException(
						this.helperService.formatReqMessagesString(
							"projection.projectionVerificationActionFailed",
							[err]
						),
						HttpStatus.BAD_REQUEST
					);
				});

			return { status: HttpStatus.OK, data: savedProjection };
		} else {
			return { status: HttpStatus.NOT_FOUND, data: projectionValidateDto.projectionType };
		}
	}

	//MARK: Get Actual Projection
	async getActualProjection(projectionType: string, user: User) {

		if (!Object.values(ProjectionType).includes(projectionType as ProjectionType)) {
			throw new HttpException(this.helperService.formatReqMessagesString("ghgInventory.invalidProjectionType", []), HttpStatus.BAD_REQUEST);
		}

		return await this.projectionRepo.findOne({
			where: {
				projectionType: projectionType
			},
		});
	}

	//MARK: Get Calculated Projection
	async getCalculatedProjection(projectionType: string, user: User) {

		if (!Object.values(ExtendedProjectionType).includes(projectionType as ExtendedProjectionType)) {
			throw new HttpException(this.helperService.formatReqMessagesString("ghgInventory.invalidBaselineProjectionType", []), HttpStatus.BAD_REQUEST);
		}

		if (Object.values(ProjectionType).includes(projectionType as ProjectionType)) {
			throw new HttpException(this.helperService.formatReqMessagesString("ghgInventory.invalidBaselineProjectionType", []), HttpStatus.BAD_REQUEST);
		}

		return await this.projectionRepo.findOne({
			where: {
				projectionType: projectionType
			},
		});
	}

	private toProjection(projectionDto: ProjectionDto): ProjectionEntity {
		const data = instanceToPlain(projectionDto);
		data.state = GHGRecordState.SAVED;
		return plainToClass(ProjectionEntity, data);
	}
}