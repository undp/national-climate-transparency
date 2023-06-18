import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { EntitySubject } from "./entity.subject";
import { Instrument } from "../enum/instrument.enum";
import { InvestmentType } from "../enum/investment.type";
import { InvestmentLevel } from "../enum/investment.level";
import { InvestmentStream } from "../enum/investment.stream";
import { ESGType } from "../enum/esg.type";
import { InvestmentStatus } from "../enum/investment.status";

@Entity()
export class Investment implements EntitySubject {

  @PrimaryGeneratedColumn()
  requestId: number;

  @Column()
  programmeId: string;

  @Column()
  amount: number;

  @Column({
    type: "enum",
    enum: Instrument,
    array: false,
    nullable: true
  })
  instrument: Instrument;

  @Column({nullable: true})
  interestRate?: number;

  @Column({nullable: true})
  resultMetric?: string;

  @Column({nullable: true})
  paymentPerMetric?: number;

  @Column({
    type: "enum",
    enum: InvestmentType,
    array: false,
    nullable: true
  })
  type: InvestmentType;

  @Column({
    type: "enum",
    enum: InvestmentLevel,
    array: false,
    nullable: true
  })
  level: InvestmentLevel;

  @Column({
    type: "enum",
    enum: InvestmentStream,
    array: false,
    nullable: true
  })
  stream: InvestmentStream;

  @Column({
    type: "enum",
    enum: ESGType,
    array: false,
    nullable: true
  })
  esgClassification: ESGType;

  @Column({
    type: "enum",
    enum: InvestmentStatus,
    array: false,
  })
  status: InvestmentStatus;

  @Column()
  fromCompanyId: number;

  @Column("real")
  percentage: number;

  @Column()
  toCompanyId: number;

  @Column()
  initiator: number;

  @Column()
  initiatorCompanyId: number;

  @Column({type: "bigint"})
  txTime: number;

  @Column({type: "bigint"})
  createdTime: number;

  @Column({nullable: true})
  txRef: string;
}
