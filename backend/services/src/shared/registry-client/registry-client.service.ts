import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UserDto } from "../dto/user.dto";
import axios from "axios";
import { ProgrammeDto } from "../dto/programme.dto";
import { NDCAction } from "../entities/ndc.action.entity";
import { NDCActionDto } from "../dto/ndc.action.dto";
import { ProgrammeDocumentDto } from "../dto/programme.document.dto";
import { NDCActionType } from "../enum/ndc.action.enum";

@Injectable()
export class RegistryClientService {
  constructor(private configService: ConfigService, private logger: Logger) {}


    private async sendHttp(endpoint: string, data: any) {

        if (!this.configService.get("registry.syncEnable")) {
            this.logger.debug("Company created ignored due to registry sync disable");
            return;
        }

        return await axios.post(
            this.configService.get("registry.endpoint") + endpoint,
            data,
            {
                headers: {
                api_key: `${this.configService.get("registry.apiToken")}`,
                },
            }
            ).catch(ex => {
                console.log('Exception', ex.response?.data)
                if (ex.response?.data?.statusCode == 400 && ex.response?.data?.message?.indexOf('already exist') >= 0 ){
                    return data;
                }
                
                throw ex;
            });
    }

  public async addDocument(document: ProgrammeDocumentDto) {
    console.log('adding document on registry', document)
    const resp = await this.sendHttp("/national/programme/addDocument", document);
    console.log('Successfully create document on registry', document.actionId)
    return resp;
  }

  public async programmeAccept(document: any) {
    console.log('programme accept on registry', document)
    const resp = await this.sendHttp("/national/programme/acceptProgramme", document);
    console.log('Successfully programme accepted on registry', document.actionId)
    return resp;
  }

  private createNDCReq(ndc: NDCAction | NDCActionDto) {
    return {
        typeOfMitigation: ndc.typeOfMitigation,
        userEstimatedCredits: ndc.ndcFinancing?.userEstimatedCredits,
        systemEstimatedCredits: ndc.ndcFinancing?.systemEstimatedCredits ? ndc.ndcFinancing?.systemEstimatedCredits : 0,
        actionId: ndc.id,
        constantVersion: '' + ndc.constantVersion,
        properties: (ndc.agricultureProperties ? ndc.agricultureProperties : ndc.solarProperties ? ndc.solarProperties : undefined)
    };
  }
  public async addMitigation(ndc: NDCAction) {
    const mitigationReq = this.createNDCReq(ndc);
    console.log('creating mitigation action on registry', ndc, mitigationReq)
    const resp = await this.sendHttp("/national/programme/addMitigation", {
        "mitigation": mitigationReq,
        "externalId": ndc.externalId
    });
    console.log('Successfully create mitigation on registry', mitigationReq.actionId)
    return resp;
  }

  public async updateOwnership(req: any) {

    console.log('creating ownership update on registry', req)
    const resp = await this.sendHttp("/national/programme/updateOwnership", req);
    console.log('Successfully create updated ownership on registry')
    return resp;
  }

  public async createCompany(userDto: UserDto) {

    console.log('creating company on registry', userDto)
    const resp = await this.sendHttp("/national/user/add", userDto);
    console.log('Successfully create company on registry', userDto.company.name)
    return resp;
  }

  public async createProgramme(programme: ProgrammeDto) {

    const { includedInNDC, includedInNap, ndcScope, ...props } = programme.programmeProperties;
    // props['programmeMaterials'] = [ programme.designDocument ]
    const programmeReq =  {
        "title": programme.title,
        "externalId": programme.externalId,
        "sectoralScope": programme.sectoralScope,
        "sector": programme.sector,
        "startTime": programme.startTime,
        "endTime": programme.endTime,
        "proponentTaxVatId": programme.proponentTaxVatId,
        "proponentPercentage": programme.proponentPercentage,
        "programmeProperties": props,
        // "creditEst": programme.creditEst,
      }

    if (programme.ndcAction && (programme.ndcAction.action === NDCActionType.Mitigation || programme.ndcAction.action === NDCActionType.CrossCutting) && programme.ndcAction.typeOfMitigation) {
        programmeReq["mitigationActions"] = [this.createNDCReq(programme.ndcAction)]
    }
    console.log('Creating programme', JSON.stringify(programmeReq))
    const resp = await this.sendHttp("/national/programme/create", programmeReq);

    this.logger.log('Successfully create programme on registry', resp)
    return resp;
  }
}
