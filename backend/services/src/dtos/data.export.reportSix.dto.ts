import { DataExportDto } from "./data.export.dto";

export class DataExportReportSixDto extends DataExportDto {
	activityId: string;
	sector: string;
	subSectors: string[];
	titleOfActivity: string;
	description: string;
	requiredAmountDomestic: number;
	requiredAmount: number;
	startYear: string;
	endYear: string;
	financialInstrument: string;
	type: string;
	techDevelopment: 'Yes' | 'No';
	capacityBuilding: 'Yes' | 'No';
	anchoredInNationalStrategy: 'Yes' | 'No';
	supportChannel: string;
	additionalInfo: string;
}