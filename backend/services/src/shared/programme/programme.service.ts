import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ProgrammeDto } from "../dto/programme.dto";
import { Programme } from "../entities/programme.entity";
import { instanceToPlain, plainToClass } from "class-transformer";
import { ProgrammeStage } from "../enum/programme-status.enum";
import { QueryDto } from "../dto/query.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { PrimaryGeneratedColumnType } from "typeorm/driver/types/ColumnTypes";
import { CounterService } from "../util/counter.service";
import { CounterType } from "../util/counter.type.enum";
import { ConstantEntity } from "../entities/constants.entity";
import { DataResponseDto } from "../dto/data.response.dto";
import { ConstantUpdateDto } from "../dto/constants.update.dto";
import { ProgrammeApprove } from "../dto/programme.approve";
import { DataListResponseDto } from "../dto/data.list.response";
import { BasicResponseDto } from "../dto/basic.response.dto";
import { ConfigService } from "@nestjs/config";
import { TypeOfMitigation } from "../enum/typeofmitigation.enum";
import { CompanyService } from "../company/company.service";
import { EmailTemplates } from "../email-helper/email.template";
import { User } from "../entities/user.entity";
import { ProgrammeTransfer } from "../entities/programme.transfer";
import { Company } from "../entities/company.entity";
import { HelperService } from "../util/helpers.service";
import { CompanyRole } from "../enum/company.role.enum";
import { ProgrammeCertify } from "../dto/programme.certify";
import { ProgrammeQueryEntity } from "../entities/programme.view.entity";
import { ProgrammeTransferViewEntityQuery } from "../entities/programmeTransfer.view.entity";
import { CompanyState } from "../enum/company.state.enum";
import { ProgrammeReject } from "../dto/programme.reject";
import { ProgrammeIssue } from "../dto/programme.issue";
import { EmailHelperService } from "../email-helper/email-helper.service";
import { UserService } from "../user/user.service";
import { CountryService } from "../util/country.service";
import { DataResponseMessageDto } from "../dto/data.response.message";
import { LocationInterface } from "../location/location.interface";
import { AgricultureConstants, AgricultureCreationRequest, SolarConstants, SolarCreationRequest, calculateCredit } from "@undp/carbon-credit-calculator";
import { ProgrammeLedgerService } from "../programme-ledger/programme-ledger.service";

export declare function PrimaryGeneratedColumn(
  options: PrimaryGeneratedColumnType
): Function;

@Injectable()
export class ProgrammeService {
  private userNameCache: any = {};

  constructor(
    private programmeLedger: ProgrammeLedgerService,
    private counterService: CounterService,
    private configService: ConfigService,
    private companyService: CompanyService,
    private userService: UserService,
    private locationService: LocationInterface,
    private helperService: HelperService,
    private emailHelperService: EmailHelperService,
    private readonly countryService: CountryService,
    @InjectRepository(Programme) private programmeRepo: Repository<Programme>,
    @InjectRepository(ProgrammeQueryEntity)
    private programmeViewRepo: Repository<ProgrammeQueryEntity>,
    @InjectRepository(ProgrammeTransferViewEntityQuery)
    private programmeTransferViewRepo: Repository<ProgrammeTransferViewEntityQuery>,
    @InjectRepository(Company) private companyRepo: Repository<Company>,
    @InjectRepository(ProgrammeTransfer)
    private programmeTransferRepo: Repository<ProgrammeTransfer>,
    @InjectRepository(ConstantEntity)
    private constantRepo: Repository<ConstantEntity>,
    private logger: Logger
  ) {}

  private toProgramme(programmeDto: ProgrammeDto): Programme {
    const data = instanceToPlain(programmeDto);
    this.logger.verbose("Converted programme", JSON.stringify(data));
    return plainToClass(Programme, data);
  }

