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
