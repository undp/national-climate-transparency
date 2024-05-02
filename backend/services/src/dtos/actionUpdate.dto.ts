import { ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, IsOptional, ValidateNested, IsNumber, Min, Max, isNotEmpty, ArrayMinSize, MaxLength, IsArray } from "class-validator";
import { ActionStatus, InstrumentType, NatAnchor } from "../enums/action.enum";
import { KpiDto } from "./kpi.dto";
import { DocumentDto } from "./document.dto";
import { KpiUpdateDto } from "./kpi.update.dto";

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