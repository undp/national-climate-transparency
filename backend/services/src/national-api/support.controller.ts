import {
  Controller,
  UseGuards,
  Request,
  Post,
  Body,
	Put,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

import { Action } from "../casl/action.enum";
import { PoliciesGuardEx } from "../casl/policy.guard";
import { QueryDto } from "../dtos/query.dto";
import { ValidateDto } from "src/dtos/validate.dto";
import { SupportService } from "src/support/support.service";
import { SupportDto } from "src/dtos/support.dto";
import { SupportEntity } from "src/entities/support.entity";
import { SupportUpdateDto } from "src/dtos/supportUpdate.dto";

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
  addSupport(@Body() supportDto: SupportDto, @Request() req) {
    return this.supportService.createSupport(supportDto, req.user);
  }

	@ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, SupportEntity, true))
  @Post("query")
  querySupport(@Body() query: QueryDto, @Request() req) {
    console.log(req.abilityCondition);
    return this.supportService.query(query, req.abilityCondition);
  }

	@ApiBearerAuth('api_key')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, SupportEntity))
  @Put("update")
  updateSupport(@Body() supportUpdateDto: SupportUpdateDto, @Request() req) {
    return this.supportService.updateSupport(supportUpdateDto, req.user);
  }

	@ApiBearerAuth('api_key')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Validate, SupportEntity))
	@Post("validate")
	validateSupport(@Body() validateDto: ValidateDto, @Request() req) {
			return this.supportService.validateSupport(validateDto, req.user);
	}

}