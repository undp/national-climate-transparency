import { Body, Post, UseGuards, Request, Get, Controller } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { LogService } from "../log/log.service";
import { PoliciesGuardEx } from "src/casl/policy.guard";
import { LogEntity } from "src/entities/log.entity";
import { Action } from "../casl/action.enum";
import { LogDto } from "src/dtos/log.dto";

@ApiTags("Log")
@ApiBearerAuth()
@Controller("log")
export class LogController {
    constructor(
        private readonly logService: LogService,
    ) { }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, LogEntity, true))
    @Post("query")
    queryLog(@Body() logDto: LogDto, @Request() req) {
      console.log(req.abilityCondition);
      return this.logService.getLogData(logDto);
    }

}