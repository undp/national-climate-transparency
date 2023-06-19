import { RegistryClientService } from "src/shared/registry-client/registry-client.service";
import { AsyncActionType } from "../shared/enum/async.action.type.enum";
import { EmailService } from "src/shared/email/email.service";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class AsyncOperationsHandlerService {
  constructor(
    private emailService: EmailService,
    private registryClient: RegistryClientService,
    private logger: Logger
  ) {}

  async handler(actionType: any, dataObject: any) {

    this.logger.log("AsyncOperationsHandlerService started", actionType.toString());
    if (actionType) {
      switch (actionType.toString()) {
        case AsyncActionType.Email.toString():
          return this.emailService.sendEmail(dataObject);
        case AsyncActionType.RegistryCompanyCreate.toString():
          return this.registryClient.createCompany(dataObject);
        case AsyncActionType.ProgrammeCreate.toString():
          return this.registryClient.createProgramme(dataObject);
        case AsyncActionType.DocumentUpload.toString():
          return this.registryClient.addDocument(dataObject);
        case AsyncActionType.ProgrammeAccept.toString():
          return this.registryClient.programmeAccept(dataObject);
        case AsyncActionType.AddMitigation.toString():
          return this.registryClient.addMitigation(dataObject);
      }
    }
  }
}
