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
      return this.programmeService.create(programme)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Programme))
    @Post('addNDCAction')
    async addNDCAction(@Body()ndcAction: NDCActionDto, @Request() req) {
      global.baseUrl = `${req.protocol}://${req.get("Host")}`;
      return this.programmeService.addNDCAction(ndcAction)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Programme))
    @Post('addDocument')
    async addDocument(@Body()docDto: ProgrammeDocumentDto, @Request() req) {
      global.baseUrl = `${req.protocol}://${req.get("Host")}`;
      return this.programmeService.addDocument(docDto)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Programme))
    @Post('docAction')
    async docAction(@Body()docAction: DocumentAction) {
      return this.programmeService.docAction(docAction)
    }


    @ApiBearerAuth()
    @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Read, Programme, true))
    // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, User, true))
    @Post('query')
    async getAll(@Body()query: QueryDto, @Request() req) {
      return this.programmeService.query(query, req.abilityCondition)
    }

    @ApiBearerAuth()
    @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Read, Programme, true))
    // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, User, true))
    @Post('queryDocs')
    async queryDocuments(@Body()query: QueryDto, @Request() req) {
      return this.programmeService.queryDocuments(query, req.abilityCondition)
    }

    @ApiBearerAuth()
    @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Read, Programme, true))
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

    // @ApiBearerAuth()
    // @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Update, Programme))
    // @Put('authorize')
    // async programmeApprove(@Body() body: ProgrammeApprove, @Request() req) {
    //     return this.programmeService.approveProgramme(body, req.user)
    // }

    // @ApiBearerAuth()
    // @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Update, Programme))
    // @Put('issue')
    // async programmeIssue(@Body() body: ProgrammeIssue, @Request() req) {
    //     return this.programmeService.issueProgrammeCredit(body, req.user)
    // }


    // @ApiBearerAuth()
    // @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Update, Programme))
    // @Put('reject')
    // async programmeReject(@Body() body: ProgrammeReject, @Request() req) {
    //     return this.programmeService.rejectProgramme(body, req.user)
    // }

    // @ApiBearerAuth()
    // @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Update, ProgrammeCertify))
    // @Put('certify')
    // async programmeCertify(@Body() body: ProgrammeCertify, @Request() req) {
    //     return this.programmeService.certify(body, true, req.user)
    // }

    // @ApiBearerAuth()
    // @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Update, ProgrammeCertify))
    // @Put('revoke')
    // async programmeRevoke(@Body() body: ProgrammeRevoke, @Request() req) {
    //     return this.programmeService.certify(body, false, req.user)
    // }

}