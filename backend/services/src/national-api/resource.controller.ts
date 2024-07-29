import {
	Body,
	Controller,
	Delete,
	Param,
	Post,
	Request,
	UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Action } from "../casl/action.enum";
import { PoliciesGuardEx } from "../casl/policy.guard";
import { SystemResourcesService } from "../system.resource/system.resources.service";
import { SystemResourceDto } from "../dtos/systemResourceDto";
import { SystemResourcesEntity } from "../entities/systemResource.entity";
import { QueryDto } from "../dtos/query.dto";

@ApiTags("Resources")
@Controller("resources")
@ApiBearerAuth()
export class ResourcesController {
	constructor(
		private readonly resourcesService: SystemResourcesService
	) { }

	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Create, SystemResourcesEntity))
	@Post("add")
	async saveResource(@Body() resourcesDto: SystemResourceDto, @Request() req) {
		return await this.resourcesService.createResource(resourcesDto, req.user)
	}

	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, SystemResourcesEntity))
	@Post("query")
	async queryResource(@Body() query: QueryDto, @Request() req) {
		return await this.resourcesService.query(query, req.user)
	}

	@UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Delete, SystemResourcesEntity))
	@Delete('delete/:id')
	async deleteResource(@Param("id") resourceId: number, @Request() req) {
		return await this.resourcesService.deleteResource(resourceId, req.user);
	}
}
