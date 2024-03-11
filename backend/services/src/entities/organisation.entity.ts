import { BeforeInsert, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { OrganisationType } from '../enums/organisation.type.enum'
// import { CompanyState } from "../enum/company.state.enum";
import { EntitySubject } from "./entity.subject";
import { SectoralScope } from "@undp/serial-number-gen";
import { User } from "./user.entity";
import { use } from "passport";
import { OrganisationState } from "../enums/organisation.state.enum";
import { Sector } from "src/enums/sector.enum";
// import { Ministry } from "../enum/ministry.enum";
// import { GovDepartment } from "../enum/govDep.enum";

@Entity()
export class Organisation implements EntitySubject {
  @PrimaryColumn()
  organisationId: number;

  // @Column({ unique: true, nullable: true })
  // taxId: string;

  // @Column({ unique: true, nullable: true })
  // paymentId: string;

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

  // @Column("real", { nullable: true })
  // creditBalance: number;

  // @Column({
  //   type: "jsonb",
  //   array: false,
  //   nullable: true,
  // })
  // secondaryAccountBalance: any;

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

  // @OneToMany(type => User, user => user.organisation)
  // users: User[]
  @BeforeInsert()
  setDefaultState() {
    if (this.organisationType === OrganisationType.GOVERNMENT) {
      this.userCount = null;
    } else if (this.organisationType === OrganisationType.DEPARTMENT) {
      this.userCount = 0;
    }
  }

}
