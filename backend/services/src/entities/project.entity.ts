import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ProjectType, ProjectStatus } from "src/enums/project.enum";
import { Recipient, IntImplementor } from "src/enums/shared.enum";
import { ProgramEntity } from "./program.entity";

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

  @ManyToOne(() => ProgramEntity, (program) => program.projects, {
    nullable: false,
  })
  @JoinColumn([{ name: "program_id", referencedColumnName: "program_id" }])
  program: ProgramEntity;
}
