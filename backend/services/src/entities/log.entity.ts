import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { EntityType } from "src/enums/shared.enum";
import { User } from "./user.entity";

@Entity("log")
export class LogEntity {
  @PrimaryColumn()
  logId: number;

  @Column({ type: "enum", enum: EntityType })
  recordType: string;

  @Column()
  recordId: string;
  
  @Column()
  userId: User;
}
