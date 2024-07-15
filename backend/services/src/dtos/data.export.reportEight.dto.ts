import { DataExportDto } from "./data.export.dto";

export class DataExportReportEightDto extends DataExportDto {
	activityId: string;
	sector: string;
	subSectors: string[];
	titleOfActivity: string;
	description: string;
	type: string;
	technologyType: string;
	startYear: string;
	endYear: string;
	additionalInfo: string;
}