import { Module, forwardRef } from '@nestjs/common';
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
import { ProgrammeService } from './programme.service';
import { ValidationModule } from '../validation/validation.module';
import { ActionModule } from '../action/action.module';
// import { OrganisationModule } from 'src/organisation/organisation.module';

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
        forwardRef(() => ActionModule),
        FileHandlerModule,
        ValidationModule,
        // OrganisationModule
    ],
    providers: [
        ProgrammeService
    ],
    exports: [ProgrammeService],
})
export class ProgrammeModule { }
