import { Injectable } from "@nestjs/common";
import { ActionEntity } from "../entities/action.entity";
import { ActivityEntity } from "../entities/activity.entity";
import { LogEntity } from "../entities/log.entity";
import { ProgrammeEntity } from "../entities/programme.entity";
import { ProjectEntity } from "../entities/project.entity";
import { User } from "../entities/user.entity";
import { LogEventType, EntityType } from "../enums/shared.enum";
import { EntityManager } from "typeorm";
import { LinkActivitiesDto } from "src/dtos/link.activities.dto";
import { UnlinkActivitiesDto } from "src/dtos/unlink.activities.dto";
import { Sector } from "src/enums/sector.enum";
import { SupportEntity } from "src/entities/support.entity";
import { AchievementEntity } from "src/entities/achievement.entity";

@Injectable()
export class LinkUnlinkService {

	async linkProgrammesToAction(
		action: ActionEntity,
		programmes: ProgrammeEntity[],
		payload: any,
		allLinkedProgrammes: ProgrammeEntity[],
		user: User,
		entityManager: EntityManager
	) {
		const sectorsSet = new Set<Sector>();
		const prog = await entityManager
			.transaction(async (em) => {
				for (const programme of programmes) {
					programme.action = action;
					programme.path = action.actionId;
					const linkedProgramme = await em.save<ProgrammeEntity>(programme);

					if (linkedProgramme) {
						//add sectors to action
						programme.affectedSectors.forEach(sector => sectorsSet.add(sector));

						if (programme.activities && programme.activities.length > 0) {
							const activities = [];
							// update each activity's path that are directly linked to the programme
							for (const activity of programme.activities) {
								activity.path = this.addActionToActivityPath(activity.path, action.actionId)
								activities.push(activity);
							}
							await em.save<ActivityEntity>(activities)
						}
						if (programme.projects && programme.projects.length > 0) {
							const projects = [];
							for (const project of programme.projects) {
								// update project's path
								project.path = this.addActionToProjectPath(project.path, action.actionId);
								projects.push(project);

								// update each activity's path that are linked to the project
								if (project.activities && project.activities.length > 0) {
									const activities = [];
									for (const activity of project.activities) {
										activity.path = this.addActionToActivityPath(activity.path, action.actionId);
										activities.push(activity);
									}
									await em.save<ActivityEntity>(activities)
								}

							}
							await em.save<ProjectEntity>(projects)
						}

						const logs = [];
						logs.push(
							this.buildLogEntity(
								LogEventType.LINKED_TO_ACTION,
								EntityType.PROGRAMME,
								programme.programmeId,
								user.id,
								payload
							)
						)
						logs.push(
							this.buildLogEntity(
								LogEventType.PROGRAMME_LINKED,
								EntityType.ACTION,
								action.actionId,
								user.id,
								payload
							)
						)
						await em.save<LogEntity>(logs);
					}
				}

				if (allLinkedProgrammes) {
					// Iterate over each programme and add its affected sectors to the set
					allLinkedProgrammes.forEach(programme => {
						programme.affectedSectors.forEach(sector => {
							sectorsSet.add(sector);
						});
					});
				}
				action.sectors = Array.from(sectorsSet);
				await em.save<ActionEntity>(action);
			});
	}

	async unlinkProgrammesFromAction(
		programme: ProgrammeEntity,
		payload: any,
		allLinkedProgrammes: ProgrammeEntity[],
		user: User,
		entityManager: EntityManager,
		achievementsToRemove: AchievementEntity[]
	) {
		const prog = await entityManager
			.transaction(async (em) => {
				const action = programme.action; const uniqueAffectedSectorsSet = new Set<Sector>();
				allLinkedProgrammes.forEach(programme => {
					programme.affectedSectors.forEach(sector => {
						uniqueAffectedSectorsSet.add(sector);
					});
				});
				action.sectors = Array.from(uniqueAffectedSectorsSet);
				await em.save<ActionEntity>(action);

				programme.action = null;
				programme.path = "";
				const unlinkedProgramme = await em.save<ProgrammeEntity>(programme);

				if (unlinkedProgramme) {
					if (programme.activities && programme.activities.length > 0) {
						// update each activity's path that are directly linked to the programme
						const activities = [];
						for (const activity of programme.activities) {
							const parts = activity.path.split(".");
							activity.path = ["_", parts[1], parts[2]].join(".");
							activities.push(activity);
						}
						await em.save<ActivityEntity>(activities)
					}
					if (programme.projects && programme.projects.length > 0) {
						const projects = [];
						const activities = [];
						for (const project of programme.projects) {
							// update project's path
							const parts = project.path.split(".");
							// const partOne = parts[0].replace("_", action.actionId);
							project.path = ["_", parts[1]].join(".");
							projects.push(project);

							// update each activity's path that are linked to the project
							if (project.activities && project.activities.length > 0) {
								for (const activity of project.activities) {
									const parts = activity.path.split(".");
									// const partOne = parts[0].replace("_", action.actionId);
									activity.path = ["_", parts[1], parts[2]].join(".");
									activities.push(activity);
								}
							}

						}
						await em.save<ProjectEntity>(projects)
						await em.save<ActivityEntity>(activities)
					}
					await this.deleteAchievements(achievementsToRemove, em);
					await em.save<LogEntity>(
						this.buildLogEntity(
							LogEventType.UNLINKED_FROM_ACTION,
							EntityType.PROGRAMME,
							programme.programmeId,
							user.id,
							payload
						)
					);
				}
			});
	}

