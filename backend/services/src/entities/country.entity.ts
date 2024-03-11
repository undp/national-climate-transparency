import { Column, Entity, PrimaryColumn } from "typeorm";
import { CounterType } from "../enums/counter.type.enum";

@Entity()
export class Country {

    @PrimaryColumn()
    alpha2: string;

    @Column()
    alpha3: string;

    @Column()
    name: string

}