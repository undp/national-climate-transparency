import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Body,
  Query,
  Req,
  HttpException,
  HttpStatus,
  Delete,
  Put,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

// import { DataExportQueryDto } from "@undp/carbon-services-lib";
// import { UserDto } from "@undp/carbon-services-lib";
// import { QueryDto } from "@undp/carbon-services-lib";
// import { PasswordUpdateDto } from "@undp/carbon-services-lib";

// import { HelperService } from '@undp/carbon-services-lib';
import { ApiKeyJwtAuthGuard } from "src/auth/guards/api-jwt-key.guard";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

import { Action } from "src/casl/action.enum";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { CheckPolicies } from "src/casl/policy.decorator";
import { PoliciesGuard, PoliciesGuardEx } from "src/casl/policy.guard";
import { Role } from "src/casl/role.enum";
import { PasswordUpdateDto } from "src/dtos/password.update.dto";
import { QueryDto } from "src/dtos/query.dto";
import { UserDto } from "src/dtos/user.dto";
import { UserUpdateDto } from "src/dtos/user.update.dto";
import { User } from "src/entities/user.entity";
import { UserService } from "src/user/user.service";
import { HelperService } from "src/util/helpers.service";

@ApiTags("User")
@ApiBearerAuth()
@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private caslAbilityFactory: CaslAbilityFactory,
    private helperService: HelperService
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@Request() req) {
    return await this.userService.getUserProfileDetails(req.user.id);
  }

  @ApiBearerAuth('api_key')
  @ApiBearerAuth()
  @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability, body) =>
    ability.can(Action.Create, Object.assign(new User(), body))
  )
  @Post("add")
  addUser(@Body() user: UserDto, @Request() req) {
    if (user.role == Role.Root) {
      throw new HttpException(
        this.helperService.formatReqMessagesString("user.rootCreatesRoot", []),
        HttpStatus.FORBIDDEN
      );
    }
    global.baseUrl = `${req.protocol}://${req.get("Host")}`;
    return this.userService.validateAndCreateUser(
      user,
      req.user.companyId,
      req.user.companyRole
    );
  }

  // @ApiBearerAuth('api_key')
  // @ApiBearerAuth()
  // @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuard)
  // @CheckPolicies((ability, body) =>
  //   ability.can(Action.Create, Object.assign(new User(), body))
  // )
  // @Post("sync")
  // syncUser(@Body() user: UserDto, @Request() req) {
  //   if (user.role == Role.SuperUser) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString("user.rootCreatesRoot", []),
  //       HttpStatus.FORBIDDEN
  //     );
  //   }
  //   global.baseUrl = `${req.protocol}://${req.get("Host")}`;
  //   return this.userService.create(
  //     user,
  //     req.user.companyId,
  //     req.user.companyRole
  //   );
  // }

  // @Post("register")
  // registerUser(@Body() user: UserDto, @Request() req) {
  //   if (user.role == Role.SuperUser) {
  //     throw new HttpException(
  //       this.helperService.formatReqMessagesString("user.rootCreatesRoot", []),
  //       HttpStatus.FORBIDDEN
  //     );
  //   }
  //   global.baseUrl = `${req.protocol}://${req.get("Host")}`;
  //   return this.userService.validateAndCreateUser(
  //     user,
  //     user,
  //     user.,
  //     true
  //   );
  // }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, User))
  // @CheckPolicies((ability, body) => ability.can(Action.Update, Object.assign(new User(), body)))
  @Put("update")
  updateUser(@Body() user: UserUpdateDto, @Request() req) {
    global.baseUrl = `${req.protocol}://${req.get("Host")}`;
    return this.userService.update(user, req.abilityCondition);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, User, true))
  // @CheckPolicies((ability, body) => ability.can(Action.Update, Object.assign(new User(), body)))
  @Put("resetPassword")
  resetPassword(@Body() reset: PasswordUpdateDto, @Request() req) {
    return this.userService.resetPassword(
      req.user.id,
      reset,
      req.abilityCondition
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, User, true))
  // @CheckPolicies((ability, body) => ability.can(Action.Update, Object.assign(new User(), body)))
  @Put("regenerateApiKey")
  resetApiKey(@Query("email") email: string, @Request() req) {
    return this.userService.regenerateApiKey(email, req.abilityCondition);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, User, true))
  @Post("query")
  queryUser(@Body() query: QueryDto, @Request() req) {
    console.log(req.abilityCondition);
    return this.userService.query(query, req.abilityCondition);
  }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, User, true))
  // // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, User, true))
  // @Post('download')
  // async getDownload(@Body()query: DataExportQueryDto, @Request() req) {
  //   return this.userService.download(query, req.abilityCondition); // Return the filePath as a JSON response
  // }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Delete, User))
  // @Delete("delete")
  // deleteUser(@Query("userId") userId: number, @Request() req) {
  //   return this.userService.delete(userId, req.abilityCondition);
  // }

  // @ApiBearerAuth('api_key')
  // @ApiBearerAuth()
  // @UseGuards(ApiKeyJwtAuthGuard, PoliciesGuardEx(true, Action.Read, User))
  // @Post('exists')
  // async checkUserExist(@Body() body: any) {
  //   return this.userService.checkUserExists(body.email);
  // }
}