import { EntityType } from '../enums/shared.enum';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { AchievementEntity } from './achievement.entity';

@Entity('kpi')
export class KpiEntity {
  @PrimaryGeneratedColumn()
  kpiId: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: EntityType })
  creatorType: string;

  @Column()
  creatorId: string;

  @Column()
  expected: number;

  @OneToMany(() => AchievementEntity, (achievementEntity) => achievementEntity.kpi)
  achievements?: AchievementEntity[];
}
