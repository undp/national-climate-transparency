import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import {
  SupportDirection,
  FinanceNature,
  IntSupChannel,
  IntFinInstrument,
  NatFinInstrument,
  FinancingStatus,
  IntSource,
} from "src/enums/support.enum";
import { ActivityEntity } from "./activity.entity";

@Entity("support")
export class SupportEntity {
  @PrimaryColumn()
  support_id: string;

  @Column({ type: "enum", enum: SupportDirection })
  direction: string;

  @Column({ type: "enum", enum: FinanceNature })
  finance_nature: string;

  @Column({ type: "enum", enum: IntSupChannel })
  int_sup_channel: string;

  @Column({ type: "enum", enum: IntFinInstrument })
  int_fin_instrument: string;

  @Column({ type: "enum", enum: NatFinInstrument })
  nat_fin_instrument: string;

  @Column()
  other_int_sup_channel: string;

  @Column()
  other_int_fin_instrument: string;

  @Column()
  other_nat_fin_instrument: string;

  @Column({ type: "enum", enum: FinancingStatus })
  financing_status: string;

  @Column({ type: "enum", enum: IntSource })
  int_source: string;

  @Column()
  nat_source: string;

  @Column()
  required_amount: number;

  @Column()
  recieved_amount: number;

  @Column()
  exch_rate: number;

  @ManyToOne(() => ActivityEntity, (activity) => activity.support, {
    nullable: false,
  })
  @JoinColumn([{ name: "activity_id", referencedColumnName: "activity_id" }])
  activity: ActivityEntity;
}
