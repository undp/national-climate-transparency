import { Sector } from "../enums/sector.enum";
import { SubSector, NatImplementor } from "../enums/shared.enum";
import { DocumentDto } from "./document.dto";

export class ProgrammeViewDto {

  programmeId: string;

  actionId: string;

  type: string;

  title: string;

  description: string;

  objectives: string;

  instrumentType: string[];

  sector: Sector;

  affectedSubSector: SubSector[];

  programmeStatus: string;

  recipientEntity: string[];

  startYear: number;

  interNationalImplementor: string[];

  nationalImplementor: NatImplementor[];

  investment: number;

  documents: DocumentDto[];

  comments: string;

	validated: boolean;

}