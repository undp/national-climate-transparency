import { DataExportDto } from "./data.export.dto";

export class DataExportReportSevenDto extends DataExportDto {
	projectId;
	titleOfProject;
	description;
	sector;
	subSectors;
	type;
	recipientEntities;
	nationalImplementingEntities;
  internationalImplementingEntities;
	supportReceivedOrNeeded;
	techDevelopment;
	capacityBuilding;
	financingOnly;
	startYear;
	endYear;
	receivedAmount;
	receivedAmountDomestic;
	internationalSupportChannel;
	financialInstrument;
	financingStatus;
}