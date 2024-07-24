import { Test, TestingModule } from "@nestjs/testing";
import { EmailService } from "./email.service";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";

describe("EmailService", () => {
	let service: EmailService;
	let configServiceMock: Partial<ConfigService>;

	beforeEach(async () => {
		configServiceMock = {
			get: jest.fn()
		};
		const module: TestingModule = await Test.createTestingModule({
			providers: [EmailService, Logger,
				{
					provide: ConfigService,
					useValue: configServiceMock
				},
			],
		}).compile();

		service = module.get<EmailService>(EmailService);
	});

	it("should be defined", () => {
		jest.spyOn(configServiceMock, "get").mockReturnValueOnce('test.email.xeptagon.com')
		jest.spyOn(configServiceMock, "get").mockReturnValueOnce(false)
		expect(service).toBeDefined();
	});
});
