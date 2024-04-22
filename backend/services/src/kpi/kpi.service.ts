import { Injectable } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { KpiEntity } from "../entities/kpi.entity";
import { EntityManager, Repository } from "typeorm";

@Injectable()
export class KpiService {
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		@InjectRepository(KpiEntity) private kpiRepo: Repository<KpiEntity>,
	) { }

	async findKpisByCreatorTypeAndCreatorId(creatorType: string, creatorId: string) {
		return await this.kpiRepo.createQueryBuilder('kpi')
			.where('kpi.creatorType = :creatorType AND kpi.creatorId = :creatorId', { creatorType, creatorId })
			.getMany();
	}

}
