import {
  Controller,
  UseGuards,
  Request,
  Post,
  Body,
	Get,
	Param,
	Put,
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
import { QueryDto } from "../dtos/query.dto";
import { ActivityUpdateDto } from "src/dtos/activityUpdate.dto";
import { ValidateDto } from "src/dtos/validate.dto";
import { SupportService } from "src/support/support.service";
import { SupportDto } from "src/dtos/support.dto";
import { SupportEntity } from "src/entities/support.entity";

@ApiTags("Supports")
@ApiBearerAuth()
@Controller("supports")
export class SupportController {
  constructor(
    private readonly supportService: SupportService,
  ) {}

  @ApiBearerAuth('api_key')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Create, SupportEntity))
  @Post("add")
  addActivity(@Body() supportDto: SupportDto, @Request() req) {
    return this.supportService.createSupport(supportDto, req.user);
  }

	@ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, SupportEntity, true))
  @Post("query")
  queryActivity(@Body() query: QueryDto, @Request() req) {
    console.log(req.abilityCondition);
    return this.supportService.query(query, req.abilityCondition);
  }

	// @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ActivityEntity, true))
  // @Get('/:id')
  // getActivityViewData(@Param('id') id: string, @Request() req) {
  //   return this.activityService.getActivityViewData(id, req.user);
  // }

	// @ApiBearerAuth('api_key')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ActivityEntity))
  // @Put("update")
  // updateActivity(@Body() activityUpdateDto: ActivityUpdateDto, @Request() req) {
  //   return this.activityService.updateActivity(activityUpdateDto, req.user);
  // }

	@ApiBearerAuth('api_key')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Validate, SupportEntity))
	@Post("validate")
	validateActivity(@Body() validateDto: ValidateDto, @Request() req) {
			return this.supportService.validateSupport(validateDto, req.user);
	}

}