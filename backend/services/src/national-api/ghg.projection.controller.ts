import {
    Controller,
    UseGuards,
    Request,
    Post,
    Body,
    Get,
    Param,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PoliciesGuardEx } from "src/casl/policy.guard";
import { Action } from "src/casl/action.enum";
import { GhgProjectionService } from "src/projection/projection.service";
import { ProjectionEntity } from "src/entities/projection.entity";
import { ProjectionDto, ProjectionValidateDto } from "src/dtos/projection.dto";
import { ExtendedProjectionType, ProjectionType } from "src/enums/projection.enum";

@ApiTags("Projections")
@ApiBearerAuth()
@Controller("projections")
export class GHGProjectionController {
    constructor(private projectionService: GhgProjectionService) {}
  
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Create, ProjectionEntity))
    @Post("add")
    addEmission(@Body() projectionDto: ProjectionDto, @Request() req) {
      console.log("came here")
        return this.projectionService.create(projectionDto, req.user);
    }

    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Validate, ProjectionEntity))
    @Post("validate")
    validateEmission(@Body() projectionValidateDto: ProjectionValidateDto, @Request() req) {
        return this.projectionService.validate(projectionValidateDto, req.user);
    }

    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ProjectionEntity, true))
    @Get('/actual/:projectionType')
    getActualProjections(@Param('projectionType') projectionType: ProjectionType, @Request() req) {
      return this.projectionService.getActualProjection(projectionType, req.user);
    }

    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ProjectionEntity, true))
    @Get('/calculated/:projectionType')
    getCalculatedProjections(@Param('projectionType') projectionType: ExtendedProjectionType, @Request() req) {
      return this.projectionService.getCalculatedProjection(projectionType, req.user);
    }
    
}