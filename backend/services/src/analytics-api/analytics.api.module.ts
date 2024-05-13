import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import configuration from "../configuration";
import { Organisation } from "../entities/organisation.entity";
import { TypeOrmConfigService } from "../typeorm.config.service";
import { AnalyticsController } from "./analytics.api.controller";
import { AnalyticsService } from "./analytics.api.service";
import { AuthModule } from "../auth/auth.module";
import { CaslModule } from "../casl/casl.module";
import { UtilModule } from "../util/util.module";

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
      Organisation,
    ]),
    AuthModule,
    CaslModule,
    UtilModule,
  ],
  controllers: [AnalyticsController],
  providers: [Logger, AnalyticsService],
})
export class AnalyticsAPIModule {}
