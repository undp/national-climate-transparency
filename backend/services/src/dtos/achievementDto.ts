import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AchievementDto {
	
	@IsNotEmpty()
  @IsNumber()
  @ApiProperty()
	kpiId: number;

	@IsNotEmpty()
  @IsString()
  @ApiProperty()
	activityId: string;

	@IsNotEmpty()
  @IsNumber()
  @ApiProperty()
	achieved: number;
}