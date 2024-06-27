import { DataExportDto } from "./data.export.dto";

export class DataExportReportSixDto extends DataExportDto {
	projectId;
	titleOfProject;
	description;
	sector;
	subSectors;
	type;
	supportReceivedOrNeeded;
	anchoredInNationalStrategy;
	techDevelopment;
	capacityBuilding;
	financingOnly;
	startYear;
	endYear;
	receivedAmount;
	receivedAmountDomestic;
	internationalSupportChannel;
	financialInstrument;
}