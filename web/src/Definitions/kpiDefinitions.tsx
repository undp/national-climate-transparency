export type NewKpiData = {
  index: number;
  name: string;
  unit: string;
  achieved: undefined;
  expected: number;
  creatorType: string;
};

export type CreatedKpiData = {
  id: number;
  name: string;
  unit: string;
  achieved: number;
  expected: number;
};
