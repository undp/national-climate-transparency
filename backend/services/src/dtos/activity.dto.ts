import { ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateIf } from "class-validator";
import { ActivityStatus, ImpleMeans, Measure, SupportType, TechnologyType } from "../enums/activity.enum";
import { EntityType, GHGS, IntImplementor, NatImplementor, Recipient } from "../enums/shared.enum";
import { DocumentDto } from "./document.dto";
import { Type } from "class-transformer";

export class ActivityDto {

	activityId: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	title: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	description: string;

	@IsNotEmpty()
	@ApiProperty({ enum: [EntityType.ACTION, EntityType.PROGRAMME, EntityType.PROJECT] })
	@IsIn([EntityType.ACTION, EntityType.PROGRAMME, EntityType.PROJECT], {
		message: 'Invalid Entity Type. Supported types are:' + Object.values([EntityType.ACTION, EntityType.PROGRAMME, EntityType.PROJECT]),
	})
	parentType: EntityType;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
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
	internationalImplementingEntity: IntImplementor[];

	@IsArray()
	@ArrayMinSize(1)
	@MaxLength(100, { each: true })
	@IsNotEmpty({ each: true })
	@IsEnum(Recipient, {
		each: true,
		message: 'Invalid Recipient Entity. Supported following entities:' + Object.values(Recipient)
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(Recipient),
	})
	recipientEntities: Recipient[];

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
	documents: DocumentDto[];

	@ValidateIf((c) => c.ghgsAffected)
	@IsNotEmpty()
	@ApiProperty({ enum: GHGS })
	@IsEnum(GHGS, {
		message: "Invalid GHG. Supported following types:" + Object.values(GHGS),
	})
	ghgsAffected: GHGS;

	@ValidateIf((c) => c.achievedGHGReduction)
	@IsNumber()
	@ApiProperty()
	achievedGHGReduction: number;

	@ValidateIf((c) => c.expectedGHGReduction)
	@IsNumber()
	@ApiProperty()
	expectedGHGReduction: number;

	@IsNumber()
	@ApiProperty()
	startYear: number;

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
			methodologyDocuments: [{
				title: "mitigation document 1",
				data: "base64 document string"
			}],
			resultDocuments: [{
				title: "result document 1",
				data: "base64 document string"
			}]
		},
	})
	mitigationInfo: any;

	@IsOptional()
	@ApiPropertyOptional({
		type: "object",
		example: {
			expected: {
				baselineEmissions: [7, 8, 9, 7],
				activityEmissionsWithM: [7, 8, 9, 7],
				activityEmissionsWithAM: [7, 8, 9, 7],
				expectedEmissionReductWithM: [7, 8, 9, 7],
				expectedEmissionReductWithAM: [7, 8, 9, 7],
				total: {
					baselineEmissions: 31,
					activityEmissionsWithM: 31,
					activityEmissionsWithAM: 31,
					expectedEmissionReductWithM: 31,
					expectedEmissionReductWithAM: 31,
				}
			},
			actual: {
				baselineActualEmissions: [7, 8, 9, 7],
				activityActualEmissions: [7, 8, 9, 7],
				actualEmissionReduct: [7, 8, 9, 7],
				total: {
					baselineActualEmissions: 31,
					activityActualEmissions: 31,
					actualEmissionReduct: 31,
				}
			},
			startYear: 2015,
			unit: GHGS.CO,
		},
	})
	mitigationTimeline: any;
}
