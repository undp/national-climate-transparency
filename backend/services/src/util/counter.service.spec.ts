import { Test, TestingModule } from '@nestjs/testing';
import { CounterService } from './counter.service';
import { Counter } from '../entities/counter.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CounterService', () => {
  let service: CounterService;
	let counterRepoMock: Partial<Repository<Counter>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
				CounterService, 
				{
          provide: getRepositoryToken(Counter),
          useValue: counterRepoMock
        },
			],
    }).compile();

    service = module.get<CounterService>(CounterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
