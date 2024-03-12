import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { EntityType } from 'src/enums/shared.enum';
import { AchievementEntity } from './achievement.entity';
import { SupportEntity } from './support.entity';

@Entity('activity')
export class ActivityEntity {
  @PrimaryColumn()
  activity_id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: EntityType })
  parent_type: string;

  @Column()
  parent_id: string;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  support_type: string;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  measure: string;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  status: string;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  int_implementor: string;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  nat_implementor: string;

  @Column()
  isAnchored: boolean;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  impl_means: string;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  technology_type: string;

  @Column()
  document: string;

  @Column()
  etf_description: string;

  @Column()
  comment: string;

  @Column()
  achieved_reduct: number;

  @Column()
  expected_reduct: number;

  @Column()
  mg_name: string;

  @Column()
  mg_method: string;

  @Column()
  mg_result: string;

  @Column()
  mg_description: string;

  @Column()
  mg_comp_entity: string;

  @Column()
  mg_comment: string;

  @Column()
  mg_timeline: string;

  @Column({ type: 'ltree' })
  path: string;

  @OneToMany(
    () => AchievementEntity,
    (achievementEntity) => achievementEntity.activity,
  )
  achievements?: AchievementEntity[];

  @OneToMany(
    () => SupportEntity,
    (supportEntity) => supportEntity.activity,
  )
  support?: SupportEntity[];
}
