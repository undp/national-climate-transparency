import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '../typeorm.config.service';
import { User } from '../entities/user.entity';
import { LogEntity } from '../entities/log.entity';

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
            User,
            LogEntity,
        ]),
    ],
    providers: [
        LogService
    ],
    exports: [LogService],
})
export class LogModule { }