  private async getCreditRequest(
    programmeDto: ProgrammeDto,
    constants: ConstantEntity
  ) {
    switch (programmeDto.typeOfMitigation) {
      case TypeOfMitigation.AGRICULTURE:
        const ar = new AgricultureCreationRequest();
        ar.duration = programmeDto.endTime - programmeDto.startTime;
        ar.durationUnit = "s";
        ar.landArea = programmeDto.agricultureProperties.landArea;
        ar.landAreaUnit = programmeDto.agricultureProperties.landAreaUnit;
        if (constants) {
          ar.agricultureConstants = constants.data as AgricultureConstants;
        }
        return ar;
      case TypeOfMitigation.SOLAR:
        const sr = new SolarCreationRequest();
        sr.buildingType = programmeDto.solarProperties.consumerGroup;
        sr.energyGeneration = programmeDto.solarProperties.energyGeneration;
        sr.energyGenerationUnit =
          programmeDto.solarProperties.energyGenerationUnit;
        if (constants) {
          sr.solarConstants = constants.data as SolarConstants;
        }
        return sr;
    }
    throw Error(
      this.helperService.formatReqMessagesString(
        "programme.notImplementedForMitigationType",
        [programmeDto.typeOfMitigation]
      )
    );
  }

  async findById(id: any): Promise<Programme | undefined> {
    return await this.programmeRepo.findOneBy({
      programmeId: id,
    });
  }

  async create(programmeDto: ProgrammeDto): Promise<Programme | undefined> {
    this.logger.verbose("ProgrammeDTO received", programmeDto);
    const programme: Programme = this.toProgramme(programmeDto);
    this.logger.verbose("Programme create", programme);

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

    let constants = undefined;
    if (!programmeDto.creditEst) {
      constants = await this.getLatestConstant(programmeDto.typeOfMitigation);

      const req = await this.getCreditRequest(programmeDto, constants);
      try {
        programme.creditEst = Math.round(await calculateCredit(req));
      } catch (err) {
        this.logger.log(`Credit calculate failed ${err.message}`);
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      }
    }

    if (programme.creditEst <= 0) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.noEnoughCreditsToCreateProgramme",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }
    // programme.creditBalance = programme.creditIssued;
    // programme.creditChange = programme.creditIssued;
    programme.programmeProperties.creditYear = new Date(
      programme.startTime * 1000
    ).getFullYear();
    programme.constantVersion = constants
      ? String(constants.version)
      : "default";
    programme.currentStage = ProgrammeStage.AWAITING_AUTHORIZATION;
    programme.companyId = companyIds;
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
    const savedProgramme = await this.programmeLedger.createProgramme(
      programme
    );
    if (savedProgramme) {
      const hostAddress = this.configService.get("host");
      await this.emailHelperService.sendEmailToGovernmentAdmins(
        EmailTemplates.PROGRAMME_CREATE,
        {
          organisationName: orgNamesList,
          programmePageLink:
            hostAddress +
            `/programmeManagement/view?id=${programme.programmeId}`,
        }
      );
    }

    return savedProgramme;
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


  async getProgrammeEvents(programmeId: string, user: User): Promise<any> {
    const resp = await this.programmeLedger.getProgrammeHistory(programmeId);
    if (resp == null) {
      return [];
    }
    for (const el of resp) {
      const refs = this.getCompanyIdAndUserIdFromRef(el.data.txRef);
      if (
        refs &&
        (user.companyRole === CompanyRole.GOVERNMENT ||
          Number(refs?.companyId) === Number(user.companyId))
      ) {
        el.data["userName"] = await this.getUserName(refs.id);
      }
    }
    return resp;
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

  async certify(req: ProgrammeCertify, add: boolean, user: User) {
    this.logger.log(
      `Programme ${req.programmeId} certification received by ${user.id}`
    );

    if (add && user.companyRole != CompanyRole.CERTIFIER) {
      throw new HttpException(
        this.helperService.formatReqMessagesString("programme.unAuth", []),
        HttpStatus.FORBIDDEN
      );
    }

    if (
      !add &&
      ![CompanyRole.CERTIFIER, CompanyRole.GOVERNMENT].includes(
        user.companyRole
      )
    ) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.certifierOrGovCanOnlyPerformCertificationRevoke",
          []
        ),
        HttpStatus.FORBIDDEN
      );
    }

