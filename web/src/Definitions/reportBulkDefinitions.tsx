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
  [ReportType.FIVE]: number;
  [ReportType.SIX]: number;
  [ReportType.SEVEN]: number;
  [ReportType.TEN]: number;
  [ReportType.ELEVEN]: number;
  [ReportType.TWELVE]: number;
  [ReportType.THIRTEEN]: number;
};

export type AggregateReportCurrentPage = {
  [ReportType.FIVE]: number;
  [ReportType.SIX]: number;
  [ReportType.SEVEN]: number;
  [ReportType.TEN]: number;
  [ReportType.ELEVEN]: number;
  [ReportType.TWELVE]: number;
  [ReportType.THIRTEEN]: number;
};

export type AggregateReportPageSize = {
  [ReportType.FIVE]: number;
  [ReportType.SIX]: number;
  [ReportType.SEVEN]: number;
  [ReportType.TEN]: number;
  [ReportType.ELEVEN]: number;
  [ReportType.TWELVE]: number;
  [ReportType.THIRTEEN]: number;
};

export const initialAggData = {
  [ReportType.FIVE]: [],
  [ReportType.SIX]: [],
  [ReportType.SEVEN]: [],
  [ReportType.TEN]: [],
  [ReportType.ELEVEN]: [],
  [ReportType.TWELVE]: [],
  [ReportType.THIRTEEN]: [],
};

export const initialAggTotal = {
  [ReportType.FIVE]: 0,
  [ReportType.SIX]: 0,
  [ReportType.SEVEN]: 0,
  [ReportType.TEN]: 0,
  [ReportType.ELEVEN]: 0,
  [ReportType.TWELVE]: 0,
  [ReportType.THIRTEEN]: 0,
};

export const initialAggPageSize = {
  [ReportType.FIVE]: 10,
  [ReportType.SIX]: 10,
  [ReportType.SEVEN]: 10,
  [ReportType.TEN]: 10,
  [ReportType.ELEVEN]: 10,
  [ReportType.TWELVE]: 10,
  [ReportType.THIRTEEN]: 10,
};

export const initialAggCurrentPage = {
  [ReportType.FIVE]: 1,
  [ReportType.SIX]: 1,
  [ReportType.SEVEN]: 1,
  [ReportType.TEN]: 1,
  [ReportType.ELEVEN]: 1,
  [ReportType.TWELVE]: 1,
  [ReportType.THIRTEEN]: 1,
};
