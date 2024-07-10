export type ReportFiveRecord = {
  key: number;
  source: 'action' | 'programme' | 'project';
  titleOfAction: string;
  description: string;
  objective: string;
  instrumentType: string[];
  status: string;
  sector: string;
  ghgsAffected: string[];
  startYear: number;
  implementingEntities: string[];
  achievedGHGReduction: number;
  expectedGHGReduction: number;
};

export type ReportSixRecord = {
  key: number;
  activityId: string;
  sector: string;
  subSectors: string[];
  titleOfActivity: string;
  description: string;
  requiredAmountDomestic: number;
  requiredAmount: number;
  startYear: string;
  endYear: string;
  financialInstrument: string;
  type: string;
  techDevelopment: 'Yes' | 'No';
  capacityBuilding: 'Yes' | 'No';
  anchoredInNationalStrategy: 'Yes' | 'No';
  supportChannel: string;
  additionalInfo: string;
};

export type ReportSevenRecord = {
  key: number;
  activityId: string;
  titleOfActivity: string;
  description: string;
  supportChannel: string;
  recipientEntities: string[];
  nationalImplementingEntities: string[];
  internationalImplementingEntities: string[];
  receivedAmountDomestic: number;
  receivedAmount: number;
  startYear: string;
  endYear: string;
  financialInstrument: string;
  financingStatus: string;
  type: string;
  sector: string;
  subSectors: string[];
  techDevelopment: 'Yes' | 'No';
  capacityBuilding: 'Yes' | 'No';
  activityStatus: string;
  additionalInfo: string;
};

export type ReportEightRecord = {
  key: number;
  activityId: string;
  sector: string;
  subSectors: string[];
  titleOfActivity: string;
  description: string;
  type: string;
  technologyType: string;
  startYear: string;
  endYear: string;
  additionalInfo: string;
};

export type ReportNineRecord = {
  key: number;
  activityId: string;
  titleOfActivity: string;
  description: string;
  technologyType: string;
  startYear: string;
  endYear: string;
  recipientEntities: string[];
  nationalImplementingEntities: string[];
  internationalImplementingEntities: string[];
  type: string;
  sector: string;
  subSectors: string[];
  activityStatus: string;
  additionalInfo: string;
};

export type ReportTenRecord = {
  key: number;
  activityId: string;
  sector: string;
  subSectors: string[];
  titleOfActivity: string;
  description: string;
  type: string;
  startYear: string;
  endYear: string;
  additionalInfo: string;
};

export type ReportElevenRecord = {
  key: number;
  activityId: string;
  titleOfActivity: string;
  description: string;
  startYear: string;
  endYear: string;
  recipientEntities: string[];
  nationalImplementingEntities: string[];
  internationalImplementingEntities: string[];
  type: string;
  sector: string;
  subSectors: string[];
  activityStatus: string;
  additionalInfo: string;
};

export type ReportTwelveRecord = {
  key: number;
  activityId: string;
  titleOfActivity: string;
  description: string;
  startYear: string;
  endYear: string;
  recipientEntities: string[];
  supportChannel: string;
  requiredAmountDomestic: number;
  requiredAmount: number;
  activityStatus: string;
  additionalInfo: string;
};

export type ReportThirteenRecord = {
  key: number;
  activityId: string;
  titleOfActivity: string;
  description: string;
  startYear: string;
  endYear: string;
  recipientEntities: string[];
  supportChannel: string;
  receivedAmountDomestic: number;
  receivedAmount: number;
  activityStatus: string;
  additionalInfo: string;
};
