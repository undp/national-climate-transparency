import { ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, IsOptional, ValidateNested, IsNumber, Min, Max, isNotEmpty } from "class-validator";
import { ActionStatus, InstrumentType, NatAnchor } from "../enums/action.enum";
import { KpiDto } from "./kpi.dto";
import { DocumentDto } from "./document.dto";
import { KpiUpdateDto } from "./kpi.update.dto";
import { KpiUnits } from "../enums/kpi.enum";

export class ActionUpdateDto {

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	actionId: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	title: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	description: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	objective: string;

	@IsNotEmpty()
	@ApiProperty({ enum: InstrumentType })
	@IsEnum(InstrumentType, {
		message: "Invalid instrument type. Supported following instrument types:" + Object.values(InstrumentType),
	})
	instrumentType: InstrumentType;

	@IsNotEmpty()
	@ApiProperty({ enum: ActionStatus })
	@IsEnum(ActionStatus, {
		message: "Invalid status. Supported following statuses:" + Object.values(ActionStatus),
	})
	status: ActionStatus;

	@IsNotEmpty()
	@IsNumber()
	@Min(2013)
	@Max(2050)
	@ApiProperty()
	startYear: number;

	@IsNotEmpty()
	@ApiProperty({ enum: NatAnchor })
	@IsEnum(NatAnchor, {
		message: "Invalid Anchored National Strategy. Supported following strategies:" + Object.values(NatAnchor),
	})
	natAnchor: NatAnchor;

	@IsOptional()
	@ApiPropertyOptional(
		{
			type: "array",
			example: [{
				title: "document 1",
				data: "base64 document string"
			}],
			items: {
				$ref: getSchemaPath(DocumentDto),
			},
		}
	)
	newDocuments: DocumentDto[];

	@IsOptional()
	@ApiPropertyOptional(
		{
			type: "array",
			example: ["http://test.com/documents/programme_documents/testDoc1_1713334127897.csv"],
		}
	)
	removedDocuments: string[];

	// @IsOptional()
	// @ApiPropertyOptional()
	// linkedProgrammes: string[];

	@IsOptional()
	@ValidateNested()
	@ApiPropertyOptional(
		{
			type: "array",
			example: [{
				kpiId: "1",
				kpiUnits: KpiUnits.GWp_INSTALLED,
				name: "KPI 1",
				creatorType: "action",
				expected: 100
		}],
			items: {
				$ref: getSchemaPath(KpiUpdateDto),
			},
		}
	)
	kpis: KpiUpdateDto[];


}