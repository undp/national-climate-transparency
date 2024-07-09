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
import { EmissionEntity } from "src/entities/emission.entity";
import { EmissionDto } from "src/dtos/emission.dto";
import { GhgProjectionService } from "src/projection/projection.service";
import { BaselineDto } from "src/dtos/baseline.dto";

@ApiTags("Projections")
@ApiBearerAuth()
@Controller("projections")
export class GHGProjectionController {
    constructor(private projectionService: GhgProjectionService) {}
  
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Create, EmissionEntity))
    @Post("add")
    addEmission(@Body() emissionDto: EmissionDto, @Request() req) {
        return this.projectionService.create(emissionDto, req.user);
    }

    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Create, EmissionEntity))
    @Post("setBaseline")
    setBaseline(@Body() baselineDto: BaselineDto, @Request() req) {
        return this.projectionService.setBaselineYear(baselineDto, req.user);
    }

    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, EmissionEntity, true))
    @Get('/:projectionType/:projectionYear')
    getEmissions(@Param('projectionType') projectionType: string, @Param('projectionYear') projectionYear: string) {
      return this.projectionService.getProjectionByYear(projectionType, projectionYear);
    }

    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, EmissionEntity, true))
    @Get("/available/:projectionType")
    getEmissionYears(@Param('projectionType') projectionType: string) {
      return this.projectionService.getProjectionSummary(projectionType);
    }
    
}