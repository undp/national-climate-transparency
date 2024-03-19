import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { EntityType } from "../enums/shared.enum";
import { AchievementEntity } from "./achievement.entity";
import { SupportEntity } from "./support.entity";
import {
  Measure,
  TechnologyType,
  ImpleMeans,
  SupportType,
  ActivityStatus,
} from "../enums/activity.enum";
import { NatImplementor, IntImplementor } from "../enums/shared.enum";

@Entity("activity")
export class ActivityEntity {
  @PrimaryColumn()
  activityId: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: "enum", enum: EntityType })
  parentType: string;

  @Column()
  parentId: string;

  @Column({ type: "enum", enum: SupportType })
  supportType: string;

  @Column({ type: "enum", enum: Measure })
  measure: string;

  @Column({ type: "enum", enum: ActivityStatus })
  status: string;

  @Column({ type: "enum", enum: IntImplementor })
  intImplementor: string;

  @Column({ type: "enum", enum: NatImplementor })
  natImplementor: string;

  @Column()
  isAnchored: boolean;

  @Column({ type: "enum", enum: ImpleMeans })
  implMeans: string;

  @Column({ type: "enum", enum: TechnologyType })
  technologyType: string;

  @Column()
  document: string;

  @Column()
  etfDescription: string;

  @Column()
  comment: string;

  @Column()
  achievedReduct: number;

  @Column()
  expectedReduct: number;

  @Column("jsonb", { nullable: true })
  mgData: JSON;

  @Column("jsonb", { nullable: true })
  mgTimeline: JSON;

  @Column({ type: "ltree" })
  path: string;

  @OneToMany(
    () => AchievementEntity,
    (achievementEntity) => achievementEntity.activity
  )
  achievements?: AchievementEntity[];

  @OneToMany(() => SupportEntity, (supportEntity) => supportEntity.activity)
  support?: SupportEntity[];
}
