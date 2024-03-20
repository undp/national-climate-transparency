import {
  Controller,
  UseGuards,
  Request,
  Post,
  Body,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ActionService } from "../action/action.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

import { Action } from "../casl/action.enum";
import { PoliciesGuardEx } from "../casl/policy.guard";
import { ActionDto } from "../dtos/action.dto";
import { ActionEntity } from "../entities/action.entity";

@ApiTags("Action")
@ApiBearerAuth()
@Controller("action")
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
}