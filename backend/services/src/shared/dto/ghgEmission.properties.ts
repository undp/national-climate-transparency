import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BuildingType } from "@undp/carbon-credit-calculator";
import { IsNotEmpty, IsPositive, IsNumber, IsEnum, IsOptional, IsString } from "class-validator";

export class GhgEmissionDataProperties {
    
    @ApiPropertyOptional()
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    CO2: number

    @ApiPropertyOptional()
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    CH4: number

   @ApiPropertyOptional()
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    N2O: number
    
   @ApiPropertyOptional()
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    HFCs: number
    
    @ApiPropertyOptional()
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    PFCs:number
    
    @ApiPropertyOptional()
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    SF6: number
}