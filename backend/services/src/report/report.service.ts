import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { plainToClass } from "class-transformer";
import { DataExportQueryDto } from "src/dtos/data.export.query.dto";
import { DataExportReportFiveDto } from "src/dtos/data.export.reportFive.dto";
import { DataExportReportTwelveDto } from "src/dtos/data.export.reportTwelve.dto";
import { DataListResponseDto } from "src/dtos/data.list.response";
import { QueryDto } from "src/dtos/query.dto";
import { ReportFiveViewEntity } from "src/entities/report.five.view.entity";
import { ReportTwelveViewEntity } from "src/entities/report.twelve.view.entity";
import { DataExportService } from "src/util/dataExport.service";
import { HelperService } from "src/util/helpers.service";
import { EntityManager, Repository } from "typeorm";

export class ReportService {
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		@InjectRepository(ReportFiveViewEntity) private reportFiveViewRepo: Repository<ReportFiveViewEntity>,
		private helperService: HelperService,
		private dataExportService: DataExportService,
		@InjectRepository(ReportTwelveViewEntity) private reportTwelveViewRepo: Repository<ReportTwelveViewEntity>,
	) { }

	async tableFiveData(query: QueryDto,) {
		const queryBuilder = this.reportFiveViewRepo
			.createQueryBuilder("reportFive");

		if (query.size && query.page) {
			queryBuilder.offset(query.size * query.page - query.size)
				.limit(query.size);
		}

		const resp = await queryBuilder.getManyAndCount();

		return new DataListResponseDto(
			resp.length > 0 ? resp[0] : undefined,
			resp.length > 1 ? resp[1] : undefined
		);
	}

	async getTableTwelveData(query: QueryDto,) {
		const queryBuilder = this.reportTwelveViewRepo
			.createQueryBuilder("reportTwelve");

		if (query.size && query.page) {
			queryBuilder.offset(query.size * query.page - query.size)
				.limit(query.size);
		}

		const resp = await queryBuilder.getManyAndCount();

		return new DataListResponseDto(
			resp.length > 0 ? resp[0] : undefined,
			resp.length > 1 ? resp[1] : undefined
		);
	}
 
	async downloadReportFive(dataExportQueryDto: DataExportQueryDto) {
    const resp = await this.reportFiveViewRepo
      .createQueryBuilder("reportFive")
      .getMany();
      
    if (resp.length > 0) {
      const prepData = this.prepareReportFiveDataForExport(resp)

      let headers: string[] = [];
      const titleKeys = Object.keys(prepData[0]);
      for (const key of titleKeys) {
        headers.push(
          this.helperService.formatReqMessagesString(
            "reportExport." + key,
            []
          )
        )
      }

      const path = await this.dataExportService.generateCsvOrExcel(prepData, headers, this.helperService.formatReqMessagesString(
        "reportExport.tableFive",
        []
      ), dataExportQueryDto.fileType);
      return path;
    }
    throw new HttpException(
      this.helperService.formatReqMessagesString(
        "reportExport.nothingToExport",
        []
      ),
      HttpStatus.BAD_REQUEST
    );
  }

	async downloadReportTwelve(dataExportQueryDto: DataExportQueryDto) {
    const resp = await this.reportTwelveViewRepo
			.createQueryBuilder("reportTwelve").getMany();
      
    if (resp.length > 0) {
      const prepData = this.prepareReportTwelveDataForExport(resp)

      let headers: string[] = [];
      const titleKeys = Object.keys(prepData[0]);
      for (const key of titleKeys) {
        headers.push(
          this.helperService.formatReqMessagesString(
            "reportTwelveExport." + key,
            []
          )
        )
      }

      const path = await this.dataExportService.generateCsvOrExcel(prepData, headers, this.helperService.formatReqMessagesString(
        "reportTwelveExport.tableTwelve",
        []
      ), dataExportQueryDto.fileType);
      return path;
    }
    throw new HttpException(
      this.helperService.formatReqMessagesString(
        "reportTwelveExport.nothingToExport",
        []
      ),
      HttpStatus.BAD_REQUEST
    );
  }

	private prepareReportFiveDataForExport(data: ReportFiveViewEntity[]) {
    const exportData: DataExportReportFiveDto[] = [];

    for (const report of data) {
      const dto: DataExportReportFiveDto = new DataExportReportFiveDto();
			dto.titleOfAction = report.titleOfAction;
			dto.description = report.description;
			dto.objective = report.objective;
			dto.instrumentType = report.instrumentType;
			dto.status = report.status;
			dto.sector = report.sector;
			dto.ghgsAffected = report.ghgsAffected;
			dto.startYear = report.startYear;
			dto.implementingEntities = report.implementingEntities;
			dto.achievedGHGReduction = report.achievedGHGReduction;
			dto.expectedGHGReduction = report.expectedGHGReduction;

      exportData.push(dto);
    }

    return exportData;
  }

	private prepareReportTwelveDataForExport(data: ReportTwelveViewEntity[]) {
    const exportData: DataExportReportTwelveDto[] = [];

    for (const report of data) {
      const dto: DataExportReportTwelveDto = new DataExportReportTwelveDto();
			dto.projectId = report.projectId;
			dto.titleOfProject = report.title;
			dto.description = report.description;
			dto.projectStatus = report.projectStatus;
			dto.startYear = report.startYear;
			dto.endYear = report.endYear;
			dto.transparency = report.transparency;
			dto.internationalSupportChannel = report.internationalSupportChannel;
			dto.supportReceivedOrNeeded = report.supportReceivedOrNeeded;
			dto.receivedAmount = report.receivedAmount;
			dto.receivedAmountDomestic = report.receivedAmountDomestic;

      exportData.push(dto);
    }

    return exportData;
  }
}