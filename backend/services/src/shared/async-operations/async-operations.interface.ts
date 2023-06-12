import { Injectable } from "@nestjs/common";

export interface AsyncAction {
  actionType: number;
  actionProps: any;
}

@Injectable()
export abstract class AsyncOperationsInterface {
  public abstract addAction(action: AsyncAction): Promise<boolean>;
}
