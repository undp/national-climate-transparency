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
import { OrganizationEntity } from "./organization.entity";
import { LogEntity } from "./log.entity";

@Entity()
export class UserEntity implements EntitySubject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: "enum",
    enum: Role,
    array: false,
    default: Role.ViewOnly,
  })
  role: Role;

  @ManyToOne(() => OrganizationEntity, (organization) => organization.users, {
    nullable: false,
  })
  @JoinColumn([
    { name: "organization_id", referencedColumnName: "organization_id" },
  ])
  organization: OrganizationEntity;

  @OneToMany(() => LogEntity, (logEntity) => logEntity.user)
  logs?: LogEntity[];

  @Column({ nullable: true, select: false })
  apiKey: string;

  @Column({ type: "bigint", nullable: true })
  createdTime: number;
}
