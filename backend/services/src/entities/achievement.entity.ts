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
  @JoinColumn([{ name: "kpiId", referencedColumnName: "kpiId" }])
  kpi: KpiEntity;

  @ManyToOne(() => ActivityEntity, (activity) => activity.achievements, {
    nullable: false,
  })
  @JoinColumn([{ name: "activityId", referencedColumnName: "activityId" }])
  activity: ActivityEntity;

  @Column()
  achieved: number;

  @Column({ type: "ltree" })
  activityPath: string;
}
