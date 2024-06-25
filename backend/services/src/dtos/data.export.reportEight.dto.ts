import { DataExportDto } from "./data.export.dto";

export class DataExportReportEightDto extends DataExportDto {
	projectId;
	titleOfProject;
	description;
	sector;
	subSectors;
	type;
	technologyType;
	supportReceivedOrNeeded;
	startYear;
	endYear;
}