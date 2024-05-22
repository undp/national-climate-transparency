import {
  Controller,
  UseGuards,
  Request,
  Post,
  Body,
	Put,
	Get,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

import { Action } from "../casl/action.enum";
import { PoliciesGuardEx } from "../casl/policy.guard";
import { QueryDto } from "../dtos/query.dto";
import { ValidateDto } from "src/dtos/validate.dto";
import { SupportService } from "src/support/support.service";
import { SupportDto } from "src/dtos/support.dto";
import { SupportEntity } from "src/entities/support.entity";
import { SupportUpdateDto } from "src/dtos/supportUpdate.dto";
import { ReportService } from "src/report/report.service";
import { ReportFiveViewEntity } from "src/entities/report.five.view.entity";

@ApiTags("Reports")
@ApiBearerAuth()
@Controller("reports")
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
  ) {}

	@ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, SupportEntity, true))
  @Post("tableFive/query")
  querySupport(@Body() query: QueryDto, @Request() req) {
    console.log(req.abilityCondition);
    return this.reportService.tableFiveData(query);
  }

}