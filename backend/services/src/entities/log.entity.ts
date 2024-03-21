import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { EntityType, LogEventType } from "../enums/shared.enum";

@Entity("log")
export class LogEntity {
  @PrimaryGeneratedColumn('increment')
  logId: number;

  @Column({ type: "enum", enum: EntityType })
  recordType: string;

  @Column({ type: "enum", enum: LogEventType })
  eventType: LogEventType;

  @Column()
  recordId: string;
  
  @Column()
  userId: number;

  @Column({ type: 'jsonb', nullable: true })
  logData: any;
}
