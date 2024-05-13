import {
  Controller,
  UseGuards,
  Get,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.api.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Analytics")
@ApiBearerAuth()
@Controller("analytics")
export class AnalyticsController {
  constructor(
    private analyticsService: AnalyticsService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/climateActionChart')
  getClimateActionChart() {
    return this.analyticsService.getClimateActionChart();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/projectSummaryChart')
  getProjectSummaryChart() {
    return this.analyticsService.getProjectSummaryChart();
  }
}
