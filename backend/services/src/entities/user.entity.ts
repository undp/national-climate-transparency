import { Role } from "../casl/role.enum";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { EntitySubject } from "./entity.subject";
import { Organisation } from "./organisation.entity";
import { LogEntity } from "./log.entity";
import { OrganisationType } from "src/enums/organisation.type.enum";
import { UserState } from "src/enums/user.state.enum";

@Entity()
export class User implements EntitySubject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: "enum",
    enum: Role,
    array: false,
    default: Role.ViewOnly,
  })
  role: Role;

  @Column()
  name: string;

  @Column({ nullable: true })
  phoneNo: string;

  @ManyToOne(() => Organisation, (organisation) => organisation.users, {
    nullable: false,
  })
  @JoinColumn([
    { name: "organization_id", referencedColumnName: "organization_id" },
  ])
  organisation: Organisation;

  @OneToMany(() => LogEntity, (logEntity) => logEntity.user)
  logs?: LogEntity[];

  // All the below fields were merged from the existing user entity

  @Column()
  country: string;

  @Column({ nullable: true })
  organisationId: number;

  @Column({
    type: "enum",
    enum: OrganisationType,
    array: false,
    default: OrganisationType.DEPARTMENT,
  })
  organisationType: OrganisationType;

  @Column({ nullable: true, select: false })
  apiKey: string;

  @Column({ type: "bigint", nullable: true })
  createdTime: number;

  @Column({
    type: "enum",
    enum: UserState,
    array: false,
    default: UserState.ACTIVE,
  })
  state: UserState;
}
