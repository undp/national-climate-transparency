import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NationalAPIController } from './national.api.controller';
import { NationalAPIService } from './national.api.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyController } from './company.controller';
import { UserController } from './user.controller';
import { AuthController } from './auth.controller';
import { ProgrammeController } from './programme.controller';
import { SettingsController } from './settings.controller';
import {ProgrammeModule,TypeOrmConfigService,configuration, AuthModule ,CompanyModule,UserModule,UtilModule,CaslModule} from "@undp/carbon-services-lib";


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration.default],
      envFilePath: [`.env.${process.env.NODE_ENV}`, `.env`]
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      imports: undefined
    }),
    AuthModule,
    UserModule,
    CaslModule,
    ProgrammeModule,
    CompanyModule,
    UtilModule
  ],
  controllers: [ NationalAPIController, UserController, AuthController, CompanyController, ProgrammeController, SettingsController ],
  providers: [
    NationalAPIService, 
    Logger
  ],
})
export class NationalAPIModule {}
