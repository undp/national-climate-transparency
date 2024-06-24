import { DataExportDto } from "./data.export.dto";

export class DataExportReportTenDto extends DataExportDto {
	projectId;
	titleOfProject;
	description;
	sector;
	subSectors;
	type;
	supportReceivedOrNeeded;
	startYear;
	endYear;
}