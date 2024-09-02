import {
  Controller,
  UseGuards,
  Request,
  Post,
  Body,
	Put,
	Delete,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

import { Action } from "../casl/action.enum";
import { PoliciesGuardEx } from "../casl/policy.guard";
import { QueryDto } from "../dtos/query.dto";
import { ValidateDto } from "../dtos/validate.dto";
import { SupportService } from "../support/support.service";
import { SupportDto } from "../dtos/support.dto";
import { SupportEntity } from "../entities/support.entity";
import { SupportUpdateDto } from "../dtos/supportUpdate.dto";
import { DeleteDto } from "../dtos/delete.dto";

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
	@Post("validateStatus")
	validateSupport(@Body() validateDto: ValidateDto, @Request() req) {
			return this.supportService.validateSupport(validateDto, req.user);
	}

	@ApiBearerAuth('api_key')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Delete, SupportEntity))
	@Delete("delete")
	deleteSupport(@Body() deleteDto: DeleteDto, @Request() req) {
			return this.supportService.deleteSupport(deleteDto, req.user);
	}

}