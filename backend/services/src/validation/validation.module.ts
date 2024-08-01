import { Module } from '@nestjs/common';
import { TrimPipe } from './trim-pipe.transform';
import { PayloadValidator } from './payload.validator';
import { UtilModule } from '../util/util.module';

@Module({
  imports: [
    UtilModule,
  ],
  providers: [
    TrimPipe,
    PayloadValidator
  ],
  exports: [
    TrimPipe,
    PayloadValidator
  ]
})
export class ValidationModule {}
