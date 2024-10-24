import { EntityType } from '../enums/shared.enum';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, AfterLoad, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AchievementEntity } from './achievement.entity';

@Entity('kpi')
export class KpiEntity {
  @PrimaryGeneratedColumn()
  kpiId: number;

  @Column()
  name: string;

	@Column()
  kpiUnit: string;

  @Column({ type: 'enum', enum: EntityType })
  creatorType: string;

  @Column()
  creatorId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  expected: number;

  @OneToMany(() => AchievementEntity, (achievementEntity) => achievementEntity.kpi)
  achievements?: AchievementEntity[];

	@CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	createdTime: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	updatedTime: Date;
}
