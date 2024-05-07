import { ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateIf } from "class-validator";
import { ActivityStatus, ImpleMeans, Measure, TechnologyType } from "../enums/activity.enum";
import { EntityType, IntImplementor, NatImplementor } from "../enums/shared.enum";
import { DocumentDto } from "./document.dto";

export class ActivityUpdateDto {

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	activityId: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	title: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	description: string;

	@ValidateIf((c) => c.parentType)
	@IsNotEmpty()
	@ApiPropertyOptional({ enum: EntityType })
	@IsEnum(EntityType, {
		message: "Invalid parent type. Supported following paren types:" + Object.values(EntityType),
	})
	parentType: EntityType;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	parentId: string;

	@ValidateIf((c) => c.measure)
	@IsNotEmpty()
	@ApiPropertyOptional({ enum: Measure })
	@IsEnum(Measure, {
		message: "Invalid Measure type. Supported following types:" + Object.values(Measure),
	})
	measure: Measure;

	@IsNotEmpty()
	@ApiProperty({ enum: ActivityStatus })
	@IsEnum(ActivityStatus, {
		message: "Invalid activity status. Supported following status:" + Object.values(ActivityStatus),
	})
	status: ActivityStatus;

	@ValidateIf((c) => c.nationalImplementingEntity)
	@IsOptional()
	@IsArray()
	@ArrayMinSize(1)
	@MaxLength(100, { each: true })
	@IsNotEmpty({ each: true })
	@IsEnum(NatImplementor, {
		each: true,
		message: 'Invalid National Implementing Entity. Supported following entities:' + Object.values(NatImplementor)
	})
	@ApiPropertyOptional({
		type: [String],
		enum: Object.values(NatImplementor),
	})
	nationalImplementingEntity: NatImplementor[]

	@ValidateIf((c) => c.internationalImplementingEntity)
	@IsOptional()
	@IsArray()
	@ArrayMinSize(1)
	@MaxLength(100, { each: true })
	@IsNotEmpty({ each: true })
	@IsEnum(IntImplementor, {
		each: true,
		message: 'Invalid International Implementing Entity. Supported following entities:' + Object.values(IntImplementor)
	})
	@ApiPropertyOptional({
		type: [String],
		enum: Object.values(IntImplementor),
	})
	internationalImplementingEntity: IntImplementor[]

	@IsOptional()
	@IsBoolean()
	@ApiPropertyOptional()
	anchoredInNationalStrategy: boolean;

	@ValidateIf((c) => c.meansOfImplementation)
	@IsNotEmpty()
	@ApiPropertyOptional({ enum: ImpleMeans })
	@IsEnum(ImpleMeans, {
		message: "Invalid Means of Implementation. Supported following types:" + Object.values(ImpleMeans),
	})
	meansOfImplementation: ImpleMeans;

	@ValidateIf((c) => c.technologyType)
	@IsNotEmpty()
	@ApiPropertyOptional({ enum: TechnologyType })
	@IsEnum(TechnologyType, {
		message: "Invalid Technology Type. Supported following types:" + Object.values(TechnologyType),
	})
	technologyType: TechnologyType;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	etfDescription: string;

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
			example: ["http://test.com/documents/activity_documents/testDoc1_1713334127897.csv"],
		}
	)
	removedDocuments: string[];

	@IsNumber()
	@ApiProperty()
	achievedGHGReduction: number;

	@IsNumber()
	@ApiProperty()
	expectedGHGReduction: number;

	@IsOptional()
	@ApiPropertyOptional()
	@IsString()
	comments: string;

	@IsOptional()
	@ApiPropertyOptional({
		type: "object",
		example: {
			mitigationMethodology: "CO2",
			mitigationMethodologyDescription: "test",
			mitigationCalcEntity: "ABB",
			comments: "test mitigation comments",
			methodologyDocuments: [
				{
					title: "added mitigation document ",
					data: "base64 document string"
				},
				{
					createdTime: 12556988775,
					title: "existing document",
					updatedTime: undefined,
					url: "www.test.com/documents/activity_documents/crr_mit_01.pdf",
				}
			],
			resultDocuments: [
				{
					title: "added result document ",
					data: "base64 document string"
				},
				{
					createdTime: 12556988775,
					title: "existing document",
					updatedTime: undefined,
					url: "www.test.com/documents/activity_documents/crr_rep_01.pdf",
				}
			]
		},
	})
	mitigationInfo: any;

}