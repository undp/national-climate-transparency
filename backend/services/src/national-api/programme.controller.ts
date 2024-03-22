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
import { ActionEntity } from "../entities/action.entity";
import { ProgrammeDto } from "../dtos/programme.dto";
import { ProgrammeService } from "../programme/programme.service";
import { ProgrammeEntity } from "src/entities/programme.entity";
import { LinkProgrammesDto } from "src/dtos/link.programmes.dto";
import { UnlinkProgrammesDto } from "src/dtos/unlink.programmes.dto";

@ApiTags("Programme")
@ApiBearerAuth()
@Controller("programme")
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
}