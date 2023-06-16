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
import { ProgrammeDocument } from "../dto/programme.document";
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
    @InjectRepository(ProgrammeDocument)
    private documentRepo: Repository<ProgrammeDocument>,
    @InjectRepository(ConstantEntity)
    private constantRepo: Repository<ConstantEntity>,
    private asyncOperationsInterface: AsyncOperationsInterface,
    @InjectEntityManager() private entityManager: EntityManager,
    private logger: Logger
  ) {}

  private toProgramme(programmeDto: ProgrammeDto): Programme {
    const data = instanceToPlain(programmeDto);
    this.logger.verbose("Converted programme", JSON.stringify(data));
    return plainToClass(Programme, data);
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
    throw Error(
      this.helperService.formatReqMessagesString(
        "programme.notImplementedForMitigationType",
        [ndcActionDto.typeOfMitigation]
      )
    );
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

    if (parseFloat(String(programme.creditIssued)) + issue.issueAmount > programme.creditEst) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.issuedCreditCannotExceedEstCredit",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    const issued = parseFloat(String(programme.creditIssued)) + issue.issueAmount;
    programme.creditIssued = issued
    programme.emissionReductionAchieved = issued

    const resp = await this.programmeRepo.update(
      {
        externalId: issue.externalId,
      },
      {
        emissionReductionAchieved: issued,
        creditIssued: issued
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

    if (parseFloat(String(programme.creditIssued)) + auth.issueAmount > programme.creditEst) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.issuedCreditCannotExceedEstCredit",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    const issued = parseFloat(String(programme.creditIssued)) + auth.issueAmount;
    const resp = await this.programmeRepo.update(
      {
        externalId: auth.externalId,
      },
      {
        creditIssued: issued,
        emissionReductionAchieved: issued,
        serialNo: auth.serialNo,
        currentStage: ProgrammeStage.AUTHORISED,
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

      companyIds.push(projectCompany.companyId);
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
    programme.emissionReductionExpected = programme.creditEst
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
    let constants = await this.getLatestConstant(ndcAction.typeOfMitigation);
    const req = await this.getCreditRequest(ndcAction, program, constants);
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
    return ndcAction;
  }

  async calcAddNDCFields(ndcAction: NDCAction, programme: Programme) {
    ndcAction.programmeId = programme.programmeId;
    ndcAction.externalId = programme.externalId;
    ndcAction.txTime = new Date().getTime();
    ndcAction.createdTime = ndcAction.txTime;
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

    const pr = await this.findById(d.programmeId)

    if (d.status == DocumentStatus.ACCEPTED) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.documentAlreadyAccepted",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

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
    let resp = await this.ndcActionRepo
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
    let resp = await this.documentRepo
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

  // async certify(req: ProgrammeCertify, add: boolean, user: User) {
  //   this.logger.log(
  //     `Programme ${req.programmeId} certification received by ${user.id}`
  //   );

  //   if (add && user.companyRole != CompanyRole.CERTIFIER) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString("programme.unAuth", []),
  //       HttpStatus.FORBIDDEN
  //     );
  //   }

  //   if (
  //     !add &&
  //     ![CompanyRole.CERTIFIER, CompanyRole.GOVERNMENT].includes(
  //       user.companyRole
  //     )
  //   ) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         "programme.certifierOrGovCanOnlyPerformCertificationRevoke",
  //         []
  //       ),
  //       HttpStatus.FORBIDDEN
  //     );
  //   }

  //   let certifierId;
  //   if (user.companyRole === CompanyRole.GOVERNMENT) {
  //     if (!req.certifierId) {
  //       throw new HttpException(
  //         this.helperService.formatReqMessagesString(
  //           "programme.certifierIdRequiredForGov",
  //           []
  //         ),
  //         HttpStatus.FORBIDDEN
  //       );
  //     }
  //     certifierId = req.certifierId;
  //   } else {
  //     certifierId = user.companyId;
  //   }

  //   const userCompany = await this.companyRepo.findOne({
  //     where: { companyId: user.companyId },
  //   });
  //   if (userCompany && userCompany.state === CompanyState.SUSPENDED) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         "programme.organisationDeactivated",
  //         []
  //       ),
  //       HttpStatus.FORBIDDEN
  //     );
  //   }

  //   const updated = await this.programmeLedger.updateCertifier(
  //     req.programmeId,
  //     certifierId,
  //     add,
  //     this.getUserRefWithRemarks(user, req.comment)
  //   );
  //   updated.company = await this.companyRepo.find({
  //     where: { companyId: In(updated.companyId) },
  //   });
  //   if (updated && updated.certifierId && updated.certifierId.length > 0) {
  //     updated.certifier = await this.companyRepo.find({
  //       where: { companyId: In(updated.certifierId) },
  //     });
  //   }

  //   if (add) {
  //     await this.emailHelperService.sendEmailToProgrammeOwnerAdmins(
  //       req.programmeId,
  //       EmailTemplates.PROGRAMME_CERTIFICATION,
  //       {},
  //       user.companyId
  //     );
  //   } else {
  //     if (user.companyRole === CompanyRole.GOVERNMENT) {
  //       await this.emailHelperService.sendEmailToProgrammeOwnerAdmins(
  //         req.programmeId,
  //         EmailTemplates.PROGRAMME_CERTIFICATION_REVOKE_BY_GOVT_TO_PROGRAMME,
  //         {},
  //         req.certifierId,
  //         user.companyId
  //       );
  //       await this.emailHelperService.sendEmailToOrganisationAdmins(
  //         req.certifierId,
  //         EmailTemplates.PROGRAMME_CERTIFICATION_REVOKE_BY_GOVT_TO_CERT,
  //         {},
  //         user.companyId,
  //         req.programmeId
  //       );
  //     } else {
  //       await this.emailHelperService.sendEmailToProgrammeOwnerAdmins(
  //         req.programmeId,
  //         EmailTemplates.PROGRAMME_CERTIFICATION_REVOKE_BY_CERT,
  //         {},
  //         user.companyId
  //       );
  //     }
  //   }

  //   if (add) {
  //     return new DataResponseMessageDto(
  //       HttpStatus.OK,
  //       this.helperService.formatReqMessagesString(
  //         "programme.certifyPendingProgramme",
  //         []
  //       ),
  //       updated
  //     );
  //   } else {
  //     return new DataResponseMessageDto(
  //       HttpStatus.OK,
  //       this.helperService.formatReqMessagesString(
  //         "programme.certificationRevocation",
  //         []
  //       ),
  //       updated
  //     );
  //   }
  // }

  // async issueProgrammeCredit(req: ProgrammeIssue, user: User) {
  //   this.logger.log(
  //     `Programme ${req.programmeId} approve. Comment: ${req.comment}`
  //   );
  //   const program = await this.programmeLedger.getProgrammeById(
  //     req.programmeId
  //   );
  //   if (!program) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         "programme.programmeNotExist",
  //         []
  //       ),
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }

  //   if (program.currentStage != ProgrammeStage.AUTHORISED) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         "programme.notInAUthorizedState",
  //         []
  //       ),
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }
  //   if (program.creditEst - program.creditIssued < req.issueAmount) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         "programme.issuedCreditAmountcantExceedPendingCredit",
  //         []
  //       ),
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }
  //   let updated: any = await this.programmeLedger.issueProgrammeStatus(
  //     req.programmeId,
  //     this.configService.get("systemCountry"),
  //     program.companyId,
  //     req.issueAmount,
  //     this.getUserRefWithRemarks(user, req.comment)
  //   );
  //   if (!updated) {
  //     return new BasicResponseDto(
  //       HttpStatus.BAD_REQUEST,
  //       this.helperService.formatReqMessagesString(
  //         "programme.notFOundAPendingProgrammeForTheId",
  //         [req.programmeId]
  //       )
  //     );
  //   }

  //   const hostAddress = this.configService.get("host");
  //   updated.companyId.forEach(async (companyId) => {
  //     await this.emailHelperService.sendEmailToOrganisationAdmins(
  //       companyId,
  //       EmailTemplates.CREDIT_ISSUANCE,
  //       {
  //         programmeName: updated.title,
  //         credits: req.issueAmount,
  //         serialNumber: updated.serialNo,
  //         pageLink:
  //           hostAddress + `/programmeManagement/view?id=${updated.programmeId}`,
  //       }
  //     );
  //   });

  //   const companyData = await this.companyService.findByCompanyIds({
  //     companyIds: program.companyId,
  //   });

  //   const suspendedCompanies = companyData.filter(
  //     (company) => company.state == CompanyState.SUSPENDED
  //   );

  //   if (suspendedCompanies.length > 0) {
  //     updated = await this.programmeLedger.freezeIssuedCredit(
  //       req.programmeId,
  //       req.issueAmount,
  //       this.getUserRef(user),
  //       suspendedCompanies
  //     );
  //     if (!updated) {
  //       return new BasicResponseDto(
  //         HttpStatus.BAD_REQUEST,
  //         this.helperService.formatReqMessagesString(
  //           "programme.internalErrorCreditFreezing",
  //           [req.programmeId]
  //         )
  //       );
  //     }
  //   }

  //   updated.company = await this.companyRepo.find({
  //     where: { companyId: In(updated.companyId) },
  //   });
  //   if (updated.certifierId && updated.certifierId.length > 0) {
  //     updated.certifier = await this.companyRepo.find({
  //       where: { companyId: In(updated.certifierId) },
  //     });
  //   }

  //   return new DataResponseDto(HttpStatus.OK, updated);
  // }

  // async approveProgramme(req: ProgrammeApprove, user: User) {
  //   this.logger.log(
  //     `Programme ${req.programmeId} approve. Comment: ${req.comment}`
  //   );
  //   const program = await this.programmeLedger.getProgrammeById(
  //     req.programmeId
  //   );
  //   if (!program) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         "programme.programmeNotExist",
  //         []
  //       ),
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }

  //   if (program.currentStage != ProgrammeStage.AWAITING_AUTHORIZATION) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         "programme.notInPendingState",
  //         []
  //       ),
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }
  //   if (program.creditEst < req.issueAmount) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         "programme.issuedCreditCannotExceedEstCredit",
  //         []
  //       ),
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }
  //   const updated: any = await this.programmeLedger.authProgrammeStatus(
  //     req.programmeId,
  //     this.configService.get("systemCountry"),
  //     program.companyId,
  //     req.issueAmount,
  //     this.getUserRefWithRemarks(user, req.comment)
  //   );
  //   if (!updated) {
  //     return new BasicResponseDto(
  //       HttpStatus.BAD_REQUEST,
  //       this.helperService.formatReqMessagesString(
  //         "programme.inotFOundAPendingProgrammeForTheId",
  //         [req.programmeId]
  //       )`Does not found a pending programme for the given programme id ${req.programmeId}`
  //     );
  //   }

  //   updated.company = await this.companyRepo.find({
  //     where: { companyId: In(updated.companyId) },
  //   });
  //   if (updated.certifierId && updated.certifierId.length > 0) {
  //     updated.certifier = await this.companyRepo.find({
  //       where: { companyId: In(updated.certifierId) },
  //     });
  //   }

  //   const hostAddress = this.configService.get("host");
  //   let authDate = new Date(updated.txTime);
  //   let date = authDate.getDate().toString().padStart(2, "0");
  //   let month = authDate.toLocaleString("default", { month: "long" });
  //   let year = authDate.getFullYear();
  //   let formattedDate = `${date} ${month} ${year}`;

  //   updated.company.forEach(async (company) => {
  //     await this.emailHelperService.sendEmailToOrganisationAdmins(
  //       company.companyId,
  //       EmailTemplates.PROGRAMME_AUTHORISATION,
  //       {
  //         programmeName: updated.title,
  //         authorisedDate: formattedDate,
  //         serialNumber: updated.serialNo,
  //         programmePageLink:
  //           hostAddress + `/programmeManagement/view?id=${updated.programmeId}`,
  //       }
  //     );
  //   });

  //   return new DataResponseDto(HttpStatus.OK, updated);
  // }

  // async rejectProgramme(req: ProgrammeReject, user: User) {
  //   this.logger.log(
  //     `Programme ${req.programmeId} reject. Comment: ${req.comment}`
  //   );
  //   const programme = await this.findById(req.programmeId);
  //   const currentStage = programme.currentStage;
  //   if (currentStage === ProgrammeStage.REJECTED) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         "programme.rejectAlreadyRejectedProg",
  //         []
  //       ),
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }
  //   const updated = await this.programmeLedger.updateProgrammeStatus(
  //     req.programmeId,
  //     ProgrammeStage.REJECTED,
  //     ProgrammeStage.AWAITING_AUTHORIZATION,
  //     this.getUserRefWithRemarks(user, req.comment)
  //   );
  //   if (!updated) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         "programme.programmeNotExist",
  //         []
  //       ),
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }

  //   await this.emailHelperService.sendEmailToProgrammeOwnerAdmins(
  //     req.programmeId,
  //     EmailTemplates.PROGRAMME_REJECTION,
  //     { reason: req.comment }
  //   );

  //   return new BasicResponseDto(HttpStatus.OK, "Successfully updated");
  // }

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
}
