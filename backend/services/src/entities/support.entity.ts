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

@Entity("support")
export class SupportEntity {
  @PrimaryColumn()
  supportId: string;

  @Column({ type: "enum", enum: SupportDirection })
  direction: string;

  @Column({ type: "enum", enum: FinanceNature })
  financeNature: string;

  @Column({ type: "enum", enum: IntSupChannel })
  intSupChannel: string;

  @Column({ type: "enum", enum: IntFinInstrument })
  intFinInstrument: string;

  @Column({ type: "enum", enum: NatFinInstrument })
  natFinInstrument: string;

  @Column()
  otherIntSupChannel: string;

  @Column()
  otherIntFinInstrument: string;

  @Column()
  otherNatFinInstrument: string;

  @Column({ type: "enum", enum: FinancingStatus })
  financingStatus: string;

  @Column({ type: "enum", enum: IntSource })
  intSource: string;

  @Column()
  natSource: string;

  @Column()
  requiredAmount: number;

  @Column()
  receivedAmount: number;

  @Column()
  exchRate: number;

	@Column()
  requiredAmountDomestic: number;

  @Column()
  receivedAmountDomestic: number;

  @ManyToOne(() => ActivityEntity, (activity) => activity.support, {
    nullable: false,
  })
  @JoinColumn([{ name: "activityId", referencedColumnName: "activityId" }])
  activity: ActivityEntity;
}
