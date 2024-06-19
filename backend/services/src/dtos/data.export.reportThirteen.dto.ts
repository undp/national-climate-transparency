import { DataExportDto } from "./data.export.dto";

export class DataExportReportThirteenDto extends DataExportDto {
	projectId;
	titleOfProject;
	description;
	recipientEntities;
	projectStatus;
	supportReceivedOrNeeded;
	transparency;
	startYear;
	endYear;
	receivedAmount;
	receivedAmountDomestic;
	internationalSupportChannel;
}