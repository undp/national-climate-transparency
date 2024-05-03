import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ValidateDto {

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	entityId: string;
}