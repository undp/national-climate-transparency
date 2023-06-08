import { Module } from '@nestjs/common';
import { RegistryClientService } from './registry-client.service';

@Module({
  providers: [RegistryClientService],
  exports: [RegistryClientService]
})
export class RegistryClientModule {}
