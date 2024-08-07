import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '../typeorm.config.service';
import { UtilModule } from '../util/util.module';
import { SystemResourcesService } from './system.resources.service';
import { SystemResourcesEntity } from '../entities/systemResource.entity';

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
			SystemResourcesEntity
		]),
		UtilModule
	],
	providers: [
		SystemResourcesService
	],
	exports: [SystemResourcesService],
})
export class SystemResourceModule { }
