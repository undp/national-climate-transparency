import {
  Entity,
  JoinColumn,
  ManyToOne,
  Column,
  PrimaryGeneratedColumn,
} from "typeorm";
import { KpiEntity } from "./kpi.entity";
import { ActivityEntity } from "./activity.entity";

@Entity("achievement")
export class AchievementEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => KpiEntity, (kpi) => kpi.achievements, {
    nullable: false,
  })
  @JoinColumn([{ name: "kpi_id", referencedColumnName: "kpi_id" }])
  kpi: KpiEntity;

  @ManyToOne(() => ActivityEntity, (activity) => activity.achievements, {
    nullable: false,
  })
  @JoinColumn([{ name: "activity_id", referencedColumnName: "activity_id" }])
  activity: ActivityEntity;

  @Column()
  achieved: number;

  @Column({ type: "ltree" })
  activity_path: string;
}
