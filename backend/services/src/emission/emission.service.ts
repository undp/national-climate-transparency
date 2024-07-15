import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { instanceToPlain, plainToClass } from "class-transformer";
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import { EmissionEntity } from 'src/entities/emission.entity';
import { HelperService } from 'src/util/helpers.service';
import { EmissionDto, EmissionValidateDto } from 'src/dtos/emission.dto';
import { User } from 'src/entities/user.entity';
import { GHGRecordState } from 'src/enums/ghg.state.enum';

@Injectable()
export class GhgEmissionsService {

    constructor(
        private logger: Logger,
        @InjectEntityManager() private entityManager: EntityManager,
        @InjectRepository(EmissionEntity) private emissionRepo: Repository<EmissionEntity>,
        private helperService: HelperService,
    ) { };

    async create(emissionDto: EmissionDto, user: User) {

        if (!this.helperService.isValidYear(emissionDto.year)){
            throw new HttpException('Invalid Emission Year Received', HttpStatus.BAD_REQUEST);
        }

        const emission: EmissionEntity = this.toEmission(emissionDto);
        this.verifyEmissionValues(emission);

        let savedEmission: EmissionEntity;
        const result = await this.getEmissionByYear(emission.year);

        if (result && result.length > 0) {
            if (result[0].state === GHGRecordState.FINALIZED) {
                throw new HttpException(
                    this.helperService.formatReqMessagesString("ghgInventory.cannotEditEmissionFinalized", []),
                    HttpStatus.FORBIDDEN
                );
            }

            emission.id = result[0]?.id;

            savedEmission = await this.entityManager
                .transaction(async (em) => {
                    const updatedData = await em.update<EmissionEntity>(EmissionEntity, {
                        id: emission.id,
                    },
                        {
                            energyEmissions: emission.energyEmissions,
                            industrialProcessesProductUse: emission.industrialProcessesProductUse,
                            agricultureForestryOtherLandUse: emission.agricultureForestryOtherLandUse,
                            waste: emission.waste,
                            other: emission.other,
                            totalCo2WithoutLand: emission.totalCo2WithoutLand,
                            totalCo2WithLand: emission.totalCo2WithLand,
                            state: emission.state,
                        });
                    return updatedData;
                })
                .catch((err: any) => {
                    console.log(err);
                    if (err instanceof QueryFailedError) {
                        throw new HttpException(this.helperService.formatReqMessagesString("ghgInventory.emissionUpdateFailed", []), HttpStatus.BAD_REQUEST);
                    } else {
                        this.logger.error(`Emission updating error ${err}`);
                    }
                    return err;
                });

            return { status: HttpStatus.OK, data: savedEmission };
        }

        savedEmission = await this.entityManager
            .transaction(async (em) => {
                const savedData = await em.save<EmissionEntity>(emission);
                return savedData;
            })
            .catch((err: any) => {
                console.log(err);
                if (err instanceof QueryFailedError) {
                    throw new HttpException(this.helperService.formatReqMessagesString("ghgInventory.emissionSaveFailed", []), HttpStatus.BAD_REQUEST);
                } else {
                    this.logger.error(`Emission add error ${err}`);
                }
                return err;
            });

        return { status: HttpStatus.CREATED, data: savedEmission };
    }

    async validate(emissionValidateDto: EmissionValidateDto, user: User) {

        if (!this.helperService.isValidYear(emissionValidateDto.year)){
            throw new HttpException('Invalid Emission Year Received', HttpStatus.BAD_REQUEST);
        }

        const result = await this.getEmissionByYear(emissionValidateDto.year);

        if (result && result.length > 0) {
            if (result[0].state === GHGRecordState.FINALIZED && emissionValidateDto.state === GHGRecordState.FINALIZED) {
                throw new HttpException(
                    this.helperService.formatReqMessagesString("ghgInventory.emissionAlreadyValidated", []),
                    HttpStatus.FORBIDDEN
                );
            }

            if (result[0].state === GHGRecordState.SAVED && emissionValidateDto.state === GHGRecordState.SAVED) {
                throw new HttpException(
                    this.helperService.formatReqMessagesString("ghgInventory.emissionAlreadyUnvalidated", []),
                    HttpStatus.FORBIDDEN
                );
            }

            result[0].state = emissionValidateDto.state as GHGRecordState;

            const savedEmission = await this.entityManager
                .transaction(async (em) => {
                    return await em.save<EmissionEntity>(result[0]);
                })
                .catch((err: any) => {
                    console.log(err);
                    throw new HttpException(
                        this.helperService.formatReqMessagesString(
                            "emission.emissionVerificationActionFailed",
                            [err]
                        ),
                        HttpStatus.BAD_REQUEST
                    );
                });

            return { status: HttpStatus.OK, data: savedEmission };
        } else {
            return { status: HttpStatus.NOT_FOUND, data: emissionValidateDto.year };
        }
    }

    async getEmissionReportSummary() {
        const emissions = await this.emissionRepo
            .createQueryBuilder("emission_entity")
            .select(["year", "state"])
            .getRawMany();
            
        return emissions;
    }

    getEmissionByYear = async (year: string) => {

        if (!this.helperService.isValidYear(year)){
            throw new HttpException('Invalid Emission Year Received', HttpStatus.BAD_REQUEST);
        }

        return await this.emissionRepo.find({
            where: {
                year: year
            },
        });
    }

    private toEmission(emissionDto: EmissionDto): EmissionEntity {
        const data = instanceToPlain(emissionDto);
        data.state = GHGRecordState.SAVED;
        return plainToClass(EmissionEntity, data);
    }

    private verifyEmissionValues(emissionData: any) {
        const gasTypes = ['co2', 'ch4', 'n2o', 'co2eq'];
        for (let key in emissionData) {
          if (typeof emissionData[key] === 'object') {
            if (!this.verifyEmissionValues(emissionData[key])) {
              return false;
            }
          } else {
            // Check if the value is a number and positive
            if (gasTypes.includes(key)) {
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