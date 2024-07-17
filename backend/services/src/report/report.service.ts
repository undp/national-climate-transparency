import { HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataExportQueryDto } from "../dtos/data.export.query.dto";
import { DataExportReportFiveDto } from "../dtos/data.export.reportFive.dto";
import { DataExportReportThirteenDto } from "../dtos/data.export.reportThirteen.dto";
import { DataExportReportTwelveDto } from "../dtos/data.export.reportTwelve.dto";
import { DataListResponseDto } from "../dtos/data.list.response";
import { QueryDto } from "../dtos/query.dto";
import { ReportFiveViewEntity } from "../entities/report.five.view.entity";
import { Reports } from "../enums/shared.enum";
import { DataExportService } from "../util/dataExport.service";
import { HelperService } from "../util/helpers.service";
import { Repository } from "typeorm";
import { DataExportReportSixDto } from "../dtos/data.export.reportSix.dto";
import { DataExportReportSevenDto } from "../dtos/data.export.reportSeven.dto";
import { DataExportReportEightDto } from "../dtos/data.export.reportEight.dto";
import { DataExportReportNineDto } from "src/dtos/data.export.reportNine.dto";
import { DataExportReportTenDto } from "../dtos/data.export.reportTen.dto";
import { DataExportReportElevenDto } from "../dtos/data.export.reportEleven.dto";
import { AnnexThreeViewEntity } from "../entities/annexThree.view.entity";
import { ImpleMeans } from "src/enums/activity.enum";
import { SupportDirection } from "src/enums/support.enum";

