import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { SubSector } from "../enums/shared.enum";
import { Sector } from "../enums/sector.enum";
import { NatImplementor } from "../enums/shared.enum";
import { ActionEntity } from "./action.entity";
import { ProjectEntity } from "./project.entity";

@Entity("programme")
export class ProgrammeEntity {
  @PrimaryColumn()
  programId: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  objective: string;

  @Column({ type: "enum", enum: Sector })
  affectedSector: string;

  @Column({ type: "enum", enum: SubSector })
  affectedSubSector: string;

  @Column()
  startYear: number;

  @Column({ type: "enum", enum: NatImplementor })
  natImplementor: string;

  @Column()
  investment: number;

  @Column()
  document: string;

  @Column()
  comment: string;

  @Column({ type: "ltree" })
  path: string;

  @ManyToOne(() => ActionEntity, (action) => action.programmes, {
    nullable: false,
  })
  @JoinColumn([{ name: "actionId", referencedColumnName: "actionId" }])
  action: ActionEntity;

  @OneToMany(() => ProjectEntity, (projectEntity) => projectEntity.programme)
  projects?: ProjectEntity[];
}
