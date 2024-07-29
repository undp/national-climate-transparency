import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { AsyncOperationsInterface } from '../async-operations/async-operations.interface';
import { User } from '../entities/user.entity';
import { HelperService } from '../util/helpers.service';
import { HttpUtilService } from '../util/http.util.service';
import { PasswordHashService } from '../util/passwordHash.service';
import { Repository, EntityManager, SelectQueryBuilder, UpdateResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, Logger } from '@nestjs/common';
import { UserDto } from '../dtos/user.dto';
import { Role, SubRole } from '../casl/role.enum';
import { SubRoleManipulate, ValidateEntity } from '../enums/user.enum';
import { UserUpdateDto } from '../dtos/user.update.dto';
import { Sector } from 'src/enums/sector.enum';

describe('UserService', () => {
  let service: UserService;
	let userRepoMock: Partial<Repository<User>>;
	let loggerMock: Partial<Logger>;
	let configServiceMock:  Partial<ConfigService>;
	let helperServiceMock:  Partial<HelperService>;
	let entityManagerMock:  Partial<EntityManager>;
	let asyncOperationsInterfaceMock:  Partial<AsyncOperationsInterface>;
	let passwordHashServiceMock:  Partial<PasswordHashService>;
	let httpUtilServiceMock:  Partial<HttpUtilService>;

  beforeEach(async () => {
		entityManagerMock = {
			transaction: jest.fn(),
			save: jest.fn(),
			query: jest.fn(),
		};

		userRepoMock = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
			createQueryBuilder: jest.fn(() => ({
				update: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				set: jest.fn().mockReturnThis(),
				addSelect: jest.fn().mockReturnThis(),
				getOne: jest.fn().mockResolvedValue({
					id: 1,
					password: 'hashed_oldPassword',  // Mocked password or other user details
			}),
				execute: jest.fn().mockResolvedValue({ affected: 1 })
		})) as unknown as () => SelectQueryBuilder<User>,
    };
    helperServiceMock = {
      formatReqMessagesString: jest.fn(),
      generateRandomPassword: jest.fn().mockReturnValue('RandomPassword123'),
			getEmailTemplateMessage: jest.fn(),
    };
    passwordHashServiceMock = {
      getPasswordHash: jest.fn().mockReturnValue('hashedPassword'),
    };

		asyncOperationsInterfaceMock = {
			AddAction: jest.fn(),
		}
    configServiceMock = {
      get: jest.fn((key) => {
        switch (key) {
          case 'systemCountry':
            return 'US';
          default:
            return null;
        }
      }),
    };
    loggerMock = {
      verbose: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
				UserService,
				{
          provide: getRepositoryToken(User),
          useValue: userRepoMock
        },
				{
          provide: Logger,
          useValue: loggerMock
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
          provide: EntityManager,
          useValue: entityManagerMock
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

	describe('Create User', () => {
		it('should successfully create a user and return the expected data response', async () => {
			const userDto = new UserDto();
			userDto.email = 'test@example.com';
			userDto.role = Role.Observer;
		
			const savedUser = {
				id: 1,
				email: 'test@example.com',
				role: Role.Observer,
				...userDto,
			};
		
			jest.spyOn(service, "findOne").mockResolvedValue(null);
			jest.spyOn(service, "validateAndCreateUser").mockResolvedValue(null);
			jest.spyOn(helperServiceMock, "getEmailTemplateMessage").mockReturnValue("Email message");
			jest.spyOn(asyncOperationsInterfaceMock, "AddAction").mockResolvedValue(null);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValueOnce(savedUser),
				};
				const savedProject = await callback(emMock);
				expect(emMock.save).toHaveBeenCalledTimes(1);
				return savedProject;
			});
		
			await service.create(userDto);
			expect(entityManagerMock.transaction).toHaveBeenCalled();
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith("user.createUserSuccess", []);
		});

		it('should throw an HttpException if the email already exists', async () => {
			const userDto = new UserDto();
			userDto.email = 'existing@example.com';
			userDto.role = Role.Observer;
		
			jest.spyOn(service, 'findOne').mockResolvedValue(new User());
		
			await expect(service.create(userDto)).rejects.toThrow(HttpException);
			expect(service.findOne).toHaveBeenCalledWith('existing@example.com');
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('user.createExistingUser', []);
		});

		it('should throw an HttpException if an Observer role tries to have permissions', async () => {
			const userDto = new UserDto();
			userDto.email = 'observer@example.com';
			userDto.role = Role.Observer;
			userDto.validatePermission = ValidateEntity.CAN; 
		
			jest.spyOn(service, 'findOne').mockResolvedValue(null); 
		
			await expect(service.create(userDto)).rejects.toThrow(HttpException);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('user.observerCannotHaveAnyPermissions', []);
		});

		it('should handle database transaction errors during user creation', async () => {
			const userDto = new UserDto();
			userDto.email = 'newuser@example.com';
			userDto.role = Role.Observer;
		
			jest.spyOn(service, 'findOne').mockResolvedValue(null);
			jest.spyOn(entityManagerMock, 'transaction').mockImplementation(() => Promise.reject(new Error('Transaction failed')));
		
			await expect(service.create(userDto)).rejects.toThrow(HttpException);
			expect(entityManagerMock.transaction).toHaveBeenCalled();
			expect(loggerMock.error).toHaveBeenCalledWith(expect.anything());
		});
	})

	describe('Update User', () => {
		it('should successfully update user details', async () => {
			const userUpdateDto = new UserUpdateDto();
			userUpdateDto.id = 1;
			userUpdateDto.email = 'test@example.com';
		
			const existingUser = new User();
			existingUser.id = 1;
			existingUser.email = 'test@example.com';
		
			jest.spyOn(userRepoMock, 'findOneBy').mockResolvedValue(existingUser);
			jest.spyOn(loggerMock, 'verbose').mockReturnValue(null);
			jest.spyOn(userRepoMock, 'update').mockResolvedValue(new UpdateResult);
		
			await service.update(userUpdateDto, '', new User());
		
			expect(userRepoMock.findOneBy).toHaveBeenCalledWith({ id: userUpdateDto.id });
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('user.editUserSuccess', []);
		});

		it('should throw an HttpException when trying to update a non-existent user', async () => {
			const userUpdateDto = new UserUpdateDto();
			userUpdateDto.id = 999;
		
			jest.spyOn(userRepoMock, 'findOneBy').mockResolvedValue(null);
		
			await expect(service.update(userUpdateDto, '', new User())).rejects.toThrow(HttpException);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('user.noUserFound', []);
		});

		it('should prevent non-root users from changing user role', async () => {
			const userUpdateDto = new UserUpdateDto();
			userUpdateDto.id = 1;
			userUpdateDto.role = Role.GovernmentUser;
		
			const existingUser = new User();
			existingUser.id = 1;
			existingUser.role = Role.Observer;
		
			const requestingUser = new User();
			requestingUser.role = Role.Observer;
		
			jest.spyOn(userRepoMock, 'findOneBy').mockResolvedValue(existingUser);
		
			await expect(service.update(userUpdateDto, '', requestingUser)).rejects.toThrow(HttpException);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('user.onlyRootCanChangeRole', []);
		});

		it('should prevent non-root users from changing user role', async () => {
			const userUpdateDto = new UserUpdateDto();
			userUpdateDto.id = 1;
			userUpdateDto.role = Role.GovernmentUser;
		
			const existingUser = new User();
			existingUser.id = 1;
			existingUser.role = Role.Observer;
		
			const requestingUser = new User();
			requestingUser.role = Role.Observer;
		
			jest.spyOn(userRepoMock, 'findOneBy').mockResolvedValue(existingUser);
		
			await expect(service.update(userUpdateDto, '', requestingUser)).rejects.toThrow(HttpException);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('user.onlyRootCanChangeRole', []);
		});

		it('should throw an HttpException if trying to set any permissions to CANNOT for Root role', async () => {
			const userUpdateDto = new UserUpdateDto();
			userUpdateDto.id = 1;
			userUpdateDto.role = Role.Root;
			userUpdateDto.validatePermission = ValidateEntity.CANNOT;
	
			const existingUser = new User();
			existingUser.id = 1;
			existingUser.role = Role.Root;
	
			jest.spyOn(userRepoMock, 'findOneBy').mockResolvedValue(existingUser);
	
			await expect(service.update(userUpdateDto, '', existingUser)).rejects.toThrow(HttpException);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('user.allRootPermissionShouldBeTrue', []);
		});

		it('should throw an HttpException if trying to grant sub-role permissions to an Admin', async () => {
			const userUpdateDto = new UserUpdateDto();
			userUpdateDto.id = 1;
			userUpdateDto.role = Role.Admin;
			userUpdateDto.subRolePermission = SubRoleManipulate.CAN;
	
			const existingUser = new User();
			existingUser.id = 1;
			existingUser.role = Role.Admin;
	
			jest.spyOn(userRepoMock, 'findOneBy').mockResolvedValue(existingUser);
	
			await expect(service.update(userUpdateDto, '', existingUser)).rejects.toThrow(HttpException);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('user.adminCannotHaveSubrolePermission', []);
		});

		it('should throw an HttpException if trying to set any permissions to CAN for an Observer', async () => {
			const userUpdateDto = new UserUpdateDto();
			userUpdateDto.id = 1;
			userUpdateDto.role = Role.Observer;
			userUpdateDto.validatePermission = ValidateEntity.CAN;
	
			const existingUser = new User();
			existingUser.id = 1;
			existingUser.role = Role.Observer;
	
			jest.spyOn(userRepoMock, 'findOneBy').mockResolvedValue(existingUser);
	
			await expect(service.update(userUpdateDto, '', existingUser)).rejects.toThrow(HttpException);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('user.observerCannotHaveAnyPermissions', []);
		});

		it('should throw HttpException when a Government User or Observer tries to change their sub-role without permission', async () => {
			const userUpdateDto = new UserUpdateDto;
			userUpdateDto.id = 1;
			userUpdateDto.role = Role.Observer,
			userUpdateDto.subRole = SubRole.Consultant;

			const existingUser = new User();
			existingUser.id = 1;
			existingUser.role = Role.Observer;

			const requestingUser = new User;
			requestingUser.id = 1;
			requestingUser.role = Role.Observer,
			requestingUser.subRole = SubRole.DevelopmentPartner;
			requestingUser.subRolePermission = SubRoleManipulate.CANNOT;
		
			jest.spyOn(userRepoMock, 'findOneBy').mockResolvedValue(existingUser);

			await expect(service.update(userUpdateDto, '', requestingUser)).rejects.toThrow(HttpException);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('user.subRolePermissionDenied', []);
		});

		it('should throw HttpException when an Admin tries to update their own permissions', async () => {
			const userUpdateDto = new UserUpdateDto;
			userUpdateDto.id = 1;
			userUpdateDto.role = Role.Admin;

			const existingUser = new User();
			existingUser.id = 1;
			existingUser.role = Role.Admin;

			const requestingUser = new User;
			requestingUser.id = 1;
			requestingUser.role = Role.Admin,
			requestingUser.validatePermission = ValidateEntity.CANNOT;

			jest.spyOn(userRepoMock, 'findOneBy').mockResolvedValue(existingUser);
		
			await expect(service.update(userUpdateDto, '', requestingUser)).rejects.toThrow(HttpException);
			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith('user.adminCannotUpdateTheirOwnPermissions', []);
		});


	})
});
