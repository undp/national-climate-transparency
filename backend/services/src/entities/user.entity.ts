import { Role } from '../casl/role.enum';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { EntitySubject } from './entity.subject';
import { OrganisationType } from '../enums/organisation.type.enum'
import { UserState } from '../enums/user.state.enum';

@Entity()
export class User  implements EntitySubject{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column({select: false})
    password: string;

    @Column({
        type: "enum",
        enum: Role,
        array: false,
        default: Role.ViewOnly
    })
    role: Role;

    @Column()
    name: string;

    @Column()
    country: string;

    @Column({nullable: true})
    phoneNo: string;

    @Column({nullable: true})
    organisationId: number;

    @Column({
        type: "enum",
        enum: OrganisationType,
        array: false,
        default: OrganisationType.DEPARTMENT
    })
    organisationType: OrganisationType;

    @Column({nullable: true, select: false})
    apiKey: string;

    @Column({type: "bigint", nullable: true})
    createdTime: number;

    companyState: number;

    @Column({
        type: "enum",
        enum: UserState,
        array: false,
        default: UserState.ACTIVE,
      })
      state: UserState;
}
