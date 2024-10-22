import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { EntityType, GHGS, Recipient } from "../enums/shared.enum";
import { AchievementEntity } from "./achievement.entity";
import { SupportEntity } from "./support.entity";
import {
	Measure,
	TechnologyType,
	ImpleMeans,
	ActivityStatus,
} from "../enums/activity.enum";
import { NatImplementor, IntImplementor } from "../enums/shared.enum";
import { Sector } from "../enums/sector.enum";
import { EntitySubject } from "./entity.subject";
import { ActionType } from "../enums/action.enum";

@Entity("activity")
export class ActivityEntity implements EntitySubject {
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

	@Column({ type: "enum", enum: Measure, nullable: true })
	measure: string;

	@Column({ type: "enum", enum: ActivityStatus })
	status: string;

	@Column("varchar", { array: true, nullable: true })
	internationalImplementingEntity: IntImplementor[];

	@Column("varchar", { array: true, nullable: true })
	nationalImplementingEntity: NatImplementor[];

	@Column("varchar", { array: true, nullable: false })
  recipientEntities: Recipient[];

	@Column({ nullable: true })
	anchoredInNationalStrategy: boolean;

	@Column({ type: "enum", enum: ImpleMeans, nullable: true })
	meansOfImplementation: string;

	@Column({ type: "enum", enum: TechnologyType, nullable: true })
	technologyType: string;

	@Column({ type: 'jsonb', nullable: true })
	documents: any;

	@Column({ nullable: true })
	etfDescription: string;

	@Column({ type: "enum", enum: GHGS, nullable: false })
	ghgsAffected: string;

	@Column({ type: 'double precision' })
	achievedGHGReduction: number;

	@Column({ type: 'double precision' })
	expectedGHGReduction: number;

	@Column({ nullable: true })
	comment: string;

	@Column("jsonb", { nullable: true })
	mitigationInfo: any;

	@Column({ type: 'jsonb', nullable: true })
	mitigationTimeline: {
		expected: {
			baselineEmissions: number[];
			activityEmissionsWithM: number[];
			activityEmissionsWithAM: number[];
			expectedEmissionReductWithM: number[];
			expectedEmissionReductWithAM: number[];
			total: {
				baselineEmissions: number;
				activityEmissionsWithM: number;
				activityEmissionsWithAM: number;
				expectedEmissionReductWithM: number;
				expectedEmissionReductWithAM: number;
			};
		};
		actual: {
			baselineActualEmissions: number[];
			activityActualEmissions: number[];
			actualEmissionReduct: number[];
			total: {
				baselineActualEmissions: number;
				activityActualEmissions: number;
				actualEmissionReduct: number;
			};
		};
		startYear: number;
		unit: GHGS
	};

	@Column({ type: "enum", enum: Sector, nullable: true })
	sector: Sector;

	@Column({ type: "enum", enum: ActionType,nullable: false })
  type: string;

	@Column({ type: "ltree" })
	path: string;

	@OneToMany(
		() => AchievementEntity,
		(achievementEntity) => achievementEntity.activity
	)
	achievements?: AchievementEntity[];

	@OneToMany(() => SupportEntity, (supportEntity) => supportEntity.activity)
	support?: SupportEntity[];

	@Column({ type: "boolean", default: false })
	validated: boolean;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	createdTime: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	updatedTime: Date;
}
