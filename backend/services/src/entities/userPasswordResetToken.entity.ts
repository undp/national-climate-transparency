import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { EntitySubject } from "./entity.subject";

@Entity()
export class PasswordReset implements EntitySubject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  token: string;

  @Column({ type: "bigint", nullable: true })
  expireTime: number;
}
