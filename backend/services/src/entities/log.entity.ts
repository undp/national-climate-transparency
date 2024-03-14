import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { EntityType } from "src/enums/shared.enum";
import { User } from "./user.entity";

@Entity("log")
export class LogEntity {
  @PrimaryColumn()
  log_id: number;

  @Column({ type: "enum", enum: EntityType })
  record_type: string;

  @Column()
  record_id: string;
  
  @Column()
  user_id: User;
}
