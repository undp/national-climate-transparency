import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { plainToClass } from "class-transformer";
import { DataExportQueryDto } from "src/dtos/data.export.query.dto";
import { DataExportReportFiveDto } from "src/dtos/data.export.reportFive.dto";
import { DataListResponseDto } from "src/dtos/data.list.response";
import { QueryDto } from "src/dtos/query.dto";
import { ReportFiveViewEntity } from "src/entities/report.five.view.entity";
import { DataExportService } from "src/util/dataExport.service";
import { HelperService } from "src/util/helpers.service";
import { EntityManager, Repository } from "typeorm";

export class ReportService {
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		@InjectRepository(ReportFiveViewEntity) private reportFiveViewRepo: Repository<ReportFiveViewEntity>,
		private helperService: HelperService,
		private dataExportService: DataExportService
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

	async downloadReportFive(dataExportQueryDto: DataExportQueryDto) {
    const resp = await this.reportFiveViewRepo
      .createQueryBuilder("reportFive")
      .select([
        "reportFive.actionId",
        "reportFive.programmeId",
        "reportFive.projectId",
        "reportFive.titleOfAction",
        "reportFive.titleOfProgramme",
        "reportFive.titleOfProject",
        "reportFive.description",
        "reportFive.objective",
        "reportFive.instrumentType",
        "reportFive.status",
        "reportFive.sector",
        "reportFive.ghgsAffected",
        "reportFive.startYear",
        "reportFive.implementingEntities",
        "reportFive.achievedGHGReduction",
        "reportFive.expectedGHGReduction"
      ])
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

	private prepareReportFiveDataForExport(data: ReportFiveViewEntity[]) {
    const exportData: DataExportReportFiveDto[] = [];

    for (const report of data) {
      const dto: DataExportReportFiveDto = plainToClass(ReportFiveViewEntity, report);
      exportData.push(dto);
    }

    return exportData;
  }
}