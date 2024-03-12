import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  BeforeInsert,
} from "typeorm";
import { Sector } from "src/enums/shared.enum";
import { OrgType } from "src/enums/shared.enum";
import { User } from "./user.entity";
import { OrganisationType } from "src/enums/organisation.type.enum";
import { OrganisationState } from "src/enums/organisation.state.enum";

@Entity("organisation")
export class Organisation {
  @PrimaryColumn()
  organisationId: number;

  @Column()
  name: string;

  @Column({ type: "enum", enum: OrgType })
  type: string;

  @Column("varchar", { array: true, nullable: true })
  sector: Sector[];

  @Column()
  phoneNo: string;

  @Column()
  email: string;

  @Column("varchar", { array: true, nullable: true })
  regions: string[];

  @Column()
  website: string;

  @Column()
  address: string;

  @Column()
  logo: string;

  @OneToMany(() => User, (userEntity) => userEntity.organisation)
  users?: User[];

  // All the below fields were merged from the existing organisation entity

  @Column({ nullable: false })
  country: string;

  @Column({
    type: "enum",
    enum: OrganisationType,
    array: false,
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

  @BeforeInsert()
  setDefaultState() {
    if (this.organisationType === OrganisationType.GOVERNMENT) {
      this.userCount = null;
    } else if (this.organisationType === OrganisationType.DEPARTMENT) {
      this.userCount = 0;
    }
  }
}
