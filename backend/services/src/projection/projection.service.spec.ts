import { Test, TestingModule } from '@nestjs/testing';
import { GhgProjectionService } from './projection.service';

describe('GhgEmissionsService', () => {
  let service: GhgProjectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GhgProjectionService],
    }).compile();

    service = module.get<GhgProjectionService>(GhgProjectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});