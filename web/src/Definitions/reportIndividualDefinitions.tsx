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
  title: string;
  description: string;
  objective: string;
  sector: string;
  subSectors: string[];
  type: string;
  natAnchor: string;
  techDevelopment: string;
  capacityBuilding: string;
  startYear: number;
  endYear: number;
  internationalSupportChannel: string[];
  supportDirection: string;
  receivedAmount: number;
  receivedAmountDomestic: number;
  financialInstrument: string;
};

export type ReportSevenRecord = {
  key: number;
  title: string;
  description: string;
  objective: string;
  sector: string;
  subSectors: string[];
  type: string;
  recipientEntities: string[];
  natImplementers: string[];
  intImplementers: string[];
  supportDirection: string;
  techDevelopment: string;
  capacityBuilding: string;
  startYear: number;
  endYear: number;
  receivedAmount: number;
  receivedAmountDomestic: number;
  internationalSupportChannel: string[];
  financialInstrument: string;
  financingStatus: string;
};

export type ReportEightRecord = {
  key: number;
  title: string;
  description: string;
  objective: string;
  sector: string;
  subSectors: string[];
  type: string;
  techType: string[];
  supportDirection: string;
  startYear: number;
  endYear: number;
};

export type ReportNineRecord = {
  key: number;
  title: string;
  description: string;
  objective: string;
  sector: string;
  subSectors: string[];
  type: string;
  techType: string[];
  recipientEntities: string[];
  natImplementers: string[];
  projectStatus: string;
  supportDirection: string;
  startYear: number;
  endYear: number;
};

export type ReportTenRecord = {
  key: number;
  title: string;
  description: string;
  objective: string;
  sector: string;
  subSectors: string[];
  type: string;
  supportDirection: string;
  startYear: number;
  endYear: number;
};

export type ReportElevenRecord = {
  key: number;
  title: string;
  description: string;
  objective: string;
  sector: string;
  subSectors: string[];
  type: string;
  recipientEntities: string[];
  natImplementers: string[];
  intImplementers: string[];
  projectStatus: string;
  supportDirection: string;
  startYear: number;
  endYear: number;
};

export type ReportTwelveRecord = {
  key: number;
  title: string;
  description: string;
  objective: string;
  status: string;
  supportDirection: string;
  isEnhancingTransparency: boolean;
  startYear: number;
  endYear: number;
  fundUsd: number;
  fundDomestic: number;
  internationalSupportChannel: string[];
};

export type ReportThirteenRecord = {
  key: number;
  title: string;
  description: string;
  recipientEntities: string[];
  projectStatus: string;
  startYear: number;
  endYear: number;
  isEnhancingTransparency: boolean;
  internationalSupportChannel: string[];
  supportDirection: string;
  fundUsd: number;
  fundDomestic: number;
};
