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
import { ActionService } from "../action/action.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

import { Action } from "../casl/action.enum";
import { PoliciesGuardEx } from "../casl/policy.guard";
import { ActionDto } from "../dtos/action.dto";
import { ActionEntity } from "../entities/action.entity";
import { QueryDto } from "../dtos/query.dto";
import { ActionUpdateDto } from "src/dtos/actionUpdate.dto";
import { ValidateDto } from "src/dtos/validate.dto";

@ApiTags("Actions")
@ApiBearerAuth()
@Controller("actions")
export class ActionController {
  constructor(
    private readonly actionService: ActionService,
  ) {}

  @ApiBearerAuth('api_key')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ActionEntity))
  @Post("add")
  addAction(@Body() actionDto: ActionDto, @Request() req) {
    return this.actionService.createAction(actionDto, req.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ActionEntity, true))
  @Post("query")
  queryActions(@Body() query: QueryDto, @Request() req) {
    console.log(req.abilityCondition);
    return this.actionService.query(query, req.abilityCondition);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ActionEntity, true))
  @Get('/:id')
  getActionViewData(@Param('id') id: string, @Request() req) {
    return this.actionService.getActionViewData(id);
  }

	@ApiBearerAuth('api_key')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ActionEntity))
  @Put("update")
  updateAction(@Body() actionUpdateDto: ActionUpdateDto, @Request() req) {
    return this.actionService.updateAction(actionUpdateDto, req.user);
  }
	
	@ApiBearerAuth('api_key')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ActionEntity))
	@Post("validate")
	validateActions(@Body() validateDto: ValidateDto, @Request() req) {
			return this.actionService.validateAction(validateDto, req.user);
	}
}