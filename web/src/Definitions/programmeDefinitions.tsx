export type ProgrammeData = {
  key: string;
  programmeId: string;
  actionId: string;
  title: string;
  type: string;
  status: string;
  subSectorsAffected: string;
  estimatedInvestment: number;
};

export type ProgrammeMigratedData = {
  type: string[];
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
