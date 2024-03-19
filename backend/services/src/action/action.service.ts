import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { plainToClass } from "class-transformer";
import { ActionDto } from "../dtos/action.dto";
import { DataResponseMessageDto } from "../dtos/data.response.message";
import { DocumentEntityDto } from "../dtos/document.entity.dto";
import { ActionEntity } from "../entities/action.entity";
import { KpiEntity } from "../entities/kpi.entity";
import { LogEntity } from "../entities/log.entity";
import { User } from "../entities/user.entity";
import { CounterType } from "../enums/counter.type.enum";
import { EntityType, LogEventType } from "../enums/shared.enum";
import { FileHandlerInterface } from "../file-handler/filehandler.interface";
import { CounterService } from "../util/counter.service";
import { HelperService } from "../util/helpers.service";
import { EntityManager } from "typeorm";
import { KpiDto } from "src/dtos/kpi.dto";

@Injectable()
export class ActionService {
  constructor(
    @InjectEntityManager() private entityManger: EntityManager,
    private counterService: CounterService,
    private helperService: HelperService,
    private fileHandler: FileHandlerInterface,

  ) { }

  async createAction(actionDto: ActionDto, user: User) {

    const action: ActionEntity = plainToClass(ActionEntity, actionDto);
    const eventLog = [];
    if (!actionDto.actionId) {
      action.actionId = 'A' + await this.counterService.incrementCount(CounterType.ACTION, 3);
    }

    // upload the documents and create the doc array here
    if (actionDto.documents) {
      const documents = [];
      for (const documentItem of actionDto.documents) {
        const response = await this.uploadDocument(documentItem.data, documentItem.title);
        const docEntity = new DocumentEntityDto();
        docEntity.title = documentItem.title;
        docEntity.url = response;
        docEntity.createdTime = new Date().getTime();
        documents.push(docEntity)
      };
      action.documents = documents;

    }
    this.addEventLogEntry(eventLog, LogEventType.ACTION_CREATED, EntityType.ACTION, action.actionId, user.id, actionDto);

    const kpiList = [];
    if (actionDto.kpis) {
      for (const kpiItem of actionDto.kpis) {
        this.validateKpiPayload(kpiItem);
        const kpi: KpiEntity = plainToClass(KpiEntity, kpiItem);
        kpi.kpiId = parseInt(await this.counterService.incrementCount(CounterType.KPI, 3));
        kpi.creatorId = action.actionId;
        kpiList.push(kpi);
      }
      // Add event log entry after the loop completes
      this.addEventLogEntry(eventLog, LogEventType.KPI_ADDED, EntityType.ACTION, action.actionId, user.id, kpiList);
    }

    const act = await this.entityManger
      .transaction(async (em) => {
        const savedAction = await em.save<ActionEntity>(action);
        if (savedAction) {
          // link programmes here
          if (actionDto.kpis) {
            kpiList.forEach(async kpi => {
              await em.save<KpiEntity>(kpi)
            });
          }

          //add log here
          eventLog.forEach(async event => {
            await em.save<LogEntity>(event);
          });
        }
        return savedAction;
      })
      .catch((err: any) => {
        console.log(err);
        throw new HttpException(
          this.helperService.formatReqMessagesString(
            "action.actionCreationFailed",
            [err]
          ),
          HttpStatus.BAD_REQUEST
        );
      });

    return new DataResponseMessageDto(
      HttpStatus.CREATED,
      this.helperService.formatReqMessagesString("action.createActionSuccess", []),
      act
    );

  }

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

  private validateKpiPayload = (kpi: KpiDto) => {
    let msg;
    if (!kpi.creatorType) msg = "action.creatorTypeCannotBeNull";
    else if (!kpi.expected) msg = "action.expectedCannotBeNull";
    else if (!kpi.name) msg = "action.kpiNameCannotBeNull";

    if (msg) {
      throw new HttpException(
        this.helperService.formatReqMessagesString(
          msg,
          [],
        ),
        HttpStatus.BAD_REQUEST,
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

  private addEventLogEntry = (
    eventLog: any[],
    eventType: LogEventType,
    recordType: EntityType,
    recordId: any,
    userId: number,
    data: any) => {
    const log = new LogEntity();
    log.eventType = eventType;
    log.recordType = recordType;
    log.recordId = recordId;
    log.userId = userId;
    log.logData = data;

    eventLog.push(log);
    return eventLog;
  }
}