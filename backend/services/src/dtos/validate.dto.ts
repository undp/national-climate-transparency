import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class ValidateDto {

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	entityId: string;

	@IsBoolean()
	@IsNotEmpty()
	@ApiProperty()
	validateStatus: boolean
}