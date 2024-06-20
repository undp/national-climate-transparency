import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { InstrumentType } from "../enums/action.enum";
import { ActionStatus } from "../enums/action.enum";
import { NatAnchor } from "../enums/action.enum";
import { ProgrammeEntity } from "./programme.entity";
import { Sector } from "../enums/sector.enum";
import { ProjectType } from "src/enums/project.enum";

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

	@Column({ type: "enum", enum: Sector, nullable: false })
  sector: Sector;

  @Column({ type: "enum", enum: ProjectType, nullable: true })
  type: string;

  @OneToMany(() => ProgrammeEntity, (programmeEntity) => programmeEntity.action)
  programmes?: ProgrammeEntity[];

	@Column({ type: "boolean", default: false })
	validated: boolean;
	
}
