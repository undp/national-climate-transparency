import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ArrayMinSize, MaxLength, Min, Max } from 'class-validator';
import { Sector } from "../enums/sector.enum";
import { SubSector, NatImplementor, Recipient, IntImplementor } from "../enums/shared.enum";
import { DocumentDto } from "./document.dto";
import { KpiDto } from "./kpi.dto";
import { ProjectType } from "src/enums/project.enum";
import { InstrumentType } from "src/enums/action.enum";
import { ProgrammeStage } from "src/enums/programme-status.enum";

export class ProgrammeViewDto {

  programmeId: string;

  actionId: string;

  types: string[];

  title: string;

  description: string;

  objectives: string;

  instrumentType: string[];

  affectedSectors: Sector[];

  affectedSubSector: SubSector[];

  programmeStatus: ProgrammeStage;

  recipientEntity: string[];

  startYear: number;

  interNationalImplementor: string[];

  nationalImplementor: NatImplementor[];

  investment: number;

  documents: DocumentDto[];

  comments: string;

}