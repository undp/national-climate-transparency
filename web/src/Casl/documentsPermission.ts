import { CompanyRole, Role } from '@undp/carbon-library';
import { DocType } from './enums/document.type';
import { DocumentStatus } from './enums/document.status';

export const linkDocVisible = (docStatus: DocumentStatus) => {
  let visible = false;
  if (
    docStatus === DocumentStatus.PENDING ||
    docStatus === DocumentStatus.ACCEPTED ||
    docStatus === DocumentStatus.REJECTED
  ) {
    visible = true;
  }
  return visible;
};

export const uploadDocUserPermission = (
  userInfoState: any,
  docType: DocType,
  programmeOwnerId: any[]
) => {
  let permission = false;
  console.log('doc uplaod -- > 20', programmeOwnerId);
  if (docType === DocType.DESIGN_DOCUMENT) {
    if (
      userInfoState?.companyRole === CompanyRole.GOVERNMENT &&
      userInfoState?.userRole !== Role.ViewOnly
    ) {
      permission = true;
    } else if (
      userInfoState?.companyRole === CompanyRole.PROGRAMME_DEVELOPER &&
      userInfoState?.userRole !== Role.ViewOnly
    ) {
      if (programmeOwnerId.includes(String(userInfoState?.companyId))) {
        permission = true;
      }
    }
  } else if (docType === DocType.METHODOLOGY_DOCUMENT || docType === DocType.MONITORING_REPORT) {
    if (
      (userInfoState?.companyRole === CompanyRole.GOVERNMENT ||
        userInfoState?.companyRole === CompanyRole.CERTIFIER) &&
      userInfoState?.userRole !== Role.ViewOnly
    ) {
      permission = true;
    } else if (
      userInfoState?.companyRole === CompanyRole.PROGRAMME_DEVELOPER &&
      userInfoState?.userRole !== Role.ViewOnly
    ) {
      if (programmeOwnerId.includes(String(userInfoState?.companyId))) {
        permission = true;
      }
    }
  } else if (docType === DocType.VERIFICATION_REPORT) {
    if (
      (userInfoState?.companyRole === CompanyRole.GOVERNMENT ||
        userInfoState?.companyRole === CompanyRole.CERTIFIER) &&
      userInfoState?.userRole !== Role.ViewOnly
    ) {
      permission = true;
    }
  }
  return permission;
};
