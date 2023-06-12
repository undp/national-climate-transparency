import { Injectable } from "@nestjs/common";
import { AsyncOperationsHandlerInterface } from "./async-operations-handler-interface.service";
import { SQSEvent } from "aws-lambda";
import { AsyncOperationsHandlerService } from "./async-operations-handler.service";

type Response = { batchItemFailures: { itemIdentifier: string }[] };

@Injectable()
export class AsyncOperationsQueueHandlerService
  implements AsyncOperationsHandlerInterface
{
  constructor(
    private asyncOperationsHandlerService: AsyncOperationsHandlerService
  ) {}

  async asyncHandler(event: SQSEvent): Promise<Response> {
    const response: Response = { batchItemFailures: [] };
    const promises = event.Records.map(async (record) => {
      try {
        const actionType = record.messageAttributes?.actionType?.stringValue;
        this.asyncOperationsHandlerService.handler(
          actionType,
          JSON.parse(record.body)
        );
      } catch (e) {
        response.batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    });

    await Promise.all(promises);
    return response;
  }
}
