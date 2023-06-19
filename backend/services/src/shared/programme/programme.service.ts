import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  forwardRef,
} from "@nestjs/common";
import { ProgrammeDto } from "../dto/programme.dto";
import { Programme } from "../entities/programme.entity";
import { instanceToPlain, plainToClass } from "class-transformer";
import { ProgrammeStage } from "../enum/programme-status.enum";
import { QueryDto } from "../dto/query.dto";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { EntityManager, QueryFailedError, Repository } from "typeorm";
import { PrimaryGeneratedColumnType } from "typeorm/driver/types/ColumnTypes";
import { CounterService } from "../util/counter.service";
import { CounterType } from "../util/counter.type.enum";
import { ConstantEntity } from "../entities/constants.entity";
import { DataResponseDto } from "../dto/data.response.dto";
import { ConstantUpdateDto } from "../dto/constants.update.dto";
import { DataListResponseDto } from "../dto/data.list.response";
import { ConfigService } from "@nestjs/config";
import { TypeOfMitigation } from "../enum/typeofmitigation.enum";
import { CompanyService } from "../company/company.service";
import { EmailTemplates } from "../email-helper/email.template";
import { HelperService } from "../util/helpers.service";
import { CompanyRole } from "../enum/company.role.enum";
import { ProgrammeQueryEntity } from "../entities/programme.view.entity";
import { EmailHelperService } from "../email-helper/email-helper.service";
import { UserService } from "../user/user.service";
import { CountryService } from "../util/country.service";
import { LocationInterface } from "../location/location.interface";
import {
  AgricultureConstants,
  AgricultureCreationRequest,
  SolarConstants,
  SolarCreationRequest,
  calculateCredit,
} from "@undp/carbon-credit-calculator";
import { NDCActionDto } from "../dto/ndc.action.dto";
import { NDCAction } from "../entities/ndc.action.entity";
import { ProgrammeDocument } from "../entities/programme.document";
import { FileHandlerInterface } from "../file-handler/filehandler.interface";
import { DocType } from "../enum/document.type";
import { DocumentStatus } from "../enum/document.status";
import {
  AsyncAction,
  AsyncOperationsInterface,
} from "../async-operations/async-operations.interface";
import { AsyncActionType } from "../enum/async.action.type.enum";
import { ProgrammeDocumentDto } from "../dto/programme.document.dto";
import { DocumentAction } from "../dto/document.action";
import { NDCActionType } from "../enum/ndc.action.enum";
import { ProgrammeAuth } from "../dto/programme.approve";
import { ProgrammeIssue } from "../dto/programme.issue";
import { BasicResponseDto } from "../dto/basic.response.dto";
import { ProgrammeReject } from "../dto/programme.reject";
import { NDCStatus } from "../enum/ndc.status";
import { NDCActionViewEntity } from "../entities/ndc.view.entity";
import { InvestmentRequestDto } from "../dto/investment.request.dto";
import { User } from "../entities/user.entity";
import { Investment } from "../entities/investment.entity";
import { InvestmentStatus } from "../enum/investment.status";
import { InvestmentApprove } from "../dto/investment.approve";
import { InvestmentReject } from "../dto/investment.reject";
import { InvestmentCancel } from "../dto/investment.cancel";
import { InvestmentView } from "../entities/investment.view.entity";
import { ProgrammeDocumentViewEntity } from "../entities/document.view.entity";

export declare function PrimaryGeneratedColumn(
  options: PrimaryGeneratedColumnType
): Function;

@Injectable()
export class ProgrammeService {

  private userNameCache: any = {};

  constructor(
    private counterService: CounterService,
    private configService: ConfigService,

    @Inject(forwardRef(() => CompanyService))
    private companyService: CompanyService,

    @Inject(forwardRef(() => UserService))
    private userService: UserService,

    private locationService: LocationInterface,
    private fileHandler: FileHandlerInterface,
    private helperService: HelperService,
    @Inject(forwardRef(() => EmailHelperService))
    private emailHelperService: EmailHelperService,

    private readonly countryService: CountryService,
    @InjectRepository(Programme) private programmeRepo: Repository<Programme>,
    @InjectRepository(ProgrammeQueryEntity)
    private programmeViewRepo: Repository<ProgrammeQueryEntity>,
    @InjectRepository(NDCAction) private ndcActionRepo: Repository<NDCAction>,
    @InjectRepository(NDCActionViewEntity)
    private ndcActionViewRepo: Repository<NDCActionViewEntity>,
    @InjectRepository(ProgrammeDocument)
    private documentRepo: Repository<ProgrammeDocument>,
    @InjectRepository(ProgrammeDocumentViewEntity)
    private documentViewRepo: Repository<ProgrammeDocumentViewEntity>,

    @InjectRepository(ConstantEntity)
    private constantRepo: Repository<ConstantEntity>,

    @InjectRepository(Investment)
    private investmentRepo: Repository<Investment>,
    @InjectRepository(InvestmentView)
    private investmentViewRepo: Repository<InvestmentView>,

    private asyncOperationsInterface: AsyncOperationsInterface,
    @InjectEntityManager() private entityManager: EntityManager,
    private logger: Logger
  ) {}

  private toProgramme(programmeDto: ProgrammeDto): Programme {
    const data = instanceToPlain(programmeDto);
    this.logger.verbose("Converted programme", JSON.stringify(data));
    return plainToClass(Programme, data);
  }


