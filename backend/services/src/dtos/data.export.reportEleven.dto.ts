import { DataExportDto } from "./data.export.dto";

export class DataExportReportElevenDto extends DataExportDto {
	projectId;
	titleOfProject;
	description;
	sector;
	subSectors;
	type;
	recipientEntities;
	nationalImplementingEntities;
    internationalImplementingEntities;
    projectStatus;
	supportReceivedOrNeeded;
	startYear;
	endYear;
}