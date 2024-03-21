import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  AsyncAction,
  AsyncOperationsInterface,
} from "../async-operations/async-operations.interface";
import { AsyncActionType } from "../enums/async.action.type.enum";
import { HelperService } from "../util/helpers.service";
import { OrganisationService } from "src/organisation/organisation.service";

@Injectable()
export class EmailHelperService {
  isEmailDisabled: boolean;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => OrganisationService))
    private companyService: OrganisationService,
    private asyncOperationsInterface: AsyncOperationsInterface,
    private helperService: HelperService
  ) {
    this.isEmailDisabled = this.configService.get<boolean>(
      "email.disableLowPriorityEmails"
    );
  }

  public async sendEmail(
    sender: string,
    template,
    templateData: any,
    companyId: number
  ) {
    if (this.isEmailDisabled) return;
    const companyDetails = await this.companyService.findByCompanyId(companyId);
    const systemCountryName = this.configService.get("systemCountryName");
    templateData = {
      ...templateData,
      countryName: systemCountryName,
      government: companyDetails.name,
    };
    const action: AsyncAction = {
      actionType: AsyncActionType.Email,
      actionProps: {
        emailType: template.id,
        sender: sender,
        subject: this.helperService.getEmailTemplateMessage(
          template["subject"],
          templateData,
          true
        ),
        emailBody: this.helperService.getEmailTemplateMessage(
          template["html"],
          templateData,
          false
        ),
      },
    };
    await this.asyncOperationsInterface.AddAction(action);
  }
}
