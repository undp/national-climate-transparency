import { DataExportDto } from "./data.export.dto";

export class DataExportReportTwelveDto extends DataExportDto {
	projectId;
	titleOfProject;
	description;
	projectStatus;
	supportReceivedOrNeeded;
	transparency;
	startYear;
	endYear;
	receivedAmount;
	receivedAmountDomestic;
	internationalSupportChannel;
}