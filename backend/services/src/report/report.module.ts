import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '../typeorm.config.service';
import { ReportFiveViewEntity } from 'src/entities/report.five.view.entity';
import { ReportService } from './report.service';
import { UtilModule } from 'src/util/util.module';

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
			ReportFiveViewEntity
		]),
		UtilModule
	],
	providers: [
		ReportService
	],
	exports: [ReportService],
})
export class ReportModule { }
