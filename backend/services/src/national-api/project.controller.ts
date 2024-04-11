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
import { ProjectService } from "../project/project.service";
import { ProjectDto } from "../dtos/project.dto";
import { LinkProjectsDto } from "../dtos/link.projects.dto";
import { ProjectEntity } from "../entities/project.entity";
import { UnlinkProjectsDto } from "../dtos/unlink.projects.dto";

@ApiTags("Projects")
@ApiBearerAuth()
@Controller("projects")
export class ProjectController {
    constructor(
        private readonly projectService: ProjectService,
    ) { }

    @ApiBearerAuth('api_key')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Create, ProjectEntity))
    @Post("add")
    addProject(@Body() projectDto: ProjectDto, @Request() req) {
        return this.projectService.createProject(projectDto, req.user);
    }

    @ApiBearerAuth('api_key')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ProjectEntity))
    @Post("link")
    linkProjects(@Body() linkProjectsDto: LinkProjectsDto, @Request() req) {
        return this.projectService.linkProjectsToProgramme(linkProjectsDto, req.user);
    }

		@ApiBearerAuth('api_key')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ProjectEntity))
    @Post("unlink")
    unlinkProjects(@Body() unlinkProjectsDto: UnlinkProjectsDto, @Request() req) {
        return this.projectService.unlinkProjectsFromProgramme(unlinkProjectsDto, req.user);
    }
}