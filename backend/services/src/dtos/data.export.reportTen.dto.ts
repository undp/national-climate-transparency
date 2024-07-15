import { DataExportDto } from "./data.export.dto";

export class DataExportReportTenDto extends DataExportDto {
	activityId: string;
	sector: string;
	subSectors: string[];
	titleOfActivity: string;
	description: string;
	type: string;
	startYear: string;
	endYear: string;
	additionalInfo: string;
}