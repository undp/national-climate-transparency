import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AsyncOperationsInterface } from '../async-operations/async-operations.interface';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { HelperService } from '../util/helpers.service';
import { PasswordHashService } from '../util/passwordHash.service';
import { PasswordResetService } from '../util/passwordReset.service';

describe('AuthService', () => {
  let service: AuthService;
	let userServiceMock: Partial<UserService>;
	let jwtServiceMock: Partial<JwtService>;
	let configServiceMock: Partial<ConfigService>;
	let helperServiceMock: Partial<HelperService>;
	let passwordResetMock: Partial<PasswordResetService>;
	let caslAbilityFactoryMock: Partial<CaslAbilityFactory>;
	let asyncOperationsInterfaceMock: Partial<AsyncOperationsInterface>;
	let passwordHashServiceMock: Partial<PasswordHashService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, 
				{
					provide: UserService,
					useValue: userServiceMock
				},
				{
					provide: JwtService,
					useValue: jwtServiceMock
				},
				{
					provide: ConfigService,
					useValue: configServiceMock
				},
				{
					provide: HelperService,
					useValue: helperServiceMock
				},
				{
					provide: PasswordResetService,
					useValue: passwordResetMock
				},
				{
					provide: CaslAbilityFactory,
					useValue: caslAbilityFactoryMock
				},
				{
					provide: AsyncOperationsInterface,
					useValue: asyncOperationsInterfaceMock // Use the mock created
				},
				{
					provide: PasswordHashService,
					useValue: passwordHashServiceMock
				},
			],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
