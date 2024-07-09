import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ProjectionType } from "src/enums/projection.enum";

export class BaselineDto {

	@IsNotEmpty()
	@ApiProperty({ enum: ProjectionType })
	@IsEnum(ProjectionType, {
		message: "Invalid Projection Type. Supported following status:" + Object.values(ProjectionType),
	})
	projectionType: ProjectionType;

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	projectionYear: string;
}