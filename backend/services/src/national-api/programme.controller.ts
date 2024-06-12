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
import { ProgrammeDto } from "../dtos/programme.dto";
import { ProgrammeService } from "../programme/programme.service";
import { ProgrammeEntity } from "src/entities/programme.entity";
import { LinkProgrammesDto } from "src/dtos/link.programmes.dto";
import { UnlinkProgrammesDto } from "src/dtos/unlink.programmes.dto";
import { QueryDto } from "../dtos/query.dto";
import { ProgrammeUpdateDto } from "src/dtos/programmeUpdate.dto";
import { ValidateDto } from "src/dtos/validate.dto";

@ApiTags("Programmes")
@ApiBearerAuth()
@Controller("programmes")
export class ProgrammeController {
    constructor(
        private readonly programmeService: ProgrammeService,
    ) { }

    @ApiBearerAuth('api_key')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Create, ProgrammeEntity))
    @Post("add")
    addProgramme(@Body() programmeDto: ProgrammeDto, @Request() req) {
        return this.programmeService.createProgramme(programmeDto, req.user);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ProgrammeEntity, true))
    @Post("query")
    queryProgramme(@Body() query: QueryDto, @Request() req) {
      console.log(req.abilityCondition);
      return this.programmeService.query(query, req.abilityCondition);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ProgrammeEntity, true))
    @Get('/:id')
    getProgrammeViewData(@Param('id') id: string, @Request() req) {
      return this.programmeService.getProgrammeViewData(id, req.abilityCondition);
    }

    @ApiBearerAuth('api_key')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ProgrammeEntity))
    @Put("update")
    updateProgramme(@Body() programmeUpdateDto: ProgrammeUpdateDto, @Request() req) {
      return this.programmeService.updateProgramme(programmeUpdateDto, req.user);
    }

		@ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ProgrammeEntity, true))
    @Get('link/eligible')
    findEligibleProgrammesForLinking(@Request() req) {
      return this.programmeService.findProgrammesEligibleForLinking();
    }

    @ApiBearerAuth('api_key')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ProgrammeEntity))
    @Post("link")
    linkProgrammes(@Body() linkProgrammesDto: LinkProgrammesDto, @Request() req) {
        return this.programmeService.linkProgrammesToAction(linkProgrammesDto, req.user);
    }

    @ApiBearerAuth('api_key')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ProgrammeEntity))
    @Post("unlink")
    unlinkProgrammes(@Body() unlinkProgrammesDto: UnlinkProgrammesDto, @Request() req) {
        return this.programmeService.unlinkProgrammesFromAction(unlinkProgrammesDto, req.user);
    }

    @ApiBearerAuth('api_key')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Validate, ProgrammeEntity))
    @Post("validateStatus")
    validateProgrammes(@Body() validateDto: ValidateDto, @Request() req) {
        return this.programmeService.validateProgramme(validateDto, req.user);
    }
}