	async linkProjectsToProgramme(programme: ProgrammeEntity, projects: ProjectEntity[], payload: any, user: User, entityManager: EntityManager) {
		const proj = await entityManager
			.transaction(async (em) => {

				for (const project of projects) {
					project.programme = programme;
					project.path = this.addProgrammeToProjectPath(project.path, programme.programmeId, programme.path);
					project.sectors = programme.affectedSectors;
					const linkedProject = await em.save<ProjectEntity>(project);

					if (linkedProject) {
						const activities = [];
						const supports = [];
						if (project.activities && project.activities.length > 0) {
							for (const activity of project.activities) {
								if (activity.support && activity.support.length > 0) {
									activity.support.forEach((support) => {
										support.sectors = programme.affectedSectors;
										supports.push(support);
									});
								}
								activity.path = this.addProgrammeToActivityPath(activity.path, programme.programmeId, programme.path);
								activity.sectors = programme.affectedSectors;
								activities.push(activity);
							}
							await em.save<SupportEntity>(supports);
							await em.save<ActivityEntity>(activities);
						}

						const logs = [];
						logs.push(
							this.buildLogEntity(
								LogEventType.LINKED_TO_PROGRAMME,
								EntityType.PROJECT,
								project.projectId,
								user.id,
								payload
							)
						)
						logs.push(
							this.buildLogEntity(
								LogEventType.PROJECT_LINKED,
								EntityType.PROGRAMME,
								programme.programmeId,
								user.id,
								payload
							)
						)
						await em.save<LogEntity>(logs);
					}
				}
			});
	}

	async unlinkProjectsFromProgramme(
		projects: ProjectEntity[],
		payload: any,
		user: User,
		entityManager: EntityManager,
		achievementsToRemove: AchievementEntity[]
	) {
		const proj = await entityManager
			.transaction(async (em) => {
				for (const project of projects) {
					project.programme = null;
					project.path = `_._`;
					project.sectors = null;
					const unLinkedProgramme = await em.save<ProjectEntity>(project);

					if (unLinkedProgramme) {
						const activities = [];
						const supports = [];
						if (project.activities && project.activities.length > 0) {
							for (const activity of project.activities) {
								if (activity.support && activity.support.length > 0) {
									activity.support.forEach((support) => {
										support.sectors = null;
										supports.push(support);
									});
								}
								activity.path = `_._.${project.projectId}`
								activity.sectors = null;
								activities.push(activity);
							}
							await em.save<SupportEntity>(supports);
							await em.save<ActivityEntity>(activities);
						}
						await this.deleteAchievements(achievementsToRemove, em);

						await em.save<LogEntity>(
							this.buildLogEntity(
								LogEventType.UNLINKED_FROM_PROGRAMME,
								EntityType.PROJECT,
								project.projectId,
								user.id,
								payload
							)
						);
					}
				}
			});
	}

