import { ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, IsOptional, ValidateNested, IsNumber, Min, Max, MaxLength, ArrayMinSize, IsArray } from "class-validator";
import { ActionStatus, InstrumentType, NatAnchor } from "../enums/action.enum";
import { KpiDto } from "./kpi.dto";
import { DocumentDto } from "./document.dto";
import { KpiUnits } from "../enums/kpi.enum";
import { Sector } from "../enums/sector.enum";

export class ActionDto {

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
	@IsEnum(Sector, {
		each: true,
		message: 'Invalid Affected Sector. Supported following types:' + Object.values(Sector)
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(Sector),
	})
	sector: Sector;

	@IsArray()
	@ArrayMinSize(1)
	@MaxLength(100, { each: true })
	@IsNotEmpty({ each: true })
	@IsEnum(InstrumentType, {
		each: true,
		message: "Invalid instrument type. Supported following instrument types:" + Object.values(InstrumentType),
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(InstrumentType),
	})
	instrumentType: InstrumentType[];

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

	@IsArray()
	@ArrayMinSize(1)
	@MaxLength(100, { each: true })
	@IsNotEmpty({ each: true })
	@IsEnum(NatAnchor, {
		each: true,
		message: "Invalid Anchored National Strategy. Supported following strategies:" + Object.values(NatAnchor),
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(NatAnchor),
	})
	natAnchor: NatAnchor[];

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
	documents: DocumentDto[];

	@IsOptional()
	@ApiPropertyOptional()
	linkedProgrammes: string[];

	@IsOptional()
	@ValidateNested()
	@ApiPropertyOptional(
		{
			type: "array",
			example: [{
				name: "KPI 1",
				kpiUnit: KpiUnits.GWp_INSTALLED,
				creatorType: "action",
				expected: 100
			}],
			items: {
				$ref: getSchemaPath(KpiDto),
			},
		}
	)
	kpis: KpiDto[];


}