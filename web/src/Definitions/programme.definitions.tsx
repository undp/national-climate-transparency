import { CarbonSystemType } from '../Enums/carbonSystemType.enum';
import { ProgrammeStageMRV, ProgrammeStageR, ProgrammeStageUnified } from '../Enums/programme.enum';
import { DateTime } from 'luxon';
import { SectoralScope } from '../Enums/sectoralScope.enum';
import { TypeOfMitigation } from '../Enums/shared.enum';
import { addCommSep, addSpaces } from '../Utils/utilServices';

export const getStageEnumVal = (value: string) => {
  const index = Object.keys(ProgrammeStageUnified).indexOf(value);
  if (index < 0) {
    return value;
  }
  return Object.values(ProgrammeStageUnified)[index];
};

export const getStageTagTypeMRV = (stage: ProgrammeStageMRV) => {
  switch (getStageEnumVal(stage)) {
    case ProgrammeStageMRV.AwaitingAuthorization:
      return 'error';
    case ProgrammeStageMRV.Authorised:
      return 'processing';
    case ProgrammeStageMRV.Approved:
      return 'purple';
    default:
      return 'default';
  }
};

export interface ProgrammeProperties {
  maxInternationalTransferAmount: string;
  creditingPeriodInYears: number;
  sourceOfFunding: any;
  grantEquivalentAmount: number;
  carbonPriceUSDPerTon: number;
  buyerCountryEligibility: string;
  geographicalLocation: string[];
  greenHouseGasses: any[];
  creditYear: number;
  programmeMaterials: [];
  projectMaterial: [];
}

export interface Programme {
  programmeId: string;
  externalId: string;
  serialNo: string;
  title: string;
  sectoralScope: string;
  sector: string;
  countryCodeA2: string;
  currentStage: ProgrammeStageR | ProgrammeStageMRV | ProgrammeStageUnified;
  startTime: number;
  endTime: number;
  creditChange: number;
  creditIssued: number;
  creditEst: number;
  creditBalance: number;
  creditTransferred: number[];
  creditRetired: number[];
  creditFrozen: number[];
  constantVersion: string;
  proponentTaxVatId: string[];
  companyId: number[];
  proponentPercentage: number[];
  creditOwnerPercentage: number[];
  certifierId: any[];
  certifier: any[];
  company: any[];
  creditUnit: string;
  programmeProperties: ProgrammeProperties;
  agricultureProperties: any;
  solarProperties: any;
  txTime: number;
  createdTime: number;
  txRef: string;
  typeOfMitigation: TypeOfMitigation;
  geographicalLocationCordintes: any;
  mitigationActions: any;
  environmentalAssessmentRegistrationNo: any;
  article6trade: boolean;
}

export interface ProgrammePropertiesR extends ProgrammeProperties {
  programmeCostUSD: number;
  estimatedProgrammeCostUSD: number;
}

export interface ProgrammePropertiesT extends ProgrammeProperties {
  estimatedProgrammeCostUSD: number;
}

export interface ProgrammePropertiesU extends ProgrammeProperties {
  estimatedProgrammeCostUSD: number;
  programmeCostUSD: number;
}

export interface ProgrammeR extends Programme {
  currentStage: ProgrammeStageR;
  programmeProperties: ProgrammePropertiesR;
}

export interface ProgrammeT extends Programme {
  currentStage: ProgrammeStageMRV;
  programmeProperties: ProgrammePropertiesT;
  emissionReductionExpected: number;
  emissionReductionAchieved: number;
}

export interface ProgrammeU extends Programme {
  currentStage: ProgrammeStageUnified;
  programmeProperties: ProgrammePropertiesU;
  emissionReductionExpected: number;
  emissionReductionAchieved: number;
}

export const getGeneralFields = (
  programme: Programme | ProgrammeU | ProgrammeR | ProgrammeT,
  system?: CarbonSystemType
) => {
  const res: Record<string, any> = {
    title: programme.title,
    serialNo: programme.serialNo,
    currentStatus: programme.currentStage,
    applicationType: 'Project Developer',
    sector: programme.sector,
    sectoralScope:
      Object.keys(SectoralScope)[
        Object.values(SectoralScope).indexOf(programme.sectoralScope as SectoralScope)
      ],
    startDate: DateTime.fromSeconds(Number(programme.startTime)),
    endDate: DateTime.fromSeconds(Number(programme.endTime)),
    buyerCountry: programme.programmeProperties.buyerCountryEligibility,
    environmentalAssessmentRegistrationNo: programme.environmentalAssessmentRegistrationNo,
  };
  if (system === CarbonSystemType.UNIFIED || system === CarbonSystemType.MRV) {
    const prog: any = programme;
    res.emissionsReductionExpected = prog.emissionReductionExpected;
    res.emissionsReductionAchieved = prog.emissionReductionAchieved;
  }
  return res;
};

export class UnitField {
  constructor(public unit: string, public value: any) {}
}

export const getFinancialFields = (programme: ProgrammeU | ProgrammeR | ProgrammeT) => {
  return {
    estimatedProgrammeCostUSD: addCommSep(programme.programmeProperties.estimatedProgrammeCostUSD),
    creditEst: addCommSep(programme.creditEst),
    financingType: addSpaces(programme.programmeProperties.sourceOfFunding),
    grantEquivalent: new UnitField(
      'USD',
      addCommSep(programme.programmeProperties.grantEquivalentAmount)
    ),
    carbonPriceUSDPerTon: addCommSep(programme.programmeProperties.carbonPriceUSDPerTon),
  };
};
