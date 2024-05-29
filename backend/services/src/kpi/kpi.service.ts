import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { KpiEntity } from "../entities/kpi.entity";
import { EntityManager, Repository } from "typeorm";
import { EntityType } from "../enums/shared.enum";
import { ActivityEntity } from "../entities/activity.entity";
import { HelperService } from "../util/helpers.service";
import { AchievementEntity } from "../entities/achievement.entity";
import { ActionEntity } from "../entities/action.entity";
import { ProgrammeEntity } from "../entities/programme.entity";
import { ProjectEntity } from "../entities/project.entity";
import { AchievementDtoList } from "../dtos/achievementDto";
import { User } from "../entities/user.entity";
import { plainToClass } from "class-transformer";
import { DataResponseMessageDto } from "../dtos/data.response.message";

@Injectable()
export class KpiService {
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		@InjectRepository(KpiEntity) private kpiRepo: Repository<KpiEntity>,
		@InjectRepository(AchievementEntity) private achievementRepo: Repository<AchievementEntity>,
		@InjectRepository(ActivityEntity) private activityRepo: Repository<ActivityEntity>,
		@InjectRepository(ActionEntity) private actionRepo: Repository<ActionEntity>,
		@InjectRepository(ProgrammeEntity) private programmeRepo: Repository<ProgrammeEntity>,
		@InjectRepository(ProjectEntity) private projectRepo: Repository<ProjectEntity>,
		private helperService: HelperService,
	) { }

	//MARK: Find KPIs by creator type and id
	async getKpisByCreatorTypeAndCreatorId(creatorType: string, creatorId: string) {
		return await this.kpiRepo.createQueryBuilder('kpi')
			.where('kpi.creatorType = :creatorType AND kpi.creatorId = :creatorId', { creatorType, creatorId })
			.getMany();
	}

	//MARK: Create Achievements
	async createAchievements(achievementDtoList: AchievementDtoList, user: User) {
		const achievements = [];

		for(const achievementDto of achievementDtoList.achievements) {
			const achievement: AchievementEntity = plainToClass(AchievementEntity, achievementDto);

			const activity = await this.findActivityById(achievementDto.activityId);
			if (!activity) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"kpi.activityNotFound",
						[achievementDto.activityId]
					),
					HttpStatus.BAD_REQUEST
				);
			}
	
			const kpi = await this.findKpiById(achievementDto.kpiId);
			if (!kpi) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"kpi.kpiNotFound",
						[achievementDto.kpiId]
					),
					HttpStatus.BAD_REQUEST
				);
			}
	
			achievement.kpi = kpi;
			achievement.activity = activity;
	
			const activityKpis = await this.getKpisForEntity(activity.activityId, EntityType.ACTIVITY);
	
			if (!activityKpis.some(kpi => kpi.kpiId === achievementDto.kpiId)) {
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"kpi.kpiNotLinkedToActivity",
						[achievementDto.kpiId, achievementDto.activityId]
					),
					HttpStatus.BAD_REQUEST
				);
			}

			achievements.push(achievement);
		}


		const achive = await this.entityManager.transaction(async (em) => {
			return await em.save<AchievementEntity>(achievements);
		})
			.catch((err: any) => {
				console.log(err);
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"kpi.achievementCreationFailed",
						[err]
					),
					HttpStatus.BAD_REQUEST
				);
			});

		await this.helperService.refreshMaterializedViews(this.entityManager);
		return new DataResponseMessageDto(
			HttpStatus.CREATED,
			this.helperService.formatReqMessagesString("kpi.createAchievementSuccess", []),
			achive
		);
	}

	//MARK: Get Parent Achievements
	async getAchievementsOfParentEntity(
		parentId: string,
		parentType: EntityType,
		unlinkingEntityId: string,
		unlinkingEntityType: EntityType
	) {
		let entityLevel;

		switch (unlinkingEntityType) {
			case EntityType.ACTION:
				entityLevel = 0;
				break;
			case EntityType.PROGRAMME:
				entityLevel = 1;
				break;
			case EntityType.PROJECT:
				entityLevel = 2;
				break;

		}

		const query = `
			SELECT achi."kpiId", achi."activityId" FROM (SELECT * FROM public.activity
			WHERE subpath(path, $1, 1) = $2) act
			join achievement achi on achi."activityId" = act."activityId"
			join (SELECT * FROM public.kpi
			where kpi."creatorId" = $3 AND kpi."creatorType" = $4) kp on kp."kpiId" = achi."kpiId"
	`;
		const result = await this.kpiRepo.query(query, [entityLevel, unlinkingEntityId, parentId, parentType]);
		return result;
	}

	//MARK: Get Kpis With Achievements
	async getKpisWithAchieved(entityId: string, entityType: EntityType) {

		const parentIds = []
		let entityLevel;
		switch (entityType) {
			case EntityType.ACTION: {
				const action = await this.findActionById(entityId);

				if (!action) {
					throw new HttpException(
						this.helperService.formatReqMessagesString(
							"kpi.actionNotFound",
							[entityId]
						),
						HttpStatus.BAD_REQUEST
					);
				}

				parentIds.push(action.actionId);
				entityLevel = 0;
				break;
			}
			case EntityType.PROGRAMME: {
				const programme = await this.findProgrammeById(entityId);

				if (!programme) {
					throw new HttpException(
						this.helperService.formatReqMessagesString(
							"kpi.programmeNotFound",
							[entityId]
						),
						HttpStatus.BAD_REQUEST
					);
				}

				parentIds.push(programme.programmeId);
				if (programme.path != null && programme.path != '_') parentIds.push(programme.path);
				entityLevel = 1;
				break;
			}
			case EntityType.PROJECT: {
				const project = await this.findProjectById(entityId);

				if (!project) {
					throw new HttpException(
						this.helperService.formatReqMessagesString(
							"kpi.projectNotFound",
							[entityId]
						),
						HttpStatus.BAD_REQUEST
					);
				}

				parentIds.push(project.projectId);
				if (project.path != null) {
					const parts = project.path.split(".");

					if (parts.length > 0 && parts[0] !== "_") {
						parentIds.push(parts[0]);
					}
					if (parts.length > 1 && parts[1] !== "_") {
						parentIds.push(parts[1]);
					}

				}
				entityLevel = 2;
				break;
			}
		}

		const query = `
			SELECT *
			FROM (
				SELECT "kpiId", SUM(achieved) as achieved
				FROM (
					SELECT *
					FROM public.activity
					WHERE subpath(path, $1, 1) = $2
				) AS ac
				JOIN achievement ach ON ac."activityId" = ach."activityId"
				GROUP BY "kpiId"
			) AS achi
			RIGHT JOIN kpi kp ON kp."kpiId" = achi."kpiId"
			WHERE kp."creatorId" = ANY($3)
		`;


		const result = await this.kpiRepo.query(query, [entityLevel, entityId, parentIds]);


		return result;

	}
