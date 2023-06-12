import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UserDto } from "../dto/user.dto";
import axios from "axios";
import { ProgrammeDto } from "../dto/programme.dto";

@Injectable()
export class RegistryClientService {
  constructor(private configService: ConfigService, private logger: Logger) {}

  public async createCompany(userDto: UserDto) {
    this.logger.log("RegistryClientService createCompany started", userDto.name);
    this.logger.log("endpoint", this.configService.get("registry.endpoint"));
    this.logger.log("apiToken", this.configService.get("registry.apiToken"));

    if (!this.configService.get("registry.syncEnable")) {
      this.logger.debug("Company created ignored due to registry sync disable");
      return;
    }

    this.logger.log("path ", this.configService.get("registry.endpoint") + "/national/user/add");
    return await axios.post(
      this.configService.get("registry.endpoint") + "/national/user/add",
      userDto,
      {
        headers: {
          api_key: `${this.configService.get("registry.apiToken")}`,
        },
      }
    );
  }

  public async createProgramme(programme: ProgrammeDto) {
    if (!this.configService.get("registry.syncEnable")) {
      this.logger.debug(
        "Programme created ignored due to registry sync disable"
      );
      return;
    }

    const { includedInNDC, includedInNap, ndcScope, ...props } =
      programme.programmeProperties;
    // props['programmeMaterials'] = [ programme.designDocument ]
    const programmeReq = {
      title: programme.title,
      externalId: programme.externalId,
      sectoralScope: programme.sectoralScope,
      sector: programme.sector,
      startTime: programme.startTime,
      endTime: programme.endTime,
      proponentTaxVatId: programme.proponentTaxVatId,
      proponentPercentage: programme.proponentPercentage,
      programmeProperties: props,
      creditEst: programme.creditEst,
    };

    if (programme.ndcAction) {
      programmeReq["mitigationActions"] = [];
      if (programme.ndcAction.agricultureProperties) {
        programmeReq["mitigationActions"].push(
          programme.ndcAction.agricultureProperties
        );
      } else if (programme.ndcAction.solarProperties) {
        programmeReq["mitigationActions"].push(
          programme.ndcAction.solarProperties
        );
      } else {
        programmeReq["mitigationActions"].push({});
      }

      programmeReq["mitigationActions"][0]["typeOfMitigation"] =
        programme.ndcAction.typeOfMitigation;
      programmeReq["mitigationActions"][0]["userEstimatedCredits"] =
        programme.ndcAction.ndcFinancing.userEstimatedCredits;
      programmeReq["mitigationActions"][0]["systemEstimatedCredits"] =
        programme.ndcAction.ndcFinancing.systemEstimatedCredits;
    }
    return await axios.post(
      this.configService.get("registry.endpoint") +
        "/national/programme/create",
      programmeReq,
      {
        headers: {
          api_key: `${this.configService.get("registry.apiToken")}`,
        },
      }
    );
  }
}
