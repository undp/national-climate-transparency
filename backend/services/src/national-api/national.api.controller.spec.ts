import { Test, TestingModule } from '@nestjs/testing';
import { NationalAPIController } from './national.api.controller';
import { NationalAPIService } from './national.api.service';
import { Logger } from '@nestjs/common';

describe('NationalAPIController', () => {
	let appController: NationalAPIController;
	let appServiceMock: Partial<NationalAPIService>;

	beforeEach(async () => {
		appServiceMock = {
			getHello: jest.fn(),
		};

		const app: TestingModule = await Test.createTestingModule({
			controllers: [NationalAPIController],
			providers: [
				{
					provide: NationalAPIService,
					useValue: appServiceMock
				},
				Logger],
		}).compile();

		appController = app.get<NationalAPIController>(NationalAPIController);
	});

	describe('root', () => {
		it('should return "Hello World!"', () => {
			jest.spyOn(appServiceMock, "getHello").mockReturnValue("Hello World!")
			expect(appController.getHello()).toBe('Hello World!');
		});
	});
});
