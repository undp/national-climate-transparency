import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { KpiDto } from "../dtos/kpi.dto";
import { HelperService } from "../util/helpers.service";
import { EntityType } from "../enums/shared.enum";
import { mitigationTimelineDto } from "src/dtos/mitigationTimeline.dto";

@Injectable()
export class PayloadValidator {

  constructor(
    private helperService: HelperService
  ) { }

  validateKpiPayload = (kpi: KpiDto, parentType: EntityType) => {
    let msg;
    if (!kpi.creatorType) msg = "action.creatorTypeCannotBeNull";
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
    let msg;
    const { mitigationTimeline } = mitigationTimelineDto;

    if (!mitigationTimeline) {
      msg = 'Mitigation timeline cannot be empty';
    } else {
      const { expected, actual } = mitigationTimeline;

      this.validateArrayAndLength(expected.baselineEmissions, 'Baseline emissions without measures');
      this.validateArrayAndLength(expected.activityEmissionsWithM, 'Activity emissions with measures');
      this.validateArrayAndLength(expected.activityEmissionsWithAM, 'Activity emissions with additional measures');
      this.validateArrayAndLength(expected.expectedEmissionReductWithM, 'Expected emission reduction with measures');
      this.validateArrayAndLength(expected.expectedEmissionReductWithAM, 'Expected emission reduction with additional measures');

      this.validateArrayAndLength(actual.baselineActualEmissions, 'Baseline actual emissions');
      this.validateArrayAndLength(actual.activityActualEmissions, 'Activity actual emissions');
      this.validateArrayAndLength(actual.actualEmissionReduct, 'Actual equivalent emission reductions');

    }

    if (msg) {
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }

  private validateArrayAndLength(array: any[], propertyName: string) {
    if (!Array.isArray(array)) {
      throw new HttpException(`Not found ${propertyName}`, HttpStatus.BAD_REQUEST);
    }
    if (array.length !== 3) {
      throw new HttpException(`${propertyName} data should be an array with exactly 3 elements`, HttpStatus.BAD_REQUEST);
    }
  }
}