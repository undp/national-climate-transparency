import { Test, TestingModule } from '@nestjs/testing';
import { GhgEmissionsService } from './emission.service';
import { Logger } from '@nestjs/common';
import { EmissionEntity } from '../entities/emission.entity';
import { FileHandlerInterface } from '../file-handler/filehandler.interface';
import { HelperService } from '../util/helpers.service';
import { EntityManager, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('GhgEmissionsService', () => {
  let service: GhgEmissionsService;
	let loggerMock: Partial<Logger>;
	let entityManagerMock: Partial<EntityManager>;
	let emissionRepoMock: Partial<Repository<EmissionEntity>>;
	let helperServiceMock: Partial<HelperService>;
	let fileHandlerMock: Partial<FileHandlerInterface>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
				GhgEmissionsService,
				{
          provide: getRepositoryToken(EmissionEntity),
          useValue: emissionRepoMock
        },
        Logger,
        {
          provide: EntityManager,
          useValue: entityManagerMock
        },
				{
          provide: HelperService,
          useValue: helperServiceMock
        },
				{
          provide: FileHandlerInterface,
          useValue: fileHandlerMock
        },
			],
    }).compile();

    service = module.get<GhgEmissionsService>(GhgEmissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});