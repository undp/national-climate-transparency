import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { Sector } from "src/enums/shared.enum";
import { OrgType } from "src/enums/shared.enum";
import { UserEntity } from "./user.entity";

@Entity("organization")
export class OrganizationEntity {
  @PrimaryColumn()
  organization_id: string;

  @Column()
  name: string;

  @Column({ type: "enum", enum: OrgType })
  type: string;

  @Column({ type: "enum", enum: Sector })
  sector: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  region: string;

  @Column()
  website: string;

  @Column()
  address: string;

  @Column()
  logo: string;

  @OneToMany(() => UserEntity, (userEntity) => userEntity.organization)
  users?: UserEntity[];
}
