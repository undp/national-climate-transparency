import { Entity, Column, PrimaryColumn, OneToMany, BeforeInsert, BeforeUpdate } from "typeorm";
import { InstrumentType } from "../enums/action.enum";
import { ActionStatus } from "../enums/action.enum";
import { NatAnchor } from "../enums/action.enum";
import { ProgrammeEntity } from "./programme.entity";

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
  startYear: number;

  @Column({ type: "enum", enum: NatAnchor })
  natAnchor: string;

  @Column({ type: 'jsonb', nullable: true })
  documents: any;

  @OneToMany(() => ProgrammeEntity, (programmeEntity) => programmeEntity.action)
  programmes?: ProgrammeEntity[];

}
