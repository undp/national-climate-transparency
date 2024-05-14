import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '../typeorm.config.service';
import { KpiEntity } from '../entities/kpi.entity';
import { KpiService } from './kpi.service';
import { ActivityEntity } from '../entities/activity.entity';
import { UtilModule } from '../util/util.module';
import { AchievementEntity } from '../entities/achievement.entity';
import { ActionEntity } from '../entities/action.entity';
import { ProgrammeEntity } from '../entities/programme.entity';
import { ProjectEntity } from '../entities/project.entity';

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
			KpiEntity,
			ActivityEntity, 
			AchievementEntity,
			ActionEntity, 
			ProgrammeEntity,
			ProjectEntity
		]),
		UtilModule
	],
	providers: [
		KpiService
	],
	exports: [KpiService],
})
export class KpiModule { }