import { Column, Entity, PrimaryColumn } from "typeorm";
import { ConfigurationSettingsType } from "../enums/configuration.settings.type.enum";
import { EntitySubject } from "./entity.subject";

@Entity()
export class ConfigurationSettings implements EntitySubject {
  @PrimaryColumn({
    type: "enum",
    enum: ConfigurationSettingsType,
    array: false,
  })
  id: ConfigurationSettingsType;

  @Column()
  settingValue: string;
}
