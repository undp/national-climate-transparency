import { DataExportDto } from "./data.export.dto";

export class DataExportReportNineDto extends DataExportDto {
	projectId;
	titleOfProject;
	description;
	sector;
	subSectors;
	type;
	technologyType;
	recipientEntities;
	nationalImplementingEntities;
	projectStatus;
	supportReceivedOrNeeded;
	startYear;
	endYear;
}