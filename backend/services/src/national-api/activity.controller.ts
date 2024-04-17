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
import { ActivityService } from "../activity/activity.service";
import { ActivityEntity } from "../entities/activity.entity";
import { ActivityDto } from "../dtos/activity.dto";

@ApiTags("Activities")
@ApiBearerAuth()
@Controller("activities")
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
  ) {}

  @ApiBearerAuth('api_key')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ActivityEntity))
  @Post("add")
  addActivity(@Body() activityDto: ActivityDto, @Request() req) {
    return this.activityService.createActivity(activityDto, req.user);
  }
}