import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { EntityType } from "src/enums/shared.enum";
import { AchievementEntity } from "./achievement.entity";
import { SupportEntity } from "./support.entity";
import {
  Measure,
  TechnologyType,
  ImpleMeans,
  SupportType,
  ActivityStatus,
} from "src/enums/activity.enum";
import { NatImplementor, IntImplementor } from "src/enums/shared.enum";

@Entity("activity")
export class ActivityEntity {
  @PrimaryColumn()
  activity_id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: "enum", enum: EntityType })
  parent_type: string;

  @Column()
  parent_id: string;

  @Column({ type: "enum", enum: SupportType })
  support_type: string;

  @Column({ type: "enum", enum: Measure })
  measure: string;

  @Column({ type: "enum", enum: ActivityStatus })
  status: string;

  @Column({ type: "enum", enum: IntImplementor })
  int_implementor: string;

  @Column({ type: "enum", enum: NatImplementor })
  nat_implementor: string;

  @Column()
  isAnchored: boolean;

  @Column({ type: "enum", enum: ImpleMeans })
  impl_means: string;

  @Column({ type: "enum", enum: TechnologyType })
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

  @Column("jsonb", { nullable: true })
  mg_data: JSON;

  @Column("jsonb", { nullable: true })
  mg_timeline: JSON;

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
