import { EntityType } from '../enums/shared.enum';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, AfterLoad } from 'typeorm';
import { AchievementEntity } from './achievement.entity';
import { KpiUnits } from '../enums/kpi.enum';

@Entity('kpi')
export class KpiEntity {
  @PrimaryGeneratedColumn()
  kpiId: number;

  @Column()
  name: string;

	@Column({ type: "enum", enum: KpiUnits })
  kpiUnit: string;

  @Column({ type: 'enum', enum: EntityType })
  creatorType: string;

  @Column()
  creatorId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  expected: number;

  @OneToMany(() => AchievementEntity, (achievementEntity) => achievementEntity.kpi)
  achievements?: AchievementEntity[];
}
