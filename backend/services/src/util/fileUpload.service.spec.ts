import { HttpException, HttpStatus } from '@nestjs/common';
import { HelperService } from './helpers.service';
import { FileUploadService } from './fileUpload.service';
import { EntityType } from '../enums/shared.enum';

describe('FileUploadService', () => {
	let fileUploadService: FileUploadService;
	let helperServiceMock: Partial<HelperService>;
	let fileHandlerMock: any;

	beforeEach(() => {
		helperServiceMock = {
			formatReqMessagesString: jest.fn(),
		};

		fileHandlerMock = {
			uploadFile: jest.fn(),
			getFileExtension: jest.fn(),
		};

		fileUploadService = new FileUploadService(
			helperServiceMock as HelperService,
			fileHandlerMock,
		);
	});

	describe('uploadDocument', () => {
		it('should upload document successfully', async () => {
			const data = "data:text/csv;base64,IlJlcXVlc3QgSWQiLCJQcm=";
			const fileData = "IlJlcXVlc3QgSWQiLCJQcm=";
			const fileName = 'test';
			const filetype = 'csv';

			const expectedResponse = 'http://example.com/test.pdf';

			fileHandlerMock.uploadFile.mockResolvedValue(expectedResponse);

			const response = await fileUploadService.uploadDocument(data, fileName, EntityType.ACTION);

			expect(response).toEqual(expectedResponse);
			expect(fileHandlerMock.uploadFile).toHaveBeenCalledWith(
				expect.stringMatching(new RegExp(`documents/action_documents/${fileName}_[0-9]+\.${filetype}`)),
				fileData,
			);
		});

		it('should throw an internal server error if unable to extract file extension', async () => {
			const data = 'fileContent';
			const fileName = 'test';

			const errorMessage = 'Error extracting file extension';
			jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockResolvedValueOnce(errorMessage);

			fileHandlerMock.uploadFile.mockResolvedValue(undefined);

			try {
				await fileUploadService.uploadDocument(data, fileName, EntityType.ACTION);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.BAD_REQUEST);
			}

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith(
				'action.unsupportedFileType',
				[],
			);
		});

		it('should throw a bad request error if unsupported file type', async () => {
			const data = 'fileContent';
			const fileName = 'test';
			const fileType = 'unsupported';

			const errorMessage = 'Unsupported file type';
			jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockResolvedValueOnce(errorMessage);

			fileHandlerMock.uploadFile.mockResolvedValue(undefined);

			try {
				await fileUploadService.uploadDocument(data, fileName, EntityType.ACTION);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.BAD_REQUEST);
			}

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith(
				'action.unsupportedFileType',
				[],
			);
		});

		it('should throw an internal server error if file upload fails', async () => {
			const data = "data:text/csv;base64,IlJlcXVlc3QgSWQiLCJQcm="
			const fileName = 'test';
			const filetype = 'csv';

			const errorMessage = 'File upload failed';
			jest.spyOn(helperServiceMock, 'formatReqMessagesString').mockResolvedValueOnce(errorMessage);

			// fileHandlerMock.uploadFile.mockRejectedValue(new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR));
			fileHandlerMock.uploadFile.mockResolvedValueOnce(null);

			//   fileUploadService.uploadDocument(data, fileName).rejects.toThrow(
			//     new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR),
			//   );

			try {
				await fileUploadService.uploadDocument(data, fileName, EntityType.ACTION);
			} catch (error) {
				expect(error).toBeInstanceOf(HttpException);
				expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
			}

			expect(helperServiceMock.formatReqMessagesString).toHaveBeenCalledWith(
				'action.docUploadFailed',
				[],
			);
		});
	});
});
