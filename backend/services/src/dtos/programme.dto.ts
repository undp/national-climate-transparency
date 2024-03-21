import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ArrayMinSize, MaxLength, Min, Max} from 'class-validator';
import { Sector } from "../enums/sector.enum";
import { SubSector, NatImplementor } from "../enums/shared.enum";
import { DocumentDto } from "./document.dto";
import { KpiDto } from "./kpi.dto";

export class ProgrammeDto {

    programmeId: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    title: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    description: string;
  
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    objective: string;
  
    @IsArray()
    @ArrayMinSize(1)
    @MaxLength(100, { each: true })
    @IsNotEmpty({ each: true })
    @IsEnum(Sector, {
        each: true,
        message: 'Invalid Sector. Supported following sectors:' + Object.values(Sector)
    })
    @ApiProperty({
      type: [String],
      enum: Object.values(Sector),
    })
    affectedSectors: Sector[];
    
    @IsArray()
    @ArrayMinSize(1)
    @MaxLength(100, { each: true })
    @IsNotEmpty({ each: true })
    @IsEnum(SubSector, {
        each: true,
        message: 'Invalid Sub sector. Supported following sub sectors:' + Object.values(SubSector)
    })
    @ApiProperty({
      type: [String],
      enum: Object.values(SubSector),
    })
    affectedSubSector: SubSector[];

    @IsNotEmpty()
    @IsNumber()
    @Min(2013)
    @Max(2050)
    @ApiProperty()
    startYear: number;

    @IsArray()
    @ArrayMinSize(1)
    @MaxLength(100, { each: true })
    @IsNotEmpty({ each: true })
    @IsEnum(NatImplementor, {
        each: true,
        message: 'Invalid National Implementing Entity. Supported following entities:' + Object.values(NatImplementor)
    })
    @ApiProperty({
      type: [String],
      enum: Object.values(NatImplementor),
    })
    natImplementor: NatImplementor[];
  
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    investment: number;
  
    @IsOptional()
    @ApiProperty()
    documents: DocumentDto[];
  
    @IsOptional()
    @ApiProperty()
    @IsString()
    comments: string;
  
    // path: string;

    @IsOptional()
    @ApiProperty()
    actionId?: string;

    @IsOptional()
    @ApiProperty()
    linkedProjects: string[];

    @IsOptional()
    @ApiProperty()
    kpis: KpiDto[];
}