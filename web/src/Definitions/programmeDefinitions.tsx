export type ProgrammeData = {
  key: string;
  programmeId: string;
  actionId: string;
  title: string;
  type: string;
  status: string;
  subSectorsAffected: string;
  estimatedInvestment: number;
  ghgsAffected: string[];
  types: string[];
  natImplementer: string[];
  achievedReduction: number;
  estimatedReduction: number;
};

export type ProgrammeMigratedData = {
  intImplementor: string[];
  recipientEntity: string[];
  ghgsAffected: string[];
  achievedReduct: number;
  expectedReduct: number;
};

export type ProgrammeSelectData = {
  id: string;
  title: string;
};