export class ReportService {
	constructor(
		@InjectRepository(ReportFiveViewEntity) private reportFiveViewRepo: Repository<ReportFiveViewEntity>,
		@InjectRepository(AnnexThreeViewEntity) private annexThreeViewRepo: Repository<AnnexThreeViewEntity>,
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
		if (reportNumber === Reports.FIVE) {
				return this.reportFiveViewRepo.createQueryBuilder("reportFive");
		} else {
			let direction: SupportDirection;
			let implementation: ImpleMeans[];

			switch(reportNumber){
				case Reports.SIX:
					direction = SupportDirection.NEEDED;
					implementation = [ImpleMeans.FINANCE];
					break;
				case Reports.SEVEN:
					direction = SupportDirection.RECEIVED;
					implementation = [ImpleMeans.FINANCE];
					break;
				case Reports.EIGHT:
					direction = SupportDirection.NEEDED;
					implementation = [ImpleMeans.TECH_DEV];
					break;
				case Reports.NINE:
					direction = SupportDirection.RECEIVED;
					implementation = [ImpleMeans.TECH_DEV];
					break;
				case Reports.TEN:
					direction = SupportDirection.NEEDED;
					implementation = [ImpleMeans.CAPACITY_BUILD];
					break;
				case Reports.ELEVEN:
					direction = SupportDirection.RECEIVED;
					implementation = [ImpleMeans.CAPACITY_BUILD];
					break;
				case Reports.TWELVE:
					direction = SupportDirection.NEEDED;
					implementation = [ImpleMeans.FINANCE, ImpleMeans.TRANSP];
					break;
				case Reports.THIRTEEN:
					direction = SupportDirection.RECEIVED;
					implementation = [ImpleMeans.FINANCE, ImpleMeans.TRANSP];
					break;
			}

			let implementationCondition = '';

			implementation.forEach((implementation, index) => {
				implementationCondition = index > 0 ? 
					`${implementationCondition} OR annex_three.meansOfImplementation = '${implementation}'` : 
					`annex_three.meansOfImplementation = '${implementation}'`
			});

			implementationCondition = `(${implementationCondition})`

			return this.annexThreeViewRepo
					   .createQueryBuilder("annex_three")
					   .where("annex_three.direction = :direction", { direction: direction })
					   .andWhere(implementationCondition)
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
					prepData = this.prepareReportSixDataForExport(resp as AnnexThreeViewEntity[]);
					localFileName = "reportSixExport.";
					localTableNameKey = "reportSixExport.tableSix";
					break;

				case Reports.SEVEN:
					prepData = this.prepareReportSevenDataForExport(resp as AnnexThreeViewEntity[]);
					localFileName = "reportSevenExport.";
					localTableNameKey = "reportSevenExport.tableSeven";
					break;

				case Reports.EIGHT:
					prepData = this.prepareReportEightDataForExport(resp as AnnexThreeViewEntity[]);
					localFileName = "reportEightExport.";
					localTableNameKey = "reportEightExport.tableEight";
					break;

				case Reports.NINE:
					prepData = this.prepareReportNineDataForExport(resp as AnnexThreeViewEntity[]);
					localFileName = "reportNineExport.";
					localTableNameKey = "reportNineExport.tableNine";
					break;

				case Reports.TEN:
					prepData = this.prepareReportTenDataForExport(resp as AnnexThreeViewEntity[]);
					localFileName = "reportTenExport.";
					localTableNameKey = "reportTenExport.tableTen";
					break;

				case Reports.ELEVEN:
					prepData = this.prepareReportElevenDataForExport(resp as AnnexThreeViewEntity[]);
					localFileName = "reportElevenExport.";
					localTableNameKey = "reportElevenExport.tableEleven";
					break;

				case Reports.TWELVE:
					prepData = this.prepareReportTwelveDataForExport(resp as AnnexThreeViewEntity[]);
					localFileName = "reportTwelveExport.";
					localTableNameKey = "reportTwelveExport.tableTwelve";
					break;

				case Reports.THIRTEEN:
					prepData = this.prepareReportThirteenDataForExport(resp as AnnexThreeViewEntity[]);
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

	private prepareReportSixDataForExport(data: AnnexThreeViewEntity[]) {
		const exportData: DataExportReportSixDto[] = [];

		for (const report of data) {
			const dto: DataExportReportSixDto = {
				activityId: report.activityId,
				sector: report.sector,
				subSectors: report.subSector,
				titleOfActivity: report.title,
				description: report.description,
				requiredAmountDomestic: report.requiredAmountDomestic,
				requiredAmount: report.requiredAmount,
				startYear: report.startYear,
				endYear: report.endYear,
				financialInstrument: report.internationalFinancialInstrument,
				type: report.type,
				techDevelopment: report.meansOfImplementation === ImpleMeans.TECH_DEV ? 'Yes' : 'No',
				capacityBuilding: report.meansOfImplementation === ImpleMeans.CAPACITY_BUILD ? 'Yes' : 'No',
				anchoredInNationalStrategy: report.anchoredInNationalStrategy ? 'Yes' : 'No',
				additionalInfo: report.etfDescription,
				supportChannel: report.internationalSupportChannel
			};
			exportData.push(dto);
		}

		return exportData;
	}

	private prepareReportSevenDataForExport(data: AnnexThreeViewEntity[]) {
		const exportData: DataExportReportSevenDto[] = [];

		for (const report of data) {
			const dto: DataExportReportSevenDto = {
				activityId: report.activityId,
				titleOfActivity: report.title,
				description: report.description,
				supportChannel: report.internationalSupportChannel,
				recipientEntities: report.recipientEntities,
				nationalImplementingEntities: report.nationalImplementingEntity,
				internationalImplementingEntities: report.internationalImplementingEntity,
				receivedAmount: report.receivedAmount,
				receivedAmountDomestic: report.receivedAmountDomestic,
				startYear: report.startYear,
				endYear: report.endYear,
				financialInstrument: report.internationalFinancialInstrument,
				financingStatus: report.financingStatus,
				type: report.type,
				sector: report.sector,
				subSectors: report.subSector,
				techDevelopment: report.meansOfImplementation === ImpleMeans.TECH_DEV ? 'Yes' : 'No',
				capacityBuilding: report.meansOfImplementation === ImpleMeans.CAPACITY_BUILD ? 'Yes' : 'No',
				activityStatus: report.status,
				additionalInfo: report.etfDescription,
			  };
			exportData.push(dto);
		}

		return exportData;
	}

	private prepareReportEightDataForExport(data: AnnexThreeViewEntity[]) {
		const exportData: DataExportReportEightDto[] = [];

		for (const report of data) {
			const dto: DataExportReportEightDto = {
				activityId: report.activityId,
				sector: report.sector,
				subSectors: report.subSector,
				titleOfActivity: report.title,
				description: report.description,
				type: report.type,
				technologyType: report.technologyType,
				startYear: report.startYear,
				endYear: report.endYear,
				additionalInfo: report.etfDescription,
			}

			exportData.push(dto);
		}

		return exportData;
	}

	private prepareReportNineDataForExport(data: AnnexThreeViewEntity[]) {
		const exportData: DataExportReportNineDto[] = [];

		for (const report of data) {
			const dto: DataExportReportNineDto = {
				activityId: report.activityId,
				titleOfActivity: report.title,
				description: report.description,
				technologyType: report.technologyType,
				startYear: report.startYear,
				endYear: report.endYear,
				recipientEntities: report.recipientEntities,
				nationalImplementingEntities: report.nationalImplementingEntity,
				internationalImplementingEntities: report.internationalImplementingEntity,
				type: report.type,
				sector: report.sector,
				subSectors: report.subSector,
				activityStatus: report.status,
				additionalInfo: report.etfDescription,
			}

			exportData.push(dto);
		}

		return exportData;
	}

	private prepareReportTenDataForExport(data: AnnexThreeViewEntity[]) {
		const exportData: DataExportReportTenDto[] = [];

		for (const report of data) {
			const dto: DataExportReportTenDto = {
				activityId: report.activityId,
				sector: report.sector,
				subSectors: report.subSector,
				titleOfActivity: report.title,
				description: report.description,
				type: report.type,
				startYear: report.startYear,
				endYear: report.endYear,
				additionalInfo: report.etfDescription,
			}

			exportData.push(dto);
		}

		return exportData;
	}

	private prepareReportElevenDataForExport(data: AnnexThreeViewEntity[]) {
		const exportData: DataExportReportElevenDto[] = [];

		for (const report of data) {
			const dto: DataExportReportElevenDto = {
				activityId: report.activityId,
				titleOfActivity: report.title,
				description: report.description,
				startYear: report.startYear,
				endYear: report.endYear,
				recipientEntities: report.recipientEntities,
				nationalImplementingEntities: report.nationalImplementingEntity,
				internationalImplementingEntities: report.internationalImplementingEntity,
				type: report.type,
				sector: report.sector,
				subSectors: report.subSector,
				activityStatus: report.status,
				additionalInfo: report.etfDescription,
			}
			exportData.push(dto);
		}

		return exportData;
	}

	private prepareReportTwelveDataForExport(data: AnnexThreeViewEntity[]) {
		const exportData: DataExportReportTwelveDto[] = [];

		for (const report of data) {
			const dto: DataExportReportTwelveDto = {
				activityId: report.activityId,
				titleOfActivity: report.title,
				description: report.description,
				startYear: report.startYear,
				endYear: report.endYear,
				recipientEntities: report.recipientEntities,
				supportChannel: report.internationalSupportChannel,
				requiredAmountDomestic: report.requiredAmountDomestic,
				requiredAmount: report.requiredAmount,
				activityStatus: report.status,
				additionalInfo: report.etfDescription,
			}

			exportData.push(dto);
		}

		return exportData;
	}

	private prepareReportThirteenDataForExport(data: AnnexThreeViewEntity[]) {
		const exportData: DataExportReportThirteenDto[] = [];

		for (const report of data) {
			const dto: DataExportReportThirteenDto = {
				activityId: report.activityId,
				titleOfActivity: report.title,
				description: report.description,
				startYear: report.startYear,
				endYear: report.endYear,
				recipientEntities: report.recipientEntities,
				supportChannel: report.internationalSupportChannel,
				receivedAmountDomestic: report.receivedAmountDomestic,
				receivedAmount: report.receivedAmount,
				activityStatus: report.status,
				additionalInfo: report.etfDescription,
			}
			exportData.push(dto);
		}

		return exportData;
	}
}