  private async doTransfer(
    transfer: Investment,
    user: string,
    programme: Programme
  ) {
   
    const companyIndex = programme.companyId.indexOf(transfer.fromCompanyId);

    // Cannot be <= 0 
    programme.creditOwnerPercentage[companyIndex] -= transfer.percentage
    programme.creditOwnerPercentage.push(transfer.percentage);

    programme.proponentPercentage[companyIndex] -= transfer.percentage
    programme.proponentPercentage.push(transfer.percentage);

    programme.companyId.push(Number(transfer.toCompanyId));

    const savedProgramme = await this.entityManager
      .transaction(async (em) => {
        await em.update(
          Investment,
          {
            requestId: transfer.requestId
          }, {
            status: InvestmentStatus.APPROVED,
            txTime: new Date().getTime()
          }
        )
        return await em.update(
          Programme,
          {
            programmeId: programme.programmeId,
          },
          {
            creditOwnerPercentage: programme.creditOwnerPercentage,
            proponentPercentage: programme.proponentPercentage,
            companyId: programme.companyId,
            txTime: new Date().getTime(),
          }
        );
      })
      .catch((err: any) => {
        console.log(err);
        if (err instanceof QueryFailedError) {
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        } else {
          this.logger.error(`Programme add error ${err}`);
        }
        return err;
      });

    if (savedProgramme.affected > 0) {
      return new DataResponseDto(HttpStatus.OK, programme);
    }

    throw new HttpException(
      this.helperService.formatReqMessagesString(
        "programme.internalErrorStatusUpdating",
        []
      ),
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
  
  async addInvestment(req: InvestmentRequestDto, requester: User) {
    this.logger.log(
      `Programme investment request by ${requester.companyId}-${
        requester.id
      } received ${JSON.stringify(req)}`
    );

    if (
      req.percentage &&
      req.percentage.reduce((a, b) => a + b, 0) <= 0
    ) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.percentage>0",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    if (req.fromCompanyIds.length > 1) {
      if (!req.percentage) {
        throw new HttpException(
          this.helperService.formatReqMessagesString(
            "programme.percentagesNeedsToDefineForMultipleComp",
            []
          ),
          HttpStatus.BAD_REQUEST
        );
      } else if (req.fromCompanyIds.length != req.percentage.length) {
        throw new HttpException(
          this.helperService.formatReqMessagesString(
            "programme.invalidCompPercentageForGivenComp",
            []
          ),
          HttpStatus.BAD_REQUEST
        );
      }
    }

    if (
      req.fromCompanyIds &&
      req.percentage &&
      req.fromCompanyIds.length != req.percentage.length
    ) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.invalidCompPercentageForGivenComp",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    const indexTo = req.fromCompanyIds.indexOf(req.toCompanyId);
    if (indexTo >= 0 && req.percentage[indexTo] > 0) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.cantTransferCreditWithinSameComp",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    const programme = await this.findById(req.programmeId);

    if (!programme) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.programmeNotExist",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }
    this.logger.verbose(`Investment on programme ${JSON.stringify(programme)}`);

    if (
      requester.companyRole != CompanyRole.GOVERNMENT &&
      ![...req.fromCompanyIds, req.toCompanyId].includes(requester.companyId)
    ) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.cantInitiateTransferForOtherComp",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    if (!req.fromCompanyIds) {
      req.fromCompanyIds = programme.companyId;
    }
    if (!programme.creditOwnerPercentage) {
      programme.creditOwnerPercentage = [100];
    }

    if (!programme.proponentPercentage) {
      programme.proponentPercentage = [100];
    }

    const requestedCompany = await this.companyService.findByCompanyId(
      requester.companyId
    );

    const allInvestmentList: Investment[] = [];
    const autoApproveInvestmentList: Investment[] = [];

    const hostAddress = this.configService.get("host");

    const ownershipMap = {};
    const propPerMap = {}

    for (const i in programme.companyId) {
      ownershipMap[programme.companyId[i]] = programme.creditOwnerPercentage[i];
      propPerMap[programme.companyId[i]] = programme.proponentPercentage[i];
    }

    programme.companyId = programme.companyId.map(c => Number(c))
    const fromCompanyListMap = {};

    const percSum = req.percentage.reduce((a, b) => a + b, 0)
    for (const j in req.fromCompanyIds) {
      const fromCompanyId = req.fromCompanyIds[j];
      this.logger.log(
        `Transfer request from ${fromCompanyId} to programme owned by ${programme.companyId}`
      );
      const fromCompany = await this.companyService.findByCompanyId(
        fromCompanyId
      );
      fromCompanyListMap[fromCompanyId] = fromCompany;

      if (programme.companyId.indexOf(fromCompanyId) < 0) {
        throw new HttpException(
          this.helperService.formatReqMessagesString(
            "programme.fromCompInReqIsNotOwnerOfProgramme",
            []
          ),
          HttpStatus.BAD_REQUEST
        );
      }

      if (!ownershipMap[fromCompanyId] || ownershipMap[fromCompanyId] < req.percentage[j] || !propPerMap[fromCompanyId] || propPerMap[fromCompanyId] < req.percentage) {
        throw new HttpException(
          this.helperService.formatReqMessagesString(
            "programme.invalidCompPercentageForGivenComp",
            []
          ),
          HttpStatus.BAD_REQUEST
        );
      }

      const investment = plainToClass(Investment, req);
      investment.programmeId = req.programmeId;
      investment.fromCompanyId = fromCompanyId;
      investment.toCompanyId = req.toCompanyId;
      investment.initiator = requester.id;
      investment.initiatorCompanyId = requester.companyId;
      investment.txTime = new Date().getTime();
      investment.createdTime = investment.txTime;
      investment.percentage = req.percentage[j];
      investment.amount = Math.round(req.amount * req.percentage[j]/percSum)
      investment.status = InvestmentStatus.PENDING;
      if (requester.companyId == fromCompanyId) {
        autoApproveInvestmentList.push(investment);
      }
      allInvestmentList.push(investment);
    }
    const results = await this.investmentRepo.insert(allInvestmentList);
    console.log(results);
    for (const i in allInvestmentList) {
      allInvestmentList[i].requestId = results.identifiers[i].requestId;
    }

    let updateProgramme = undefined;
    for (const trf of autoApproveInvestmentList) {
      this.logger.log(`Investment send received ${trf}`);
      const toCompany = await this.companyService.findByCompanyId(
        trf.toCompanyId
      );
      console.log("To Company", toCompany);
      updateProgramme = (
        await this.doTransfer(
          trf,
          `${this.getUserRef(requester)}#${toCompany.companyId}#${
            toCompany.name
          }#${fromCompanyListMap[trf.fromCompanyId].companyId}#${
            fromCompanyListMap[trf.fromCompanyId].name
          }`,
          programme
        )
      ).data;
      // await this.emailHelperService.sendEmailToOrganisationAdmins(
      //   trf.toCompanyId,
      //   EmailTemplates.CREDIT_SEND_DEVELOPER,
      //   {
      //     organisationName: requestedCompany.name,
      //     credits: trf.creditAmount,
      //     programmeName: programme.title,
      //     serialNumber: programme.serialNo,
      //     pageLink: hostAddress + "/creditTransfers/viewAll",
      //   }
      // );
    }
    if (updateProgramme) {
      return new DataResponseDto(HttpStatus.OK, updateProgramme);
    }

    // allInvestmentList.forEach(async (transfer) => {
    //   if (requester.companyRole === CompanyRole.GOVERNMENT) {
    //     if (transfer.toCompanyId === requester.companyId) {
    //       await this.emailHelperService.sendEmailToOrganisationAdmins(
    //         transfer.fromCompanyId,
    //         EmailTemplates.CREDIT_TRANSFER_REQUISITIONS,
    //         {
    //           organisationName: requestedCompany.name,
    //           credits: transfer.creditAmount,
    //           programmeName: programme.title,
    //           serialNumber: programme.serialNo,
    //           pageLink: hostAddress + "/creditTransfers/viewAll",
    //         }
    //       );
    //     } else {
    //       await this.emailHelperService.sendEmailToOrganisationAdmins(
    //         transfer.fromCompanyId,
    //         EmailTemplates.CREDIT_TRANSFER_GOV,
    //         {
    //           credits: transfer.creditAmount,
    //           programmeName: programme.title,
    //           serialNumber: programme.serialNo,
    //           pageLink: hostAddress + "/creditTransfers/viewAll",
    //           government: requestedCompany.name,
    //         },
    //         transfer.toCompanyId
    //       );
    //     }
    //   } else if (requester.companyId != transfer.fromCompanyId) {
    //     await this.emailHelperService.sendEmailToOrganisationAdmins(
    //       transfer.fromCompanyId,
    //       EmailTemplates.CREDIT_TRANSFER_REQUISITIONS,
    //       {
    //         organisationName: requestedCompany.name,
    //         credits: transfer.creditAmount,
    //         programmeName: programme.title,
    //         serialNumber: programme.serialNo,
    //         pageLink: hostAddress + "/creditTransfers/viewAll",
    //       }
    //     );
    //   }
    // });

    return new DataListResponseDto(allInvestmentList, allInvestmentList.length);
  }

