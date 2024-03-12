import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ParentTypeEnum } from 'src/utils/enums/parentType.enum';
import { ActionEntity } from './action.entity';
import { ProjectEntity } from './project.entity';

@Entity('program')
export class ProgramEntity {
  @PrimaryColumn()
  program_id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  objective: string;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  affected_sector: string;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  affected_sub_sector: string;

  @Column()
  start_year: number;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  nat_implementor: string;

  @Column()
  investment: number;

  @Column()
  document: string;

  @Column()
  comment: string;

  @Column({ type: 'ltree' })
  path: string;

  @ManyToOne(() => ActionEntity, (action) => action.programs, {
    nullable: false,
  })
  @JoinColumn([{ name: 'action_id', referencedColumnName: 'action_id' }])
  action: ActionEntity;

  @OneToMany(() => ProjectEntity, (projectEntity) => projectEntity.program)
  projects?: ProjectEntity[];
}
