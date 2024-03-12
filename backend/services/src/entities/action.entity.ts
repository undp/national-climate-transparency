import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { InstrumentEnum } from 'src/utils/enums/instrument.enum';
import { ActionStatusEnum } from 'src/utils/enums/actionStatus.enum';
import { NatAnchorEnum } from 'src/utils/enums/natAnchor.enum';
import { ProgramEntity } from './program.entity';

@Entity('action')
export class ActionEntity {
  @PrimaryColumn()
  action_id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  objective: string;

  @Column({ type: 'enum', enum: InstrumentEnum })
  instrument_type: string;

  @Column({ type: 'enum', enum: ActionStatusEnum })
  status: string;

  @Column()
  start_year: string;

  @Column({ type: 'enum', enum: NatAnchorEnum })
  nat_anchor: string;

  @Column()
  document: string;

  @OneToMany(() => ProgramEntity, (programEntity) => programEntity.action)
  programs?: ProgramEntity[];
}
