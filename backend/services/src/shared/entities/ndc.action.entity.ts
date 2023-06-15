
import { AdaptationProperties } from "../dto/adaptation.properties";
import { AgricultureProperties } from "../dto/agriculture.properties";
import { CoBenefitsProperties } from "../dto/co.benefits";
import { NdcFinancing } from "../dto/ndc.financing";
import { NDCReports } from "../dto/ndc.reports";
import { SolarProperties } from "../dto/solar.properties";
import { NDCActionType } from "../enum/ndc.action.enum";
import { TypeOfMitigation } from "../enum/typeofmitigation.enum";
import { Column, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

export class NDCAction {

  @PrimaryColumn()
  id: string;

  @Column()
  programmeId: string;

  @Column({
    type: "enum",
    enum: NDCActionType,
    array: false,
  })
  action: NDCActionType;

  @Column()
  methodology: string;

  @Column({
    type: "enum",
    enum: TypeOfMitigation,
    array: false,
  })
  typeOfMitigation: TypeOfMitigation;


  @Column({
    type: "jsonb",
    array: false,
  })
  agricultureProperties?: AgricultureProperties;

  @Column({
    type: "jsonb",
    array: false,
  })
  solarProperties?: SolarProperties;


  @Column({
    type: "jsonb",
    array: false,
  })
  adaptationProperties: AdaptationProperties;

  
  @Column({
    type: "jsonb",
    array: false,
  })
  ndcFinancing?: NdcFinancing;
  

  // @Column({
  //   type: "jsonb",
  //   array: false,
  // })
  // ndcReports?: NDCReports;


  @Column({
    type: "jsonb",
    array: false,
  })
  coBenefitsProperties?: CoBenefitsProperties;

  @Column({ type: "bigint" })
  txTime: number;

  @Column({ type: "bigint" })
  createdTime: number;

  @Column({ nullable: true })
  constantVersion: string;
}
