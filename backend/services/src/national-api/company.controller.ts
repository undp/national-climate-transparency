import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Post,
  Put,
  HttpException,
  HttpStatus,
  Body,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
// import { ApiKeyJwtAuthGuard, DataExportQueryDto, OrganisationDuplicateCheckDto, Investment, InvestmentDto, CheckPolicies} from "@undp/carbon-services-lib";
// import { QueryDto } from "@undp/carbon-services-lib";
// import { OrganisationSuspendDto } from "@undp/carbon-services-lib";
// import { FindOrganisationQueryDto } from "@undp/carbon-services-lib";
// import { HelperService,CountryService } from '@undp/carbon-services-lib';
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Action } from "src/casl/action.enum";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { PoliciesGuardEx } from "src/casl/policy.guard";
import { FindOrganisationQueryDto } from "src/dtos/find.organisation.dto";
import { OrganisationDto } from "src/dtos/organisation.dto";
import { OrganisationUpdateDto } from "src/dtos/organisation.update.dto";
import { QueryDto } from "src/dtos/query.dto";
import { Organisation } from "src/entities/organisation.entity";
import { OrganisationType } from "src/enums/organisation.type.enum";
import { OrganisationService } from "src/organisation/organisation.service";
import { CountryService } from "src/util/country.service";
import { HelperService } from "src/util/helpers.service";

@ApiTags("Organisation")
@ApiBearerAuth()
@Controller("organisation")
export class CompanyController {
  constructor(
    private readonly organisationService: OrganisationService,
    private readonly countryService: CountryService,
    private caslAbilityFactory: CaslAbilityFactory,
    private helperService: HelperService
  ) {}

  @ApiBearerAuth('api_key')
  @ApiBearerAuth()
  // @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuard)
  // @CheckPolicies((ability, body) =>
  //   ability.can(Action.Create, Object.assign(new User(), body))
  // )
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Create, Organisation, true))
  @Post("add")
  addUser(@Body() organisationDto: OrganisationDto, @Request() req) {
    if (organisationDto.organisationType == OrganisationType.GOVERNMENT) {
      throw new HttpException(
        this.helperService.formatReqMessagesString("company.cannotCreateGovernments", []),
        HttpStatus.FORBIDDEN
      );
    }
    global.baseUrl = `${req.protocol}://${req.get("Host")}`;
    return this.organisationService.create(
      organisationDto,
      false
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, Organisation, true))
  @Post("query")
  query(@Body() query: QueryDto, @Request() req) {
    console.log(req.abilityCondition);
    return this.organisationService.query(query, req.abilityCondition, req.user.companyRole);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, Organisation, true))
  @Post("queryNames")
  queryNames(@Body() query: QueryDto, @Request() req) {
    console.log(req.abilityCondition);
    return this.organisationService.queryNames(query, req.abilityCondition);
  }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, Company, true))
  // @Post('download')
  // async getDownload(@Body()query: DataExportQueryDto, @Request() req) {
  //   return this.companyService.download(query, req.abilityCondition, req.user.companyRole); // Return the filePath as a JSON response
  // }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Delete, Company))
  // @Put("suspend")
  // suspend(
  //   @Query("id") companyId: number,
  //   @Body() body: OrganisationSuspendDto,
  //   @Request() req
  // ) {
  //   if (companyId == req.user.companyId) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         "company.cantSuspendUrOwn",
  //         []
  //       ),
  //       HttpStatus.FORBIDDEN
  //     );
  //   }
  //   return this.companyService.suspend(
  //     companyId,
  //     req.user,
  //     body.remarks,
  //     req.abilityCondition
  //   );
  // }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Delete, Company))
  // @Put("activate")
  // revoke(
  //   @Query("id") companyId: number,
  //   @Body() body: OrganisationSuspendDto,
  //   @Request() req
  // ) {
  //   if (companyId == req.user.companyId) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString(
  //         "company.cantActivateUrOwn",
  //         []
  //       ),
  //       HttpStatus.FORBIDDEN
  //     );
  //   }
  //   return this.companyService.activate(
  //     companyId,
  //     req.user,
  //     body.remarks,
  //     req.abilityCondition
  //   );
  // }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Approve, Company))
  // @Put("approve")
  // approve(
  //   @Query("id") companyId: number,
  //   @Body() body: OrganisationSuspendDto,
  //   @Request() req
  // ) {
  //   return this.companyService.approve(
  //     companyId,
  //     req.abilityCondition
  //   );
  // }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Reject, Company))
  // @Put("reject")
  // reject(
  //   @Query("id") companyId: number,
  //   @Body() body: OrganisationSuspendDto,
  //   @Request() req
  // ) {
  //   return this.companyService.reject(
  //     companyId,
  //     req.user,
  //     body.remarks,
  //     req.abilityCondition
  //   );
  // }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, Organisation))
  @Post("findByIds")
  async findByCompanyId(
    @Body() body: FindOrganisationQueryDto,
    @Request() req
  ) {
    return this.organisationService.findByCompanyIds(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getCompany(@Query("id") companyId: number, @Request() req) {
    return await this.organisationService.findByCompanyId(companyId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, Organisation))
  @Put("update")
  async updateCompany(@Body() company: OrganisationUpdateDto, @Request() req) {
    global.baseUrl = `${req.protocol}://${req.get("Host")}`;
    return await this.organisationService.update(company, req.abilityCondition);
  }

  @Post("countries")
  async getCountries(@Body() query: QueryDto, @Request() req) {
    return await this.countryService.getCountryList(query);
  }


  @Post("regions")
  async getRegionList(@Body() query: QueryDto, @Request() req) {
    return await this.countryService.getRegionList(query);
  }


  @Get("countries")
  async getAvailableCountries(@Request() req) {
    return await this.countryService.getAvailableCountries();
  }

  // @ApiBearerAuth()
  // @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Update, Investment))
  // @Post('addInvestment')
  // async addInvestment(@Body() investment: InvestmentDto, @Request() req) {
  //     return this.companyService.addNationalInvestment(investment, req.user);
  // }

  // @ApiBearerAuth()
  // @Get("getMinistries")
  // getMinistryUser(@Request() req) {
  //   return this.companyService.getMinistries();
  // }

  // @ApiBearerAuth('api_key')
  // @ApiBearerAuth()
  // @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Read, Company))
  // @Post('exists')
  // async checkCompanyExist(@Body() organisationDuplicateCheckDto: OrganisationDuplicateCheckDto) {
  //   return this.companyService.findCompanyByTaxIdPaymentIdOrEmail(organisationDuplicateCheckDto);
  // }
}
