import {
  Controller,
  Get,
  Logger,
  Query,
  UseGuards,
  Request,
  Post,
  Body,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AggregateAPIService } from "./aggregate.api.service";
import { ApiKeyJwtAuthGuard } from "../auth/guards/api-jwt-key.guard";
import { PoliciesGuardEx } from "../casl/policy.guard";
import { Stat } from "../dtos/stat.dto";
import { StatList } from "../dtos/stat.list.dto";
import { Action } from "../casl/action.enum";

@ApiTags("Programme")
@ApiBearerAuth()
@Controller("programme")
export class ProgrammeController {
  constructor(
    private aggService: AggregateAPIService,
    private readonly logger: Logger
  ) {}

  @ApiBearerAuth()
  @UseGuards(
    ApiKeyJwtAuthGuard,
    PoliciesGuardEx(true, Action.Read, Stat, true, true)
  )
  @Post("agg")
  async aggQueries(
    @Body() query: StatList,
    @Request() req
  ) {
    const companyId =
      req?.user?.companyId !== null ? req?.user?.companyId : null;
    return this.aggService.getAggregateQuery(
      req.abilityCondition,
      query,
      companyId,
      req.user?.organisationType
    );
  }
}
