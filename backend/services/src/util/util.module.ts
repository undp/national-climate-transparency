import { forwardRef, Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AcceptLanguageResolver, I18nModule, QueryResolver } from "nestjs-i18n";
import * as path from "path";
import { TypeOrmModule } from "@nestjs/typeorm";
import configuration from "../configuration";
import { Counter } from "../entities/counter.entity";
import { Country } from "../entities/country.entity";
import { TypeOrmConfigService } from "../typeorm.config.service";
import { CounterService } from "./counter.service";
import { CountryService } from "./country.service";
import { HelperService } from "./helpers.service";
import { IsValidCountryConstraint } from "./validcountry.decorator";
import { PasswordReset } from "../entities/userPasswordResetToken.entity";
import { PasswordResetService } from "./passwordReset.service";
import { User } from "../entities/user.entity";
import { AsyncOperationsModule } from "../async-operations/async-operations.module";
import { ConfigurationSettingsService } from "./configurationSettings.service";
import { ConfigurationSettings } from "../entities/configuration.settings";
import { Region } from "../entities/region.entity";
import { PasswordHashService } from "./passwordHash.service";
import { HttpUtilService } from "./http.util.service";
import { Organisation } from "../entities/organisation.entity";
import { FileHandlerModule } from "../file-handler/filehandler.module";
import { FileUploadService } from "./fileUpload.service";
import { LinkUnlinkService } from "./linkUnlink.service";
import { IsTwoDecimalPointsConstraint } from "./twoDecimalPointNumber.decorator";
import { DataExportService } from "./dataExport.service";
import { ActionEntity } from "src/entities/action.entity";
import { ProgrammeEntity } from "src/entities/programme.entity";
import { ProjectEntity } from "src/entities/project.entity";
import { ActivityEntity } from "src/entities/activity.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [`.env.${process.env.NODE_ENV}`, `.env`],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      imports: undefined,
    }),FileHandlerModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '../i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    TypeOrmModule.forFeature([
      Counter,
      Country,
      Organisation,
      PasswordReset,
      User,
      ConfigurationSettings,
      Region,
			ActionEntity,
			ProgrammeEntity,
			ProjectEntity,
			ActivityEntity
    ]),
    forwardRef(() => AsyncOperationsModule),
    FileHandlerModule,
  ],
  providers: [
    CounterService,
    CountryService,
    IsValidCountryConstraint,
    HelperService,
    PasswordResetService,
    Logger,
    ConfigurationSettingsService,
    PasswordHashService,
    HttpUtilService,
    FileUploadService,
		LinkUnlinkService,
		IsTwoDecimalPointsConstraint,
		DataExportService,
  ],
  exports: [
    CounterService,
    CountryService,
    HelperService,
    PasswordResetService,
    ConfigurationSettingsService,
    PasswordHashService,
    HttpUtilService,
    FileUploadService,
		LinkUnlinkService,
		DataExportService,
  ],
})
export class UtilModule {}
