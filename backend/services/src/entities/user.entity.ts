import { Role } from "../casl/role.enum";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { EntitySubject } from "./entity.subject";
import { OrganizationEntity } from "./organization.entity";

@Entity()
export class User implements EntitySubject {
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

  @Column({ nullable: true, select: false })
  apiKey: string;

  @Column({ type: "bigint", nullable: true })
  createdTime: number;
}
