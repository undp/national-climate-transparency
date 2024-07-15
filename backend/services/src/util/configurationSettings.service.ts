import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BasicResponseDto } from "../dtos/basic.response.dto";
import { ConfigurationSettingsEntity } from "../entities/configuration.settings.entity";
import { ConfigurationSettingsType } from "../enums/configuration.settings.type.enum";
import { HelperService } from "./helpers.service";
import { ProjectionData } from "src/dtos/projection.dto";
import { ProjectionEntity } from "src/entities/projection.entity";
import { GHGRecordState } from "src/enums/ghg.state.enum";
import { ExtendedProjectionType, ProjectionLeafSection } from "src/enums/projection.enum";

@Injectable()
export class ConfigurationSettingsService {
	constructor(
		@InjectRepository(ConfigurationSettingsEntity)
		private configSettingsRepo: Repository<ConfigurationSettingsEntity>,
		@InjectRepository(ProjectionEntity) private projectionRepo: Repository<ProjectionEntity>,
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

			// Updating the Baseline Projection
			if ([ConfigurationSettingsType.PROJECTIONS_WITH_MEASURES, ConfigurationSettingsType.PROJECTIONS_WITH_ADDITIONAL_MEASURES, ConfigurationSettingsType.PROJECTIONS_WITHOUT_MEASURES].includes(type)){

				const projectionType = type === ConfigurationSettingsType.PROJECTIONS_WITH_MEASURES 
												? ExtendedProjectionType.BASELINE_WITH_MEASURES : (
													type === ConfigurationSettingsType.PROJECTIONS_WITH_ADDITIONAL_MEASURES 
													? ExtendedProjectionType.BASELINE_WITH_ADDITIONAL_MEASURES 
													: ExtendedProjectionType.BASELINE_WITHOUT_MEASURES);

				await this.updateBaselineProjection(settingValue as ProjectionData, projectionType)
			}
			
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

	async updateBaselineProjection(baselineData: ProjectionData, projectionType: string) {
		
		const calculatedProjection = new ProjectionData();

		Object.values(ProjectionLeafSection).forEach(async (value, locIndex) => {
			calculatedProjection[value] = await this.buildProjectionArray(baselineData[value])
		});

		let baselineProjection = await this.projectionRepo.findOne({ where: { projectionType: projectionType } });

		if (baselineProjection) {
			baselineProjection.projectionData = calculatedProjection;
		} else {
			baselineProjection = new ProjectionEntity();
			baselineProjection.projectionType = projectionType;
			baselineProjection.projectionData = calculatedProjection;
			baselineProjection.state = GHGRecordState.SAVED;
		}

		// Save the setting
		await this.projectionRepo.save(baselineProjection);
	}

	private async buildProjectionArray(sectionConfig: number[]){
		const growthRate = (sectionConfig[0] + 100)/100;
		const baselineYear = sectionConfig[1];
		const co2 = sectionConfig[2];
		const ch4 = sectionConfig[3];
		const n2o = sectionConfig[4];

		const {gwp_ch4, gwp_n2o} = await this.getSetting(ConfigurationSettingsType.GWP);

		const projectionArray = new Array(51).fill(0);

		for (let year = baselineYear; year <= 2050; year++) {
			projectionArray[year - 2000] = (co2 + (ch4*gwp_ch4) + (n2o*gwp_n2o))*Math.pow(growthRate, (year-baselineYear))
		}

		return projectionArray;
	}
}
