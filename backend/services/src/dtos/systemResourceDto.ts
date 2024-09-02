import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { SystemResourceCategory, SystemResourceType } from "../enums/shared.enum";

export class SystemResourceDto {

	@IsNotEmpty()
	@IsEnum(SystemResourceCategory, {
		each: true,
		message: 'Invalid resource category. Supported following categories:' + Object.values(SystemResourceCategory)
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(SystemResourceCategory),
	})
	resourceCategory: SystemResourceCategory;

	@IsNotEmpty()
	@IsEnum(SystemResourceType, {
		each: true,
		message: 'Invalid resource type. Supported following types:' + Object.values(SystemResourceType)
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(SystemResourceType),
	})
	resourceType: SystemResourceType;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	title: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	data: string;
}