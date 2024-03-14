import { PG_UNIQUE_VIOLATION } from '@drdgvhbh/postgres-error-codes';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganisationDto } from '../dtos/organisation.dto';
import { QueryFailedError, Repository } from 'typeorm';
import { Organisation } from '../entities/organisation.entity';
import { OrganisationType } from '../enums/organisation.type.enum';
import { OrganisationUpdateDto } from '../dtos/organisation.update.dto';
import { HelperService } from '../util/helpers.service';
import { CounterService } from '../util/counter.service';
import { QueryDto } from '../dtos/query.dto';
import { FilterEntry } from '../dtos/filter.entry';
import { DataListResponseDto } from '../dtos/data.list.response';
import { FindOrganisationQueryDto } from '../dtos/find.organisation.dto';
import { CounterType } from '../enums/counter.type.enum';
import { LocationInterface } from '../location/location.interface';
import { FileHandlerInterface } from '../file-handler/filehandler.interface';
import { DataResponseDto } from '../dtos/data.response.dto';

@Injectable()
export class OrganisationService {
  constructor(
    @InjectRepository(Organisation) private organisationRepo: Repository<Organisation>,
    private logger: Logger,
    private configService: ConfigService,
    private helperService: HelperService,
    private fileHandler: FileHandlerInterface,
    private counterService: CounterService,
    private locationService: LocationInterface  ) {}

  async query(
    query: QueryDto,
    abilityCondition: string,
    companyRole: string,
  ): Promise<any> {
    const queryBuilder = this.organisationRepo.createQueryBuilder()
      .where(
        this.helperService.generateWhereSQL(
          query,
          this.helperService.parseMongoQueryToSQL(abilityCondition),
        ),
      )
      .orderBy(
        query?.sort?.key && `"${query?.sort?.key}"`,
        query?.sort?.order,
        query?.sort?.nullFirst !== undefined
          ? query?.sort?.nullFirst === true
            ? 'NULLS FIRST'
            : 'NULLS LAST'
          : undefined,
      );

    if (query.size && query.page) {
      queryBuilder.offset(query.size * query.page - query.size)
        .limit(query.size);
    }

    const resp = await queryBuilder.getManyAndCount();

    return new DataListResponseDto(
      resp.length > 0 ? resp[0] : undefined,
      resp.length > 1 ? resp[1] : undefined,
    );
  }

  async queryNames(query: QueryDto, abilityCondition: string): Promise<any> {
    if (query.filterAnd) {
      query.filterAnd.push({
        key: 'state',
        operation: 'in',
        value: [1],
      });
    } else {
      const filterAnd: FilterEntry[] = [];
      filterAnd.push({
        key: 'state',
        operation: 'in',
        value: [1],
      });
      query.filterAnd = filterAnd;
    }

    const resp = await this.organisationRepo
      .createQueryBuilder()
      .select(['"organisationId"', '"name"', '"organisationType"'])
      .where(
        this.helperService.generateWhereSQL(
          query,
          this.helperService.parseMongoQueryToSQL(abilityCondition),
        ),
      )
      .orderBy(query?.sort?.key && `"${query?.sort?.key}"`, query?.sort?.order)
      .offset(query.size * query.page - query.size)
      .limit(query.size)
      .getRawMany();
    return new DataListResponseDto(resp, undefined);
  }

  async findByCompanyId(organisationId: number): Promise<Organisation | undefined> {
    const organisations = await this.organisationRepo.find({
      where: {
        organisationId: organisationId,
      }
    });
    return organisations && organisations.length > 0 ? organisations[0] : undefined;
  }

  async findByCompanyIds(
    req: FindOrganisationQueryDto,
  ): Promise<Organisation[] | undefined> {
    const data: Organisation[] = [];

    if (!(req.companyIds instanceof Array)) {
      throw new HttpException('Invalid companyId list', HttpStatus.BAD_REQUEST);
    }
    for (let i = 0; i < req.companyIds.length; i++) {
      const companies = await this.organisationRepo.find({
        where: {
          organisationId: req.companyIds[i],
        },
      });
      data.push(companies[0]);
    }
    return data && data.length > 0 ? data : undefined;
  }

  async findGovByCountry(countryCode: string): Promise<Organisation | undefined> {
    const companies = await this.organisationRepo.find({
      where: {
        country: countryCode,
        organisationType: OrganisationType.GOVERNMENT,
      },
    });
    return companies && companies.length > 0 ? companies[0] : undefined;
  }

