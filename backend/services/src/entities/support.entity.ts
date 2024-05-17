import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
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
import { Sector } from "src/enums/sector.enum";

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

	@Column()
  otherInternationalSupportChannel: string;

  @Column({ type: "enum", enum: IntFinInstrument, nullable: true })
  internationalFinancialInstrument: string;

	@Column()
	otherInternationalFinancialInstrument: string;

  @Column({ type: "enum", enum: NatFinInstrument, nullable: true })
  nationalFinancialInstrument: string;

  @Column({ nullable: true })
  otherNationalFinancialInstrument: string;

  @Column({ type: "enum", enum: FinancingStatus, nullable: true })
  financingStatus: string;

  @Column("varchar", { array: true, nullable: true })
  internationalSource: IntSource[];

  @Column({ nullable: true })
  nationalSource: string;

  @Column({nullable: false, type: 'double precision' })
  requiredAmount: number;

  @Column({nullable: false, type: 'double precision' })
  receivedAmount: number;

  @Column()
  exchangeRate: number;

	@Column()
  requiredAmountDomestic: number;

  @Column()
  receivedAmountDomestic: number;

  @Column({ nullable: true })
  sector: Sector;

  @ManyToOne(() => ActivityEntity, (activity) => activity.support, {
    nullable: false,
  })
  @JoinColumn([{ name: "activityId", referencedColumnName: "activityId" }])
  activity: ActivityEntity;

	@Column({ type: "boolean", default: false })
	validated: boolean;
}
