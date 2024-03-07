import { PG_UNIQUE_VIOLATION } from '@drdgvhbh/postgres-error-codes';
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganisationDto } from '../dtos/organisation.dto';
import { QueryFailedError, Repository } from 'typeorm';
import { Organisation } from '../entities/organisation.entity';
import { OrganisationType } from '../enums/organisation.type.enum';
// import { QueryDto } from '@undp/carbon-services-lib';
// import { DataListResponseDto } from '@undp/carbon-services-lib';
// import { BasicResponseDto } from '@undp/carbon-services-lib';
// import { CompanyState } from '../enum/company.state.enum';
// import { HelperService } from '@undp/carbon-services-lib';
// import { FindOrganisationQueryDto } from '@undp/carbon-services-lib';
// import { ProgrammeLedgerService } from '@undp/carbon-services-lib';
import { OrganisationUpdateDto } from '../dtos/organisation.update.dto';
// import { DataResponseDto } from '@undp/carbon-services-lib';
// // import { ProgrammeTransfer } from '@undp/carbon-services-lib';
// import { TransferStatus } from '@undp/carbon-services-lib';
import { User } from '../entities/user.entity';
// import { EmailHelperService } from '@undp/carbon-services-lib';
// import { Programme } from '@undp/carbon-services-lib';
// import { EmailTemplates } from '@undp/carbon-services-lib';
// import { SystemActionType } from '@undp/carbon-services-lib';
// import { FileHandlerInterface } from '@undp/carbon-services-lib';
// import { CounterType } from '@undp/carbon-services-lib';
// import { CounterService } from '@undp/carbon-services-lib';
// import { FilterEntry } from '@undp/carbon-services-lib';
import { UserService } from '../user/user.service';
// import {
//   AsyncAction,
//   AsyncOperationsInterface,
//   DataResponseDto,
//   FileHandlerInterface,
// } from '@undp/carbon-services-lib';
// import { AsyncActionType } from '@undp/carbon-services-lib';
// import { LocationInterface } from '@undp/carbon-services-lib';
// import { DataExportQueryDto } from '@undp/carbon-services-lib';
// import { DataExportService } from "../util/data.export.service";
// import { DataExportCompanyDto } from "../dto/data.export.company.dto";
// import { SYSTEM_TYPE } from "../enum/system.names.enum";
// import { SectoralScope } from '@undp/carbon-services-lib';
// import { GovDepartment, ministryOrgs } from '@undp/carbon-services-lib';
// import { Ministry } from '@undp/carbon-services-lib';
// import { InvestmentDto } from '@undp/carbon-services-lib';
// import { plainToClass } from 'class-transformer';
// import { Investment } from '@undp/carbon-services-lib';
// import { InvestmentStatus } from '@undp/carbon-services-lib';
import { HelperService } from '../util/helpers.service';
import { CounterService } from '../util/counter.service';
import { HttpUtilService } from '../util/http.util.service';
import { QueryDto } from '../dtos/query.dto';
import { FilterEntry } from '../dtos/filter.entry';
import { DataListResponseDto } from '../dtos/data.list.response';
import { FindOrganisationQueryDto } from '../dtos/find.organisation.dto';
import { CounterType } from '../enums/counter.type.enum';
import { LocationInterface } from '../location/location.interface';
import { FileHandlerInterface } from '../file-handler/filehandler.interface';
import { DataResponseDto } from '../dtos/data.response.dto';
// import { InvestmentCategoryEnum } from '@undp/carbon-services-lib';
// import { InvestmentSyncDto } from '@undp/carbon-services-lib';
// import { HttpUtilService } from '@undp/carbon-services-lib';
// import { OrganisationDuplicateCheckDto } from "../dto/organisation.duplicate.check.dto";
// import { OrganisationSyncRequestDto } from '@undp/carbon-services-lib';

@Injectable()
export class OrganisationService {
  constructor(
    @InjectRepository(Organisation) private organisationRepo: Repository<Organisation>,
    private logger: Logger,
    private configService: ConfigService,
    private helperService: HelperService,
    // private programmeLedgerService: ProgrammeLedgerService,
    // @Inject(forwardRef(() => EmailHelperService))
    // private emailHelperService: EmailHelperService,
    // @InjectRepository(ProgrammeTransfer)
    // private programmeTransferRepo: Repository<ProgrammeTransfer>,
    private fileHandler: FileHandlerInterface,
    private counterService: CounterService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    // private asyncOperationsInterface: AsyncOperationsInterface,
    private locationService: LocationInterface,
    // @InjectRepository(Investment)
    // private investmentRepo: Repository<Investment>,
    // private dataExportService: DataExportService,
    private httpUtilService: HttpUtilService
  ) {}

