import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ParentTypeEnum } from 'src/utils/enums/parentType.enum';
import { ActivityEntity } from './activity.entity';

@Entity('support')
export class SupportEntity {
  @PrimaryColumn()
  support_id: string;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  direction: string;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  finance_nature: string;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  int_sup_channel: string;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  nat_sup_channel: string;

  @Column()
  other_int_sup_channel: string;

  @Column()
  other_nat_sup_channel: string;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  financing_status: string;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  int_source: string;

  @Column()
  nat_source: string;

  @Column()
  required_amount: number;

  @Column()
  recieved_amount: number;

  @Column()
  exch_rate: number;

  @ManyToOne(() => ActivityEntity, (activity) => activity.support, {
    nullable: false,
  })
  @JoinColumn([{ name: 'activity_id', referencedColumnName: 'activity_id' }])
  activity: ActivityEntity;
}
