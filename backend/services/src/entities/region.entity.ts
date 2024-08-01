import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Region {
  @PrimaryColumn()
  key: string;

  @Column()
  countryAlpha2: string;

  @Column()
  regionName: string;

  @Column()
  lang: string;

  @Column({
    type: "jsonb",
    array: false,
    nullable: true,
  })
  geoCoordinates: any;
}
