import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BasicResponseDto } from "../dtos/basic.response.dto";
import { ConfigurationSettingsEntity } from "../entities/configuration.settings.entity";
import { ConfigurationSettingsType } from "../enums/configuration.settings.type.enum";
import { HelperService } from "./helpers.service";

@Injectable()
export class ConfigurationSettingsService {
	constructor(
		@InjectRepository(ConfigurationSettingsEntity)
		private configSettingsRepo: Repository<ConfigurationSettingsEntity>,
		private helperService: HelperService
	) { }

	async getSetting(type: ConfigurationSettingsType, defaultValue?: string) {
		if (!Object.values(ConfigurationSettingsType).includes(type)) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"common.invalidConfigType",
					[type]
				),
				HttpStatus.BAD_REQUEST
			);
		}
		return await this.configSettingsRepo
			.findOneBy({
				id: type,
			})
			.then(async (value) => {
				if (value) return value.settingValue;
				else {
					throw new HttpException(
						this.helperService.formatReqMessagesString(
							"common.configsNotFound",
							[type]
						),
						HttpStatus.NOT_FOUND
					);
				}
			});
	}

	async updateSetting(type: ConfigurationSettingsType, settingValue: any) {

		try {
			let setting = await this.configSettingsRepo.findOne({ where: { id: type } });

			if (setting) {
				setting.settingValue = settingValue;
			} else {
				setting = new ConfigurationSettingsEntity();
				setting.id = type;
				setting.settingValue = settingValue;
			}

			// Save the setting
			await this.configSettingsRepo.save(setting);

			// Return success message
			return new BasicResponseDto(
				HttpStatus.OK,
				this.helperService.formatReqMessagesString(
					"common.settingsSavedMsg",
					[]
				)
			);
		} catch (err) {
			console.error("Failed to update settings:", err);
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"common.settingsSaveFailedMsg",
					[]
				),
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}
}
