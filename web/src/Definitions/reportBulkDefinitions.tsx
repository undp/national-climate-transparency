import { ReportType } from '../Enums/report.enum';
import {
  ReportElevenRecord,
  ReportFiveRecord,
  ReportSevenRecord,
  ReportSixRecord,
  ReportTenRecord,
  ReportThirteenRecord,
  ReportTwelveRecord,
} from './reportIndividualDefinitions';

export type AggregateReportData = {
  [ReportType.FIVE]: ReportFiveRecord[];
  [ReportType.SIX]: ReportSixRecord[];
  [ReportType.SEVEN]: ReportSevenRecord[];
  [ReportType.TEN]: ReportTenRecord[];
  [ReportType.ELEVEN]: ReportElevenRecord[];
  [ReportType.TWELVE]: ReportTwelveRecord[];
  [ReportType.THIRTEEN]: ReportThirteenRecord[];
};

export type AggregateReportTotal = {
  [key in ReportType]: number;
};

export type AggregateReportPageSize = {
  [key in ReportType]: number;
};

export type AggregateReportCurrentPage = {
  [key in ReportType]: number;
};

export const initialAggData: AggregateReportData = {} as AggregateReportData;
export const initialAggTotal: AggregateReportTotal = {} as AggregateReportTotal;
export const initialAggPageSize: AggregateReportPageSize = {} as AggregateReportPageSize;
export const initialAggCurrentPage: AggregateReportCurrentPage = {} as AggregateReportCurrentPage;

Object.values(ReportType).forEach((report) => {
  initialAggData[report] = [];
  initialAggTotal[report] = 0;
  initialAggPageSize[report] = 10;
  initialAggCurrentPage[report] = 1;
});
