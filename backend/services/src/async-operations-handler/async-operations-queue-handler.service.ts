import { Injectable, Logger } from "@nestjs/common";
import { AsyncOperationsHandlerInterface } from "./async-operations-handler-interface.service";
import { SQSEvent } from "aws-lambda";
import { AsyncOperationsHandlerService } from "./async-operations-handler.service";

type Response = { batchItemFailures: { itemIdentifier: string }[] };

@Injectable()
export class AsyncOperationsQueueHandlerService
  implements AsyncOperationsHandlerInterface
{
  constructor(
    private asyncOperationsHandlerService: AsyncOperationsHandlerService,
    private logger: Logger
  ) {}

  async asyncHandler(event: SQSEvent): Promise<Response> {
    this.logger.log("Queue asyncHandler started");
    const response: Response = { batchItemFailures: [] };
    const promises = event.Records.map(async (record) => {
      try {
        const actionType = record.messageAttributes?.actionType?.stringValue;
        const response = this.asyncOperationsHandlerService.handler(
          actionType,
          JSON.parse(record.body)
        );
        console.log('response',response);
        this.logger.log("response", response);
      } catch (exception) {
        this.logger.log("queue asyncHandler failed", exception);
        response.batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    });

    try {
      await Promise.all(promises);
      return response;
    } catch (exception) {
      this.logger.log("asyncHandler failed", exception);
    }
  }
}
