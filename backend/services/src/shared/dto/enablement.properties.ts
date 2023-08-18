import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BuildingType } from "@undp/carbon-credit-calculator";
import { IsNotEmpty, IsPositive, IsNumber, IsEnum, IsOptional, IsString, IsArray } from "class-validator";
import { EnablementTypes } from "../enum/enablementTypes.enum";

export class EnablementProperties {

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title: string;

    @ApiPropertyOptional()
    @IsArray()
    @IsOptional()
    @IsNotEmpty()
    @IsEnum(EnablementTypes, {
      each: true,
      message: 'Invalid enablement type. Supported following enablement type:' + Object.values(EnablementTypes)
    })
    type?: EnablementTypes[];

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    report?: string;
}