import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ParentTypeEnum } from 'src/utils/enums/parentType.enum';
import { UserEntity } from './user.entity';

@Entity('log')
export class LogEntity {
  @PrimaryColumn()
  log_id: number;

  @Column({ type: 'enum', enum: ParentTypeEnum })
  record_type: string;

  @Column()
  record_id: string;

  @ManyToOne(() => UserEntity, (user) => user.logs, {
    nullable: false,
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'user_id' }])
  user: UserEntity;
}
