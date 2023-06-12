import { Column, PrimaryGeneratedColumn } from "typeorm";
import { DocumentStatus } from "../enum/document.status";
import { DocType } from "../enum/document.type";

export class ProgrammeDocument {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  programmeId: string;

  @Column({nullable: true})
  actionId: string;

  @Column({nullable: true})
  url: string;

  @Column({
    type: "enum",
    enum: DocType,
    array: false
  })
  type: DocType;

  @Column({ type: "bigint", nullable: true })
  txTime: number;

  @Column({
    type: "enum",
    enum: DocumentStatus,
    array: false,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @Column({nullable: true})
  remark: string;
}
