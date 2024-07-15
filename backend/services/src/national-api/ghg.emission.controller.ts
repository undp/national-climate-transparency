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
import { EmissionDto, EmissionValidateDto } from "src/dtos/emission.dto";
import { GhgEmissionsService } from "src/emission/emission.service";

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
      return this.emissionService.getEmissionByYear(year);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, EmissionEntity, true))
    @Get("/summary/available")
    getEmissionYears() {
      return this.emissionService.getEmissionReportSummary();
    }
    
}