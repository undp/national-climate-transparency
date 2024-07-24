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
import { PoliciesGuardEx } from "../casl/policy.guard";
import { Action } from "../casl/action.enum";
import { EmissionEntity } from "../entities/emission.entity";
import { EmissionDto, EmissionValidateDto } from "../dtos/emission.dto";
import { GhgEmissionsService } from "../emission/emission.service";

@ApiTags("Emissions")
@ApiBearerAuth()
@Controller("emissions")
export class GHGEmissionController {
    constructor(private emissionService: GhgEmissionsService) {}
  
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Create, EmissionEntity))
    @Post("add")
    addEmission(@Body() emissionDto: EmissionDto, @Request() req) {
        return this.emissionService.create(emissionDto, req.user);
    }

    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Validate, EmissionEntity))
    @Post("validate")
    validateEmission(@Body() emissionValidateDto: EmissionValidateDto, @Request() req) {
        return this.emissionService.validate(emissionValidateDto, req.user);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, EmissionEntity, true))
    @Get('/:year')
    getEmissions(@Param('year') year: string, @Request() req) {
      return this.emissionService.getEmissionByYear(year, req.user);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, EmissionEntity, true))
    @Get("/summary/available")
    getEmissionYears(@Request() req) {
      return this.emissionService.getEmissionReportSummary(req.user);
    }
    
}