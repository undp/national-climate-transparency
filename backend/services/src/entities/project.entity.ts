import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ProjectType, ProjectStatus } from "src/enums/project.enum";
import { Recipient, IntImplementor } from "src/enums/shared.enum";
import { ProgramEntity } from "./program.entity";

@Entity("project")
export class ProjectEntity {
  @PrimaryColumn()
  project_id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: "enum", enum: ProjectType })
  type: string;

  @Column()
  additional_project: string;

  @Column({ type: "enum", enum: ProjectStatus })
  project_status: string;

  @Column()
  start_year: number;

  @Column()
  end_year: number;

  @Column()
  time_frame: number;

  @Column({ type: "enum", enum: Recipient })
  recipient: string;

  @Column({ type: "enum", enum: IntImplementor })
  int_implementor: string;

  @Column()
  document: string;

  @Column()
  achieved_reduct: number;

  @Column()
  expected_reduct: number;

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
