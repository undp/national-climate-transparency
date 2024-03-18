import { Module } from '@nestjs/common';
import { ActionService } from './action.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '../typeorm.config.service';
import { ActionEntity } from '../entities/action.entity';
import { KpiEntity } from '../entities/kpi.entity';
import { LogEntity } from '../entities/log.entity';
import { ProgrammeEntity } from '../entities/programme.entity';
import { ProjectEntity } from 'src/entities/project.entity';
import { AchievementEntity } from 'src/entities/achievement.entity';
import { ActivityEntity } from 'src/entities/activity.entity';
import { SupportEntity } from 'src/entities/support.entity';
import { UtilModule } from 'src/util/util.module';
import { FileHandlerModule } from 'src/file-handler/filehandler.module';

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
            SupportEntity
        ]),
        UtilModule,
        FileHandlerModule,
    ],
    providers: [
        ActionService
    ],
    exports: [ActionService],
})
export class ActionModule { }
