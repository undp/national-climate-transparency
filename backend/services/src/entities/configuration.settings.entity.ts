import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { ConfigurationSettingsType } from "../enums/configuration.settings.type.enum";
import { EntitySubject } from "./entity.subject";

@Entity("configuration_settings")
export class ConfigurationSettingsEntity implements EntitySubject {
  @PrimaryColumn({
    type: "enum",
    enum: ConfigurationSettingsType,
    array: false,
		unique: true
  })
  id: ConfigurationSettingsType;

	@Column({ type: 'jsonb', nullable: true })
  settingValue: any;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	createdTime: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	updatedTime: Date;
}
