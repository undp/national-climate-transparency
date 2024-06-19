import { ReportType } from '../Enums/report.enum';
import {
  ReportFiveRecord,
  ReportThirteenRecord,
  ReportTwelveRecord,
} from './reportIndividualDefinitions';

export type AggregateReportData = {
  [ReportType.FIVE]: ReportFiveRecord[];
  [ReportType.TWELVE]: ReportTwelveRecord[];
  [ReportType.THIRTEEN]: ReportThirteenRecord[];
};

export type AggregateReportTotal = {
  [ReportType.FIVE]: number;
  [ReportType.TWELVE]: number;
  [ReportType.THIRTEEN]: number;
};

export type AggregateReportCurrentPage = {
  [ReportType.FIVE]: number;
  [ReportType.TWELVE]: number;
  [ReportType.THIRTEEN]: number;
};

export type AggregateReportPageSize = {
  [ReportType.FIVE]: number;
  [ReportType.TWELVE]: number;
  [ReportType.THIRTEEN]: number;
};

export const initialAggData = {
  [ReportType.FIVE]: [],
  [ReportType.TWELVE]: [],
  [ReportType.THIRTEEN]: [],
};

export const initialAggTotal = {
  [ReportType.FIVE]: 0,
  [ReportType.TWELVE]: 0,
  [ReportType.THIRTEEN]: 0,
};

export const initialAggPageSize = {
  [ReportType.FIVE]: 10,
  [ReportType.TWELVE]: 10,
  [ReportType.THIRTEEN]: 10,
};

export const initialAggCurrentPage = {
  [ReportType.FIVE]: 1,
  [ReportType.TWELVE]: 1,
  [ReportType.THIRTEEN]: 1,
};
