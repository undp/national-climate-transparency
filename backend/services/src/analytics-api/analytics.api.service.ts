import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { DataCountResponseDto } from "../dtos/data.count.response";
import { ActionEntity } from "src/entities/action.entity";
import { EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { ProjectEntity } from "src/entities/project.entity";
import { ActivityEntity } from "src/entities/activity.entity";
import { FinanceNature, SupportDirection } from "src/enums/support.enum";
import { HelperService } from "src/util/helpers.service";

@Injectable()
export class AnalyticsService {

	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		@InjectRepository(ActivityEntity) private activityRepo: Repository<ActivityEntity>,
		private helperService: HelperService
	) { }

	async getClimateActionChart(): Promise<DataCountResponseDto> {
		try {
			const queryBuilder = this.entityManager.createQueryBuilder()
				.select('sector, COUNT("actionId") as count')
				.from(ActionEntity, 'action')
				.groupBy('sector');

			const result = await queryBuilder.getRawMany();

			// Extract sectors and counts into separate arrays
			const sectors = result.map(row => row.sector);
			const counts = result.map(row => row.count);

			return new DataCountResponseDto({ sectors, counts });
		} catch (err) {
			console.log(err);
			// Handle error
		}

	}

	async getProjectSummaryChart(): Promise<DataCountResponseDto> {
		try {
			const queryBuilder = this.entityManager.createQueryBuilder()
				.select('sector, COUNT("projectId") as count')
				.from(ProjectEntity, 'project')
				.groupBy('sector');

			const result = await queryBuilder.getRawMany();

			// Extract sectors and counts into separate arrays
			const sectors = result.map(row => row.sector);
			const counts = result.map(row => row.count);

			return new DataCountResponseDto({ sectors, counts });
		} catch (err) {
			console.log(err);
			// Handle error
		}
	}

	async getActivitiesSupported() {
		try {
			const results = await this.activityRepo.createQueryBuilder('activity')
				.leftJoin('activity.support', 'support')
				.select([
					'COUNT(DISTINCT activity.activityId) as "totalActivities"',
					'COUNT(DISTINCT CASE WHEN support.financeNature = :financeNature AND support.direction = :directionReceived THEN activity.activityId END) as "supportReceivedActivities"'
				])
				.setParameter('financeNature', FinanceNature.INTERNATIONAL)
				.setParameter('directionReceived', SupportDirection.RECEIVED)
				.getRawOne();

			const totalActivities = results.totalActivities ? parseInt(results.totalActivities) : 0;
			const supportReceivedActivities = results.supportReceivedActivities ? parseInt(results.supportReceivedActivities) : 0;
			const supportNeededActivities = totalActivities - supportReceivedActivities;

			return new DataCountResponseDto({ supportReceivedActivities, supportNeededActivities });
		} catch (err) {
			console.log(err);
			// Handle error
		}
	}

	async getActivitiesFinance() {
		try {
			const results = await this.activityRepo.createQueryBuilder('activity')
				.leftJoin('activity.support', 'support')
				.select([
					'sum(support."receivedAmount") as "supportReceived"', 'sum(support."requiredAmount") as "supportNeeded"',
				])
				.getRawOne();

			const supportReceived = results.supportReceived ? parseFloat(results.supportReceived) : 0;
			const supportNeeded = results.supportNeeded ? parseFloat(results.supportNeeded) : 0;

			return new DataCountResponseDto({ supportReceived, supportNeeded });
		} catch (err) {
			console.log(err);
			// Handle error
		}
	}

	async getGhgMitigationForYear(year: number) {

		if (year > 2050 || year < 2015) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"stat.yearNotValid",
					[year]
				),
				HttpStatus.BAD_REQUEST
			);
		}
		try {
			const index = year - 2015
			const query = `
			SELECT 
					activity.sector,
					SUM((activity."mitigationTimeline"->'expected'->'expectedEmissionReductWithM'->>${index})::numeric) AS total
			FROM 
					activity
				Where activity."mitigationTimeline" IS NOT NULL
			GROUP BY 
					activity.sector;
			`;

			const result = await this.entityManager.query(query);
			// Extract sectors and counts into separate arrays
			const sectors = result.map(row => row.sector);
			const totals = result.map(row => row.total);

			return new DataCountResponseDto({sectors, totals});
		} catch (err) {
			console.log(err);
			// Handle error
		}
	}

	async getGhgMitigationForRecentYear() {

		// Get the current year
		const currentYear = new Date().getFullYear();

		// Calculate the previous year
		const previousYear = currentYear - 1;

		// Ensure the year is at least 2015
		const year = previousYear < 2015 ? 2015 : previousYear;

		try {
			const index = year - 2015
			const query = `
			SELECT 
					activity.sector,
					SUM((activity."mitigationTimeline"->'actual'->'actualEmissionReduct'->>${index})::numeric) AS total
			FROM 
					activity
				Where activity."mitigationTimeline" IS NOT NULL
			GROUP BY 
					activity.sector;
			`;

			const result = await this.entityManager.query(query);
			const sectors = result.map(row => row.sector);
			const totals = result.map(row => row.total);

			return new DataCountResponseDto({sectors, totals});
		} catch (err) {
			console.log(err);
			// Handle error
		}
	}

}
