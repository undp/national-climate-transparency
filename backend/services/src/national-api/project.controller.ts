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
import { ProjectService } from "../project/project.service";
import { ProjectDto } from "../dtos/project.dto";
import { LinkProjectsDto } from "../dtos/link.projects.dto";
import { ProjectEntity } from "../entities/project.entity";
import { UnlinkProjectsDto } from "../dtos/unlink.projects.dto";
import { QueryDto } from "src/dtos/query.dto";
import { ProjectUpdateDto } from "src/dtos/projectUpdate.dto";
import { ValidateDto } from "src/dtos/validate.dto";

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

		@ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ProjectEntity, true))
    @Post("query")
    queryProgramme(@Body() query: QueryDto, @Request() req) {
      console.log(req.abilityCondition);
      return this.projectService.query(query, req.abilityCondition);
    }

		@ApiBearerAuth()
		@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ProjectEntity, true))
		@Get('/:id')
		getActionViewData(@Param('id') id: string, @Request() req) {
			return this.projectService.getProjectViewData(id, req.abilityCondition);
		}

		@ApiBearerAuth('api_key')
		@ApiBearerAuth()
		@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ProjectEntity))
		@Put("update")
		updateProject(@Body() projectUpdateDto: ProjectUpdateDto, @Request() req) {
			return this.projectService.updateProject(projectUpdateDto, req.user);
		}

		@ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ProjectEntity, true))
    @Get('link/eligible')
    findEligibleProjectsForLinking(@Request() req) {
      return this.projectService.findProjectsEligibleForLinking();
    }

		@ApiBearerAuth('api_key')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ProjectEntity))
    @Post("validate")
    validateProjects(@Body() validateDto: ValidateDto, @Request() req) {
        return this.projectService.validateProject(validateDto, req.user);
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