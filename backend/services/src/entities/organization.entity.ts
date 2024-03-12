import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { InstrumentEnum } from 'src/utils/enums/instrument.enum';
import { ActionStatusEnum } from 'src/utils/enums/actionStatus.enum';
import { NatAnchorEnum } from 'src/utils/enums/natAnchor.enum';
import { UserEntity } from './user.entity';

@Entity('organization')
export class OrganizationEntity {
  @PrimaryColumn()
  organization_id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: InstrumentEnum })
  type: string;

  @Column({ type: 'enum', enum: ActionStatusEnum })
  sector: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: NatAnchorEnum })
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
