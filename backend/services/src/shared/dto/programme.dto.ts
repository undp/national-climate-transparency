import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsEnum, IsInt, IsNotEmpty, IsNotEmptyObject, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator";
import { SectoralScope } from '@undp/serial-number-gen'
import { ProgrammeProperties } from "./programme.properties";
import { Sector } from "../enum/sector.enum";
import { Type } from "class-transformer";
// import { ProgrammeDocuments } from "./programme.documents";
import { NDCActionDto } from "./ndc.action.dto";

export class ProgrammeDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    externalId: string;

    @ApiProperty({ enum: SectoralScope })
    @IsNotEmpty()
    @IsEnum(SectoralScope, {
        message: 'Invalid sectoral scope. Supported following sectoral scope:' + Object.values(SectoralScope)
    })
    sectoralScope: SectoralScope;

    @ApiProperty({ enum: Sector })
    @IsNotEmpty()
    @IsEnum(Sector, {
        message: 'Invalid sector. Supported following sector:' + Object.values(Sector)
    })
    sector: Sector;

    @ApiProperty()
    @IsNotEmpty()
    @IsPositive()
    @IsInt()
    startTime: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsPositive()
    @IsInt()
    endTime: number;

    @ApiProperty()
    @IsNotEmpty({ each: true })
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    proponentTaxVatId: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ each: true })
    @IsArray()
    @IsPositive({ each: true })
    @ArrayMinSize(1)
    proponentPercentage: number[];

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    creditUnit: string;

    @ApiProperty()
    @IsNotEmptyObject()
    @ValidateNested()
    @Type(() => ProgrammeProperties)
    programmeProperties: ProgrammeProperties;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    designDocument?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    creditEst: number;

    @ApiPropertyOptional()
    @ValidateNested()
    @Type(() => NDCActionDto)
    ndcAction?: NDCActionDto;
}
