import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsArray, IsIn } from "class-validator";
import { EntityType } from "../enums/shared.enum";

export class LinkActivitiesDto {

	@IsNotEmpty()
	@IsNotEmpty()
	@ApiProperty({ enum: [EntityType.ACTION, EntityType.PROGRAMME, EntityType.PROJECT] })
	@IsIn([EntityType.ACTION, EntityType.PROGRAMME, EntityType.PROJECT], {
		message: 'Invalid Entity Type. Supported types are:' + Object.values([EntityType.ACTION, EntityType.PROGRAMME, EntityType.PROJECT]),
	})
	parentType: EntityType;

	@IsNotEmpty()
	@ApiProperty()
	parentId: string;

	@IsNotEmpty()
	@IsArray()
	@ApiProperty()
	activityIds: string[];

}