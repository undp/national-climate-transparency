import { forwardRef, Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Organisation } from "../entities/organisation.entity";
import { CaslModule } from "../casl/casl.module";
import configuration from "../configuration";
import { OrganisationService } from "./organisation.service";
import { UserModule } from "../user/user.module";
import { TypeOrmConfigService } from "../typeorm.config.service";
import { UtilModule } from "../util/util.module";
import { AsyncOperationsModule } from "../async-operations/async-operations.module";
import { LocationModule } from "../location/location.module";
import { FileHandlerModule } from "../file-handler/filehandler.module";

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
    FileHandlerModule,
    forwardRef(() => UserModule),
    AsyncOperationsModule,
    LocationModule
  ],
  providers: [OrganisationService, Logger],
  exports: [OrganisationService],
})
export class OrganisationModule {}
