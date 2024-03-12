import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import configuration from "./configuration";
import { DataSource, DataSourceOptions } from "typeorm";

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return this.configService.get<any>("database");
  }
}

const dbConfig = {
  ...configuration().database,
  migrations: [`src/migrations/*.{ts,js}`],
  migrationsRun: true,
};

export default new DataSource(dbConfig as DataSourceOptions);
