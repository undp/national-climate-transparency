import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '../typeorm.config.service';
import { LogEntity } from '../entities/log.entity';
import { ActivityEntity } from '../entities/activity.entity';
import { SupportEntity } from '../entities/support.entity';
import { UtilModule } from '../util/util.module';
import { SupportService } from './support.service';
import { ActivityModule } from 'src/activity/activity.module';

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
			LogEntity,
			ActivityEntity,
			SupportEntity,
		]),
		UtilModule,
		ActivityModule
	],
	providers: [
		SupportService
	],
	exports: [SupportService],
})
export class SupportModule { }