  // async suspend(
  //   companyId: number,
  //   user: any,
  //   remarks: string,
  //   abilityCondition: string,
  // ): Promise<any> {
  //   this.logger.verbose('Suspend company', companyId);
  //   const company = await this.companyRepo
  //     .createQueryBuilder()
  //     .where(
  //       `"companyId" = '${companyId}' and state = '1' ${
  //         abilityCondition
  //           ? ' AND (' +
  //             this.helperService.parseMongoQueryToSQL(abilityCondition) +
  //             ')'
  //           : ''
  //       }`,
  //     )
  //     .getOne();
  //   if (!company) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         'company.noActiveCompany',
  //         [],
  //       ),
  //       HttpStatus.UNAUTHORIZED,
  //     );
  //   }
  //   const result = await this.companyRepo
  //     .update(
  //       {
  //         companyId: companyId,
  //       },
  //       {
  //         state: CompanyState.SUSPENDED,
  //         remarks: remarks,
  //       },
  //     )
  //     .catch((err: any) => {
  //       this.logger.error(err);
  //       return err;
  //     });

  //   if (result.affected > 0) {
  //     // TODO: Currently there can be unfreezed credits after company suspend if transactions failed
  //     if (company.companyRole === CompanyRole.PROGRAMME_DEVELOPER) {
  //       await this.programmeLedgerService.freezeCompany(
  //         companyId,
  //         this.getUserRefWithRemarks(user, `${remarks}#${company.name}`),
  //         true,
  //       );
  //       await this.companyTransferCancel(
  //         companyId,
  //         `${remarks}#${user.companyId}#${user.id}#${SystemActionType.SUSPEND_AUTO_CANCEL}#${company.name}#${user.companyName}`,
  //       );
  //       await this.emailHelperService.sendEmail(
  //         company.email,
  //         EmailTemplates.PROGRAMME_DEVELOPER_ORG_DEACTIVATION,
  //         {},
  //         user.companyId,
  //       );
  //     } else if (company.companyRole === CompanyRole.CERTIFIER) {
  //       await this.programmeLedgerService.revokeCompanyCertifications(
  //         companyId,
  //         this.getUserRefWithRemarks(
  //           user,
  //           `${remarks}#${SystemActionType.SUSPEND_REVOKE}#${company.name}`,
  //         ),
  //         async (programme: Programme) => {
  //           const hostAddress = this.configService.get('host');
  //           await this.emailHelperService.sendEmailToProgrammeOwnerAdmins(
  //             programme.programmeId,
  //             EmailTemplates.PROGRAMME_CERTIFICATION_REVOKE_BY_SYSTEM,
  //             {
  //               organisationName: company.name,
  //               programmeName: programme.title,
  //               credits: programme.creditBalance,
  //               serialNumber: programme.serialNo,
  //               pageLink:
  //                 hostAddress +
  //                 `/programmeManagement/view/${programme.programmeId}`,
  //             },
  //           );
  //         },
  //       );

  //       await this.emailHelperService.sendEmail(
  //         company.email,
  //         EmailTemplates.CERTIFIER_ORG_DEACTIVATION,
  //         {},
  //         user.companyId,
  //       );
  //     }
  //     return new BasicResponseDto(
  //       HttpStatus.OK,
  //       this.helperService.formatReqMessagesString(
  //         'company.suspendCompanySuccess',
  //         [],
  //       ),
  //     );
  //   }
  //   throw new HttpException(
  //     this.helperService.formatReqMessagesString('company.suspendFailed', []),
  //     HttpStatus.INTERNAL_SERVER_ERROR,
  //   );
  // }

