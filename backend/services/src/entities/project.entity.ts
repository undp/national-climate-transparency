import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ProjectType, ProjectStatus } from "../enums/project.enum";
import { Recipient, IntImplementor } from "../enums/shared.enum";
import { ProgrammeEntity } from "./programme.entity";


@Entity("project")
export class ProjectEntity {
  @PrimaryColumn()
  projectId: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: "enum", enum: ProjectType })
  type: string;

  @Column()
  additionalProject: string;

  @Column({ type: "enum", enum: ProjectStatus })
  projectStatus: string;

  @Column()
  startYear: number;

  @Column()
  endYear: number;

  @Column()
  timeFrame: number;

  @Column({ type: "enum", enum: Recipient })
  recipient: string;

  @Column({ type: "enum", enum: IntImplementor })
  intImplementor: string;

  @Column()
  document: string;

  @Column()
  achievedReduct: number;

  @Column()
  expectedReduct: number;

  @Column()
  comment: string;

  @Column({ type: "ltree" })
  path: string;

  @ManyToOne(() => ProgrammeEntity, (programme) => programme.projects, {
    nullable: false,
  })
  @JoinColumn([{ name: "programmeId", referencedColumnName: "programmeId" }])
  programme: ProgrammeEntity;
}
