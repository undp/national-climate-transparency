import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";
import { CaslModule } from "../casl/casl.module";
import { ApiKeyStrategy } from "./strategies/apikey.strategy";
// import { OrganisationModule } from "../organisation/organisation.module";
import { UserModule } from "../user/user.module";
import { UtilModule } from "../util/util.module";
import { AsyncOperationsModule } from "../async-operations/async-operations.module";
import { PasswordReset } from "../entities/userPasswordResetToken.entity";


@Module({
  imports: [
    UserModule,
    PassportModule,
    UtilModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secretOrPrivateKey: configService.get<string>("jwt.userSecret"),
        signOptions: {
          expiresIn: parseInt(configService.get<string>("jwt.expiresIn")),
        },
      }),
      inject: [ConfigService],
      imports: undefined,
    }),
    CaslModule,
    // OrganisationModule,
    AsyncOperationsModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    ApiKeyStrategy,
    Logger,
    PasswordReset,
  ],
  exports: [AuthService],
})
export class AuthModule {}