  // async addNationalInvestment(
  //   req: InvestmentDto,
  //   requester: User,
  // ): Promise<any> {
  //   //validations
  //   this.logger.log(
  //     `National investment request by ${requester.companyId}-${
  //       requester.id
  //     } received ${JSON.stringify(req)}`,
  //   );
  //   //requester validations
  //   if (
  //     requester.companyRole !== CompanyRole.GOVERNMENT &&
  //     requester.companyRole != CompanyRole.MINISTRY &&
  //     requester.companyId !== req.toCompanyId
  //   ) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         'company.cannotAddNationalInvestmentOnOtherCompanies',
  //         [],
  //       ),
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   //to company validations
  //   const companyDetails = await this.findByCompanyId(req.toCompanyId);
  //   if (
  //     companyDetails &&
  //     companyDetails.companyRole !== CompanyRole.PROGRAMME_DEVELOPER
  //   ) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString('user.investerUserAuth', []),
  //       HttpStatus.FORBIDDEN,
  //     );
  //   }
  //   //add investment
  //   const investment = plainToClass(Investment, req);
  //   investment.toCompanyId = req.toCompanyId;
  //   investment.fromCompanyId = req.toCompanyId;
  //   investment.initiator = requester.id;
  //   investment.initiatorCompanyId = requester.companyId;
  //   investment.txTime = new Date().getTime();
  //   investment.createdTime = investment.txTime;
  //   investment.amount = Math.round(req.amount);
  //   investment.status = InvestmentStatus.APPROVED;
  //   investment.category = InvestmentCategoryEnum.National;
  //   investment.nationalInvestmentId = null
  //   const results = await this.investmentRepo
  //     .insert([investment])
  //     .catch((err: any) => {
  //       this.logger.error(err);
  //       return err;
  //     });
  //   investment.requestId = results.identifiers[0].requestId;
  //   investment.investmentName = `${companyDetails.name}_${
  //     req.instrument && req.instrument.length
  //       ? `${req.instrument.join('&')}_`
  //       : ''
  //   }${investment.requestId}`;
  //   const result = await this.investmentRepo
  //     .update(
  //       {
  //         requestId: investment.requestId,
  //       },
  //       {
  //         investmentName: investment.investmentName,
  //       },
  //     )
  //     .catch((err: any) => {
  //       this.logger.error(err);
  //       return err;
  //     });
  //   console.log('Investment', investment);
  //   //sync investment
  //   await this.asyncOperationsInterface.AddAction({
  //     actionType: AsyncActionType.NationalInvestment,
  //     actionProps: {
  //       investorTaxId: companyDetails.taxId,
  //       amount: investment.amount,
  //       requestId: investment.requestId,
  //       txRef: `${investment.requestId}#${investment.investmentName}`,
  //     },
  //   });
  //   if (this.configService.get('systemType') == SYSTEM_TYPE.CARBON_UNIFIED) {
  //     await this.programmeLedgerService.addCompanyInvestment(
  //       investment.requestId,
  //       investment.toCompanyId,
  //       investment.amount,
  //       `${investment.requestId}#${investment.investmentName}`,
  //     );
  //   }
  //   return new DataResponseDto(HttpStatus.OK, investment);
  // }

