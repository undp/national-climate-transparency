import { Body, Controller, Post, UseGuards, Request, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Programme } from '../shared/entities/programme.entity';
import { Action } from '../shared/casl/action.enum';
import { AppAbility } from '../shared/casl/casl-ability.factory';
import { CheckPolicies } from '../shared/casl/policy.decorator';
import { PoliciesGuard, PoliciesGuardEx } from '../shared/casl/policy.guard';
import { ProgrammeDto } from '../shared/dto/programme.dto';
import { ProgrammeService } from '../shared/programme/programme.service';
import { QueryDto } from '../shared/dto/query.dto';
import { ConstantUpdateDto } from '../shared/dto/constants.update.dto';
import { ApiKeyJwtAuthGuard } from '../shared/auth/guards/api-jwt-key.guard';
import { NDCActionDto } from '../shared/dto/ndc.action.dto';
import { JwtAuthGuard } from '../shared/auth/guards/jwt-auth.guard';
import { ProgrammeDocumentDto } from '../shared/dto/programme.document.dto';
import { DocumentAction } from '../shared/dto/document.action';
import { ProgrammeAuth } from '../shared/dto/programme.approve';
import { ProgrammeIssue } from '../shared/dto/programme.issue';
import { ProgrammeReject } from '../shared/dto/programme.reject';
import { InvestmentRequestDto } from '../shared/dto/investment.request.dto';
import { Investment } from '../shared/entities/investment.entity';
import { InvestmentApprove } from '../shared/dto/investment.approve';
import { InvestmentCancel } from '../shared/dto/investment.cancel';
import { InvestmentReject } from '../shared/dto/investment.reject';
import { ProgrammeDocument } from '../shared/entities/programme.document';
import { NDCAction } from '../shared/entities/ndc.action.entity';
import { NDCActionViewEntity } from '../shared/entities/ndc.view.entity';
import { ProgrammeDocumentViewEntity } from '../shared/entities/document.view.entity';

@ApiTags('Programme')
@ApiBearerAuth()
@Controller('programme')
export class ProgrammeController {

    constructor(private programmeService: ProgrammeService) {

    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Programme))
    @Post('create')
    async addProgramme(@Body()programme: ProgrammeDto, @Request() req) {
      global.baseUrl = `${req.protocol}://${req.get("Host")}`;
      return this.programmeService.create(programme, req.user)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Programme))
    @Post('addNDCAction')
    async addNDCAction(@Body()ndcAction: NDCActionDto, @Request() req) {
      global.baseUrl = `${req.protocol}://${req.get("Host")}`;
      return this.programmeService.addNDCAction(ndcAction, req.user)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, DocumentAction))
    @Post('addDocument')
    async addDocument(@Body()docDto: ProgrammeDocumentDto, @Request() req) {
      global.baseUrl = `${req.protocol}://${req.get("Host")}`;
      return this.programmeService.addDocument(docDto, req.user)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, DocumentAction))
    @Post('docAction')
    async docAction(@Body()docAction: DocumentAction, @Request() req) {
      return this.programmeService.docAction(docAction, req.user)
    }


    @ApiBearerAuth()
    @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Read, Programme, true))
    // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, User, true))
    @Post('query')
    async getAll(@Body()query: QueryDto, @Request() req) {
      return this.programmeService.query(query, req.abilityCondition)
    }

    @ApiBearerAuth()
    @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Read, ProgrammeDocumentViewEntity, true))
    // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, User, true))
    @Post('queryDocs')
    async queryDocuments(@Body()query: QueryDto, @Request() req) {
      return this.programmeService.queryDocuments(query, req.abilityCondition)
    }

    @ApiBearerAuth()
    @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Read, NDCActionViewEntity, true))
    // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, User, true))
    @Post('queryNdcActions')
    async queryNdcActions(@Body()query: QueryDto, @Request() req) {
      return this.programmeService.queryNdcActions(query, req.abilityCondition)
    }

    // @ApiBearerAuth('api_key')
    // @ApiBearerAuth()
    // @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuard)
    // @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Read, Programme, true))
    // @Get('getHistory')
    // async getHistory(@Query('programmeId') programmeId: string, @Request() req) {
    //     return this.programmeService.getProgrammeEvents(programmeId, req.user)
    // }

    @ApiBearerAuth()
    @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Update, Programme))
    @Post('updateConfigs')
    async updateConfigs(@Body() config: ConstantUpdateDto) {
        return this.programmeService.updateCustomConstants(config.type, config);
    }

    @ApiBearerAuth('api_key')
    @ApiBearerAuth()
    @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Update, Programme))
    @Put('authProgramme')
    async authProgramme(@Body() auth: ProgrammeAuth) {
        return this.programmeService.authProgramme(auth);
    }

    @ApiBearerAuth('api_key')
    @ApiBearerAuth()
    @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Update, Programme))
    @Put('issueCredit')
    async issueCredit(@Body() issue: ProgrammeIssue) {
        return this.programmeService.issueCredit(issue);
    }

    @ApiBearerAuth('api_key')
    @ApiBearerAuth()
    @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Update, Programme))
    @Put('rejectProgramme')
    async rejectProgramme(@Body() rej: ProgrammeReject) {
        return this.programmeService.rejectProgramme(rej);
    }


    @ApiBearerAuth()
    @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Update, Investment))
    @Post('addInvestment')
    async addInvestment(@Body() investment: InvestmentRequestDto, @Request() req) {
        return this.programmeService.addInvestment(investment, req.user);
    }

    @ApiBearerAuth()
    @UseGuards(ApiKeyJwtAuthGuard, ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Create, Investment))
    @Post('investmentApprove')
    async investmentApprove(@Body() body: InvestmentApprove, @Request() req) {
        return this.programmeService.investmentApprove(body, req.user)
    }

    @ApiBearerAuth()
    @UseGuards(ApiKeyJwtAuthGuard, ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Delete, Investment))
    @Post('investmentReject')
    async investmentReject(@Body() body: InvestmentReject, @Request() req) {
        return this.programmeService.investmentReject(body, req.user)
    }

    @ApiBearerAuth()
    @UseGuards(ApiKeyJwtAuthGuard, ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Delete, Investment))
    @Post('investmentCancel')
    async investmentCancel(@Body() body: InvestmentCancel, @Request() req) {
        return this.programmeService.investmentCancel(body, req.user)
    }

    @ApiBearerAuth()
    @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Read, Investment, true))
    @Post('investmentQuery')
    queryUser(@Body()query: QueryDto, @Request() req) {
      console.log(req.abilityCondition)
      return this.programmeService.queryInvestment(query, req.abilityCondition, req.user)
    }
}