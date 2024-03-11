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
// import { StatList } from "../shared/dto/stat.list.dto";
// import { ApiKeyJwtAuthGuard } from "../shared/auth/guards/api-jwt-key.guard";
// import { Action } from "../shared/casl/action.enum";
// import { PoliciesGuardEx } from "../shared/casl/policy.guard";
// import { Stat } from "../shared/dto/stat.dto";
import { AggregateAPIService } from "./aggregate.api.service";
import { ApiKeyJwtAuthGuard } from "src/auth/guards/api-jwt-key.guard";
import { PoliciesGuardEx } from "src/casl/policy.guard";
import { Stat } from "src/dtos/stat.dto";
import { StatList } from "src/dtos/stat.list.dto";
import { Action } from "src/casl/action.enum";

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
