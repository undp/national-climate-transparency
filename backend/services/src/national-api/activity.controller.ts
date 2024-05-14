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
import { QueryDto } from "../dtos/query.dto";
import { ActivityUpdateDto } from "src/dtos/activityUpdate.dto";
import { ValidateDto } from "src/dtos/validate.dto";

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
		return this.activityService.updateMitigationTimeline(mitigationTimelineDto, req.user);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ActivityEntity, true))
	@Get('mitigation/:id')
	getActivityMitigationTimeline(@Param('id') id: string, @Request() req) {
		return this.activityService.getActivityMitigationTimeline(id, req.user);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ActivityEntity, true))
	@Post("query")
	queryActivity(@Body() query: QueryDto, @Request() req) {
		console.log(req.abilityCondition);
		return this.activityService.query(query, req.abilityCondition);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ActivityEntity, true))
	@Get('/:id')
	getActivityViewData(@Param('id') id: string, @Request() req) {
		return this.activityService.getActivityViewData(id, req.user);
	}

	@ApiBearerAuth('api_key')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ActivityEntity))
	@Put("update")
	updateActivity(@Body() activityUpdateDto: ActivityUpdateDto, @Request() req) {
		return this.activityService.updateActivity(activityUpdateDto, req.user);
	}

	@ApiBearerAuth('api_key')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Validate, ActivityEntity))
	@Post("validate")
	validateActivity(@Body() validateDto: ValidateDto, @Request() req) {
		return this.activityService.validateActivity(validateDto, req.user);
	}

}