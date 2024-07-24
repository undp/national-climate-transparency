import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ConfigurationSettingsType } from "../enums/configuration.settings.type.enum";

export class SettingsDto {
	@IsNotEmpty()
	@ApiProperty()
	@IsEnum(ConfigurationSettingsType, {
		message: "Invalid type. Supported following types:" + Object.values(ConfigurationSettingsType),
	})
	id: ConfigurationSettingsType;

	@IsNotEmpty()
	@ApiProperty()
	settingValue: any;
}
