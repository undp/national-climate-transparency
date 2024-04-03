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
import { ProgrammeEntity } from "../entities/programme.entity";
import { ProjectService } from "../project/project.service";
import { ProjectDto } from "../dtos/project.dto";

@ApiTags("Projects")
@ApiBearerAuth()
@Controller("projects")
export class ProjectController {
    constructor(
        private readonly projectService: ProjectService,
    ) { }

    @ApiBearerAuth('api_key')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Create, ProgrammeEntity))
    @Post("add")
    addProject(@Body() projectDto: ProjectDto, @Request() req) {
        return this.projectService.createProject(projectDto, req.user);
    }
}