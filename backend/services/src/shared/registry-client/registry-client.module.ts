import { Logger, Module } from '@nestjs/common';
import { RegistryClientService } from './registry-client.service';

@Module({
  providers: [RegistryClientService, Logger,],
  exports: [RegistryClientService]
})
export class RegistryClientModule {}
