export class ResponseMessageDto {
    constructor(
      public statusCode: number,
      public message: string,
    ) {}
  }