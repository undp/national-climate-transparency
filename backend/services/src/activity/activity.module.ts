import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '../typeorm.config.service';
import { ActionEntity } from '../entities/action.entity';
import { KpiEntity } from '../entities/kpi.entity';
import { LogEntity } from '../entities/log.entity';
import { ProgrammeEntity } from '../entities/programme.entity';
import { ProjectEntity } from '../entities/project.entity';
import { AchievementEntity } from '../entities/achievement.entity';
import { ActivityEntity } from '../entities/activity.entity';
import { SupportEntity } from '../entities/support.entity';
import { UtilModule } from '../util/util.module';
import { FileHandlerModule } from '../file-handler/filehandler.module';
import { ValidationModule } from '../validation/validation.module';
import { ActionViewEntity } from '../entities/action.view.entity';
import { ActivityService } from './activity.service';
import { ActionModule } from 'src/action/action.module';
import { ProgrammeModule } from 'src/programme/programme.module';
import { ProjectModule } from 'src/project/project.module';
import { ProgrammeViewEntity } from 'src/entities/programme.view.entity';
import { KpiModule } from 'src/kpi/kpi.module';

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
					ActionEntity,
					KpiEntity,
					LogEntity,
					ProgrammeEntity,
					ProjectEntity,
					AchievementEntity,
					ActivityEntity,
					SupportEntity,
					ActionViewEntity,
					ProgrammeViewEntity
			]),
			ActionModule,
			ProgrammeModule,
			ProjectModule,
			UtilModule,
			FileHandlerModule,
			ValidationModule,
			KpiModule
	],
	providers: [
			ActivityService
	],
	exports: [ActivityService],
})
export class ActivityModule { }
