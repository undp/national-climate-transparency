import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { KpiDto } from "../dtos/kpi.dto";
import { HelperService } from "../util/helpers.service";
import { EntityType } from "../enums/shared.enum";
import { mitigationTimelineDto } from "../dtos/mitigationTimeline.dto";
import { expectedMitigationTimelineProperties, actualMitigationTimelineProperties } from "../enums/mitigationTimeline.enum";

@Injectable()
export class PayloadValidator {

  constructor(
    private helperService: HelperService
  ) { }

  validateKpiPayload = (kpi: KpiDto, parentType: EntityType) => {
    let msg;
    if (!kpi.creatorType) msg = "action.creatorTypeCannotBeNull";
    else if (!kpi.kpiUnit) msg = "action.kpiUnitCannotBeNull";
    else if (!kpi.expected) msg = "action.expectedCannotBeNull";
    else if (!kpi.name) msg = "action.kpiNameCannotBeNull";
    else if (kpi.creatorType != parentType) msg = "action.kpiCreatorTypeMismatch"

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

  validateMitigationTimelinePayload(mitigationTimelineDto: mitigationTimelineDto) {
    const { mitigationTimeline } = mitigationTimelineDto;

    if (!mitigationTimeline) {
      throw new HttpException('Mitigation timeline data is missing', HttpStatus.BAD_REQUEST);
    }

    const { expected, actual } = mitigationTimeline;

    if (!expected) {
      throw new HttpException('Mitigation timeline Expected data is missing', HttpStatus.BAD_REQUEST);
    } else {
      this.validateArrayAndLength(expected, expectedMitigationTimelineProperties);
      if(!expected.total){
        throw new HttpException('Mitigation timeline Expected total data is missing', HttpStatus.BAD_REQUEST);
      }else{
        this.validateTotalValues(expected.total, expectedMitigationTimelineProperties);
        this.validateArraySum(expected, expected.total);
      }
    }

    if (!actual) {
      throw new HttpException('Mitigation timeline Actual data is missing', HttpStatus.BAD_REQUEST);
    } else {
      this.validateArrayAndLength(actual, actualMitigationTimelineProperties);
      if(!actual.total){
        throw new HttpException('Mitigation timeline Actual total data is missing', HttpStatus.BAD_REQUEST);
      }else{
        this.validateTotalValues(actual.total, actualMitigationTimelineProperties);
        this.validateArraySum(actual, actual.total);
      }
    }
  }

  private validateArrayAndLength(data: any, propertiesEnum: any) {
    for (const propertyName in propertiesEnum) {
      const property = propertiesEnum[propertyName];
      const array = data[propertyName];
      const arraySize = 26;

      if (!Array.isArray(array)) {
        throw new HttpException(`Mitigation timeline ${property} array is missing`, HttpStatus.BAD_REQUEST);
      }

      if (array.length !== arraySize) {
        throw new HttpException(`${property} data should be an array with exactly ${arraySize} elements`, HttpStatus.BAD_REQUEST);
      }
    }
  }

  private validateTotalValues(data: any, propertiesEnum: any) {
    for (const propertyName in propertiesEnum) {
      const property = propertiesEnum[propertyName];
      const value = data[propertyName];

      if (value === undefined || value === null) {
        throw new HttpException(`Mitigation timeline ${property} total value is missing`, HttpStatus.BAD_REQUEST);
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
}