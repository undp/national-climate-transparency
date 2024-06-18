import {
  Controller,
  Post,
  Request,
  Body,
  Put,
  Query,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { AuthService } from "src/auth/auth.service";
import { ForgotPasswordDto } from "src/dtos/forgotPassword.dto";
import { LoginDto } from "src/dtos/login.dto";
import { PasswordResetDto } from "src/dtos/passwordReset.dto";
import { User } from "src/entities/user.entity";
import { HelperService } from "src/util/helpers.service";
import { PasswordResetService } from "src/util/passwordReset.service";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
    private helperService: HelperService,
  ) {}

  @Post("login")
  async login(@Body() login: LoginDto, @Request() req) {
    const validationResponse: {user: Omit<User, 'password'> | null; message: string} = 
    await this.authService.validateUser(
      login.username,
      login.password
    );

    if (validationResponse.user != null) {
      global.baseUrl = `${req.protocol}://${req.get("Host")}`;
      return this.authService.login(validationResponse.user);
    }
    throw new HttpException(this.helperService.formatReqMessagesString(
      `common.${validationResponse.message}`,
      []
    ), HttpStatus.UNAUTHORIZED);
  }

  @Post("forgotPassword")
  async forgotPassword(
    @Body() forgotPassword: ForgotPasswordDto,
    @Request() req
  ) {
    const email = forgotPassword.email;
    if (email !== null) {
      return this.authService.forgotPassword(email);
    }
  }

  @Put("resetPassword")
  async resetPassword(
    @Query("requestId") reqId: string,
    @Body() reset: PasswordResetDto,
    @Request() req
  ) {
    return this.passwordResetService.resetPassword(
      reqId,
      reset,
      req.abilityCondition
    );
  }

  @Put("checkResetRequestId")
  async checkResetRequestId(@Query("requestId") reqId: string, @Request() req) {
    return this.passwordResetService.checkPasswordResetRequestId(
      reqId,
      req.abilityCondition
    );
  }
}
