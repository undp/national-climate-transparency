import { ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { ArrayMinSize, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { IsTwoDecimalPoints } from "src/util/twoDecimalPointNumber.decorator";

export class AchievementDto {
	
	@IsNotEmpty()
  @IsNumber()
  @ApiProperty()
	kpiId: number;

	@IsNotEmpty()
  @IsString()
  @ApiProperty()
	activityId: string;

	@IsTwoDecimalPoints()
	@IsNotEmpty()
  @IsNumber()
  @ApiProperty()
	achieved: number;
}

export class AchievementDtoList {

	@ArrayMinSize(1)
	@IsNotEmpty({ each: true })
	@ApiProperty({
		type: "array",
		example: [{
			kpiId: "1",
			activityId: "T00001",
			achieved: 100
	}],
		items: {
			$ref: getSchemaPath(AchievementDto),
		},
	})
	achievements: AchievementDto[]
}