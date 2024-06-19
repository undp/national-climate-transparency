import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { DataExportQueryDto } from "../dtos/data.export.query.dto";
import { DataExportReportFiveDto } from "../dtos/data.export.reportFive.dto";
import { DataExportReportThirteenDto } from "../dtos/data.export.reportThirteen.dto";
import { DataExportReportTwelveDto } from "../dtos/data.export.reportTwelve.dto";
import { DataListResponseDto } from "../dtos/data.list.response";
import { QueryDto } from "../dtos/query.dto";
import { ReportFiveViewEntity } from "../entities/report.five.view.entity";
import { ReportThirteenViewEntity } from "../entities/report.thirteen.view.entity";
import { ReportTwelveViewEntity } from "../entities/report.twelve.view.entity";
import { Reports } from "../enums/shared.enum";
import { DataExportService } from "../util/dataExport.service";
import { HelperService } from "../util/helpers.service";
import { EntityManager, Repository } from "typeorm";

export class ReportService {
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		@InjectRepository(ReportFiveViewEntity) private reportFiveViewRepo: Repository<ReportFiveViewEntity>,
		private helperService: HelperService,
		private dataExportService: DataExportService,
		@InjectRepository(ReportTwelveViewEntity) private reportTwelveViewRepo: Repository<ReportTwelveViewEntity>,
		@InjectRepository(ReportThirteenViewEntity) private reportThirteenViewRepo: Repository<ReportThirteenViewEntity>,
	) { }

	async getTableData(id: Reports, query: QueryDto,) {
		const queryBuilder = this.getReportQueryBuilder(id);

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

	getReportQueryBuilder(reportNumber: Reports) {
		switch (reportNumber) {
			case Reports.FIVE:
				return this.reportFiveViewRepo.createQueryBuilder("reportFive");

			case Reports.TWELVE:
				return this.reportTwelveViewRepo.createQueryBuilder("reportTwelve");

			case Reports.THIRTEEN:
				return this.reportThirteenViewRepo.createQueryBuilder("reportThirteen");

			default:
				break;
		}

	}
 
	async downloadReportData(tableNumber: Reports, dataExportQueryDto: DataExportQueryDto) {
    const resp = await this.getReportQueryBuilder(tableNumber).getMany();
      
    if (resp.length > 0) {
      let prepData;
			let localFileName;
			let localTableNameKey;

			switch (tableNumber) {
				case Reports.FIVE:
					prepData =  this.prepareReportFiveDataForExport(resp as ReportFiveViewEntity[]);
					localFileName = "reportExport.";
					localTableNameKey = "reportExport.tableFive";
					break;
	
				case Reports.TWELVE:
					prepData = this.prepareReportTwelveDataForExport(resp as ReportTwelveViewEntity[]);
					localFileName = "reportTwelveExport.";
					localTableNameKey = "reportTwelveExport.tableTwelve";
					break;
	
					case Reports.THIRTEEN:
						prepData = this.prepareReportThirteenDataForExport(resp as ReportThirteenViewEntity[]);
						localFileName = "reportTwelveExport.";
						localTableNameKey = "reportTwelveExport.tableThirteen";
						break;
	
				default:
					break;
			}

      let headers: string[] = [];
      const titleKeys = Object.keys(prepData[0]);
      for (const key of titleKeys) {
        headers.push(
          this.helperService.formatReqMessagesString(
            localFileName + key,
            []
          )
        )
      }

      const path = await this.dataExportService.generateCsvOrExcel(prepData, headers, this.helperService.formatReqMessagesString(
        localTableNameKey,
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

	private prepareReportThirteenDataForExport(data: ReportThirteenViewEntity[]) {
    const exportData: DataExportReportThirteenDto[] = [];

    for (const report of data) {
      const dto: DataExportReportThirteenDto = new DataExportReportThirteenDto();
			dto.projectId = report.projectId;
			dto.titleOfProject = report.title;
			dto.description = report.description;
			dto.recipientEntities = report.recipientEntities;
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