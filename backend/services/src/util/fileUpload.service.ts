import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { FileHandlerInterface } from "../file-handler/filehandler.interface";
import { HelperService } from "./helpers.service";

@Injectable()
export class FileUploadService {

    constructor(
        private helperService: HelperService,
        private fileHandler: FileHandlerInterface,
    ) { }

    async uploadDocument(data: string, fileName: string) {
        let filetype;
        try {
            filetype = this.getFileExtension(data);
            data = data.split(',')[1];
        } catch (exception: any) {
            throw new HttpException(
                this.helperService.formatReqMessagesString(
                    'action.docUploadFailed',
                    exception.message,
                ),
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        if (filetype == undefined) {
            throw new HttpException(
                this.helperService.formatReqMessagesString(
                    'action.unsupportedFileType',
                    [],
                ),
                HttpStatus.BAD_REQUEST,
            );
        }

        const response: any = await this.fileHandler.uploadFile(
            `documents/action_documents/${fileName}.${filetype}`,
            data,
        );
        if (response) {
            return response;
        } else {
            throw new HttpException(
                this.helperService.formatReqMessagesString(
                    'action.docUploadFailed',
                    [],
                ),
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    getFileExtension = (file: string): string => {
        let fileType = file.split(';')[0].split('/')[1];
        fileType = this.fileExtensionMap.get(fileType);
        return fileType;
    };

    private fileExtensionMap = new Map([
        ['pdf', 'pdf'],
        ['vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx'],
        ['vnd.ms-excel', 'xls'],
        ['vnd.ms-powerpoint', 'ppt'],
        ['vnd.openxmlformats-officedocument.presentationml.presentation', 'pptx'],
        ['msword', 'doc'],
        ['vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx'],
        ['csv', 'csv'],
        ['png', 'png'],
        ['jpeg', 'jpg'],
    ]);
}