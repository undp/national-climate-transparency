import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { instanceToPlain, plainToClass } from "class-transformer";
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EmissionEntity } from 'src/entities/emission.entity';
import { HelperService } from 'src/util/helpers.service';
import { FileHandlerInterface } from 'src/file-handler/filehandler.interface';
import { EmissionDto } from 'src/dtos/emission.dto';
import { User } from 'src/entities/user.entity';
import { Role } from 'src/casl/role.enum';
import { GHGEmissionRecordState } from 'src/enums/ghg.emission.state.enum';

@Injectable()
export class GhgEmissionsService {

    constructor(
        private logger: Logger,
        @InjectEntityManager() private entityManager: EntityManager,
        @InjectRepository(EmissionEntity) private emissionRepo: Repository<EmissionEntity>,
        private helperService: HelperService,
        private fileHandler: FileHandlerInterface,
    ) { };

    async create(emissionDto: EmissionDto, user: User) {
        if (user.role === Role.Observer) {
            throw new HttpException(
                this.helperService.formatReqMessagesString("user.userUnAUth", []),
                HttpStatus.FORBIDDEN
            );
        }

        const emission: EmissionEntity = this.toEmission(emissionDto);
        this.verifyEmissionValues(emission);

        let savedEmission: EmissionEntity;
        const result = await this.getEmissionByYear(emission.year);

        if (result && result.length > 0) {
            if (result[0].state === GHGEmissionRecordState.FINALIZED) {
                throw new HttpException(
                    this.helperService.formatReqMessagesString("ghgInventory.cannotEditEmissionFinalized", []),
                    HttpStatus.FORBIDDEN
                );
            }

            emission.id = result[0]?.id;
            if (emissionDto.emissionDocument) {
                emission.emissionDocument = await this.uploadDocument(
                    emissionDto.year,
                    emissionDto.emissionDocument
                );
            }

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
                            emissionDocument: emission.emissionDocument,
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

        if (emissionDto.emissionDocument) {
            emission.emissionDocument = await this.uploadDocument(
                emissionDto.year,
                emissionDto.emissionDocument

            );
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

    async getEmissionReportSummary() {
        const emissions = await this.emissionRepo
            .createQueryBuilder("emission_entity")
            .select(["year", "state"])
            .getRawMany();
            
        return emissions;
    }

    getEmissionByYear = async (year: string) => {
        return await this.emissionRepo.find({
            where: {
                year: year
            },
        });
    }

    private toEmission(emissionDto: EmissionDto): EmissionEntity {
        const data = instanceToPlain(emissionDto);
        this.logger.verbose("Converted emissionDto to Emission entity", JSON.stringify(data));
        return plainToClass(EmissionEntity, data);
    }

    private fileExtensionMap = new Map([
        ["vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"],
        ["vnd.ms-excel", "xls"],
    ]);

    getFileExtension = (file: string): string => {
        let fileType = file.split(';')[0].split('/')[1];
        fileType = this.fileExtensionMap.get(fileType);
        return fileType;
    }

    async uploadDocument(year: string, data: string) {
        let filetype;
        try {
            filetype = this.getFileExtension(data);
            data = data.split(',')[1];
            if (filetype == undefined) {
                throw new HttpException(
                    this.helperService.formatReqMessagesString(
                        "programme.invalidDocumentUpload",
                        []
                    ),
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
        catch (Exception: any) {
            throw new HttpException(
                this.helperService.formatReqMessagesString(
                    "programme.invalidDocumentUpload",
                    []
                ),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        // Get the current date and time
        const currentDate = new Date();

        const response: any = await this.fileHandler.uploadFile(
            `documents/${year}_${currentDate.getTime()}.${filetype}`,
            data
        );
        if (response) {
            return response;
        } else {
            throw new HttpException(
                this.helperService.formatReqMessagesString(
                    "programme.docUploadFailed",
                    []
                ),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
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