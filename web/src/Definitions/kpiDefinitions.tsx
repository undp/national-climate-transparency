export type NewKpiData = {
  index: number;
  name: string;
  unit: string;
  achieved: undefined;
  expected: number;
};

export type CreatedKpiData = {
  index: number;
  creator: string;
  id: number;
  name: string;
  unit: string;
  achieved: number;
  expected: number;
};
