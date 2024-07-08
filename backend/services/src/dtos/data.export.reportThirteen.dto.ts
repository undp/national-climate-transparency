import { DataExportDto } from "./data.export.dto";

export class DataExportReportThirteenDto extends DataExportDto {
	activityId: string;
	titleOfActivity: string;
	description: string;
	startYear: string;
	endYear: string;
	recipientEntities: string[];
	supportChannel: string;
	receivedAmountDomestic: number;
	receivedAmount: number;
	activityStatus: string;
	additionalInfo: string;
}