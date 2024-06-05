export type PieChartData = {
  chartId: number;
  categories: string[];
  values: number[];
  chartTitle: string;
  chartDescription: string;
  lastUpdatedTime: number;
};

export type DashboardActionItem = {
  key: number;
  actionId: number;
  title: string;
  actionType: string;
  affectedSectors: string[];
  financeNeeded: number;
  financeReceived: number;
  status: string;
  nationalImplementingEntity: string[];
};
