import { Entity, Column, PrimaryColumn, OneToMany, BeforeInsert, BeforeUpdate } from "typeorm";
import { InstrumentType } from "../enums/action.enum";
import { ActionStatus } from "../enums/action.enum";
import { NatAnchor } from "../enums/action.enum";
import { ProgrammeEntity } from "./programme.entity";
import { Sector } from "src/enums/sector.enum";

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

  @Column("varchar", { array: true, nullable: false })
  instrumentType: InstrumentType[];

  @Column({ type: "enum", enum: ActionStatus })
  status: string;

  @Column()
  startYear: number;

  @Column("varchar", { array: true, nullable: false })
  natAnchor: NatAnchor[];

  @Column({ type: 'jsonb', nullable: true })
  documents: any;

	@Column("varchar", { array: true, nullable: true })
  sectors: Sector[];

  @OneToMany(() => ProgrammeEntity, (programmeEntity) => programmeEntity.action)
  programmes?: ProgrammeEntity[];

	@Column({ type: "boolean", default: false })
	validated: boolean;
	
}
