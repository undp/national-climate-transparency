import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class BaselineDto {

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	projectionType: string;

	@IsBoolean()
	@IsNotEmpty()
	@ApiProperty()
	projectionYear: string;
}