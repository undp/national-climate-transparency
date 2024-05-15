export type ActionMigratedData = {
  type: string[];
  ghgsAffected: string;
  natImplementer: string[];
  estimatedInvestment: number;
  achievedReduction: number;
  expectedReduction: number;
};

export type ActionSelectData = {
  id: string;
  title: string;
  instrumentType: string;
};