  async create(
    organisationDto: OrganisationDto, isInitData?: boolean): Promise<Organisation | undefined> {
    this.logger.verbose('Company create received', organisationDto.email);

    if (!isInitData && organisationDto.organisationType != OrganisationType.DEPARTMENT) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          'company.canOnlyCreateDepartments',
          [],
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (organisationDto.organisationType == OrganisationType.GOVERNMENT) {
      const companyGov = await this.findGovByCountry(
        organisationDto.country
      );
      if (companyGov) {
        throw new HttpException(
          this.helperService.formatReqMessagesString(
            "user.governmentUserAlreadyExist",
            [organisationDto.country]
          ),
          HttpStatus.BAD_REQUEST
        );
      }
    }

    if (!organisationDto.organisationId) {
      organisationDto.organisationId = parseInt(
        await this.counterService.incrementCount(CounterType.COMPANY, 3),
      );
    }

    organisationDto.country = this.configService.get("systemCountry");

    if (organisationDto.logo && this.helperService.isBase64(organisationDto.logo)) {
      const response: any = await this.fileHandler.uploadFile(
        `profile_images/${organisationDto.organisationId}_${new Date().getTime()}.png`,
        organisationDto.logo
      );
      if (response) {
        organisationDto.logo = response;
      } else {
        throw new HttpException(
          this.helperService.formatReqMessagesString(
            "user.companyLogoUploadFailed",
            []
          ),
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }

    return await this.organisationRepo.save(organisationDto).catch((err: any) => {
      if (err instanceof QueryFailedError) {
        switch (err.driverError.code) {
          case PG_UNIQUE_VIOLATION:
            throw new HttpException(
              this.helperService.formatReqMessagesString(
                'company.companyExist',
                [],
              ),
              HttpStatus.BAD_REQUEST,
            );
        }
      }
      return err;
    });
  }

  async update(
    organisationUpdateDto: OrganisationUpdateDto,
    abilityCondition: string,
  ): Promise<DataResponseDto | undefined> {
    const organisation = await this.organisationRepo
      .createQueryBuilder()
      .where(
        `"organisationId" = '${organisationUpdateDto.organisationId}' ${
          abilityCondition
            ? ' AND (' +
              this.helperService.parseMongoQueryToSQL(abilityCondition) +
              ')'
            : ''
        }`,
      )
      .getOne();
    if (!organisation) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          'company.noActiveCompany',
          [],
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (organisationUpdateDto.organisationType !== organisation.organisationType) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          'company.orgTypeCannotBeUpdated',
          [],
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (organisationUpdateDto.logo) {
      const response: any = await this.fileHandler.uploadFile(
        `profile_images/${
          organisationUpdateDto.organisationId
        }_${new Date().getTime()}.png`,
        organisationUpdateDto.logo,
      );

      if (response) {
        organisationUpdateDto.logo = response;
      } else {
        throw new HttpException(
          this.helperService.formatReqMessagesString(
            'company.companyUpdateFailed',
            [],
          ),
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    if (organisationUpdateDto.regions) {
      organisationUpdateDto.geographicalLocationCordintes =
        await this.locationService
          .getCoordinatesForRegion(organisationUpdateDto.regions)
          .then((response: any) => {
            console.log(
              'response from forwardGeoCoding function -> ',
              response,
            );
            return [...response];
          });
    }
    const { ...companyUpdateFields } = organisationUpdateDto;
    if (!companyUpdateFields.hasOwnProperty("website")) {
      companyUpdateFields["website"] = "";
    }
    const result = await this.organisationRepo
      .update(
        {
          organisationId: organisation.organisationId,
        },
        { ...companyUpdateFields }
      )
      .catch((err: any) => {
        this.logger.error(err);
        return err;
      });

    if (result.affected > 0) {
      return new DataResponseDto(
        HttpStatus.OK,
        await this.findByCompanyId(organisation.organisationId)
      );
    }

    throw new HttpException(
      this.helperService.formatReqMessagesString(
        "company.companyUpdateFailed",
        []
      ),
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  
  async increaseUserCount(organisationId: any) {
    const organisationDetails = await this.findByCompanyId(organisationId);
    const userCount = Number(organisationDetails.userCount) + 1;

    const response = await this.organisationRepo
      .update(
        {
          organisationId: parseInt(organisationId),
        },
        {
          userCount: userCount,
        },
      )
      .catch((err: any) => {
        this.logger.error(err);
        return err;
      });

    return response;
  }

  
}
