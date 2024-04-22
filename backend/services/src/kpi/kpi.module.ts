import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '../typeorm.config.service';
import { KpiEntity } from '../entities/kpi.entity';
import { KpiService } from './kpi.service';
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
			KpiEntity
		]),
		// OrganisationModule
	],
	providers: [
		KpiService
	],
	exports: [KpiService],
})
export class KpiModule { }