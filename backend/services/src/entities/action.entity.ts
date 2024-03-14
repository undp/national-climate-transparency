import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { InstrumentType } from "src/enums/action.enum";
import { ActionStatus } from "src/enums/action.enum";
import { NatAnchor } from "src/enums/action.enum";
import { ProgramEntity } from "./program.entity";

@Entity("action")
export class ActionEntity {
  @PrimaryColumn()
  actionId: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  objective: string;

  @Column({ type: "enum", enum: InstrumentType })
  instrumentType: string;

  @Column({ type: "enum", enum: ActionStatus })
  status: string;

  @Column()
  startYear: string;

  @Column({ type: "enum", enum: NatAnchor })
  natAnchor: string;

  @Column()
  document: string;

  @OneToMany(() => ProgramEntity, (programEntity) => programEntity.action)
  programs?: ProgramEntity[];
}
