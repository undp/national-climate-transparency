import { DataExportDto } from "./data.export.dto";

export class DataExportReportTwelveDto extends DataExportDto {
	activityId: string;
	titleOfActivity: string;
	description: string;
	startYear: string;
	endYear: string;
	recipientEntities: string[];
	supportChannel: string;
	requiredAmountDomestic: number;
	requiredAmount: number;
	activityStatus: string;
	additionalInfo: string;
}