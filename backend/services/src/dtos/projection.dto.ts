import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectionLeafSection, ProjectionType } from 'src/enums/projection.enum';
import { GHGRecordState } from 'src/enums/ghg.state.enum';

export class ProjectionData {

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.ENERGY_INDUSTRIES]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.MANUFACTURING_CONSTRUCTION]: number[];

}
  
  
export class ProjectionDto {

	@IsNotEmpty()
	@ApiProperty({ enum: ProjectionType })
	@IsEnum(ProjectionType, {
		message: "Invalid Projection Type. Supported following status:" + Object.values(ProjectionType),
	})
	projectionType: ProjectionType;
  
    @ApiProperty()
    @IsNotEmpty()
    @Type(() => ProjectionData)
    projectionData: ProjectionData;
  
    @IsNotEmpty()
	@ApiProperty({ enum: GHGRecordState })
	@IsEnum(GHGRecordState, {
		message: "Invalid State. Supported following states:" + Object.values(GHGRecordState),
	})
	state: GHGRecordState;
}
