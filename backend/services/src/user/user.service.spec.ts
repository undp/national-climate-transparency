import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { AsyncOperationsInterface } from '../async-operations/async-operations.interface';
import { User } from '../entities/user.entity';
import { HelperService } from '../util/helpers.service';
import { HttpUtilService } from '../util/http.util.service';
import { PasswordHashService } from '../util/passwordHash.service';
import { Repository, EntityManager } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
	let userRepoMock: Partial<Repository<User>>;
	let configServiceMock:  Partial<ConfigService>;
	let helperServiceMock:  Partial<HelperService>;
	let entityMangerMock:  Partial<EntityManager>;
	let asyncOperationsInterfaceMock:  Partial<AsyncOperationsInterface>;
	let passwordHashServiceMock:  Partial<PasswordHashService>;
	let httpUtilServiceMock:  Partial<HttpUtilService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
				UserService,
				{
          provide: getRepositoryToken(User),
          useValue: userRepoMock
        },
        Logger,
        {
          provide: ConfigService,
          useValue: configServiceMock
        },
        {
          provide: HelperService,
          useValue: helperServiceMock
        },
        {
          provide: EntityManager,
          useValue: entityMangerMock
        },
        {
          provide: AsyncOperationsInterface,
          useValue: asyncOperationsInterfaceMock
        },
        {
          provide: PasswordHashService,
          useValue: passwordHashServiceMock
        },
        {
          provide: HttpUtilService,
          useValue: httpUtilServiceMock
        }
			],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
