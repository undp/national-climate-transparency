import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '../typeorm.config.service';
import { ReportFiveViewEntity } from '../entities/report.five.view.entity';
import { ReportService } from './report.service';
import { UtilModule } from '../util/util.module';
import { ReportTwelveViewEntity } from '../entities/report.twelve.view.entity';
import { ReportThirteenViewEntity } from 'src/entities/report.thirteen.view.entity';
import { ReportSixViewEntity } from 'src/entities/report.six.view.entity';
import { ReportSevenViewEntity } from 'src/entities/report.seven.view.entity';
import { ReportEightViewEntity } from 'src/entities/report.eight.view.entity';
import { ReportNineViewEntity } from 'src/entities/report.nine.view.entity';

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
			ReportFiveViewEntity,
			ReportTwelveViewEntity,
			ReportThirteenViewEntity,
			ReportSixViewEntity,
			ReportSevenViewEntity,
			ReportEightViewEntity,
			ReportNineViewEntity,
		]),
		UtilModule
	],
	providers: [
		ReportService
	],
	exports: [ReportService],
})
export class ReportModule { }
