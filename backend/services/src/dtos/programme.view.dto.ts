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

  documents: DocumentDto[];

  comments: string;

	validated: boolean;

	achievedGHGReduction?: number;

	expectedGHGReduction?: number;

	ghgsAffected?: string[]

  estimatedAmount: number

  receivedAmount: number
}