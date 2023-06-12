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
    this.logger.log("AsyncOperationsHandlerService started", dataObject.name);
    if (actionType) {
      switch (actionType) {
        case AsyncActionType.Email.toString():
          return await this.emailService.sendEmail(dataObject);
        case AsyncActionType.RegistryCompanyCreate.toString():
          return await this.registryClient.createCompany(dataObject);
        case AsyncActionType.ProgrammeCreate.toString():
          return await this.registryClient.createProgramme(dataObject);
      }
    }
  }
}
