import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsArray } from "class-validator";

export class UnlinkActivitiesDto {

	@IsNotEmpty()
	@IsArray()
	@ApiProperty()
	activityIds: string[];

}