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
import { Repository } from "typeorm";
import { ReportSixViewEntity } from "../entities/report.six.view.entity";
import { DataExportReportSixDto } from "../dtos/data.export.reportSix.dto";
import { ReportSevenViewEntity } from "../entities/report.seven.view.entity";
import { DataExportReportSevenDto } from "../dtos/data.export.reportSeven.dto";
import { ReportEightViewEntity } from "../entities/report.eight.view.entity";
import { DataExportReportEightDto } from "../dtos/data.export.reportEight.dto";
import { ReportNineViewEntity } from "../entities/report.nine.view.entity";
import { DataExportReportNineDto } from "src/dtos/data.export.reportNine.dto";
import { ReportTenViewEntity } from "../entities/report.ten.view.entity";
import { ReportElevenViewEntity } from "../entities/report.eleven.view.entity";
import { DataExportReportTenDto } from "../dtos/data.export.reportTen.dto";
import { DataExportReportElevenDto } from "../dtos/data.export.reportEleven.dto";
import { ReportViewEntity } from "../entities/report.view.entity";

export class ReportService {
	constructor(
		@InjectRepository(ReportFiveViewEntity) private reportFiveViewRepo: Repository<ReportFiveViewEntity>,
		@InjectRepository(ReportTwelveViewEntity) private reportTwelveViewRepo: Repository<ReportTwelveViewEntity>,
		@InjectRepository(ReportThirteenViewEntity) private reportThirteenViewRepo: Repository<ReportThirteenViewEntity>,
		@InjectRepository(ReportSixViewEntity) private reportSixViewRepo: Repository<ReportSixViewEntity>,
		@InjectRepository(ReportSevenViewEntity) private reportSevenViewRepo: Repository<ReportSevenViewEntity>,
		@InjectRepository(ReportEightViewEntity) private reportEightViewRepo: Repository<ReportEightViewEntity>,
		@InjectRepository(ReportNineViewEntity) private reportNineViewRepo: Repository<ReportNineViewEntity>,
		@InjectRepository(ReportTenViewEntity) private reportTenViewRepo: Repository<ReportTenViewEntity>,
		@InjectRepository(ReportElevenViewEntity) private reportElevenViewRepo: Repository<ReportElevenViewEntity>,
		@InjectRepository(ReportViewEntity) private reportViewRepo: Repository<ReportViewEntity>,
		private helperService: HelperService,
		private dataExportService: DataExportService,
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

			case Reports.SIX:
				return this.reportSixViewRepo.createQueryBuilder("reportSix");

			case Reports.SEVEN:
				return this.reportSevenViewRepo.createQueryBuilder("reportSeven");

			case Reports.TEN:
				return this.reportTenViewRepo.createQueryBuilder("reportTen");

			case Reports.ELEVEN:
				return this.reportElevenViewRepo.createQueryBuilder("reportEleven");

			case Reports.EIGHT:
				return this.reportEightViewRepo.createQueryBuilder("reportEight");

			case Reports.NINE:
				return this.reportNineViewRepo.createQueryBuilder("reportNine");

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
					prepData = this.prepareReportFiveDataForExport(resp as ReportFiveViewEntity[]);
					localFileName = "reportExport.";
					localTableNameKey = "reportExport.tableFive";
					break;

				case Reports.SIX:
					prepData = this.prepareReportSixDataForExport(resp as ReportSixViewEntity[]);
					localFileName = "reportSixExport.";
					localTableNameKey = "reportSixExport.tableSix";
					break;

				case Reports.SEVEN:
					prepData = this.prepareReportSevenDataForExport(resp as ReportSevenViewEntity[]);
					localFileName = "reportSevenExport.";
					localTableNameKey = "reportSevenExport.tableSeven";
					break;

				case Reports.EIGHT:
					prepData = this.prepareReportEightDataForExport(resp as ReportEightViewEntity[]);
					localFileName = "reportEightExport.";
					localTableNameKey = "reportEightExport.tableEight";
					break;

				case Reports.NINE:
					prepData = this.prepareReportNineDataForExport(resp as ReportNineViewEntity[]);
					localFileName = "reportNineExport.";
					localTableNameKey = "reportNineExport.tableNine";
					break;

				case Reports.TEN:
					prepData = this.prepareReportTenDataForExport(resp as ReportTenViewEntity[]);
					localFileName = "reportTenExport.";
					localTableNameKey = "reportTenExport.tableTen";
					break;

				case Reports.ELEVEN:
					prepData = this.prepareReportElevenDataForExport(resp as ReportElevenViewEntity[]);
					localFileName = "reportElevenExport.";
					localTableNameKey = "reportElevenExport.tableEleven";
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
					))
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

	private prepareReportSixDataForExport(data: ReportSixViewEntity[]) {
		const exportData: DataExportReportSixDto[] = [];

		for (const report of data) {
			const dto: DataExportReportSixDto = new DataExportReportSixDto();
			dto.projectId = report.projectId;
			dto.titleOfProject = report.title;
			dto.description = report.description;
			dto.sector = report.sector;
			dto.subSectors = report.subSectors;
			dto.type = report.type;
			dto.supportReceivedOrNeeded = report.supportReceivedOrNeeded;
			dto.anchoredInNationalStrategy = report.anchoredInNationalStrategy;
			dto.techDevelopment = report.techDevelopment;
			dto.capacityBuilding = report.capacityBuilding;
			// dto.financingOnly = report.financingOnly;
			dto.startYear = report.startYear;
			dto.endYear = report.endYear;
			dto.receivedAmount = report.receivedAmount;
			dto.receivedAmountDomestic = report.receivedAmountDomestic;
			dto.internationalSupportChannel = report.internationalSupportChannel;
			dto.financialInstrument = report.financialInstrument;

			exportData.push(dto);
		}

		return exportData;
	}

	private prepareReportSevenDataForExport(data: ReportSevenViewEntity[]) {
		const exportData: DataExportReportSevenDto[] = [];

		for (const report of data) {
			const dto: DataExportReportSevenDto = new DataExportReportSevenDto();
			dto.projectId = report.projectId;
			dto.titleOfProject = report.title;
			dto.description = report.description;
			dto.sector = report.sector;
			dto.subSectors = report.subSectors;
			dto.type = report.type;
			dto.recipientEntities = report.recipientEntities;
			dto.nationalImplementingEntities = report.nationalImplementingEntities;
			dto.internationalImplementingEntities = report.internationalImplementingEntities;
			dto.supportReceivedOrNeeded = report.supportReceivedOrNeeded;
			dto.techDevelopment = report.techDevelopment;
			dto.capacityBuilding = report.capacityBuilding;
			// dto.financingOnly = report.financingOnly;
			dto.startYear = report.startYear;
			dto.endYear = report.endYear;
			dto.receivedAmount = report.receivedAmount;
			dto.receivedAmountDomestic = report.receivedAmountDomestic;
			dto.internationalSupportChannel = report.internationalSupportChannel;
			dto.financialInstrument = report.financialInstrument;
			dto.financingStatus = report.financingStatus;

			exportData.push(dto);
		}

		return exportData;
	}

	private prepareReportTenDataForExport(data: ReportTenViewEntity[]) {
		const exportData: DataExportReportTenDto[] = [];

		for (const report of data) {
			const dto: DataExportReportTenDto = new DataExportReportTenDto();
			dto.projectId = report.projectId;
			dto.titleOfProject = report.title;
			dto.description = report.description;
			dto.sector = report.sector;
			dto.subSectors = report.subSectors;
			dto.type = report.type;
			dto.supportReceivedOrNeeded = report.supportReceivedOrNeeded;
			dto.startYear = report.startYear;
			dto.endYear = report.endYear;

			exportData.push(dto);
		}

		return exportData;
	}

	private prepareReportElevenDataForExport(data: ReportElevenViewEntity[]) {
		const exportData: DataExportReportElevenDto[] = [];

		for (const report of data) {
			const dto: DataExportReportElevenDto = new DataExportReportElevenDto();
			dto.projectId = report.projectId;
			dto.titleOfProject = report.title;
			dto.description = report.description;
			dto.sector = report.sector;
			dto.subSectors = report.subSectors;
			dto.type = report.type;
			dto.recipientEntities = report.recipientEntities;
			dto.nationalImplementingEntities = report.nationalImplementingEntities;
			dto.internationalImplementingEntities = report.internationalImplementingEntities;
			dto.projectStatus = report.projectStatus;
			dto.supportReceivedOrNeeded = report.supportReceivedOrNeeded;
			dto.startYear = report.startYear;
			dto.endYear = report.endYear;

			exportData.push(dto);
		}

		return exportData;
	}

	private prepareReportEightDataForExport(data: ReportEightViewEntity[]) {
		const exportData: DataExportReportEightDto[] = [];

		for (const report of data) {
			const dto: DataExportReportEightDto = new DataExportReportEightDto();
			dto.projectId = report.projectId;
			dto.titleOfProject = report.title;
			dto.description = report.description;
			dto.sector = report.sector;
			dto.subSectors = report.subSectors;
			dto.type = report.type;
			dto.technologyType = report.technologyType;
			dto.supportReceivedOrNeeded = report.supportReceivedOrNeeded;
			dto.startYear = report.startYear;
			dto.endYear = report.endYear;
			exportData.push(dto);
		}

		return exportData;
	}

	private prepareReportNineDataForExport(data: ReportNineViewEntity[]) {
		const exportData: DataExportReportNineDto[] = [];

		for (const report of data) {
			const dto: DataExportReportNineDto = new DataExportReportNineDto();
			dto.projectId = report.projectId;
			dto.titleOfProject = report.title;
			dto.description = report.description;
			dto.sector = report.sector;
			dto.subSectors = report.subSectors;
			dto.type = report.type;
			dto.technologyType = report.technologyType;
			dto.recipientEntities = report.recipientEntities;
			dto.nationalImplementingEntities = report.nationalImplementingEntities;
			dto.projectStatus = report.projectStatus;
			dto.supportReceivedOrNeeded = report.supportReceivedOrNeeded;
			dto.startYear = report.startYear;
			dto.endYear = report.endYear;
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