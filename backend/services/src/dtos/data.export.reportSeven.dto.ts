import { DataExportDto } from "./data.export.dto";
export class DataExportReportSevenDto extends DataExportDto {
	activityId: string;
	titleOfActivity: string;
	description: string;
	supportChannel: string;
	recipientEntities: string[];
	nationalImplementingEntities: string[];
	internationalImplementingEntities: string[];
	receivedAmountDomestic: number;
	receivedAmount: number;
	startYear: string;
	endYear: string;
	financialInstrument: string;
	financingStatus: string;
	type: string;
	sector: string;
	subSectors: string[];
	techDevelopment: 'Yes' | 'No';
	capacityBuilding: 'Yes' | 'No';
	activityStatus: string;
	additionalInfo: string;
  }