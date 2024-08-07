import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserService } from './user.service';
import { CaslModule } from '../casl/casl.module';
import configuration from '../configuration';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConfigService } from '../typeorm.config.service';
import { UtilModule } from '../util/util.module';
import { AsyncOperationsModule } from '../async-operations/async-operations.module';
import { FileHandlerModule } from '../file-handler/filehandler.module';
import { LocationModule } from '../location/location.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [`.env.${process.env.NODE_ENV}`, `.env`]
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      imports: undefined
    }),
    TypeOrmModule.forFeature([User]),
    CaslModule,
    UtilModule,
    FileHandlerModule,
    AsyncOperationsModule,
    LocationModule,
  ],
  providers: [UserService, Logger],
  exports: [UserService]
})
export class UserModule {}
