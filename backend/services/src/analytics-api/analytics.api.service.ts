import { Injectable } from "@nestjs/common";
import { DataCountResponseDto } from "../dtos/data.count.response";

@Injectable()
export class AnalyticsService {

  constructor() {}

  async getClimateActionChart(): Promise<DataCountResponseDto> {
    let results = {};
    return new DataCountResponseDto(results);
  }

  async getProjectSummaryChart(): Promise<DataCountResponseDto> {
    let results = {};
    return new DataCountResponseDto(results);
  }
  
}
