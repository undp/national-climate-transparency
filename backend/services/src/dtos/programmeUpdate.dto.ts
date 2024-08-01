import { ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ArrayMinSize, MaxLength, Min, Max, ValidateNested} from 'class-validator';
import { Sector } from "../enums/sector.enum";
import { SubSector, NatImplementor, KPIAction } from "../enums/shared.enum";
import { DocumentDto } from "./document.dto";
import { ProgrammeStatus } from "../enums/programme-status.enum";
import { KpiUpdateDto } from "./kpi.update.dto";
import { IsTwoDecimalPoints } from "../util/twoDecimalPointNumber.decorator";

export class ProgrammeUpdateDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
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
    @Max(2049)
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
		@IsTwoDecimalPoints()
    @ApiProperty()
    investment: number;

		@IsNotEmpty()
    @IsEnum(ProgrammeStatus, {
			each: true,
			message: 'Invalid Programme Status. Supported following status:' + Object.values(ProgrammeStatus)
    })
    @ApiProperty({
      type: [String],
      enum: Object.values(ProgrammeStatus),
    })
    programmeStatus: number;
  
    @IsOptional()
    @ApiPropertyOptional()
    @IsString()
    comments: string;

    @IsOptional()
    @ApiPropertyOptional(
      {
        type: "array",
        example: [{
          title: "document 1",
          data: "base64 document string"
        }],
        items: {
          $ref: getSchemaPath(DocumentDto),
        },
      }
    )
    newDocuments: DocumentDto[];

    @IsOptional()
    @ApiPropertyOptional(
      {
        type: "array",
        example: ["http://test.com/documents/programme_documents/testDoc1_1713334127897.csv"],
      }
    )
    removedDocuments: string[];

    @IsOptional()
    @ApiPropertyOptional()
    actionId?: string;

    @IsOptional()
    @ValidateNested()
    @ApiPropertyOptional(
      {
        type: "array",
        example: [{
          kpiId: "1",
          name: "KPI 1",
          creatorType: "action",
          expected: 100,
          KPIAction: KPIAction.CREATED,       // To check KPI is Updated or not for Update Timeline
      }],
        items: {
          $ref: getSchemaPath(KpiUpdateDto),
        },
      }
    )
    kpis: KpiUpdateDto[];
}