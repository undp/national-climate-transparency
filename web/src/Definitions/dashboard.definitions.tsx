export type PieChartData = {
  chartId: 1 | 2 | 3 | 4 | 5 | 6;
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

export const chartColorMappings = {
  sectors: [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FFCD56',
    '#8B4513',
    '#00FA9A',
  ],
  finance: ['#9966FF', '#36A2EB'],
  support: ['#9966FF', '#36A2EB'],
};
