import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { DataListResponseDto } from "src/dtos/data.list.response";
import { QueryDto } from "src/dtos/query.dto";
import { ReportFiveViewEntity } from "src/entities/report.five.view.entity";
import { HelperService } from "src/util/helpers.service";
import { EntityManager, Repository } from "typeorm";

export class ReportService {
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		@InjectRepository(ReportFiveViewEntity) private reportFiveViewRepo: Repository<ReportFiveViewEntity>,
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
}