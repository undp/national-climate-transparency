import { RegistryClientService } from "src/shared/registry-client/registry-client.service";
import { AsyncActionType } from "../shared/enum/async.action.type.enum";
import { EmailService } from "src/shared/email/email.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AsyncOperationsHandlerService {
  constructor(
    private emailService: EmailService,
    private registryClient: RegistryClientService
  ) {}

  async handler(actionType: any, dataObject: any) {
    if (actionType) {
      switch (actionType) {
        case AsyncActionType.Email.toString():
          return await this.emailService.sendEmail(dataObject);
          break;
        case AsyncActionType.RegistryCompanyCreate.toString():
          return await this.registryClient.createCompany(dataObject);
          break;
      }
    }
  }
}
