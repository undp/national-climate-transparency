import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateIf } from "class-validator";
import { ActivityStatus, ImpleMeans, Measure, SupportType, TechnologyType } from "../enums/activity.enum";
import { EntityType, IntImplementor, NatImplementor } from "../enums/shared.enum";
import { DocumentDto } from "./document.dto";

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

	@ValidateIf((c) => c.parentType)
	@IsNotEmpty()
	@ApiProperty({ enum: EntityType })
	@IsEnum(EntityType, {
		message: "Invalid parent type. Supported following paren types:" + Object.values(EntityType),
	})
	parentType: EntityType;

	@IsOptional()
	@IsString()
	@ApiProperty()
	parentId: string;

	@ValidateIf((c) => c.supportType)
	@IsNotEmpty()
	@ApiProperty({ enum: SupportType })
	@IsEnum(SupportType, {
		message: "Invalid type of support. Supported following types:" + Object.values(SupportType),
	})
	supportType: SupportType;

	@ValidateIf((c) => c.measure)
	@IsNotEmpty()
	@ApiProperty({ enum: Measure })
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
	@ApiProperty({
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
	@ApiProperty({
		type: [String],
		enum: Object.values(IntImplementor),
	})
	internationalImplementingEntity: IntImplementor[]

	@IsOptional()
	@IsBoolean()
	@ApiProperty()
	anchoredInNationalStrategy: boolean;

	@ValidateIf((c) => c.meansOfImplementation)
	@IsNotEmpty()
	@ApiProperty({ enum: ImpleMeans })
	@IsEnum(ImpleMeans, {
		message: "Invalid Means of Implementation. Supported following types:" + Object.values(ImpleMeans),
	})
	meansOfImplementation: ImpleMeans;

	@ValidateIf((c) => c.technologyType)
	@IsNotEmpty()
	@ApiProperty({ enum: TechnologyType })
	@IsEnum(TechnologyType, {
		message: "Invalid Technology Type. Supported following types:" + Object.values(TechnologyType),
	})
	technologyType: TechnologyType;

	@IsOptional()
	@IsString()
	@ApiProperty()
	etfDescription: string;

	@IsOptional()
	@ApiProperty()
	documents: DocumentDto[];

	@IsNumber()
	@ApiProperty()
	achievedGHGReduction: number;

	@IsNumber()
	@ApiProperty()
	expectedGHGReduction: number;

	@IsOptional()
	@ApiProperty()
	@IsString()
	comments: string;

	@IsOptional()
	@ApiProperty()
	mitigationInfo: any;

}