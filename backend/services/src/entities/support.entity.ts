import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import {
  SupportDirection,
  FinanceNature,
  IntSupChannel,
  IntFinInstrument,
  NatFinInstrument,
  FinancingStatus,
  IntSource,
} from "../enums/support.enum";
import { ActivityEntity } from "./activity.entity";
import { Sector } from "../enums/sector.enum";
import { ActionType } from "../enums/action.enum";

@Entity("support")
export class SupportEntity {
  @PrimaryColumn()
  supportId: string;

  @Column({ type: "enum", enum: SupportDirection })
  direction: string;

  @Column({ type: "enum", enum: FinanceNature })
  financeNature: string;

  @Column({ type: "enum", enum: IntSupChannel, nullable: true })
  internationalSupportChannel: string;

  @Column({ type: "enum", enum: IntFinInstrument, nullable: true })
  internationalFinancialInstrument: string;

  @Column({ type: "enum", enum: NatFinInstrument, nullable: true })
  nationalFinancialInstrument: string;

  @Column({ type: "enum", enum: FinancingStatus, nullable: true })
  financingStatus: string;

  @Column("varchar", { array: true, nullable: true })
  internationalSource: IntSource[];

  @Column({ nullable: true })
  nationalSource: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: false })
  requiredAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: false })
  receivedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: false })
  exchangeRate: number;

	@Column({ type: 'decimal', precision: 15, scale: 2, nullable: false })
  requiredAmountDomestic: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: false })
  receivedAmountDomestic: number;

  @Column({ nullable: true })
  sector: Sector;

  @Column({ type: "enum", enum: ActionType,nullable: false })
  type: string;

  @ManyToOne(() => ActivityEntity, (activity) => activity.support, {
    nullable: false,
		onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: "activityId", referencedColumnName: "activityId" }])
  activity: ActivityEntity;

	@Column({ type: "boolean", default: false })
	validated: boolean;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	createdTime: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	updatedTime: Date;
}
