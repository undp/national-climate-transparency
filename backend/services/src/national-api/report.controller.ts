import {
  Controller,
  UseGuards,
  Request,
  Post,
  Body,
	Param,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

import { Action } from "../casl/action.enum";
import { PoliciesGuardEx } from "../casl/policy.guard";
import { QueryDto } from "../dtos/query.dto";
import { SupportEntity } from "src/entities/support.entity";
import { ReportService } from "src/report/report.service";
import { DataExportQueryDto } from "src/dtos/data.export.query.dto";
import { Reports } from "src/enums/shared.enum";

@ApiTags("Reports")
@ApiBearerAuth()
@Controller("reports")
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
  ) {}

	@ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, SupportEntity, true))
  @Post(":tableNumber/query")
  queryReportFiveData(@Param('tableNumber') tableNumber: Reports, @Body() query: QueryDto, @Request() req) {
    return this.reportService.getTableData(tableNumber, query);
  }

	@ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, SupportEntity, true))
  @Post(":tableNumber/export")
  exportReportFiveData(@Param('tableNumber') tableNumber: Reports, @Body() query: DataExportQueryDto, @Request() req) {
    return this.reportService.downloadReportData(tableNumber, query);
  }

	// @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, SupportEntity, true))
  // @Post("tableTwelve/query")
  // queryReportTwelveData(@Body() query: QueryDto, @Request() req) {
  //   return this.reportService.getTableTwelveData(query);
  // }
	
	// @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, SupportEntity, true))
  // @Post("tableTwelve/export")
  // exportReportTwelveData(@Body() query: DataExportQueryDto, @Request() req) {
  //   return this.reportService.downloadReportTwelve(query);
  // }

}