import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { SubSector } from "src/enums/shared.enum";
import { Sector } from "src/enums/sector.enum";
import { NatImplementor } from "src/enums/shared.enum";
import { ActionEntity } from "./action.entity";
import { ProjectEntity } from "./project.entity";

@Entity("program")
export class ProgramEntity {
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

  @ManyToOne(() => ActionEntity, (action) => action.programs, {
    nullable: false,
  })
  @JoinColumn([{ name: "action_id", referencedColumnName: "action_id" }])
  action: ActionEntity;

  @OneToMany(() => ProjectEntity, (projectEntity) => projectEntity.program)
  projects?: ProjectEntity[];
}
