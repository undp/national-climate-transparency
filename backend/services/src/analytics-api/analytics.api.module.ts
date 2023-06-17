import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ProgrammeController } from "./programme.controller";
import configuration from "../shared/configuration";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfigService } from "../shared/typeorm.config.service";
import { Programme } from "../shared/entities/programme.entity";
import { ProgrammeTransfer } from "../shared/entities/programme.transfer";
import { CaslModule } from "../shared/casl/casl.module";
import { AuthModule } from "../shared/auth/auth.module";
import { UtilModule } from "../shared/util/util.module";
import { AggregateAPIService } from "./aggregate.api.service";
import { Company } from "../shared/entities/company.entity";
import { NDCActionViewEntity } from "../shared/entities/ndc.view.entity";

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
    TypeOrmModule.forFeature([
      Programme,
      ProgrammeTransfer,
      Company,
      NDCActionViewEntity
    ]),
    AuthModule,
    CaslModule,
    UtilModule
  ],
  controllers: [ProgrammeController],
  providers: [Logger, AggregateAPIService],
})
export class AnalyticsAPIModule {}
