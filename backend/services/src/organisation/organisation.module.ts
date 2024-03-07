import { forwardRef, Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Organisation } from "../entities/organisation.entity";
import { CaslModule } from "../casl/casl.module";
import configuration from "../configuration";
// import { TypeOrmConfigService } from '@undp/carbon-services-lib';
import { OrganisationService } from "./organisation.service";
// import { UtilModule } from '@undp/carbon-services-lib';
// import { ProgrammeLedgerModule } from '@undp/carbon-services-lib';
// import { ProgrammeTransfer } from '@undp/carbon-services-lib';
// import { EmailHelperModule } from '@undp/carbon-services-lib';
// import { FileHandlerModule } from '@undp/carbon-services-lib';
import { UserModule } from "../user/user.module";
// import { AsyncOperationsModule } from '@undp/carbon-services-lib';
// import { FileHandlerModule, LocationModule } from '@undp/carbon-services-lib';
import { TypeOrmConfigService } from "../typeorm.config.service";
import { UtilModule } from "../util/util.module";
import { AsyncOperationsModule } from "../async-operations/async-operations.module";
import { LocationModule } from "../location/location.module";
import { FileHandlerModule } from "../file-handler/filehandler.module";
// import { Investment } from '@undp/carbon-services-lib';

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
    }),
    TypeOrmModule.forFeature([Organisation]),
    CaslModule,
    UtilModule,
    // ProgrammeLedgerModule,
    FileHandlerModule,
    // forwardRef(() => EmailHelperModule),
    forwardRef(() => UserModule),
    AsyncOperationsModule,
    LocationModule
  ],
  providers: [OrganisationService, Logger],
  exports: [OrganisationService],
})
export class OrganisationModule {}
