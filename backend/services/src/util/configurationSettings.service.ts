import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { BasicResponseDto } from "../dtos/basic.response.dto";
import { ConfigurationSettingsEntity } from "../entities/configuration.settings.entity";
import { ConfigurationSettingsType } from "../enums/configuration.settings.type.enum";
import { HelperService } from "./helpers.service";
import { ProjectionData } from "../dtos/projection.dto";
import { ProjectionEntity } from "../entities/projection.entity";
import { GHGRecordState } from "../enums/ghg.state.enum";
import { ExtendedProjectionType, ProjectionLeafSection } from "../enums/projection.enum";
import { User } from "../entities/user.entity";
import { GHGInventoryManipulate } from "../enums/user.enum";
import { ActivityEntity } from "../entities/activity.entity";
import { GHGS } from "../enums/shared.enum";

@Injectable()
export class ConfigurationSettingsService {
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		@InjectRepository(ConfigurationSettingsEntity)
		private configSettingsRepo: Repository<ConfigurationSettingsEntity>,
		@InjectRepository(ProjectionEntity) private projectionRepo: Repository<ProjectionEntity>,
		@InjectRepository(ActivityEntity) private activityRepo: Repository<ActivityEntity>,
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

	async updateSetting(type: ConfigurationSettingsType, settingValue: any, user: User) {

		try {

			if (
			[
				ConfigurationSettingsType.GWP, 
				ConfigurationSettingsType.PROJECTIONS_WITHOUT_MEASURES, 
				ConfigurationSettingsType.PROJECTIONS_WITH_ADDITIONAL_MEASURES, 
				ConfigurationSettingsType.PROJECTIONS_WITH_MEASURES
			].includes(type) && user.ghgInventoryPermission === GHGInventoryManipulate.CANNOT) {
				throw new HttpException(this.helperService.formatReqMessagesString("ghgInventory.ghgPermissionDenied", []), HttpStatus.FORBIDDEN);
			}

			let setting = await this.configSettingsRepo.findOne({ where: { id: type } });
			let oldGwp: any;

			if (setting) {
				if(setting.id === ConfigurationSettingsType.GWP){
					oldGwp = setting.settingValue;
				}
				setting.settingValue = settingValue;
			} else {
				setting = new ConfigurationSettingsEntity();
				setting.id = type;
				setting.settingValue = settingValue;
			}
			
			// Updating the Baseline Projection

			await this.entityManager
				.transaction(async (em) => {
					const savedSetting = await em.save<ConfigurationSettingsEntity>(setting);

					if (savedSetting){
						if ([ConfigurationSettingsType.PROJECTIONS_WITH_MEASURES, ConfigurationSettingsType.PROJECTIONS_WITH_ADDITIONAL_MEASURES, ConfigurationSettingsType.PROJECTIONS_WITHOUT_MEASURES].includes(type)){

							const projectionType = type === ConfigurationSettingsType.PROJECTIONS_WITH_MEASURES 
															? ExtendedProjectionType.BASELINE_WITH_MEASURES : (
																type === ConfigurationSettingsType.PROJECTIONS_WITH_ADDITIONAL_MEASURES 
																? ExtendedProjectionType.BASELINE_WITH_ADDITIONAL_MEASURES 
																: ExtendedProjectionType.BASELINE_WITHOUT_MEASURES);
							
							await this.updateBaselineProjection(settingValue as ProjectionData, projectionType)
						}
					}
				})
				.catch((err: any) => {
					throw err;
				});
			
				if(type === ConfigurationSettingsType.GWP){
					await this.updateMitigationTimeline(setting.settingValue, oldGwp);
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
			console.log('Setting save failed due to', err);
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"common.settingsSaveFailedMsg",
					[]
				),
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	private async updateBaselineProjection(baselineData: ProjectionData, projectionType: string) {

		const calculatedProjection = new ProjectionData();
		const currentYear = new Date().getFullYear();

		for (const value of Object.values(ProjectionLeafSection)) {
			calculatedProjection[value] = await this.buildProjectionArray(baselineData[value], currentYear)
		}

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

	private async buildProjectionArray(sectionConfig: number[], currentYear: number){

		const growthRate = (sectionConfig[0] + 100)/100;
		const baselineYear = sectionConfig[1];
		const co2 = sectionConfig[2];
		const ch4 = sectionConfig[3];
		const n2o = sectionConfig[4];
		const maxProjectingYear = baselineYear < currentYear ? (currentYear + 10) : baselineYear + 10 < 2050 ? (baselineYear + 10) : 2050;

		if (baselineYear < 2000 || baselineYear > 2050){
			throw new HttpException(this.helperService.formatReqMessagesString("ghgInventory.invalidYearReceived", []), HttpStatus.BAD_REQUEST);
		}

		let gwp_ch4 = 1; 
		let gwp_n2o = 1;
		
		try {
			const settings = await this.getSetting(ConfigurationSettingsType.GWP);
			gwp_ch4 = settings.gwp_ch4;
			gwp_n2o = settings.gwp_n2o;
		} catch {
			console.log('Using Default GWP Value of 1')
		}
		
		const projectionArray = new Array(51).fill(0);
		const baselineProjection = (co2 + (ch4*gwp_ch4) + (n2o*gwp_n2o));

		for (let year = baselineYear; year <= 2050; year++) {
			const projectionByYear = baselineProjection*Math.pow(growthRate, (year >= maxProjectingYear ? (maxProjectingYear - baselineYear) : (year - baselineYear)));
			projectionArray[year - 2000] = parseFloat(projectionByYear.toFixed(2));
		}

		return projectionArray;

	}

	private async updateMitigationTimeline(newGwpValue: any, oldGwpValue: any) {

		const currentYear = new Date().getFullYear();

		if (oldGwpValue === undefined || newGwpValue.gwp_ch4 !== oldGwpValue.gwp_ch4) {
			await this.entityManager.query(`SELECT update_mitigation_timeline(${newGwpValue.gwp_ch4}::INTEGER, '${GHGS.CH}', ${currentYear}::INTEGER);`);
		}

		if (oldGwpValue === undefined || newGwpValue.gwp_n2o !== oldGwpValue.gwp_n2o) {
			await this.entityManager.query(`SELECT update_mitigation_timeline(${newGwpValue.gwp_n2o}::INTEGER, '${GHGS.NO}', ${currentYear}::INTEGER);`);
		}
	}
}
