export type ActivityData = {
  key: string;
  activityId: string;
  title: string;
  reductionMeasures: string;
  status: string;
  startYear: number;
  endYear: number;
  natImplementor: string;
};

export type ParentData = {
  id: string;
  title: string;
  desc: string;
};

export type ActivityMigratedData = {
  recipient: string[];
  affSectors: string[];
  affSubSectors: string[];
  startYear: number;
  endYear: number;
  expectedTimeFrame: number;
};
