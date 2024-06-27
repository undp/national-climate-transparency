import { Entity, Column, PrimaryColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ActionType, InstrumentType } from "../enums/action.enum";
import { ActionStatus } from "../enums/action.enum";
import { NatAnchor } from "../enums/action.enum";
import { ProgrammeEntity } from "./programme.entity";
import { Sector } from "../enums/sector.enum";

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

  @Column({ type: "enum", enum: ActionType, default: ActionType.MITIGATION ,nullable: false })
  type: string;

  @OneToMany(() => ProgrammeEntity, (programmeEntity) => programmeEntity.action)
  programmes?: ProgrammeEntity[];

	@Column({ type: "boolean", default: false })
	validated: boolean;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	createdTime: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	updatedTime: Date;
	
}
