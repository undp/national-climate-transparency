import { Sector } from "../enums/sector.enum";
import { SubSector, NatImplementor } from "../enums/shared.enum";
import { DocumentDto } from "./document.dto";

export class ProgrammeViewDto {

  programmeId: string;

  actionId: string;

  types: string[];

  title: string;

  description: string;

  objectives: string;

  instrumentType: string;

  affectedSectors: Sector[];

  affectedSubSector: SubSector[];

  programmeStatus: string;

  recipientEntity: string[];

  startYear: number;

  interNationalImplementor: string[];

  nationalImplementor: NatImplementor[];

  investment: number;

  documents: DocumentDto[];

  comments: string;

}