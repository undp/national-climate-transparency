import { DataExportDto } from "./data.export.dto";

export class DataExportReportFiveDto extends DataExportDto {
	source;
	actionId;
	programmeId;
	projectId;
	titleOfAction;
	titleOfProgramme;
	titleOfProject;
	description;
	objective;
	instrumentType;
	status;
	sector;
	ghgsAffected;
	startYear;
	implementingEntities;
	achievedGHGReduction;
	expectedGHGReduction;
}