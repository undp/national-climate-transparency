import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { instanceToPlain, plainToClass } from "class-transformer";
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import { HelperService } from '../util/helpers.service';
import { User } from '../entities/user.entity';
import { ProjectionEntity } from '../entities/projection.entity';
import { ProjectionDto } from '../dtos/projection.dto';
import { ExtendedProjectionType, ProjectionType } from '../enums/projection.enum';
import { GHGRecordState } from '../enums/ghg.state.enum';

@Injectable()
export class GhgProjectionService {

    constructor(
        private logger: Logger,
        @InjectEntityManager() private entityManager: EntityManager,
        @InjectRepository(ProjectionEntity) private projectionRepo: Repository<ProjectionEntity>,
        private helperService: HelperService,
    ) { };

    async create(projectionDto: ProjectionDto, user: User) {

      const projection: ProjectionEntity = this.toProjection(projectionDto);

      let savedProjection: ProjectionEntity;
      const result = await this.getActualProjection(projection.projectionType);

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
                  }
                  return err;
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
              }
              return err;
          });

      return { status: HttpStatus.CREATED, data: savedProjection };
    }

    async getActualProjection(projectionType: string) {

        if (!Object.values(ProjectionType).includes(projectionType as ProjectionType)){
          throw new HttpException('Invalid Projection Type Received', HttpStatus.BAD_REQUEST);
        }

        return await this.projectionRepo.findOne({
            where: {
                projectionType: projectionType
            },
        });
    }

    async getCalculatedProjection(projectionType: string) {

        if (!Object.values(ExtendedProjectionType).includes(projectionType as ExtendedProjectionType)){
            throw new HttpException('Invalid Baseline Projection Type Received', HttpStatus.BAD_REQUEST);
        }

        if (Object.values(ProjectionType).includes(projectionType as ProjectionType)){
            throw new HttpException('Invalid Baseline Projection Type Received', HttpStatus.BAD_REQUEST);
        }
  
        return await this.projectionRepo.findOne({
            where: {
                projectionType: projectionType
            },
        });
    }

    private toProjection(projectionDto: ProjectionDto): ProjectionEntity {
        const data = instanceToPlain(projectionDto);
        this.logger.verbose("Converted projectionDto to Projection entity", JSON.stringify(data));
        return plainToClass(ProjectionEntity, data);
    }
}