import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FileHandlerInterface } from "./filehandler.interface";
var AWS = require("aws-sdk");
const s3 = new AWS.S3();

@Injectable()
export class S3FileHandlerService implements FileHandlerInterface {

  constructor(
    private logger: Logger,
    private configService: ConfigService
  ) {}
  

  private getContentType(filename: string) {
    if (filename.endsWith('.pdf')){
      return 'application/pdf'
    }
    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      return 'application/excel'
    }
    return "image/png";
  }

  public async uploadFile(path: string, content: string): Promise<string> {
    const imgBuffer = Buffer.from(content, "base64");
    var uploadParams = {
      Bucket: this.configService.get<string>("s3CommonBucket.name"),
      Key: "",
      Body: imgBuffer,
      ContentEncoding: "base64",
      ContentType: this.getContentType(path),
    };
    
    // uploadParams.Key = `profile_images/${companyId}_${new Date().getTime()}.png`;
    uploadParams.Key = path
    return (await s3
      .upload(uploadParams)
      .promise())?.Location;
  }


  public getUrl(path: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
  
}