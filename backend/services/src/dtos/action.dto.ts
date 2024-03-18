import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ActionStatus, InstrumentType, NatAnchor } from "../enums/action.enum";
import { KpiDto } from "./kpi.dto";
import { DocumentDto } from "./document.dto";

export class ActionDto {

    actionId: string; 

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

    @IsNotEmpty()
    @ApiProperty({ enum: InstrumentType })
    @IsEnum(InstrumentType, {
      message: "Invalid instrument type. Supported following instrument types:" + Object.values(InstrumentType),
    })
    instrumentType: InstrumentType;

    @IsNotEmpty()
    @ApiProperty({ enum: ActionStatus })
    @IsEnum(ActionStatus, {
      message: "Invalid status. Supported following statuses:" + Object.values(ActionStatus),
    })
    status: ActionStatus;

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    startYear: string;

    @IsNotEmpty()
    @ApiProperty({ enum: NatAnchor })
    @IsEnum(NatAnchor, {
      message: "Invalid Anchored National Strategy. Supported following strategies:" + Object.values(NatAnchor),
    })
    natAnchor: NatAnchor;

    @Optional()
    @ApiProperty()
    documents: DocumentDto[];

    @Optional()
    @ApiProperty()
    linkedProgrammes: string[];

    @Optional()
    @ApiProperty()
    kpis: KpiDto[];

  
}