  private async getCreditRequest(
    ndcActionDto: NDCActionDto,
    programme: Programme,
    constants: ConstantEntity
  ) {
    switch (ndcActionDto.typeOfMitigation) {
      case TypeOfMitigation.AGRICULTURE:
        const ar = new AgricultureCreationRequest();
        ar.duration = programme.endTime - programme.startTime;
        ar.durationUnit = "s";
        ar.landArea = ndcActionDto.agricultureProperties.landArea;
        ar.landAreaUnit = ndcActionDto.agricultureProperties.landAreaUnit;
        if (constants) {
          ar.agricultureConstants = constants.data as AgricultureConstants;
        }
        return ar;
      case TypeOfMitigation.SOLAR:
        const sr = new SolarCreationRequest();
        sr.buildingType = ndcActionDto.solarProperties.consumerGroup;
        sr.energyGeneration = ndcActionDto.solarProperties.energyGeneration;
        sr.energyGenerationUnit =
          ndcActionDto.solarProperties.energyGenerationUnit;
        if (constants) {
          sr.solarConstants = constants.data as SolarConstants;
        }
        return sr;
    }
    return null;
  }

  async findById(id: any): Promise<Programme | undefined> {
    return await this.programmeRepo.findOneBy({
      programmeId: id,
    });
  }

  async issueCredit(issue: ProgrammeIssue) {
    const programme = await this.findByExternalId(issue.externalId);
    if (!programme) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.documentNotExist",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    if (!programme.creditIssued) {
      programme.creditIssued = 0;
    }

    if (
      parseFloat(String(programme.creditIssued)) + issue.issueAmount >
      programme.creditEst
    ) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.issuedCreditCannotExceedEstCredit",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    const issued =
      parseFloat(String(programme.creditIssued)) + issue.issueAmount;
    programme.creditIssued = issued;
    programme.emissionReductionAchieved = issued;

    const resp = await this.programmeRepo.update(
      {
        externalId: issue.externalId,
      },
      {
        emissionReductionAchieved: issued,
        creditIssued: issued,
        creditUpdateTime: new Date().getTime(),
        txTime: new Date().getTime(),
      }
    );