  // async addInvestmentOnLedger(investment: InvestmentSyncDto): Promise<any> {
  //   const compo = await this.findByTaxId(investment.investorTaxId);
  //   if (!compo) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         'programme.proponentTaxIdNotInSystem',
  //         [investment.investorTaxId],
  //       ),
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   const resp = await this.programmeLedgerService.addCompanyInvestment(
  //     investment.requestId,
  //     compo.companyId,
  //     investment.amount,
  //     investment.txRef,
  //   );
  //   return new DataResponseDto(HttpStatus.OK, resp);
  // }

  // async activate(
  //   companyId: number,
  //   user: User,
  //   remarks: string,
  //   abilityCondition: string,
  // ): Promise<any> {
  //   this.logger.verbose('revoke company', companyId);
  //   const company = await this.companyRepo
  //     .createQueryBuilder()
  //     .where(
  //       `"companyId" = '${companyId}' and state = '0' ${
  //         abilityCondition
  //           ? ' AND (' +
  //             this.helperService.parseMongoQueryToSQL(abilityCondition) +
  //             ')'
  //           : ''
  //       }`,
  //     )
  //     .getOne();
  //   if (!company) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         'company.noSuspendedCompany',
  //         [],
  //       ),
  //       HttpStatus.UNAUTHORIZED,
  //     );
  //   }
  //   const result = await this.companyRepo
  //     .update(
  //       {
  //         companyId: companyId,
  //       },
  //       {
  //         state: CompanyState.ACTIVE,
  //       },
  //     )
  //     .catch((err: any) => {
  //       this.logger.error(err);
  //       return err;
  //     });

  //   if (result.affected > 0) {
  //     await this.programmeLedgerService.freezeCompany(
  //       companyId,
  //       this.getUserRefWithRemarks(user, `${remarks}#${company.name}`),
  //       false,
  //     );
  //     await this.emailHelperService.sendEmail(
  //       company.email,
  //       EmailTemplates.ORG_REACTIVATION,
  //       {},
  //       user.companyId,
  //     );
  //     return new BasicResponseDto(
  //       HttpStatus.OK,
  //       this.helperService.formatReqMessagesString(
  //         'company.companyActivationSuccess',
  //         [],
  //       ),
  //     );
  //   }
  //   throw new HttpException(
  //     this.helperService.formatReqMessagesString(
  //       'company.companyActivationFailed',
  //       [],
  //     ),
  //     HttpStatus.INTERNAL_SERVER_ERROR,
  //   );
  // }

  // async approve(companyId: number, abilityCondition: string): Promise<any> {
  //   this.logger.verbose('approve company', companyId);
  //   const company = await this.companyRepo
  //     .createQueryBuilder()
  //     .where(
  //       `"companyId" = '${companyId}' and (state ='2' or  state ='3') ${
  //         abilityCondition
  //           ? ' AND (' +
  //             this.helperService.parseMongoQueryToSQL(abilityCondition) +
  //             ')'
  //           : ''
  //       }`,
  //     )
  //     .getOne();
  //   if (!company) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         'company.noPendingCompany',
  //         [],
  //       ),
  //       HttpStatus.UNAUTHORIZED,
  //     );
  //   }
  //   const result = await this.companyRepo
  //     .update(
  //       {
  //         companyId: companyId,
  //       },
  //       {
  //         state: CompanyState.ACTIVE,
  //       },
  //     )
  //     .catch((err: any) => {
  //       this.logger.error(err);
  //       return err;
  //     });

  //   if (result.affected > 0) {
  //     try {
  //       const hostAddress = this.configService.get('host');
  //       const res = await this.userService.approveUser(company);
  //       const templateData = {
  //         organisationName: company.name,
  //         countryName: this.configService.get('systemCountryName'),
  //         systemName: this.configService.get('systemName'),
  //         organisationRole:
  //           company.companyRole === CompanyRole.PROGRAMME_DEVELOPER
  //             ? 'Programme Developer'
  //             : company.companyRole,
  //         home: hostAddress,
  //       };

  //       const action: AsyncAction = {
  //         actionType: AsyncActionType.Email,
  //         actionProps: {
  //           emailType: EmailTemplates.ORGANISATION_CREATE.id,
  //           sender: company.email,
  //           subject: this.helperService.getEmailTemplateMessage(
  //             EmailTemplates.ORGANISATION_CREATE['subject'],
  //             templateData,
  //             true,
  //           ),
  //           emailBody: this.helperService.getEmailTemplateMessage(
  //             EmailTemplates.ORGANISATION_CREATE['html'],
  //             templateData,
  //             false,
  //           ),
  //         },
  //       };
  //       await this.asyncOperationsInterface.AddAction(action);
  //     } catch (error) {
  //       throw new HttpException(
  //         this.helperService.formatReqMessagesString(
  //           'company.companyApprovalFailed',
  //           [],
  //         ),
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     }
  //     return new BasicResponseDto(
  //       HttpStatus.OK,
  //       this.helperService.formatReqMessagesString(
  //         'company.companyApprovalSuccess',
  //         [],
  //       ),
  //     );
  //   }
  //   throw new HttpException(
  //     this.helperService.formatReqMessagesString(
  //       'company.companyApprovalFailed',
  //       [],
  //     ),
  //     HttpStatus.INTERNAL_SERVER_ERROR,
  //   );
  // }

  // async reject(
  //   companyId: number,
  //   user: User,
  //   remarks: string,
  //   abilityCondition: string,
  // ): Promise<any> {
  //   this.logger.verbose('approve company', companyId);
  //   const company = await this.companyRepo
  //     .createQueryBuilder()
  //     .where(
  //       `"companyId" = '${companyId}' and state = '2' ${
  //         abilityCondition
  //           ? ' AND (' +
  //             this.helperService.parseMongoQueryToSQL(abilityCondition) +
  //             ')'
  //           : ''
  //       }`,
  //     )
  //     .getOne();
  //   if (!company) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         'company.noPendingCompany',
  //         [],
  //       ),
  //       HttpStatus.UNAUTHORIZED,
  //     );
  //   }
  //   const result = await this.companyRepo
  //     .update(
  //       {
  //         companyId: companyId,
  //       },
  //       {
  //         state: CompanyState.REJECTED,
  //       },
  //     )
  //     .catch((err: any) => {
  //       this.logger.error(err);
  //       return err;
  //     });

  //   if (result.affected > 0) {
  //     const hostAddress = this.configService.get('host');
  //     const templateData = {
  //       name: company.name,
  //       countryName: this.configService.get('systemCountryName'),
  //       organisationRole:
  //         company.companyRole === CompanyRole.PROGRAMME_DEVELOPER
  //           ? 'Programme Developer'
  //           : company.companyRole,
  //       remarks: remarks,
  //       systemName: this.configService.get('systemName'),
  //       home: hostAddress,
  //     };

  //     const action: AsyncAction = {
  //       actionType: AsyncActionType.Email,
  //       actionProps: {
  //         emailType: EmailTemplates.ORGANISATION_REGISTRATION_REJECTED.id,
  //         sender: company.email,
  //         subject: this.helperService.getEmailTemplateMessage(
  //           EmailTemplates.ORGANISATION_REGISTRATION_REJECTED['subject'],
  //           templateData,
  //           true,
  //         ),
  //         emailBody: this.helperService.getEmailTemplateMessage(
  //           EmailTemplates.ORGANISATION_REGISTRATION_REJECTED['html'],
  //           templateData,
  //           false,
  //         ),
  //       },
  //     };
  //     await this.asyncOperationsInterface.AddAction(action);

