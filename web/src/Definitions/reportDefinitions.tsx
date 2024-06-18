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
  internationalSupportChannel: string;
};
