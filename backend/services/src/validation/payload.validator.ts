import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { KpiDto } from "../dtos/kpi.dto";
import { HelperService } from "../util/helpers.service";
import { EntityType } from "../enums/shared.enum";

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
}