  //     return new BasicResponseDto(
  //       HttpStatus.OK,
  //       this.helperService.formatReqMessagesString(
  //         'company.companyRejectionSuccess',
  //         [],
  //       ),
  //     );
  //   }
  //   throw new HttpException(
  //     this.helperService.formatReqMessagesString(
  //       'company.companyRejectionFailed',
  //       [],
  //     ),
  //     HttpStatus.INTERNAL_SERVER_ERROR,
  //   );
  // }

  async query(
    query: QueryDto,
    abilityCondition: string,
    companyRole: string,
  ): Promise<any> {
    let filterWithCompanyStatesIn: number[];

    // if (companyRole === OrganisationType.GOVERNMENT) {
    //   filterWithCompanyStatesIn = [0, 1, 2, 3];
    // } else {
    //   filterWithCompanyStatesIn = [0, 1];
    // }

    // if (query.filterAnd) {
    //   query.filterAnd.push({
    //     key: 'state',
    //     operation: 'in',
    //     value: filterWithCompanyStatesIn,
    //   });
    // } else {
    //   const filterAnd: FilterEntry[] = [];
    //   filterAnd.push({
    //     key: 'state',
    //     operation: 'in',
    //     value: filterWithCompanyStatesIn,
    //   });
    //   query.filterAnd = filterAnd;
    // }

    const resp = await this.organisationRepo
      .createQueryBuilder()
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
      )
      .offset(query.size * query.page - query.size)
      .limit(query.size)
      .getManyAndCount();

