import { ReportType } from '../Enums/report.enum';
import { ReportFiveRecord, ReportTwelveRecord } from './reportIndividualDefinitions';

export type AggregateReportData = {
  [ReportType.FIVE]: ReportFiveRecord[];
  [ReportType.TWELVE]: ReportTwelveRecord[];
};

export type AggregateReportTotal = {
  [ReportType.FIVE]: number;
  [ReportType.TWELVE]: number;
};

export type AggregateReportCurrentPage = {
  [ReportType.FIVE]: number;
  [ReportType.TWELVE]: number;
};

export type AggregateReportPageSize = {
  [ReportType.FIVE]: number;
  [ReportType.TWELVE]: number;
};
