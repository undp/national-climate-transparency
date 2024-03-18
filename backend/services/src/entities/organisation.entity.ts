import { BeforeInsert, Column, Entity, PrimaryColumn } from "typeorm";
import { OrganisationType } from '../enums/organisation.type.enum'
import { EntitySubject } from "./entity.subject";
import { OrganisationState } from "../enums/organisation.state.enum";
import { Sector } from "../enums/sector.enum";

@Entity()
export class Organisation implements EntitySubject {
  @PrimaryColumn()
  organisationId: number;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  phoneNo: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: false })
  country: string;

  @Column({
    type: "enum",
    enum: OrganisationType,
    array: false
  })
  organisationType: OrganisationType;


  @Column({
    type: "enum",
    enum: OrganisationState,
    array: false,
    default: OrganisationState.ACTIVE,
  })
  state: OrganisationState;

  @Column("bigint", { nullable: true })
  userCount: number;

  @Column("bigint", { nullable: true })
  lastUpdateVersion: number;

  @Column("bigint", { nullable: true })
  creditTxTime: number;

  @Column({ nullable: true })
  remarks: string;

  @Column({ type: "bigint", nullable: true })
  createdTime: number;

  @Column({
    type: "jsonb",
    array: false,
    nullable: true,
  })
  geographicalLocationCordintes: any;

  @Column("varchar", { array: true, nullable: true })
  regions: string[];

  @Column("varchar", { array: true, nullable: true })
  sector: Sector[];

  @BeforeInsert()
  setDefaultState() {
    if (this.organisationType === OrganisationType.GOVERNMENT) {
      this.userCount = null;
    } else if (this.organisationType === OrganisationType.DEPARTMENT) {
      this.userCount = 0;
    }
  }

}
