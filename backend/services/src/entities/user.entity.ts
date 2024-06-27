import { Role, SubRole } from '../casl/role.enum';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { EntitySubject } from './entity.subject';
import { Organisation, OrganisationType } from '../enums/organisation.enum'
import { UserState } from '../enums/user.enum';
import { Sector } from '../enums/sector.enum';

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
        default: Role.Observer
    })
    role: Role;

		@Column({
			type: "enum",
			enum: SubRole,
			array: false,
			nullable: true
    })
    subRole: SubRole;

    @Column()
    name: string;

    @Column()
    country: string;

    @Column({nullable: true})
    phoneNo: string;

    @Column({
			type: "enum",
			enum: Organisation,
			array: false,
			nullable: true
	  })
    organisation: Organisation;

    @Column({nullable: true, select: false})
    apiKey: string;

    @Column({type: "bigint", nullable: true})
    createdTime: number;

		@Column("varchar", { array: true, nullable: true })
		sector: Sector[];

    @Column({
        type: "enum",
        enum: UserState,
        array: false,
        default: UserState.ACTIVE,
    })
    state: UserState;
}