    let certifierId;
    if (user.companyRole === CompanyRole.GOVERNMENT) {
      if (!req.certifierId) {
        throw new HttpException(
          this.helperService.formatReqMessagesString(
            "programme.certifierIdRequiredForGov",
            []
          ),
          HttpStatus.FORBIDDEN
        );
      }
      certifierId = req.certifierId;
    } else {
      certifierId = user.companyId;
    }

    const userCompany = await this.companyRepo.findOne({
      where: { companyId: user.companyId },
    });
    if (userCompany && userCompany.state === CompanyState.SUSPENDED) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.organisationDeactivated",
          []
        ),
        HttpStatus.FORBIDDEN
      );
    }

    const updated = await this.programmeLedger.updateCertifier(
      req.programmeId,
      certifierId,
      add,
      this.getUserRefWithRemarks(user, req.comment)
    );
    updated.company = await this.companyRepo.find({
      where: { companyId: In(updated.companyId) },
    });
    if (updated && updated.certifierId && updated.certifierId.length > 0) {
      updated.certifier = await this.companyRepo.find({
        where: { companyId: In(updated.certifierId) },
      });
    }

    if (add) {
      await this.emailHelperService.sendEmailToProgrammeOwnerAdmins(
        req.programmeId,
        EmailTemplates.PROGRAMME_CERTIFICATION,
        {},
        user.companyId
      );
    } else {
      if (user.companyRole === CompanyRole.GOVERNMENT) {
        await this.emailHelperService.sendEmailToProgrammeOwnerAdmins(
          req.programmeId,
          EmailTemplates.PROGRAMME_CERTIFICATION_REVOKE_BY_GOVT_TO_PROGRAMME,
          {},
          req.certifierId,
          user.companyId
        );
        await this.emailHelperService.sendEmailToOrganisationAdmins(
          req.certifierId,
          EmailTemplates.PROGRAMME_CERTIFICATION_REVOKE_BY_GOVT_TO_CERT,
          {},
          user.companyId,
          req.programmeId
        );
      } else {
        await this.emailHelperService.sendEmailToProgrammeOwnerAdmins(
          req.programmeId,
          EmailTemplates.PROGRAMME_CERTIFICATION_REVOKE_BY_CERT,
          {},
          user.companyId
        );
      }
    }

    if (add) {
      return new DataResponseMessageDto(
        HttpStatus.OK,
        this.helperService.formatReqMessagesString(
          "programme.certifyPendingProgramme",
          []
        ),
        updated
      );
    } else {
      return new DataResponseMessageDto(
        HttpStatus.OK,
        this.helperService.formatReqMessagesString(
          "programme.certificationRevocation",
          []
        ),
        updated
      );
    }
  }

  async issueProgrammeCredit(req: ProgrammeIssue, user: User) {
    this.logger.log(
      `Programme ${req.programmeId} approve. Comment: ${req.comment}`
    );
    const program = await this.programmeLedger.getProgrammeById(
      req.programmeId
    );
    if (!program) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.programmeNotExist",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    if (program.currentStage != ProgrammeStage.AUTHORISED) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.notInAUthorizedState",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }
    if (program.creditEst - program.creditIssued < req.issueAmount) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.issuedCreditAmountcantExceedPendingCredit",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }
    let updated: any = await this.programmeLedger.issueProgrammeStatus(
      req.programmeId,
      this.configService.get("systemCountry"),
      program.companyId,
      req.issueAmount,
      this.getUserRefWithRemarks(user, req.comment)
    );
    if (!updated) {
      return new BasicResponseDto(
        HttpStatus.BAD_REQUEST,
        this.helperService.formatReqMessagesString(
          "programme.notFOundAPendingProgrammeForTheId",
          [req.programmeId]
        )
      );
    }

    const hostAddress = this.configService.get("host");
    updated.companyId.forEach(async (companyId) => {
      await this.emailHelperService.sendEmailToOrganisationAdmins(
        companyId,
        EmailTemplates.CREDIT_ISSUANCE,
        {
          programmeName: updated.title,
          credits: req.issueAmount,
          serialNumber: updated.serialNo,
          pageLink:
            hostAddress + `/programmeManagement/view?id=${updated.programmeId}`,
        }
      );
    });

    const companyData = await this.companyService.findByCompanyIds({
      companyIds: program.companyId,
    });

    const suspendedCompanies = companyData.filter(
      (company) => company.state == CompanyState.SUSPENDED
    );

    if (suspendedCompanies.length > 0) {
      updated = await this.programmeLedger.freezeIssuedCredit(
        req.programmeId,
        req.issueAmount,
        this.getUserRef(user),
        suspendedCompanies
      );
      if (!updated) {
        return new BasicResponseDto(
          HttpStatus.BAD_REQUEST,
          this.helperService.formatReqMessagesString(
            "programme.internalErrorCreditFreezing",
            [req.programmeId]
          )
        );
      }
    }

    updated.company = await this.companyRepo.find({
      where: { companyId: In(updated.companyId) },
    });
    if (updated.certifierId && updated.certifierId.length > 0) {
      updated.certifier = await this.companyRepo.find({
        where: { companyId: In(updated.certifierId) },
      });
    }

    return new DataResponseDto(HttpStatus.OK, updated);
  }

  async approveProgramme(req: ProgrammeApprove, user: User) {
    this.logger.log(
      `Programme ${req.programmeId} approve. Comment: ${req.comment}`
    );
    const program = await this.programmeLedger.getProgrammeById(
      req.programmeId
    );
    if (!program) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.programmeNotExist",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    if (program.currentStage != ProgrammeStage.AWAITING_AUTHORIZATION) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.notInPendingState",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }
    if (program.creditEst < req.issueAmount) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.issuedCreditCannotExceedEstCredit",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }
    const updated: any = await this.programmeLedger.authProgrammeStatus(
      req.programmeId,
      this.configService.get("systemCountry"),
      program.companyId,
      req.issueAmount,
      this.getUserRefWithRemarks(user, req.comment)
    );
    if (!updated) {
      return new BasicResponseDto(
        HttpStatus.BAD_REQUEST,
        this.helperService.formatReqMessagesString(
          "programme.inotFOundAPendingProgrammeForTheId",
          [req.programmeId]
        )`Does not found a pending programme for the given programme id ${req.programmeId}`
      );
    }

    updated.company = await this.companyRepo.find({
      where: { companyId: In(updated.companyId) },
    });
    if (updated.certifierId && updated.certifierId.length > 0) {
      updated.certifier = await this.companyRepo.find({
        where: { companyId: In(updated.certifierId) },
      });
    }

    const hostAddress = this.configService.get("host");
    let authDate = new Date(updated.txTime);
    let date = authDate.getDate().toString().padStart(2, "0");
    let month = authDate.toLocaleString("default", { month: "long" });
    let year = authDate.getFullYear();
    let formattedDate = `${date} ${month} ${year}`;

    updated.company.forEach(async (company) => {
      await this.emailHelperService.sendEmailToOrganisationAdmins(
        company.companyId,
        EmailTemplates.PROGRAMME_AUTHORISATION,
        {
          programmeName: updated.title,
          authorisedDate: formattedDate,
          serialNumber: updated.serialNo,
          programmePageLink:
            hostAddress + `/programmeManagement/view?id=${updated.programmeId}`,
        }
      );
    });

    return new DataResponseDto(HttpStatus.OK, updated);
  }

  async rejectProgramme(req: ProgrammeReject, user: User) {
    this.logger.log(
      `Programme ${req.programmeId} reject. Comment: ${req.comment}`
    );
    const programme = await this.findById(req.programmeId);
    const currentStage = programme.currentStage;
    if (currentStage === ProgrammeStage.REJECTED) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.rejectAlreadyRejectedProg",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }
    const updated = await this.programmeLedger.updateProgrammeStatus(
      req.programmeId,
      ProgrammeStage.REJECTED,
      ProgrammeStage.AWAITING_AUTHORIZATION,
      this.getUserRefWithRemarks(user, req.comment)
    );
    if (!updated) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          "programme.programmeNotExist",
          []
        ),
        HttpStatus.BAD_REQUEST
      );
    }

    await this.emailHelperService.sendEmailToProgrammeOwnerAdmins(
      req.programmeId,
      EmailTemplates.PROGRAMME_REJECTION,
      { reason: req.comment }
    );

    return new BasicResponseDto(HttpStatus.OK, "Successfully updated");
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

}