//MARK: Get Kpis For Entity
	async getKpisForEntity(entityId: string, entityType: EntityType) {
		const entity = await this.getEntityByEntityIdAndType(entityId, entityType);

		if (!entity) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"kpi.entityNotFound",
					[entityId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		if (entityType == EntityType.ACTIVITY && !entity.parentId) {
			return [];
		}

		const queryBuilder = this.kpiRepo.createQueryBuilder('kpi');

		if (entityType == EntityType.ACTION) {
			queryBuilder.orWhere('kpi.creatorType = :creatorType AND kpi.creatorId = :creatorId', {
				creatorType: EntityType.ACTION,
				creatorId: entityId
			});
		} else {
			const parts = entity.path.split(".");

			if (parts.length > 0 && parts[0] !== "_") {
				queryBuilder.orWhere('kpi.creatorType = :creatorType1 AND kpi.creatorId = :creatorId1', {
					creatorType1: EntityType.ACTION,
					creatorId1: parts[0]
				});
			}
			if (parts.length > 1 && parts[1] !== "_") {
				queryBuilder.orWhere('kpi.creatorType = :creatorType2 AND kpi.creatorId = :creatorId2', {
					creatorType2: EntityType.PROGRAMME,
					creatorId2: parts[1]
				});
			}
			if (parts.length > 2 && parts[2] !== "_") {
				queryBuilder.orWhere('kpi.creatorType = :creatorType3 AND kpi.creatorId = :creatorId3', {
					creatorType3: EntityType.PROJECT,
					creatorId3: parts[2]
				});
			}
			if (entityType == EntityType.PROGRAMME) {
				queryBuilder.orWhere('kpi.creatorType = :creatorType4 AND kpi.creatorId = :creatorId4', {
					creatorType4: EntityType.PROGRAMME,
					creatorId4: entityId
				});
			} else if (entityType == EntityType.PROJECT) {
				queryBuilder.orWhere('kpi.creatorType = :creatorType5 AND kpi.creatorId = :creatorId5', {
					creatorType5: EntityType.PROJECT,
					creatorId5: entityId
				});
			}
		}

		queryBuilder.leftJoinAndMapMany(
			"kpi.achievements",
			AchievementEntity,
			"kpiAchievement",
			"kpiAchievement.kpiId = kpi.kpiId AND kpiAchievement.activityId = :entityId", { entityId }
		);


		return await queryBuilder.getMany();
	}

	async findActionById(actionId: string) {
		return await this.actionRepo.findOneBy({
			actionId
		})
	}

	async findProgrammeById(programmeId: string) {
		return await this.programmeRepo.findOneBy({
			programmeId
		})
	}

	async findProjectById(projectId: string) {
		return await this.projectRepo.findOneBy({
			projectId
		})
	}

	async findActivityById(activityId: string) {
		return await this.activityRepo.findOneBy({
			activityId
		})
	}

	async findKpiById(kpiId: number) {
		return await this.kpiRepo.findOneBy({
			kpiId
		})
	}

	// MARK: Get Entity By EntityId & Type
	async getEntityByEntityIdAndType(entityId: string, entityType: EntityType): Promise<any> {
		switch (entityType) {
			case EntityType.ACTION:
				return await this.findActionById(entityId);
			case EntityType.PROGRAMME:
				return await this.findProgrammeById(entityId);
			case EntityType.PROJECT:
				return await this.findProjectById(entityId);
			case EntityType.ACTIVITY:
				return await this.findActivityById(entityId);
			default:
				throw new HttpException(
					this.helperService.formatReqMessagesString(
						"kpi.entityNotFound",
						[entityId]
					),
					HttpStatus.BAD_REQUEST
				);;
		}
	}

	async findAchievementsByActivityId(activityId: string) {
		return await this.achievementRepo.findBy({activityId})
	}

	async findAchievementsByKpiIds(kpiIds: number[]) {
		if (!kpiIds || kpiIds.length === 0) {
			return [];
		}

		const achievements = await this.achievementRepo
			.createQueryBuilder('achievement')
			.where('achievement.kpiId IN (:...kpiIds)', { kpiIds })
			.getMany();

		return achievements;
	}

	// async findAllActivitiesInTree(rootNodeId: string, rootNodeType: EntityType) {
	// 	const queryBuilder = this.activityRepo
	// 		.createQueryBuilder()
	// 		.where(
	// 			this.helperService.generateSubPathSQL({
	// 				match: rootNodeId,
	// 				ltree: 'path',
	// 				startLevel: 0,
	// 				traverseDepth: 1,
	// 			}),
	// 		);

	// 	const query = queryBuilder.getQueryAndParameters();
	// 	console.log("Generated SQL Query:", query[0]);
	// 	console.log("Query Parameters:", query[1]);

	// 	const result = await queryBuilder.getMany();
	// 	return result;
	// }

}
