import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NationalAPIController } from './national.api.controller';
import { NationalAPIService } from './national.api.service';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { CompanyController } from './company.controller';
import { UserController } from './user.controller';
import { AuthController } from './auth.controller';
import { SettingsController } from './settings.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { CaslModule } from '../casl/casl.module';
// import { OrganisationModule } from '../organisation/organisation.module';
import { TypeOrmConfigService } from '../typeorm.config.service';
import { UtilModule } from '../util/util.module';
import configuration from '../configuration';
import { ActionController } from './action.controller';
import { ActionModule } from '../action/action.module';
import { ProgrammeModule } from '../programme/programme.module';
import { ProgrammeController } from './programme.controller';
import { ProjectController } from './project.controller';
import { ProjectModule } from '../project/project.module';
import { ActivityModule } from 'src/activity/activity.module';
import { ActivityController } from './activity.controller';
import { LogController } from './log.controller';
import { LogModule } from 'src/log/log.module';
import { SupportController } from './support.controller';
import { SupportModule } from 'src/support/support.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [`.env.${process.env.NODE_ENV}`, `.env`]
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      imports: undefined
    }),
    AuthModule,
    UserModule,
    CaslModule,
    // OrganisationModule,
    UtilModule,
    ActionModule,
    ProgrammeModule, 
		ProjectModule,
		ActivityModule,
    LogModule,
		SupportModule
  ],
  controllers: [ 
    NationalAPIController, 
    UserController, 
    AuthController, 
    // CompanyController, 
    SettingsController, 
    ActionController, 
    ProgrammeController,
		ProjectController, 
		ActivityController,
    LogController,
		SupportController
  ],
  providers: [
    NationalAPIService, 
    Logger
  ],
})
export class NationalAPIModule {}
