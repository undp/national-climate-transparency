import { DataExportDto } from "./data.export.dto";

export class DataExportReportElevenDto extends DataExportDto {
	activityId: string;
	titleOfActivity: string;
	description: string;
	startYear: string;
	endYear: string;
	recipientEntities: string[];
	nationalImplementingEntities: string[];
	internationalImplementingEntities: string[];
	type: string;
	sector: string;
	subSectors: string[];
	activityStatus: string;
	additionalInfo: string;
}