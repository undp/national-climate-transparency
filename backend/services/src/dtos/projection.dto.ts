import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, ArrayMinSize, ArrayMaxSize, ValidateNested } from 'class-validator';
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

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.CIVIL_AVIATION]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.ROAD_TRANSPORTATION]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.RAILWAYS]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.WATER_NAVIGATION]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.OTHER_TRANSPORTATION]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.OTHER_SECTORS]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.NON_SPECIFIED]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.SOLID_FUELS]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.OIL_NATURAL_GAS]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.OTHER_EMISSIONS]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.TRANSPORT_CO2]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.INJECTION_STORAGE]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.OTHER_CO2]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.MINERAL_INDUSTRY]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.CHEMICAL_INDUSTRY]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.METAL_INDUSTRY]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.NON_ENERGY_PRODUCTS]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.ELECTRONICS_INDUSTRY]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.SUBSTITUTES_OZONE]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.OTHER_MANUFACTURE]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.OTHER_INDUSTRIAL]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.ENTERIC_FERMENTATION]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.MANURE_MANAGEMENT]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.FOREST_LAND]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.CROPLAND]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.GRASSLAND]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.WETLANDS]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.SETTLEMENTS]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.OTHER_LAND]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.AGG_SOURCE]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.OTHER_AGR]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.SOLID_WASTE]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.BIOLOGICAL_TREATMENT]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.INCINERATION_BURNING]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.WASTEWATER_TREATMENT]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.OTHER_WASTE]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.INDIRECT_N2O]: number[];

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(51)
    @ArrayMaxSize(51)
    [ProjectionLeafSection.OTHER]: number[];
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
    @ValidateNested()
    @Type(() => ProjectionData)
    projectionData: ProjectionData;
}

export class ProjectionValidateDto {
	@IsNotEmpty()
	@ApiProperty({ enum: ProjectionType })
	@IsEnum(ProjectionType, {
		message: "Invalid Projection Type. Supported following status:" + Object.values(ProjectionType),
	})
	projectionType: ProjectionType;
  
    @IsNotEmpty()
	@ApiProperty({ enum: GHGRecordState })
	@IsEnum(GHGRecordState, {
		message: "Invalid State. Supported following states:" + Object.values(GHGRecordState),
	})
	state: GHGRecordState;
}
