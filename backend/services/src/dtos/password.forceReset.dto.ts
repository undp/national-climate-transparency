import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class PasswordForceResetDto {

	@IsNotEmpty()
	@IsNumber()
	@ApiProperty()
	userId: number;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	newPassword: string;

}