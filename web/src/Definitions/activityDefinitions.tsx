export type ActivityData = {
  key: string;
  activityId: string;
  title: string;
  reductionMeasures: string;
  status: string;
  natImplementor: string[];
  ghgsAffected?: string[];
  achievedReduction?: number;
  estimatedReduction?: number;
  technologyType?: string;
  meansOfImplementation?: string;
};

export type ParentData = {
  id: string;
  title: string;
};

export type ActivityMigratedData = {
  description: string | undefined;
  type: string | undefined;
  recipient: string[] | undefined;
  affSectors: string[] | undefined;
  affSubSectors: string[] | undefined;
  startYear: number | undefined;
  endYear: number | undefined;
  expectedTimeFrame: number | undefined;
};
