import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { instanceToPlain, plainToClass } from "class-transformer";
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import { HelperService } from '../util/helpers.service';
import { EmissionDto } from '../dtos/emission.dto';
import { User } from '../entities/user.entity';
import { Role } from '../casl/role.enum';
import { BaselineDto } from 'src/dtos/baseline.dto';
import { ProjectionEntity } from 'src/entities/projection.entity';
import { ProjectionDto } from 'src/dtos/projection.dto';
import { ProjectionCategories, ProjectionType } from 'src/enums/projection.enum';
import { GHGRecordState } from 'src/enums/ghg.state.enum';

@Injectable()
export class GhgProjectionService {

    constructor(
        private logger: Logger,
        @InjectEntityManager() private entityManager: EntityManager,
        @InjectRepository(ProjectionEntity) private projectionRepo: Repository<ProjectionEntity>,
        private helperService: HelperService,
    ) { };

    async create(projectionDto: ProjectionDto, user: User) {
      if (user.role === Role.Observer) {
        throw new HttpException(
            this.helperService.formatReqMessagesString("user.userUnAUth", []),
            HttpStatus.FORBIDDEN
        );
      }

      if (!this.helperService.isValidYear(projectionDto.year)){
        throw new HttpException('Invalid Projection Year Received', HttpStatus.BAD_REQUEST);
      }

      const projection: ProjectionEntity = this.toProjection(projectionDto);
      this.verifyProjectionValues(projection);

      let savedProjection: ProjectionEntity;
      const result = await this.getProjectionByYear(projection.projectionType, projection.year);

      if (result && result.length > 0) {
          if (result[0].state === GHGRecordState.FINALIZED) {
              throw new HttpException(
                  this.helperService.formatReqMessagesString("ghgInventory.cannotEditProjectionFinalized", []),
                  HttpStatus.FORBIDDEN
              );
          }

          projection.id = result[0]?.id;

          savedProjection = await this.entityManager
              .transaction(async (em) => {
                  const updatedData = await em.update<ProjectionEntity>(ProjectionEntity, {
                      id: projection.id,
                  },
                      {
                          energyEmissions: projection.energyEmissions,
                          industrialProcessesProductUse: projection.industrialProcessesProductUse,
                          agricultureForestryOtherLandUse: projection.agricultureForestryOtherLandUse,
                          waste: projection.waste,
                          other: projection.other,
                          totalCo2WithoutLand: projection.totalCo2WithoutLand,
                          totalCo2WithLand: projection.totalCo2WithLand,
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

    async getProjectionByYear(projectionType: string, projectionYear: string) {

        if (!Object.values(ProjectionType).includes(projectionType as ProjectionType)){
          throw new HttpException('Invalid Projection Type Received', HttpStatus.BAD_REQUEST);
        }

        if (!this.helperService.isValidYear(projectionYear)){
          throw new HttpException('Invalid Projection Year Received', HttpStatus.BAD_REQUEST);
        }

        return await this.projectionRepo.find({
            where: {
                projectionType: projectionType,
                year: projectionYear
            },
        });
    }

    async getProjectionSummary(projectionType: ProjectionType) {

        if (!Object.values(ProjectionType).includes(projectionType)){
          throw new HttpException('Invalid Projection Type Received', HttpStatus.BAD_REQUEST);
        }
        const projectionSummary = await this.projectionRepo
            .createQueryBuilder("projection_entity")
            .select(["year", "state", '"isBaseline"'])
            .where("projection_entity.projectionType = :pType", { pType: projectionType })
            .getRawMany();
            
        return projectionSummary;
    }

    async setBaselineYear(baselineDto: BaselineDto, user: User) {
        // const emissions = await this.emissionRepo
        //     .createQueryBuilder("emission_entity")
        //     .select(["year", "state"])
        //     .getRawMany();
            
        // return emissions;

        if (!this.helperService.isValidYear(baselineDto.projectionYear)){
          throw new HttpException('Invalid Projection Year Received', HttpStatus.BAD_REQUEST);
        }

        return baselineDto;
    }

    private toProjection(projectionDto: ProjectionDto): ProjectionEntity {
        const data = instanceToPlain(projectionDto);
        data.isBaseline = false;
        this.logger.verbose("Converted projectionDto to Projection entity", JSON.stringify(data));
        return plainToClass(ProjectionEntity, data);
    }

    private verifyProjectionValues(emissionData: any) {
        const projectionProperties = [ProjectionCategories.BAU, ProjectionCategories.CONDITIONAL_NDC, ProjectionCategories.UNCONDITIONAL_NDC];
        for (let key in emissionData) {
          if (typeof emissionData[key] === 'object') {
            if (!this.verifyProjectionValues(emissionData[key])) {
              return false;
            }
          } else {
            if (projectionProperties.includes(key as ProjectionCategories)) {
              if (typeof emissionData[key] === 'string') {
                throw new HttpException(this.helperService.formatReqMessagesString("ghgInventory.invalidDataType", []), HttpStatus.BAD_REQUEST);
              }
              if (typeof emissionData[key] === 'number' && emissionData[key] < 0) {
                throw new HttpException(this.helperService.formatReqMessagesString("ghgInventory.negativeValuesNotAllowed", []), HttpStatus.BAD_REQUEST);
              }
            }
      
          }
        }
        return true;
    }
}