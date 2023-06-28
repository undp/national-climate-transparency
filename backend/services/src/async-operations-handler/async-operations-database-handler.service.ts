import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AsyncActionEntity } from "src/shared/entities/async.action.entity";
import { Counter } from "src/shared/entities/counter.entity";
import { CounterType } from "src/shared/util/counter.type.enum";
import { Repository } from "typeorm";
import { AsyncOperationsHandlerInterface } from "./async-operations-handler-interface.service";
import { AsyncOperationsHandlerService } from "./async-operations-handler.service";

@Injectable()
export class AsyncOperationsDatabaseHandlerService
  implements AsyncOperationsHandlerInterface
{
  constructor(
    private logger: Logger,
    @InjectRepository(Counter) private counterRepo: Repository<Counter>,
    @InjectRepository(AsyncActionEntity)
    private asyncActionRepo: Repository<AsyncActionEntity>,
    private asyncOperationsHandlerService: AsyncOperationsHandlerService
  ) {}

  async asyncHandler(event: any): Promise<any> {

    const seqObj = await this.counterRepo.findOneBy({
      id: CounterType.ASYNC_OPERATIONS,
    });
    let lastSeq = 0;
    if (seqObj) {
      lastSeq = seqObj.counter;
    }

    this.logger.log("database asyncHandler started", lastSeq);

    setInterval(async () => {

      const notExecutedActions = await this.asyncActionRepo
        .createQueryBuilder("asyncAction")
        .where("asyncAction.actionId > :lastExecuted", {
          lastExecuted: lastSeq,
        })
        .orderBy(
          '"actionId"',
          'ASC',
        )
        .select(['"actionId"', '"actionType"', '"actionProps"'])
        .getRawMany();

      if (notExecutedActions.length === 0) return;

      const startedSeq = lastSeq;

      try {
        for (const action of notExecutedActions) {
          console.log('Action start', action.actionType, action.actionId)
          await this.asyncOperationsHandlerService.handler(
            action.actionType,
            JSON.parse(action.actionProps)
          );
          lastSeq = action.actionId;
          await this.counterRepo.save({
            id: CounterType.ASYNC_OPERATIONS,
            counter: lastSeq,
          });
        }
        // await Promise.all(asyncPromises);
        
      } catch (exception) {
        this.logger.log("database asyncHandler failed", exception);
        // lastSeq = startedSeq;
      }
    }, 5000);
  }
}
