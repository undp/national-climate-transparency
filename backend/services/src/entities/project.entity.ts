import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ParentTypeEnum } from 'src/utils/enums/parentType.enum';
import { ProgramEntity } from './program.entity';

@Entity('project')
export class ProjectEntity {
  @PrimaryColumn()
  project_id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  type: string;

  @Column()
  additional_project: string;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  project_status: string;

  @Column()
  start_year: number;

  @Column()
  end_year: number;

  @Column()
  time_frame: number;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  recipient: string;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  int_implementor: string;

  @Column()
  document: string;

  @Column()
  achieved_reduct: number;

  @Column()
  expected_reduct: number;

  @Column()
  comment: string;

  @Column({ type: 'ltree' })
  path: string;

  @ManyToOne(() => ProgramEntity, (program) => program.projects, {
    nullable: false,
  })
  @JoinColumn([{ name: 'program_id', referencedColumnName: 'program_id' }])
  program: ProgramEntity;
}