    return new DataResponseDto(HttpStatus.OK, programme);
  }

  async rejectProgramme(auth: ProgrammeReject) {
    const programme = await this.findByExternalId(auth.externalId);
    if (!programme) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.documentNotExist",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    const resp = await this.programmeRepo.update(
      {
        externalId: auth.externalId,
      },
      {
        currentStage: ProgrammeStage.REJECTED,
        statusUpdateTime: new Date().getTime(),
        txTime: new Date().getTime(),
      }
    );

    return new DataResponseDto(HttpStatus.OK, programme);
  }

  async authProgramme(auth: ProgrammeAuth) {
    const programme = await this.findByExternalId(auth.externalId);
    if (!programme) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.documentNotExist",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    if (!programme.creditIssued) {
      programme.creditIssued = 0;
    }

    if (!auth.issueAmount) {
      auth.issueAmount = 0;
    }

    if (
      parseFloat(String(programme.creditIssued)) + auth.issueAmount >
      programme.creditEst
    ) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.issuedCreditCannotExceedEstCredit",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    const issued =
      parseFloat(String(programme.creditIssued)) + auth.issueAmount;
    const t = new Date().getTime();
    const resp = await this.programmeRepo.update(
      {
        externalId: auth.externalId,
      },
      {
        creditIssued: issued,
        emissionReductionAchieved: issued,
        serialNo: auth.serialNo,
        currentStage: ProgrammeStage.AUTHORISED,
        statusUpdateTime: t,
        authTime: t,
        creditUpdateTime: t,
        txTime: t,
      }
    );

    return new DataResponseDto(HttpStatus.OK, programme);
  }

  async uploadDocument(type: DocType, id: string, data: string) {
    const filetype = type == DocType.METHODOLOGY_DOCUMENT ? "xlsx" : "pdf";
    const response: any = await this.fileHandler.uploadFile(
      `documents/${this.helperService.enumToString(DocType, type)}${
        id ? "_" + id : ""
      }.${filetype}`,
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

  async create(programmeDto: ProgrammeDto): Promise<Programme | undefined> {
    this.logger.verbose("ProgrammeDTO received", programmeDto);
    const programme: Programme = this.toProgramme(programmeDto);
    this.logger.verbose("Programme create", programme);

    const pr = await this.findByExternalId(programmeDto.externalId);
    if (pr) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.programmeExistsWithSameExetrnalId",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }
    if (
      programmeDto.proponentTaxVatId.length > 1 &&
      (!programmeDto.proponentPercentage ||
        programmeDto.proponentPercentage.length !=
          programmeDto.proponentTaxVatId.length)
    ) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.proponentPercMustDefinedForEvryProponentTaxId",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    if (
      programmeDto.proponentPercentage &&
      programmeDto.proponentTaxVatId.length !=
        programmeDto.proponentPercentage.length
    ) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.proponentPercAndTaxIdsNotMatched",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    if (
      programmeDto.proponentPercentage &&
      programmeDto.proponentPercentage.reduce((a, b) => a + b, 0) != 100
    ) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.proponentPercSum=100",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    if (
      programmeDto.proponentTaxVatId.length !==
      new Set(programmeDto.proponentTaxVatId).size
    ) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.duplicatedProponentTaxIds",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    const companyIds = [];
    const companyNames = [];
    for (const taxId of programmeDto.proponentTaxVatId) {
      const projectCompany = await this.companyService.findByTaxId(taxId);
      if (!projectCompany) {
        throw new HttpException(
          this.helperService.formatReqMessagesString(
            "programme.proponentTaxIdNotInSystem",
            []
          ),
          HttpStatus.BAD_REQUEST
        );
      }

      if (projectCompany.companyRole != CompanyRole.PROGRAMME_DEVELOPER) {
        throw new HttpException(
          this.helperService.formatReqMessagesString(
            "programme.proponentIsNotAProgrammeDev",
            []
          ),
          HttpStatus.BAD_REQUEST
        );
      }

      companyIds.push(Number(projectCompany.companyId));
      companyNames.push(projectCompany.name);
    }

    programme.programmeId = await this.counterService.incrementCount(
      CounterType.PROGRAMME,
      3
    );
    programme.countryCodeA2 = this.configService.get("systemCountry");
    programme.programmeProperties.creditYear = new Date(
      programme.startTime * 1000
    ).getFullYear();
    programme.currentStage = ProgrammeStage.AWAITING_AUTHORIZATION;
    programme.companyId = companyIds;
    programme.emissionReductionExpected = programme.creditEst;
    programme.txTime = new Date().getTime();
    if (programme.proponentPercentage) {
      programme.creditOwnerPercentage = programme.proponentPercentage;
    }
    programme.createdTime = programme.txTime;
    if (!programme.creditUnit) {
      programme.creditUnit = this.configService.get("defaultCreditUnit");
    }

    let orgNamesList = "";
    if (companyNames.length > 1) {
      const lastItem = companyNames.pop();
      orgNamesList = companyNames.join(",") + " and " + lastItem;
    } else {
      orgNamesList = companyNames[0];
    }

    if (programme.companyId.length === 1 && !programme.proponentPercentage) {
      programme.proponentPercentage = [100];
      programme.creditOwnerPercentage = [100];
    }

    if (programmeDto.designDocument) {
      programmeDto.designDocument = await this.uploadDocument(
        DocType.DESIGN_DOCUMENT,
        undefined,
        programmeDto.designDocument
      );
    }

    let ndcAc: NDCAction = undefined;
    if (programmeDto.ndcAction) {
      const data = instanceToPlain(programmeDto.ndcAction);
      ndcAc = plainToClass(NDCAction, data);
      ndcAc.id = await this.createNDCActionId(programmeDto.ndcAction);

      await this.calcCreditNDCAction(ndcAc, programme);
      this.calcAddNDCFields(ndcAc, programme);

      programmeDto.ndcAction.id = ndcAc.id;
      programmeDto.ndcAction.programmeId = programme.programmeId;
      programmeDto.ndcAction.externalId = programme.externalId;
      programmeDto.ndcAction.ndcFinancing = ndcAc.ndcFinancing;
      programmeDto.ndcAction.constantVersion = ndcAc.constantVersion;
    }

    await this.populateExtraFields(programme);

    const savedProgramme = await this.entityManager
      .transaction(async (em) => {
        if (ndcAc) {
          await em.save<NDCAction>(ndcAc);
          if (programmeDto.ndcAction.monitoringReport) {
            const dr = new ProgrammeDocument();
            dr.programmeId = programme.programmeId;
            dr.externalId = programme.externalId;
            dr.actionId = ndcAc.id;
            dr.status = DocumentStatus.PENDING;
            dr.type = DocType.MONITORING_REPORT;
            dr.txTime = new Date().getTime();
            dr.url = await this.uploadDocument(
              DocType.MONITORING_REPORT,
              ndcAc.id,
              programmeDto.ndcAction.monitoringReport
            );
            const d: ProgrammeDocument = await em.save<ProgrammeDocument>(dr);
          }
        }
        if (programmeDto.designDocument) {
          const dr = new ProgrammeDocument();
          dr.programmeId = programme.programmeId;
          dr.externalId = programme.externalId;
          dr.status = DocumentStatus.PENDING;
          dr.type = DocType.DESIGN_DOCUMENT;
          dr.txTime = new Date().getTime();
          dr.url = programmeDto.designDocument;
          const d: ProgrammeDocument = await em.save<ProgrammeDocument>(dr);
        }
        return await em.save<Programme>(programme);
      })
      .catch((err: any) => {
        console.log(err);
        if (err instanceof QueryFailedError) {
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        } else {
          this.logger.error(`Programme add error ${err}`);
        }
        return err;
      });

    await this.asyncOperationsInterface.addAction({
      actionType: AsyncActionType.ProgrammeCreate,
      actionProps: programmeDto,
    });

    const hostAddress = this.configService.get("host");
    await this.emailHelperService.sendEmailToGovernmentAdmins(
      EmailTemplates.PROGRAMME_CREATE,
      {
        organisationName: orgNamesList,
        programmePageLink:
          hostAddress + `/programmeManagement/view?id=${programme.programmeId}`,
      }
    );
    return savedProgramme;
  }

  async calcCreditNDCAction(ndcAction: NDCAction, program: Programme) {

    if ((ndcAction.action === NDCActionType.Mitigation || ndcAction.action === NDCActionType.CrossCutting) && ndcAction.typeOfMitigation) {
      let constants = await this.getLatestConstant(ndcAction.typeOfMitigation);
      const req = await this.getCreditRequest(ndcAction, program, constants);
      if (req) {
        const crdts = await calculateCredit(req);
        console.log("Credit", crdts, req);
        try {
          ndcAction.ndcFinancing.systemEstimatedCredits = Math.round(crdts);
        } catch (err) {
          this.logger.log(`Credit calculate failed ${err.message}`);
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        }
    
        ndcAction.constantVersion = constants
          ? String(constants.version)
          : "default";
    
        console.log("1111", ndcAction);
      }
      
    }
    
    return ndcAction;
  }

  async calcAddNDCFields(ndcAction: NDCAction, programme: Programme) {
    ndcAction.programmeId = programme.programmeId;
    ndcAction.externalId = programme.externalId;
    ndcAction.txTime = new Date().getTime();
    ndcAction.createdTime = ndcAction.txTime;
    ndcAction.sector = programme.sector;
    ndcAction.status = NDCStatus.PENDING;
  }

  private getExpectedDoc(type: DocType) {
    if (type == DocType.METHODOLOGY_DOCUMENT) {
      return DocType.DESIGN_DOCUMENT;
    }
    if (type == DocType.MONITORING_REPORT) {
      return DocType.METHODOLOGY_DOCUMENT;
    }
    if (type == DocType.VERIFICATION_REPORT) {
      return DocType.MONITORING_REPORT;
    }
  }

  async docAction(documentAction: DocumentAction) {
    const d = await this.documentRepo.findOne({
      where: {
        id: documentAction.id,
      },
    });
    if (!d) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.documentNotExist",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    const pr = await this.findById(d.programmeId);

    if (d.status == DocumentStatus.ACCEPTED) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.documentAlreadyAccepted",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }
    let ndc: NDCAction;

    if (documentAction.status == DocumentStatus.ACCEPTED) {
      if (d.type == DocType.METHODOLOGY_DOCUMENT) {
        await this.asyncOperationsInterface.addAction({
          actionType: AsyncActionType.ProgrammeAccept,
          actionProps: {
            type: this.helperService.enumToString(DocType, d.type),
            data: d.url,
            externalId: d.externalId,
            creditEst: Number(pr.creditEst),
          },
        });
      } else {
        if (d.type == DocType.VERIFICATION_REPORT) {
          ndc = await this.ndcActionRepo.findOne({
            where: {
              id: d.actionId,
            },
          });
          if (ndc) {
            ndc.status = NDCStatus.APPROVED;
          }
        }

        await this.asyncOperationsInterface.addAction({
          actionType: AsyncActionType.DocumentUpload,
          actionProps: {
            type: this.helperService.enumToString(DocType, d.type),
            data: d.url,
            externalId: d.externalId,
            actionId: d.actionId,
          },
        });
      }
    }

    const resp = await this.entityManager.transaction(async (em) => {
      if (
        d.type == DocType.METHODOLOGY_DOCUMENT &&
        documentAction.status == DocumentStatus.ACCEPTED
      ) {
        await em.update(
          Programme,
          {
            programmeId: d.programmeId,
          },
          {
            currentStage: ProgrammeStage.APPROVED,
            statusUpdateTime: new Date().getTime(),
            txTime: new Date().getTime(),
          }
        );
      }
      if (ndc) {
        await em.update(
          NDCAction,
          {
            id: ndc.id,
          },
          {
            status: ndc.status,
          }
        );
      }
      return await em.update(
        ProgrammeDocument,
        {
          id: documentAction.id,
        },
        {
          status: documentAction.status,
          remark: documentAction.remark,
        }
      );
    });

    return new BasicResponseDto(
      HttpStatus.OK,
      this.helperService.formatReqMessagesString(
        "programme.actionSuccessful",
        []
      )
    );
  }

  async addDocument(documentDto: ProgrammeDocumentDto) {
    const programme = await this.findById(documentDto.programmeId);

    if (!programme) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.programmeNotExist",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    const expected = this.getExpectedDoc(documentDto.type);
    if (expected) {
      let whr = {
        programmeId: documentDto.programmeId,
        status: DocumentStatus.ACCEPTED,
        type: expected,
      };
      if (documentDto.actionId) {
        whr["actionId"] = documentDto.actionId;
      }
      const approvedDesign = await this.documentRepo.findOne({
        where: whr,
      });

      if (!approvedDesign) {
        throw new HttpException(
          this.helperService.formatReqMessagesString(
            "programme.invalidDocumentUpload",
            []
          ),
          HttpStatus.BAD_REQUEST
        );
      }
    }

    let whr = {
      programmeId: documentDto.programmeId,
      type: documentDto.type,
    };
    if (documentDto.actionId) {
      whr["actionId"] = documentDto.actionId;
    }
    const currentDoc = await this.documentRepo.findOne({
      where: whr,
    });

    const url = await this.uploadDocument(
      documentDto.type,
      documentDto.actionId,
      documentDto.data
    );
    const dr = new ProgrammeDocument();
    dr.programmeId = programme.programmeId;
    dr.externalId = programme.externalId;
    dr.status = DocumentStatus.PENDING;
    dr.type = documentDto.type;
    dr.txTime = new Date().getTime();
    dr.url = url;

    let resp;
    if (!currentDoc) {
      resp = await this.documentRepo.save(dr);
    } else {
      resp = await this.documentRepo.update(whr, {
        status: dr.status,
        txTime: dr.txTime,
        url: dr.url,
      });
    }

    return new DataResponseDto(HttpStatus.OK, resp);
  }

  private async createNDCActionId(ndcAction: NDCActionDto) {
    const id = await this.counterService.incrementCount(
      CounterType.NDC_ACTION,
      3
    );

    const type =
      ndcAction.action == NDCActionType.Mitigation
        ? "MTG"
        : ndcAction.action == NDCActionType.Adaptation
        ? "ADT"
        : ndcAction.action == NDCActionType.Enablement
        ? "ENB"
        : "CRS";
    return `${type}-${id}`;
  }

  async addNDCAction(ndcActionDto: NDCActionDto): Promise<DataResponseDto> {
    if (!ndcActionDto.programmeId) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.programmeNotExist",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    const program = await this.findById(ndcActionDto.programmeId);

    if (!program) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.programmeNotExist",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    const data = instanceToPlain(ndcActionDto);
    const ndcAction: NDCAction = plainToClass(NDCAction, data);
    ndcAction.id = await this.createNDCActionId(ndcActionDto);

    await this.calcCreditNDCAction(ndcAction, program);
    console.log("2222", ndcAction);
    this.calcAddNDCFields(ndcAction, program);

    if (
      ndcActionDto.action == NDCActionType.Mitigation ||
      ndcActionDto.action == NDCActionType.CrossCutting
    ) {
      await this.asyncOperationsInterface.addAction({
        actionType: AsyncActionType.AddMitigation,
        actionProps: ndcAction,
      });
    }
    const saved = await this.entityManager
      .transaction(async (em) => {
        const n = await em.save<NDCAction>(ndcAction);
        if (ndcActionDto.monitoringReport) {
          const dr = new ProgrammeDocument();
          dr.programmeId = program.programmeId;
          dr.externalId = program.externalId;
          dr.actionId = ndcAction.id;
          dr.status = DocumentStatus.PENDING;
          dr.type = DocType.MONITORING_REPORT;
          dr.txTime = new Date().getTime();
          dr.url = await this.uploadDocument(
            DocType.MONITORING_REPORT,
            program.programmeId,
            ndcActionDto.monitoringReport
          );
          const d: ProgrammeDocument = await em.save<ProgrammeDocument>(dr);
        }

        return n;
      })
      .catch((err: any) => {
        console.log(err);
        if (err instanceof QueryFailedError) {
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        } else {
          this.logger.error(`NDC Action add error ${err}`);
        }
        return err;
      });
    return new DataResponseDto(HttpStatus.OK, saved);
  }

  async queryNdcActions(
    query: QueryDto,
    abilityCondition: string
  ): Promise<DataListResponseDto> {
    const skip = query.size * query.page - query.size;
    let resp = await this.ndcActionViewRepo
      .createQueryBuilder("ndcaction")
      .where(
        this.helperService.generateWhereSQL(
          query,
          this.helperService.parseMongoQueryToSQLWithTable(
            "ndcaction",
            abilityCondition
          ),
          "ndcaction"
        )
      )
      .orderBy(
        query?.sort?.key &&
          `"ndcaction".${this.helperService.generateSortCol(query?.sort?.key)}`,
        query?.sort?.order,
        query?.sort?.nullFirst !== undefined
          ? query?.sort?.nullFirst === true
            ? "NULLS FIRST"
            : "NULLS LAST"
          : undefined
      )
      .offset(skip)
      .limit(query.size)
      .getManyAndCount();

    return new DataListResponseDto(
      resp.length > 0 ? resp[0] : undefined,
      resp.length > 1 ? resp[1] : undefined
    );
  }

  async queryDocuments(
    query: QueryDto,
    abilityCondition: string
  ): Promise<DataListResponseDto> {
    const skip = query.size * query.page - query.size;
    let resp = await this.documentViewRepo
      .createQueryBuilder("programmedocument")
      .where(
        this.helperService.generateWhereSQL(
          query,
          this.helperService.parseMongoQueryToSQLWithTable(
            "programmedocument",
            abilityCondition
          ),
          "programmedocument"
        )
      )
      .orderBy(
        query?.sort?.key &&
          `"programmedocument".${this.helperService.generateSortCol(
            query?.sort?.key
          )}`,
        query?.sort?.order,
        query?.sort?.nullFirst !== undefined
          ? query?.sort?.nullFirst === true
            ? "NULLS FIRST"
            : "NULLS LAST"
          : undefined
      )
      .offset(skip)
      .limit(query.size)
      .getManyAndCount();

    return new DataListResponseDto(
      resp.length > 0 ? resp[0] : undefined,
      resp.length > 1 ? resp[1] : undefined
    );
  }

  async query(
    query: QueryDto,
    abilityCondition: string
  ): Promise<DataListResponseDto> {
    const skip = query.size * query.page - query.size;
    let resp = await this.programmeViewRepo
      .createQueryBuilder("programme")
      .where(
        this.helperService.generateWhereSQL(
          query,
          this.helperService.parseMongoQueryToSQLWithTable(
            "programme",
            abilityCondition
          ),
          "programme"
        )
      )
      .orderBy(
        query?.sort?.key &&
          `"programme".${this.helperService.generateSortCol(query?.sort?.key)}`,
        query?.sort?.order,
        query?.sort?.nullFirst !== undefined
          ? query?.sort?.nullFirst === true
            ? "NULLS FIRST"
            : "NULLS LAST"
          : undefined
      )
      .offset(skip)
      .limit(query.size)
      .getManyAndCount();

    if (resp.length > 0) {
      resp[0] = resp[0].map((e) => {
        e.certifier =
          e.certifier.length > 0 && e.certifier[0] === null ? [] : e.certifier;
        e.company =
          e.company.length > 0 && e.company[0] === null ? [] : e.company;
        return e;
      });
    }

    return new DataListResponseDto(
      resp.length > 0 ? resp[0] : undefined,
      resp.length > 1 ? resp[1] : undefined
    );
  }

  async updateCustomConstants(
    customConstantType: TypeOfMitigation,
    constants: ConstantUpdateDto
  ) {
    let config;
    if (customConstantType == TypeOfMitigation.AGRICULTURE) {
      config = new AgricultureConstants();
      const recv = instanceToPlain(constants.agricultureConstants);
      for (const key in recv) {
        if (recv.hasOwnProperty(key) && recv[key] != undefined) {
          config[key] = recv[key];
        }
      }
    } else if (customConstantType == TypeOfMitigation.SOLAR) {
      config = new SolarConstants();
      const recv = instanceToPlain(constants.solarConstants);
      for (const key in recv) {
        if (recv.hasOwnProperty(key) && recv[key] != undefined) {
          config[key] = recv[key];
        }
      }
    }

    const existing = await this.getLatestConstant(customConstantType);
    if (existing && JSON.stringify(existing.data) == JSON.stringify(config)) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.noDiffInConfigFromThePrevVersion",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }
    const resp = await this.constantRepo.save({
      id: customConstantType,
      data: config,
    });
    return new DataResponseDto(HttpStatus.OK, resp);
  }

  async getLatestConstant(customConstantType: TypeOfMitigation) {
    return await this.constantRepo.findOne({
      where: [{ id: customConstantType }],
      order: { version: "DESC" },
    });
  }

  private getUserName = async (usrId: string) => {
    this.logger.debug(`Getting user [${usrId}]`);
    if (usrId == "undefined" || usrId == "null") {
      return null;
    }
    const userId = Number(usrId);
    if (userId == undefined || userId == null) {
      return null;
    }
    if (this.userNameCache[userId]) {
      this.logger.debug(
        `Getting user - cached ${userId} ${this.userNameCache[userId]}`
      );
      return this.userNameCache[userId];
    }
    const user = await this.userService.findById(Number(userId));
    this.logger.debug(`Getting user - user ${user}`);
    if (user) {
      this.logger.debug(`Getting user - user ${user.name}`);
      this.userNameCache[userId] = user.name;
      return user.name;
    }
    return null;
  };

  private getCompanyIdAndUserIdFromRef = (ref: string) => {
    if (!ref) {
      return null;
    }
    const parts = ref.split("#");
    if (parts.length > 2) {
      return {
        id: parts[2],
        companyId: Number(parts[0]),
      };
    }
    if (parts.length > 0) {
      return {
        companyId: Number(parts[0]),
      };
    }
    return null;
  };

  async findByExternalId(externalId: string): Promise<Programme | undefined> {
    return await this.programmeRepo.findOne({
      where: {
        externalId: externalId,
      },
    });
  }

  private getUserRef = (user: any) => {
    return `${user.companyId}#${user.companyName}#${user.id}`;
  };

  private getUserRefWithRemarks = (user: any, remarks: string) => {
    return `${user.companyId}#${user.companyName}#${user.id}#${remarks}`;
  };

  private populateExtraFields = async (programme: Programme) => {
    const programmeProperties = programme.programmeProperties;
    programme.geographicalLocationCordintes = await this.locationService
      .getCoordinatesForRegion(programmeProperties.geographicalLocation)
      .then((response: any) => {
        console.log("response from forwardGeoCoding function -> ", response);
        return [...response];
      });
    programme.createdTime = new Date().getTime();
  };

  async queryInvestment(query: QueryDto, abilityCondition: any, user: User) {
    const resp = await this.investmentViewRepo
      .createQueryBuilder("investment")
      .where(
        this.helperService.generateWhereSQL(
          query,
          this.helperService.parseMongoQueryToSQLWithTable(
            "investment",
            abilityCondition
          )
        )
      )
      .orderBy(
        query?.sort?.key &&
          this.helperService.generateSortCol(query?.sort?.key),
        query?.sort?.order,
        query?.sort?.nullFirst !== undefined
          ? query?.sort?.nullFirst === true
            ? "NULLS FIRST"
            : "NULLS LAST"
          : undefined
      )
      .offset(query.size * query.page - query.size)
      .limit(query.size)
      .getManyAndCount();
    return new DataListResponseDto(
      resp.length > 0 ? resp[0] : undefined,
      resp.length > 1 ? resp[1] : undefined
    );
  }
  async investmentCancel(req: InvestmentCancel, requester: User) {
    this.logger.log(
      `Investment cancel by ${requester.companyId}-${
        requester.id
      } received ${JSON.stringify(req)}`
    );

    const investment = await this.investmentRepo.findOneBy({
      requestId: req.requestId,
    });

    if (!investment) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.investmentReqDoesNotExist",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    if (investment.status != InvestmentStatus.PENDING) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.acceptOrRejCancelledReq",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    const result = await this.investmentRepo
      .update(
        {
          requestId: req.requestId,
          status: InvestmentStatus.PENDING,
        },
        {
          status: InvestmentStatus.CANCELLED,
          txTime: new Date().getTime(),
          txRef: `${req.comment}#${requester.companyId}#${requester.id}`,
        }
      )
      .catch((err) => {
        this.logger.error(err);
        return err;
      });

    if (result.affected > 0) {
      return new BasicResponseDto(
        HttpStatus.OK,
        this.helperService.formatReqMessagesString(
          "programme.investmentCancelSuccess",
          []
        )
      );
    }
    return new BasicResponseDto(
      HttpStatus.BAD_REQUEST,
      this.helperService.formatReqMessagesString(
        "programme.investmentReqNotExistinGiv",
        []
      )
    );
  }

  async investmentReject(req: InvestmentReject, approver: User) {
    this.logger.log(
      `Investment reject ${JSON.stringify(req)} ${approver.companyId}`
    );

    const investment = await this.investmentRepo.findOneBy({
      requestId: req.requestId,
    });

    if (!investment) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.investmentReqDoesNotExist",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    if (investment.status != InvestmentStatus.PENDING) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.acceptOrRejCancelledReq",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    if (
      investment.fromCompanyId != approver.companyId
    ) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.invalidApproverForInvestmentReq",
          []
        ),
        HttpStatus.FORBIDDEN
      );
    }

    const result = await this.investmentRepo
      .update(
        {
          requestId: req.requestId,
          status: InvestmentStatus.PENDING,
        },
        {
          status: InvestmentStatus.REJECTED,
          txTime: new Date().getTime(),
          txRef: `${req.comment}#${approver.companyId}#${approver.id}`,
        }
      )
      .catch((err) => {
        this.logger.error(err);
        return err;
      });


    if (result.affected > 0) {
      return new BasicResponseDto(
        HttpStatus.OK,
        this.helperService.formatReqMessagesString(
          "programme.investmentReqRejectSuccess",
          []
        )
      );
    }

    throw new HttpException(
      this.helperService.formatReqMessagesString(
        "programme.noPendReqFound",
        []
      ),
      HttpStatus.BAD_REQUEST
    );
  }
  async investmentApprove(req: InvestmentApprove, approver: User) {
    const investment = await this.investmentRepo.findOneBy({
      requestId: req.requestId,
    });

    if (!investment) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.investmentReqDoesNotExist",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    if (investment.status == InvestmentStatus.CANCELLED) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.acceptOrRejAlreadyCancelled",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    if (investment.status == InvestmentStatus.APPROVED) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.investmentAlreadyApproved",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    if (
      investment.fromCompanyId != approver.companyId
    ) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.invalidApproverForInvestmentReq",
          []
        ),
        HttpStatus.FORBIDDEN
      );
    }

    const receiver = await this.companyService.findByCompanyId(
      investment.toCompanyId
    );
    const giver = await this.companyService.findByCompanyId(
      investment.fromCompanyId
    );

    const initiatorCompanyDetails = await this.companyService.findByCompanyId(
      investment.initiatorCompanyId
    );

    const programme = await this.findById(investment.programmeId);

    const transferResult = await this.doTransfer(
      investment,
      `${this.getUserRef(approver)}#${receiver.companyId}#${receiver.name}#${
        giver.companyId
      }#${giver.name}`,
      programme
    );

    return transferResult;
  }
}
