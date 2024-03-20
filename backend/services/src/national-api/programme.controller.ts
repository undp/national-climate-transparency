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
import { ProgrammeDto } from "src/dtos/programme.dto";
import { ProgrammeService } from "src/programme/programme.service";

@ApiTags("Programme")
@ApiBearerAuth()
@Controller("programme")
export class ProgrammeController {
    constructor(
        private readonly programmeService: ProgrammeService,
    ) { }

    @ApiBearerAuth('api_key')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ActionEntity))
    @Post("add")
    addProgramme(@Body() programmeDto: ProgrammeDto, @Request() req) {
        return this.programmeService.createProgramme(programmeDto, req.user);
    }
}