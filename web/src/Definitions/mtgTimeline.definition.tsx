export interface ExpectedTimeline {
  key: string;
  ghg: string;
  topic: string;
  total: number;
  values: number[];
}

export interface ActualTimeline {
  key: string;
  ghg: string;
  topic: string;
  total: number;
  values: number[];
}

export const ExpectedRows = {
  ROW_ONE: ['ktCO2', 'Baseline Emissions (without measures)'],
  ROW_TWO: ['ktCO2', 'Activity Emissions (with measures)'],
  ROW_THREE: ['ktCO2', 'Activity Emissions (with additional measures)'],
  ROW_FOUR: ['ktCO2e', 'Expected Emission Reductions (with measures)'],
  ROW_FIVE: ['ktCO2e', 'Expected Emission Reductions (with additional measures)'],
};

export const ActualRows = {
  ROW_ONE: ['ktCO2', 'Baseline Actual Emissions'],
  ROW_TWO: ['ktCO2', 'Activity Actual Emissions'],
  ROW_THREE: ['ktCO2e', 'Actual Equivalent Emission Reductions'],
};
