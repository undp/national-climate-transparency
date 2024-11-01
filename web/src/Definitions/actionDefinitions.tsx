import { ActionType } from '../Enums/action.enum';

export type ActionMigratedData = {
  ghgsAffected: string[];
  natImplementer: string[];
  estimatedInvestment: number;
  achievedReduction: number;
  expectedReduction: number;
};

export type ActionSelectData = {
  id: string;
  title: string;
  instrumentType: string;
  sector: string;
  type: ActionType;
  hasChildActivities: boolean;
};
