import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { KpiDto } from "../dtos/kpi.dto";
import { HelperService } from "../util/helpers.service";
import { EntityType, Method } from "../enums/shared.enum";
import { mitigationTimelineDto } from "../dtos/mitigationTimeline.dto";
import { expectedMitigationTimelineProperties, actualMitigationTimelineProperties } from "../enums/mitigationTimeline.enum";
import { ActivityDto } from "../dtos/activity.dto";

@Injectable()
export class PayloadValidator {

	constructor(
		private helperService: HelperService
	) { }

	validateKpiPayload = (kpi: KpiDto, parentType: EntityType) => {
		let msg;
		if (!kpi.creatorType) msg = "kpi.creatorTypeCannotBeNull";
		else if (!kpi.kpiUnit) msg = "kpi.kpiUnitCannotBeNull";
		else if (!kpi.expected) msg = "kpi.expectedCannotBeNull";
		else if (!kpi.name) msg = "kpi.kpiNameCannotBeNull";
		else if (kpi.creatorType != parentType) msg = "kpi.kpiCreatorTypeMismatch";
		else if (!this.validateKpiValues(kpi.expected)) msg = "kpi.expectCanHaveOnlyTwoDecimals"

		if (msg) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					msg,
					[],
				),
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	validateMitigationTimelinePayload(mitigationTimelineDto: mitigationTimelineDto | ActivityDto, method: Method) {
		const { mitigationTimeline } = mitigationTimelineDto;

		if (!mitigationTimeline) {
			throw new HttpException('Mitigation timeline data is missing', HttpStatus.BAD_REQUEST);
		}

		const { expected, actual } = mitigationTimeline;

		if (!expected) {
			throw new HttpException('Mitigation timeline Expected data is missing', HttpStatus.BAD_REQUEST);
		} else {
			this.validateArrayAndLength(expected, expectedMitigationTimelineProperties);
			if (!expected.total) {
				throw new HttpException('Mitigation timeline Expected total data is missing', HttpStatus.BAD_REQUEST);
			} else {
				this.validateTotalValues(expected.total, expectedMitigationTimelineProperties);
				this.validateArraySum(expected, expected.total);
			}
		}

		if (!actual) {
			throw new HttpException('Mitigation timeline Actual data is missing', HttpStatus.BAD_REQUEST);
		} else {
			this.validateArrayAndLength(actual, actualMitigationTimelineProperties);
			if (!actual.total) {
				throw new HttpException('Mitigation timeline Actual total data is missing', HttpStatus.BAD_REQUEST);
			} else {
				this.validateTotalValues(actual.total, actualMitigationTimelineProperties);
				this.validateArraySum(actual, actual.total);
			}
		}

		if(method === Method.CREATE){
			const {startYear, unit} = mitigationTimeline;
			if(!startYear){
				throw new HttpException('Mitigation timeline Start Year is missing', HttpStatus.BAD_REQUEST);
			}

			if(!unit){
				throw new HttpException('Mitigation timeline Unit is missing', HttpStatus.BAD_REQUEST);
			}
		}
	}

	private validateArrayAndLength(data: any, propertiesEnum: any) {
		for (const propertyName in propertiesEnum) {
			const property = propertiesEnum[propertyName];
			const array = data[propertyName];

			if (!Array.isArray(array)) {
				throw new HttpException(`Mitigation timeline ${property} array is missing`, HttpStatus.BAD_REQUEST);
			}

			array.forEach((value, index) => {
				if (!Number.isInteger(value) || value < 0) {
					throw new HttpException(`Mitigation timeline ${property} array should contain only positive integers. Invalid value at index ${index}: ${value}`, HttpStatus.BAD_REQUEST);
				}
			});
		}
	}

	private validateTotalValues(data: any, propertiesEnum: any) {
		for (const propertyName in propertiesEnum) {
			const property = propertiesEnum[propertyName];
			const value = data[propertyName];

			if (value === undefined || value === null) {
				throw new HttpException(`Mitigation timeline ${property} total value is missing`, HttpStatus.BAD_REQUEST);
			}

			if (!Number.isInteger(value) || value < 0) {
				throw new HttpException(`Mitigation timeline ${property} total value should be a positive integer. Invalid value: ${value}`, HttpStatus.BAD_REQUEST);
			}
		}
	}

	private validateArraySum(data: any, total: any) {
		for (const propertyName in total) {
			const propertyTotal = total[propertyName];
			const array = data[propertyName];

			const sum = array.reduce((acc, curr) => acc + curr, 0);

			if (sum !== propertyTotal) {
				throw new HttpException(`Sum of ${propertyName} array elements should equal its total value`, HttpStatus.BAD_REQUEST);
			}
		}
	}

	public validateKpiValues(value: any) {
		// Check if the value is a number and has no more than two decimal points
		if (typeof value !== 'number') {
			return false;
		}
		const decimalPart = value.toString().split('.')[1];
		return !decimalPart || decimalPart.length <= 2;
	}
}