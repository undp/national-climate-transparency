import {
	Controller,
	UseGuards,
	Request,
	Post,
	Body,
	Get,
	Put,
	Param,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

import { Action } from "../casl/action.enum";
import { PoliciesGuardEx } from "../casl/policy.guard";
import { ActivityService } from "../activity/activity.service";
import { ActivityEntity } from "../entities/activity.entity";
import { ActivityDto } from "../dtos/activity.dto";
import { LinkActivitiesDto } from "src/dtos/link.activities.dto";
import { UnlinkActivitiesDto } from "src/dtos/unlink.activities.dto";
import { mitigationTimelineDto } from "src/dtos/mitigationTimeline.dto";

@ApiTags("Activities")
@ApiBearerAuth()
@Controller("activities")
export class ActivityController {
	constructor(
		private readonly activityService: ActivityService,
	) { }

	@ApiBearerAuth('api_key')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ActivityEntity))
	@Post("add")
	addActivity(@Body() activityDto: ActivityDto, @Request() req) {
		return this.activityService.createActivity(activityDto, req.user);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ActivityEntity, true))
	@Get('link/eligible')
	findEligibleProjectsForLinking(@Request() req) {
		return this.activityService.findActivitiesEligibleForLinking();
	}

	@ApiBearerAuth('api_key')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ActivityEntity))
	@Post("link")
	linkProjects(@Body() linkActivitiesDto: LinkActivitiesDto, @Request() req) {
		return this.activityService.linkActivitiesToParent(linkActivitiesDto, req.user);
	}

	@ApiBearerAuth('api_key')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ActivityEntity))
	@Post("unlink")
	unlinkProjects(@Body() unlinkActivitiesDto: UnlinkActivitiesDto, @Request() req) {
		return this.activityService.unlinkActivitiesFromParents(unlinkActivitiesDto, req.user);
	}

	@ApiBearerAuth('api_key')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ActivityEntity))
	@Put("mitigation/update")
	updateMitigationTimeline(@Body() mitigationTimelineDto: mitigationTimelineDto, @Request() req) {
		return this.activityService.updateMitigationTimeline(mitigationTimelineDto);
	}
}