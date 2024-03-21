import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
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
import { CounterService } from "../util/counter.service";
import { HelperService } from "../util/helpers.service";
import { EntityManager, Repository } from "typeorm";
import { FileUploadService } from "../util/fileUpload.service";
import { PayloadValidator } from "../validation/payload.validator";

@Injectable()
export class ActionService {
  constructor(
    @InjectEntityManager() private entityManger: EntityManager,
    @InjectRepository(ActionEntity) private actionRepo: Repository<ActionEntity>,
    private counterService: CounterService,
    private helperService: HelperService,
    private fileUploadService: FileUploadService,
    private payloadValidator: PayloadValidator
  ) { }

  async createAction(actionDto: ActionDto, user: User) {

    const action: ActionEntity = plainToClass(ActionEntity, actionDto);
    const eventLog = [];

    action.actionId = 'A' + await this.counterService.incrementCount(CounterType.ACTION, 3);

    // upload the documents and create the doc array here
    if (actionDto.documents) {
      const documents = [];
      for (const documentItem of actionDto.documents) {
        const response = await this.fileUploadService.uploadDocument(documentItem.data, documentItem.title);
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
        this.payloadValidator.validateKpiPayload(kpiItem, EntityType.ACTION);
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

  async findActionById(actionId: string) {
    return await this.actionRepo.findOneBy({
      actionId
    })
  }

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