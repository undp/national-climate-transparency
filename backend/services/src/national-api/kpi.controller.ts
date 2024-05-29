import {
	Controller,
	UseGuards,
	Request,
	Post,
	Body,
	Get,
	Param,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

import { Action } from "../casl/action.enum";
import { PoliciesGuardEx } from "../casl/policy.guard";
import { KpiService } from "src/kpi/kpi.service";
import { EntityType } from "src/enums/shared.enum";
import { AchievementDto, AchievementDtoList } from "src/dtos/achievementDto";
import { KpiEntity } from "src/entities/kpi.entity";

@ApiTags("Kpis")
@ApiBearerAuth()
@Controller("kpis")
export class KpiController {
	constructor(
		private readonly kpiService: KpiService,
	) { }

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, KpiEntity, true))
	@Get('entities/:rootNodeType/:rootNodeId')
	getKpisOfEntity(@Param('rootNodeType') rootNodeType: EntityType, @Param('rootNodeId') rootNodeId: string, @Request() req) {
		return this.kpiService.getKpisForEntity(rootNodeId, rootNodeType);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, KpiEntity, true))
	@Get('achieved/:rootNodeType/:rootNodeId')
	getAchievedOfEntity(@Param('rootNodeType') rootNodeType: EntityType, @Param('rootNodeId') rootNodeId: string, @Request() req) {
		return this.kpiService.getKpisWithAchieved(rootNodeId, rootNodeType);
	}

	@ApiBearerAuth('api_key')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Create, KpiEntity))
	@Post("achievements/add")
	addAchievement(@Body() achievementDtoList: AchievementDtoList, @Request() req) {
		return this.kpiService.createAchievements(achievementDtoList, req.user);
	}

}