    return new DataListResponseDto(
      resp.length > 0 ? resp[0] : undefined,
      resp.length > 1 ? resp[1] : undefined,
    );
  }

  // async download(
  //   queryData: DataExportQueryDto,
  //   abilityCondition: string,
  //   companyRole: string,
  // ) {
  //   const queryDto = new QueryDto();
  //   queryDto.filterAnd = queryData.filterAnd;
  //   queryDto.filterOr = queryData.filterOr;
  //   queryDto.sort = queryData.sort;

  //   let filterWithCompanyStatesIn: number[];

  //   if (companyRole === CompanyRole.GOVERNMENT) {
  //     filterWithCompanyStatesIn = [0, 1, 2, 3];
  //   } else {
  //     filterWithCompanyStatesIn = [0, 1];
  //   }

  //   if (queryDto.filterAnd) {
  //     queryDto.filterAnd.push({
  //       key: 'state',
  //       operation: 'in',
  //       value: filterWithCompanyStatesIn,
  //     });
  //   } else {
  //     const filterAnd: FilterEntry[] = [];
  //     filterAnd.push({
  //       key: 'state',
  //       operation: 'in',
  //       value: filterWithCompanyStatesIn,
  //     });
  //     queryDto.filterAnd = filterAnd;
  //   }

  //   queryDto.filterAnd.push({
  //     key: 'companyRole',
  //     operation: '!=',
  //     value: 'API',
  //   });

  //   const resp = await this.companyRepo
  //     .createQueryBuilder()
  //     .where(
  //       this.helperService.generateWhereSQL(
  //         queryDto,
  //         this.helperService.parseMongoQueryToSQL(abilityCondition),
  //       ),
  //     )
  //     .orderBy(
  //       queryDto?.sort?.key && `"${queryDto?.sort?.key}"`,
  //       queryDto?.sort?.order,
  //       queryDto?.sort?.nullFirst !== undefined
  //         ? queryDto?.sort?.nullFirst === true
  //           ? 'NULLS FIRST'
  //           : 'NULLS LAST'
  //         : undefined,
  //     )
  //     .getMany();

  //   if (resp.length > 0) {
  //     const prepData = this.prepareCompanyDataForExport(resp);
  //     let headers: string[] = [];
  //     const titleKeys = Object.keys(prepData[0]);
  //     for (const key of titleKeys) {
  //       headers.push(
  //         this.helperService.formatReqMessagesString(
  //           'companyExport.' + key,
  //           [],
  //         ),
  //       );
  //     }
  //     const path = await this.dataExportService.generateCsv(
  //       prepData,
  //       headers,
  //       this.helperService.formatReqMessagesString(
  //         'companyExport.organisations',
  //         [],
  //       ),
  //     );
  //     return path;
  //   }

  //   throw new HttpException(
  //     this.helperService.formatReqMessagesString(
  //       'companyExport.nothingToExport',
  //       [],
  //     ),
  //     HttpStatus.BAD_REQUEST,
  //   );
  // }

  // private prepareCompanyDataForExport(companies: any) {
  //   const exportData: DataExportCompanyDto[] = [];

  //   for (const company of companies) {
  //     const dto = new DataExportCompanyDto();

  //     let orgSectoralScopeKey;
  //     if (company.sectoralScope && company.sectoralScope.length > 0) {
  //       orgSectoralScopeKey = company.sectoralScope
  //         .map((sectoralScope) => {
  //           return Object.keys(SectoralScope).find(
  //             (key) => SectoralScope[key] === sectoralScope,
  //           );
  //         })
  //         .join(', ');
  //     }

  //     const orgStateKey = Object.keys(CompanyState).find(
  //       (key) => CompanyState[key] === company.state,
  //     );

  //     const secondaryAccountBalanceLocal =
  //       (company.secondaryAccountBalance?.local?.total ?? 0) +
  //       (company.secondaryAccountBalance?.account?.total ?? 0);

  //     dto.companyId = company.companyId;
  //     dto.taxId = company.taxId;
  //     dto.paymentId = company.paymentId;
  //     dto.name = company.name;
  //     dto.email = company.email;
  //     dto.phoneNo = company.phoneNo;
  //     dto.website = company.website;
  //     dto.address = company.address;
  //     dto.country = company.country;
  //     dto.companyRole = company.companyRole;
  //     dto.state = orgStateKey;
  //     dto.creditBalance = company.creditBalance;
  //     dto.secondaryAccountBalanceLocal = secondaryAccountBalanceLocal
  //       ? secondaryAccountBalanceLocal
  //       : '';
  //     dto.secondaryAccountBalanceInternational =
  //       company.secondaryAccountBalance?.international?.total;
  //     dto.secondaryAccountBalanceOmge =
  //       company.secondaryAccountBalance?.omge?.total;
  //     dto.programmeCount = company.programmeCount;
  //     dto.lastUpdateVersion = company.lastUpdateVersion;
  //     dto.creditTxTime = this.helperService.formatTimestamp(
  //       company.creditTxTime,
  //     );
  //     dto.remarks = company.remarks;
  //     dto.createdTime = this.helperService.formatTimestamp(company.createdTime);
  //     dto.geographicalLocationCordintes = company.geographicalLocationCordintes;
  //     dto.regions = company.regions;
  //     dto.nameOfMinister = company.nameOfMinister;
  //     dto.sectoralScope = orgSectoralScopeKey;
  //     exportData.push(dto);
  //   }

  //   return exportData;
  // }

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

  // async findByTaxId(taxId: string): Promise<Company | undefined> {
  //   if (!taxId) {
  //     return null;
  //   }
  //   const companies = await this.companyRepo.find({
  //     where: {
  //       taxId: taxId,
  //     },
  //   });
  //   return companies && companies.length > 0 ? companies[0] : undefined;
  // }

  // async findMinistryByDepartment(govDep: GovDepartment): Promise<Company | undefined> {
  //   if (!govDep) {
  //     return null;
  //   }
  //   const companies = await this.companyRepo.find({
  //     where: {
  //       govDep: govDep,
  //     },
  //   });
  //   return companies && companies.length > 0 ? companies[0] : undefined;
  // }

  // async findMinByCountry(countryCode: string): Promise<Company | undefined> {
  //   const companies = await this.companyRepo.find({
  //     where: {
  //       country: countryCode,
  //       companyRole: CompanyRole.MINISTRY,
  //     },
  //   });
  //   return companies && companies.length > 0 ? companies[0] : undefined;
  // }

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

    if (organisationDto.logo && this.helperService.isBase64(organisationDto.logo)) {
      const response: any = await this.fileHandler.uploadFile(
        `profile_images/${organisationDto.organisationId}_${new Date().getTime()}.png`,
        organisationDto.logo
      );
      if (response) {
        organisationDto.logo = response;
        // if (process.env.ASYNC_OPERATIONS_TYPE === AsyncOperationType.Queue) {
        //   createdUserDto.company.logo = response;
        // }
      } else {
        throw new HttpException(
          this.helperService.formatReqMessagesString(
            "user.companyUpdateFailed",
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
                'company.companyTaxIdExist',
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

    // if (company.companyRole !== CompanyRole.GOVERNMENT && 
    //   company.companyRole !== CompanyRole.MINISTRY && 
    //   company.taxId !== companyUpdateDto.taxId) {
    //   throw new HttpException(
    //     this.helperService.formatReqMessagesString(
    //       'company.companyTaxIdCannotUpdate',
    //       [],
    //     ),
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    // if (
    //   company.companyRole == CompanyRole.MINISTRY ||
    //   company.companyRole == CompanyRole.GOVERNMENT
    // ) {
    //   const ministrykey =
    //     Object.keys(Ministry)[
    //       Object.values(Ministry).indexOf(companyUpdateDto.ministry as Ministry)
    //     ];
    //   if (
    //     !ministryOrgs[ministrykey].includes(
    //       Object.keys(GovDepartment)[
    //         Object.values(GovDepartment).indexOf(
    //           companyUpdateDto.govDep as GovDepartment,
    //         )
    //       ],
    //     )
    //   ) {
    //     throw new HttpException(
    //       this.helperService.formatReqMessagesString(
    //         'company.wrongMinistryAndGovDep',
    //         [],
    //       ),
    //       HttpStatus.BAD_REQUEST,
    //     );
    //   }
    // }
    // if (company.companyRole == CompanyRole.MINISTRY || company.companyRole == CompanyRole.GOVERNMENT){
    //   const ministry = await this.findMinistryByDepartment(
    //     companyUpdateDto.govDep
    //   );
    //   if (company.govDep!=companyUpdateDto.govDep && company.ministry!=companyUpdateDto.ministry && ministry && ministry.ministry==companyUpdateDto.ministry && ministry.govDep==companyUpdateDto.govDep) {
    //     throw new HttpException(
    //       this.helperService.formatReqMessagesString(
    //         "company.MinistryDepartmentAlreadyExist",
    //         []
    //       ),
    //       HttpStatus.BAD_REQUEST
    //     );
    //   }
    // }

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
    // if ((company.organisationType == CompanyRole.MINISTRY)){
    //   companyUpdateDto.taxId = "00000"+this.configService.get("systemCountry")+"-"+companyUpdateDto.ministry+"-"+companyUpdateDto.govDep
    // }
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
        // this.configService.get('systemType') !== SYSTEM_TYPE.CARBON_REGISTRY
        //   ? { ...companyUpdateFields, nationalSopValue }
          // : { ...companyUpdateFields },
      )
      .catch((err: any) => {
        this.logger.error(err);
        return err;
      });

    if (result.affected > 0) {

      // const organisationSyncRequestDto: OrganisationSyncRequestDto = {
      //   organizationIdentifierId: company.taxId,
      //   organisationUpdateDto: companyUpdateDto
      // }

      // const companySyncAction: AsyncAction = {
      //   actionType: AsyncActionType.CompanyUpdate,
      //   actionProps: organisationSyncRequestDto,
      // };
      // await this.asyncOperationsInterface.AddAction(
      //   companySyncAction
      // );

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

  // async sync(
  //   organisationSyncRequest: OrganisationSyncRequestDto,
  //   abilityCondition: string
  // ): Promise<DataResponseDto | undefined> {
  //   const {organizationIdentifierId, organisationUpdateDto:companyUpdateDto} = organisationSyncRequest;
  //   const company = await this.companyRepo
  //     .createQueryBuilder()
  //     .where(
  //       `"taxId" = '${organizationIdentifierId}' ${
  //         abilityCondition
  //           ? " AND (" +
  //             this.helperService.parseMongoQueryToSQL(abilityCondition) +
  //             ")"
  //           : ""
  //       }`
  //     )
  //     .getOne();
  //   if (!company) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         "company.noActiveCompany",
  //         []
  //       ),
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }

  //   if (companyUpdateDto.logo) {
  //     const response: any = await this.fileHandler.uploadFile(
  //       `profile_images/${
  //         company.companyId
  //       }_${new Date().getTime()}.png`,
  //       companyUpdateDto.logo
  //     );

  //     if (response) {
  //       companyUpdateDto.logo = response;
  //     } else {
  //       throw new HttpException(
  //         this.helperService.formatReqMessagesString(
  //           "company.companyUpdateFailed",
  //           []
  //         ),
  //         HttpStatus.INTERNAL_SERVER_ERROR
  //       );
  //     }
  //   }

  //   if(companyUpdateDto.regions){
  //     companyUpdateDto.geographicalLocationCordintes = await this.locationService
  //     .getCoordinatesForRegion(companyUpdateDto.regions)
  //     .then((response: any) => {
  //       console.log("response from forwardGeoCoding function -> ", response);
  //       return  [...response];
  //     });
  //   }

  //   const { nationalSopValue, ...companyUpdateFields } = companyUpdateDto;
  //   if (!companyUpdateFields.hasOwnProperty("website")) {
  //     companyUpdateFields["website"] = "";
  //   }
  //   const result = await this.companyRepo
  //     .update(
  //       {
  //         taxId: company.taxId,
  //       },
  //       this.configService.get('systemType')!==SYSTEM_TYPE.CARBON_REGISTRY?{...companyUpdateFields,nationalSopValue}:{...companyUpdateFields}
  //     )
  //     .catch((err: any) => {
  //       this.logger.error(err);
  //       return err;
  //     });

  //   if (result.affected > 0) {
  //     return new DataResponseDto(
  //       HttpStatus.OK,
  //       await this.findByCompanyId(company.companyId),
  //     );
  //   }

  //   throw new HttpException(
  //     this.helperService.formatReqMessagesString(
  //       'company.companyUpdateFailed',
  //       [],
  //     ),
  //     HttpStatus.INTERNAL_SERVER_ERROR,
  //   );
  // }

  // async companyTransferCancel(companyId: number, remark: string) {
  //   await this.programmeTransferRepo
  //     .createQueryBuilder()
  //     .update(ProgrammeTransfer)
  //     .set({
  //       status: TransferStatus.CANCELLED,
  //       txRef: remark,
  //       txTime: new Date().getTime(),
  //     })
  //     .where(
  //       '(fromCompanyId = :companyId OR toCompanyId = :companyId) AND status = :status',
  //       {
  //         companyId: companyId,
  //         status: TransferStatus.PENDING,
  //       },
  //     )
  //     .execute()
  //     .catch((err: any) => {
  //       this.logger.error(err);
  //       return err;
  //     });
  // }

  // private getUserRefWithRemarks = (user: any, remarks: string) => {
  //   return `${user.companyId}#${user.companyName}#${user.id}#${remarks}`;
  // };

  // async increaseProgrammeCount(companyId: any) {
  //   const companyDetails = await this.findByCompanyId(companyId);
  //   const programmeCount = Number(companyDetails.programmeCount) + 1;

  //   const response = await this.companyRepo
  //     .update(
  //       {
  //         companyId: parseInt(companyId),
  //       },
  //       {
  //         programmeCount: programmeCount,
  //       },
  //     )
  //     .catch((err: any) => {
  //       this.logger.error(err);
  //       return err;
  //     });

  //   return response;
  // }

  // async getSectoralScopeMinistry(sectorId: any) {
  //   const resp = await this.companyRepo
  //     .createQueryBuilder()
  //     .where(
  //       `"companyRole" = 'Ministry' AND :sectorId = ANY("sectoralScope")`,
  //       {
  //         sectorId: sectorId,
  //       },
  //     )
  //     .getMany();

  //   return resp;
  // }

  // async getMinistries() {
  //   const result = await this.companyRepo
  //     .createQueryBuilder('company')
  //     .where(
  //       'company.companyRole= :companyRole AND company.state= :activeState',
  //       {
  //         companyRole: CompanyRole.MINISTRY,
  //         activeState: CompanyState.ACTIVE,
  //       },
  //     )
  //     .select(['company.name', 'company.companyId'])
  //     .getRawMany();

  //   return result;
  // }

  // public async checkCompanyExistOnOtherSystem(
  //   organisationDuplicateCheckDto: OrganisationDuplicateCheckDto
  // ) {
  //   console.log('check if organisation already exist in other system with taxId, paymentId or email', organisationDuplicateCheckDto)
  //   const resp = await this.httpUtilService.sendHttp("/national/organisation/exists", organisationDuplicateCheckDto);
  //   if (typeof resp === 'boolean') {
  //     return resp;
  //   } else {
  //     console.log('Successfully requested and response received for ', organisationDuplicateCheckDto);
  //     return resp.data;
  //   }
  // }

  // async findCompanyByTaxIdPaymentIdOrEmail(
  //   orgDuplicateCheckDto: OrganisationDuplicateCheckDto
  // ): Promise<Company | undefined> {
  //   console.log("INSIDE findCompanyByTaxIdPaymentIdOrEmail", orgDuplicateCheckDto.taxId, orgDuplicateCheckDto.paymentId, orgDuplicateCheckDto.email);
  //   const company = await this.companyRepo.createQueryBuilder('company')
  //     .where('company.taxId = :taxId OR company.paymentId = :paymentId OR company.email = :email', {
  //       taxId: orgDuplicateCheckDto.taxId,
  //       paymentId: orgDuplicateCheckDto.paymentId,
  //       email: orgDuplicateCheckDto.email
  //     })
  //     .getOne();
  //   console.log("INSIDE findCompanyByTaxIdPaymentIdOrEmail company", company);
  //   return company;
  // }
  
  // async checkForCompanyDuplicates(email: any, taxId: any, paymentId: any) {
  //   const companies = await this.companyRepo.find({
  //     where: [
  //       { email: email },
  //       { taxId: taxId },
  //       { paymentId: paymentId }
  //     ]
  //   });

  //   return companies && companies.length > 0 ? companies[0] : undefined;
  // }
}
