import {
  Controller,
  UseGuards,
  Get,
	Param,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.api.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Analytics")
@ApiBearerAuth('api_key')
@Controller("analytics")
export class AnalyticsController {
  constructor(
    private analyticsService: AnalyticsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/actionsSummery')
  getClimateActionChart() {
    return this.analyticsService.getClimateActionChart();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/projectSummary')
  getProjectSummaryChart() {
    return this.analyticsService.getProjectSummaryChart();
  }

	@UseGuards(JwtAuthGuard)
  @Get('/supportSummary')
  getSupportChart() {
    return this.analyticsService.getActivitiesSupported();
  }

	@UseGuards(JwtAuthGuard)
  @Get('/supportFinanceSummary')
  getSupportFinanceChart() {
    return this.analyticsService.getActivitiesFinance();
  }

	@UseGuards(JwtAuthGuard)
  @Get('/ghgMitigationSummaryForYear/:year')
  getGhgMitigationForYear(@Param('year') year: number) {
    return this.analyticsService.getGhgMitigationForYear(year);
  }

	@UseGuards(JwtAuthGuard)
  @Get('/getGhgMitigationSummary')
  getGhgMitigationForRecentYear() {
    return this.analyticsService.getGhgMitigationForRecentYear();
  }
}