	async linkActivitiesToParent(
		parentEntity: any,
		activities: ActivityEntity[],
		linkActivitiesDto: LinkActivitiesDto,
		user: User,
		entityManager: EntityManager
	) {
		const act = await entityManager
			.transaction(async (em) => {
				for (const activity of activities) {
					let logEventType;
					let entityType;
					switch (linkActivitiesDto.parentType) {
						case EntityType.ACTION: {
							activity.path = `${linkActivitiesDto.parentId}._._`;
							logEventType = LogEventType.LINKED_TO_ACTION;
							entityType  = EntityType.ACTION;
							activity.sectors = parentEntity?.migratedData?.sectorsAffected;
							break;
						}
						case EntityType.PROGRAMME: {
							activity.path = parentEntity.path ? `${parentEntity.path}.${linkActivitiesDto.parentId}._` : `_.${linkActivitiesDto.parentId}._`;
							logEventType = LogEventType.LINKED_TO_PROGRAMME;
							entityType  = EntityType.PROGRAMME;
							activity.sectors = parentEntity?.affectedSectors;
							break;
						}
						case EntityType.PROJECT: {
							activity.path = parentEntity.path ? `${parentEntity.path}.${linkActivitiesDto.parentId}` : `_._.${linkActivitiesDto.parentId}`;
							logEventType = LogEventType.LINKED_TO_PROJECT;
							entityType  = EntityType.PROJECT;
							activity.sectors = parentEntity?.sectors;
							break;
						}
					}
					activity.parentId = linkActivitiesDto.parentId;
					activity.parentType = linkActivitiesDto.parentType;

					const linkedActivity = await em.save<ActivityEntity>(activity);

					if (linkedActivity) {
						const supports = [];
						if (activity.support && activity.support.length > 0) {
							activity.support.forEach((support) => {
								support.sectors = linkedActivity.sectors;
								supports.push(support);
							});
						}

						await em.save<SupportEntity>(supports);
						const logs =[];
						logs.push(
							this.buildLogEntity(
								logEventType,
								EntityType.ACTIVITY,
								activity.activityId,
								user.id,
								linkActivitiesDto.parentId
							)
						)
						logs.push(
							this.buildLogEntity(
								LogEventType.ACTIVITY_LINKED,
								entityType,
								linkActivitiesDto.parentId,
								user.id,
								linkActivitiesDto.parentId
							)
						)
						await em.save<LogEntity>(logs);
					}
				}
			});
	}

	async unlinkActivitiesFromParent(
		activities: ActivityEntity[],
		unlinkActivitiesDto: UnlinkActivitiesDto,
		user: User,
		entityManager: EntityManager,
		achievementsToRemove: AchievementEntity[]
	) {
		const act = await entityManager
			.transaction(async (em) => {
				for (const activity of activities) {
					let logEventType;
					switch (activity.parentType) {
						case EntityType.ACTION: {
							logEventType = LogEventType.UNLINKED_FROM_ACTION;
							break;
						}
						case EntityType.PROGRAMME: {
							logEventType = LogEventType.UNLINKED_FROM_PROGRAMME;
							break;
						}
						case EntityType.PROJECT: {
							logEventType = LogEventType.UNLINKED_FROM_PROJECT;
							break;
						}
					}
					activity.parentId = null;
					activity.parentType = null;
					activity.path = '_._._';
					activity.sectors = null;

					const unlinkedActivity = await em.save<ActivityEntity>(activity);

					if (unlinkedActivity) {
						const supports = [];
						if (activity.support && activity.support.length > 0) {
							activity.support.forEach((support) => {
								support.sectors = null;
								supports.push(support);
							});
						}
						await em.save<SupportEntity>(supports)
						await em.remove<AchievementEntity>(achievementsToRemove);
						await em.save<LogEntity>(
							this.buildLogEntity(
								logEventType,
								EntityType.ACTIVITY,
								activity.activityId,
								user.id,
								unlinkActivitiesDto
							)
						);
					}
				}
			});

	}

	// Adding here to avoid circular dependencies
	async deleteAchievements(achievements: any[], em: EntityManager) {
		const queryBuilder = em.createQueryBuilder()
			.delete()
			.from(AchievementEntity);

		for (const achievement of achievements) {
			queryBuilder.orWhere('"kpiId" = :kpiId AND "activityId" = :activityId', { kpiId: achievement.kpiId, activityId: achievement.activityId });
		}

		const query = queryBuilder.getQueryAndParameters();
		console.log("Generated SQL Query:", query[0]);
		console.log("Query Parameters:", query[1]);

		const result = await queryBuilder.execute();
		return result;
	}

	addActionToActivityPath(currentActivityPath: string, actionId: string) {
		const parts = currentActivityPath.split(".");
		parts[0] = actionId;
		return [parts[0], parts[1], parts[2]].join(".");
	}

	addActionToProjectPath(currentProjectPath: string, actionId: string) {
		const parts = currentProjectPath.split(".");
		parts[0] = actionId;
		return [parts[0], parts[1]].join(".");
	}

	addProgrammeToActivityPath(currentActivityPath: string, programmeId: string, currentProgrammePath: string) {
		const parts = currentActivityPath.split(".");
		parts[0] = currentProgrammePath ? currentProgrammePath : "_";
		parts[1] = programmeId;
		return [parts[0], parts[1], parts[2]].join(".");
	}

	addProgrammeToProjectPath(currentProjectPath: string, programmeId: string, currentProgrammePath: string) {
		const parts = currentProjectPath.split(".");
		parts[0] = currentProgrammePath ? currentProgrammePath : "_";
		parts[1] = programmeId;
		return [parts[0], parts[1]].join(".");
	}

	buildLogEntity = (
		eventType: LogEventType,
		recordType: EntityType,
		recordId: any,
		userId: number,
		data: any) => {
		const log = new LogEntity();
		log.eventType = eventType;
		log.recordType = recordType;
		log.recordId = recordId;
		log.userId = userId;
		log.logData = data;
		return log;
	}
}