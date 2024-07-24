import { forwardRef, Logger, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CaslModule } from "../casl/casl.module";
import { UtilModule } from "../util/util.module";
import { FileHandlerModule } from "../file-handler/filehandler.module";
import { UserModule } from "../user/user.module";
import { AsyncOperationsModule } from '../async-operations/async-operations.module';
import { GhgProjectionService } from "./projection.service";
import { ProjectionEntity } from "src/entities/projection.entity";

@Module({
  imports: [
  TypeOrmModule.forFeature([ProjectionEntity]),
  CaslModule,
  UtilModule,
  FileHandlerModule,
  forwardRef(() => UserModule),
  AsyncOperationsModule,
],
  providers: [Logger, GhgProjectionService],
  exports: [GhgProjectionService],
})
export class GhgProjectionModule {}