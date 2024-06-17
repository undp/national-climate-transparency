import {
  Controller,
  UseGuards,
  Request,
  Post,
  Body,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

import { Action } from "../casl/action.enum";
import { PoliciesGuardEx } from "../casl/policy.guard";
import { QueryDto } from "../dtos/query.dto";
import { SupportEntity } from "src/entities/support.entity";
import { ReportService } from "src/report/report.service";
import { DataExportQueryDto } from "src/dtos/data.export.query.dto";

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
  queryReportFiveData(@Body() query: QueryDto, @Request() req) {
    return this.reportService.tableFiveData(query);
  }

	@ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, SupportEntity, true))
  @Post("tableFive/export")
  exportReportFiveData(@Body() query: DataExportQueryDto, @Request() req) {
    return this.reportService.downloadReportFive(query);
  }

	@ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, SupportEntity, true))
  @Post("tableTwelve/query")
  queryReportTwelveData(@Body() query: QueryDto, @Request() req) {
    return this.reportService.getTableTwelveData(query);
  }
	
	@ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, SupportEntity, true))
  @Post("tableTwelve/export")
  exportReportTwelveData(@Body() query: DataExportQueryDto, @Request() req) {
    return this.reportService.downloadReportTwelve(query);
  }

}