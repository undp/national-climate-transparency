import { Injectable } from "@nestjs/common";
import { ActionEntity } from "../entities/action.entity";
import { ActivityEntity } from "../entities/activity.entity";
import { LogEntity } from "../entities/log.entity";
import { ProgrammeEntity } from "../entities/programme.entity";
import { ProjectEntity } from "../entities/project.entity";
import { User } from "../entities/user.entity";
import { LogEventType, EntityType } from "../enums/shared.enum";
import { EntityManager } from "typeorm";
import { LinkActivitiesDto } from "../dtos/link.activities.dto";
import { UnlinkActivitiesDto } from "../dtos/unlink.activities.dto";
import { Sector } from "../enums/sector.enum";
import { SupportEntity } from "../entities/support.entity";
import { AchievementEntity } from "../entities/achievement.entity";

@Injectable()
export class LinkUnlinkService {

	async linkProgrammesToAction(
		action: ActionEntity,
		programmes: ProgrammeEntity[],
		payload: any,
		user: User,
		entityManager: EntityManager
	) {
		await entityManager
			.transaction(async (em) => {
				const logs = [];

				logs.push(
					this.buildLogEntity(
						LogEventType.PROGRAMME_LINKED,
						EntityType.ACTION,
						action.actionId,
						user.id,
						payload
					)
				)
				
				for (const programme of programmes) {
					programme.action = action;
					programme.path = action.actionId;
					programme.sector = action.sector;

					logs.push(this.buildLogEntity(LogEventType.LINKED_TO_ACTION, EntityType.PROGRAMME, programme.programmeId, user.id, payload))

					if (programme.validated) {
						programme.validated = false;
						logs.push(this.buildLogEntity(
							LogEventType.PROGRAMME_UNVERIFIED_DUE_ATTACHMENT_CHANGE,
							EntityType.PROGRAMME,
							programme.programmeId,
							0,
							action.actionId)
						)
					}

					const linkedProgramme = await em.save<ProgrammeEntity>(programme);

					if (linkedProgramme) {
						if (action.validated) {
							action.validated = false;
							await em.save<ActionEntity>(action)
							logs.push(this.buildLogEntity(
								LogEventType.ACTION_UNVERIFIED_DUE_ATTACHMENT_CHANGE,
								EntityType.ACTION,
								action.actionId,
								0,
								programme.programmeId)
							)
						}

						if (programme.activities && programme.activities.length > 0) {
							const activities = [];
							// update each activity's path that are directly linked to the programme
							for (const activity of programme.activities) {
								activity.sector = action.sector;
								activity.path = this.addActionToActivityPath(activity.path, action.actionId)

								// unvalidate the activity linked to programme
								if (activity.validated) {
									activity.validated = false;
									logs.push(this.buildLogEntity(
										LogEventType.ACTIVITY_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
										EntityType.ACTIVITY,
										activity.activityId,
										0,
										programme.programmeId)
									)
								}
								activities.push(activity);
							}
							await em.save<ActivityEntity>(activities)
						}
						if (programme.projects && programme.projects.length > 0) {
							const projects = [];
							for (const project of programme.projects) {
								// update project's path
								project.sector = action.sector;
								project.path = this.addActionToProjectPath(project.path, action.actionId);

								// unvalidate the linked projects
								if (project.validated) {
									project.validated = false;
									logs.push(this.buildLogEntity(
										LogEventType.PROJECT_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
										EntityType.PROJECT,
										project.projectId,
										0,
										programme.programmeId)
									)
								}
								projects.push(project);

								// update each activity's path that are linked to the project
								if (project.activities && project.activities.length > 0) {
									const activities = [];
									for (const activity of project.activities) {
										activity.sector = action.sector;
										activity.path = this.addActionToActivityPath(activity.path, action.actionId);

										// unvalidate the activity linked to project
										if (activity.validated) {
											activity.validated = false;
											logs.push(this.buildLogEntity(
												LogEventType.ACTIVITY_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
												EntityType.ACTIVITY,
												activity.activityId,
												0,
												programme.programmeId)
											)
										}
										activities.push(activity);
									}
									await em.save<ActivityEntity>(activities)
								}

							}
							await em.save<ProjectEntity>(projects)
						}
					}
				}
				
				await em.save<LogEntity>(logs);
			});
	}

	async unlinkProgrammesFromAction(
		programmes: ProgrammeEntity[],
		action: ActionEntity,
		payload: any,
		user: User,
		entityManager: EntityManager,
		achievementsToRemove: AchievementEntity[],
		isActionDelete: boolean
	) {
		await entityManager
			.transaction(async (em) => {
				const logs = [];

				for (const programme of programmes) {
					programme.action = null;
					programme.path = "";
					programme.sector = null;

					logs.push(this.buildLogEntity(LogEventType.UNLINKED_FROM_ACTION, EntityType.PROGRAMME, programme.programmeId, user.id, payload))

					if (programme.validated) {
						programme.validated = false;
						logs.push(
							this.buildLogEntity(
								(isActionDelete) ? LogEventType.PROGRAMME_UNVERIFIED_DUE_ATTACHMENT_DELETE : LogEventType.PROGRAMME_UNVERIFIED_DUE_ATTACHMENT_CHANGE, 
								EntityType.PROGRAMME, 
								programme.programmeId, 
								0, 
								(isActionDelete) ? action.actionId : payload
							)
						)
					}

					const unlinkedProgramme = await em.save<ProgrammeEntity>(programme);

					if (unlinkedProgramme) {

						if (programme?.action?.validated && !isActionDelete) {
							action.validated = false;
							logs.push(this.buildLogEntity(LogEventType.ACTION_UNVERIFIED_DUE_ATTACHMENT_CHANGE, EntityType.ACTION, action.actionId, 0, programme.programmeId))
							await em.save<ActionEntity>(action)
						}

						if (programme.activities && programme.activities.length > 0) {
							// update each activity's path that are directly linked to the programme
							const activities = [];
							for (const activity of programme.activities) {
								const parts = activity.path.split(".");
								activity.path = ["_", parts[1], parts[2]].join(".");
								activity.sector = null;

								// unvalidate the activity linked to programme
								if (activity.validated) {
									activity.validated = false;
									logs.push(this.buildLogEntity(
										LogEventType.ACTIVITY_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
										EntityType.ACTIVITY,
										activity.activityId,
										0,
										programme.programmeId)
									)
								}
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
								project.path = ["_", parts[1]].join(".");
								project.sector = null;

								// unvalidate the activity linked to programme
								if (project.validated) {
									project.validated = false;
									logs.push(this.buildLogEntity(
										LogEventType.PROJECT_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
										EntityType.PROJECT,
										project.projectId,
										0,
										programme.programmeId)
									)
								}
								projects.push(project);

								// update each activity's path that are linked to the project
								if (project.activities && project.activities.length > 0) {
									for (const activity of project.activities) {
										const parts = activity.path.split(".");
										activity.path = ["_", parts[1], parts[2]].join(".");
										activity.sector = null;

										// unvalidate the activity linked to project
										if (activity.validated) {
											activity.validated = false;
											logs.push(this.buildLogEntity(
												LogEventType.ACTIVITY_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
												EntityType.ACTIVITY,
												activity.activityId,
												0,
												project.projectId)
											)
										}
										activities.push(activity);
									}
								}

							}
						await em.save<ProjectEntity>(projects)
						await em.save<ActivityEntity>(activities)
							
						}
						
					}
				}
				if (achievementsToRemove.length > 0) {
					await this.deleteAchievements(achievementsToRemove, em);
				}
				await em.save<LogEntity>(logs);

			});
	}

	async updateActionChildrenSector(
		actionId: string,
		children: {
			haveChildren: boolean;
			programmeChildren: ProgrammeEntity[];
			projectChildren: ProjectEntity[];
			activityChildren: ActivityEntity[]
		},
		newSector: Sector,
		entityManager: EntityManager
	) {
		await entityManager
			.transaction(async (em) => {
				const logs = [];

				const programmes = []
				for (const programme of children.programmeChildren) {
					programme.sector = newSector;
					// unvalidate programme
					if (programme.validated) {
						programme.validated = false;
						logs.push(this.buildLogEntity(
							LogEventType.PROGRAMME_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
							EntityType.PROGRAMME,
							programme.programmeId,
							0,
							actionId)
						)
					}

					programmes.push(programme)
				}

				await em.save<ProgrammeEntity>(programmes);

				const projects = []
				for (const project of children.projectChildren) {
					project.sector = newSector;
					// unvalidate project
					if (project.validated) {
						project.validated = false;
						logs.push(this.buildLogEntity(
							LogEventType.PROJECT_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
							EntityType.PROJECT,
							project.projectId,
							0,
							actionId)
						)
					}
					projects.push(project)
				}

				await em.save<ProjectEntity>(projects);

				const activities = []
				for (const activity of children.activityChildren) {
					activity.sector = newSector;

					// unvalidate activity
					if (activity.validated) {
						activity.validated = false;
						logs.push(this.buildLogEntity(
							LogEventType.ACTIVITY_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
							EntityType.ACTIVITY,
							activity.activityId,
							0,
							actionId)
						)
					}

					activities.push(activity)

					const supports = []
					for (const support of activity.support) {
						support.sector = newSector;

						// unvalidate support
						if (support.validated) {
							support.validated = false;
							logs.push(this.buildLogEntity(
								LogEventType.SUPPORT_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
								EntityType.SUPPORT,
								support.supportId,
								0,
								actionId)
							)
						}
						supports.push(support)
					}

					await em.save<SupportEntity>(supports);
				}

				await em.save<ActivityEntity>(activities);
				await em.save<LogEntity>(logs);

			});
	}

	async linkProjectsToProgramme(programme: ProgrammeEntity, projects: ProjectEntity[], payload: any, user: User, entityManager: EntityManager) {
		const action = programme.action;

		await entityManager
			.transaction(async (em) => {
				const logs = [];

				for (const project of projects) {
					project.programme = programme;
					project.path = this.addProgrammeToProjectPath(project.path, programme.programmeId, programme.path);
					project.sector = programme.sector;

					// unvalidate project
					if (project.validated) {
						project.validated = false;
						logs.push(this.buildLogEntity(
							LogEventType.PROJECT_UNVERIFIED_DUE_ATTACHMENT_CHANGE,
							EntityType.PROJECT,
							project.projectId,
							0,
							programme.programmeId)
						)
					}

					const linkedProject = await em.save<ProjectEntity>(project);

					if (linkedProject) {
						const activities = [];
						const supports = [];
						if (project.activities && project.activities.length > 0) {
							for (const activity of project.activities) {
								if (activity.support && activity.support.length > 0) {
									activity.support.forEach((support) => {

										support.sector = programme.sector;
										// unvalidate support
										if (support.validated) {
											support.validated = false;
											logs.push(this.buildLogEntity(
												LogEventType.SUPPORT_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
												EntityType.SUPPORT,
												support.supportId,
												0,
												project.projectId)
											)
										}
										supports.push(support);
									});
								}
								activity.path = this.addProgrammeToActivityPath(activity.path, programme.programmeId, programme.path);
								activity.sector = programme.sector;

								// unvalidate activity
								if (activity.validated) {
									activity.validated = false;
									logs.push(this.buildLogEntity(
										LogEventType.ACTIVITY_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
										EntityType.ACTIVITY,
										activity.activityId,
										0,
										project.projectId)
									)
								}
								activities.push(activity);
							}
							await em.save<SupportEntity>(supports);
							await em.save<ActivityEntity>(activities);
						}

						logs.push(
							this.buildLogEntity(
								LogEventType.LINKED_TO_PROGRAMME,
								EntityType.PROJECT,
								project.projectId,
								user.id,
								payload
							)
						)
					}
				}
				if (programme.validated) {
					programme.validated = false;
					logs.push(this.buildLogEntity(
						LogEventType.PROGRAMME_UNVERIFIED_DUE_ATTACHMENT_CHANGE,
						EntityType.PROGRAMME,
						programme.programmeId,
						0,
						payload)
					)
					await em.save<ProgrammeEntity>(programme)
				}

				if (action && action.validated) {
					action.validated = false;
					logs.push(this.buildLogEntity(
						LogEventType.ACTION_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
						EntityType.ACTION,
						action.actionId,
						0,
						programme.programmeId)
					)
					await em.save<ActionEntity>(action)
				}

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
			});
	}

	async unlinkProjectsFromProgramme(
		projects: ProjectEntity[],
		payload: any,
		user: User,
		entityManager: EntityManager,
		achievementsToRemove: AchievementEntity[],
		isProgrammeDelete: boolean
	) {
		await entityManager
			.transaction(async (em) => {
				const logs = [];

				for (const project of projects) {

					const programme = project.programme;
					const action = project.programme?.action;

					logs.push(this.buildLogEntity(LogEventType.UNLINKED_FROM_PROGRAMME, EntityType.PROJECT, project.projectId, user.id, payload))

					// unvalidate programme
					if (programme?.validated && !isProgrammeDelete) {
						await this.unvalidateProgrammes(
							[project.programme],
							project.projectId,
							LogEventType.PROGRAMME_UNVERIFIED_DUE_ATTACHMENT_CHANGE,
							em
						)
					}

					if (action && action.validated) {
						await this.unvalidateAction(
							action,
							programme.programmeId,
							(isProgrammeDelete) ? LogEventType.ACTION_UNVERIFIED_DUE_ATTACHMENT_DELETE : LogEventType.ACTION_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
							em
						)
					}

					project.programme = null;
					project.path = `_._`;
					project.sector = null;

					// unvalidate project
					if (project.validated) {
						project.validated = false;
						logs.push(this.buildLogEntity(
							(isProgrammeDelete) ? LogEventType.PROJECT_UNVERIFIED_DUE_ATTACHMENT_DELETE : LogEventType.PROJECT_UNVERIFIED_DUE_ATTACHMENT_CHANGE,
							EntityType.PROJECT,
							project.projectId,
							0,
							programme.programmeId)
						)
					}

					const unlinkedProject = await em.save<ProjectEntity>(project);

					if (unlinkedProject) {
						const activities = [];
						const supports = [];
						if (project.activities && project.activities.length > 0) {
							for (const activity of project.activities) {
								if (activity.support && activity.support.length > 0) {
									activity.support.forEach((support) => {
										support.sector = null;

										// unvalidate project
										if (support.validated) {
											support.validated = false;
											logs.push(this.buildLogEntity(
												LogEventType.SUPPORT_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
												EntityType.SUPPORT,
												support.supportId,
												0,
												project.projectId)
											)
										}
										supports.push(support);
									});
								}
								activity.path = `_._.${project.projectId}`
								activity.sector = null;

								// unvalidate project
								if (activity.validated) {
									activity.validated = false;
									logs.push(this.buildLogEntity(
										LogEventType.ACTIVITY_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
										EntityType.ACTIVITY,
										activity.activityId,
										0,
										project.projectId)
									)
								}
								activities.push(activity);
							}
							await em.save<SupportEntity>(supports);
							await em.save<ActivityEntity>(activities);
						}
					}
				}
				if (achievementsToRemove?.length > 0) {
					await this.deleteAchievements(achievementsToRemove, em);
				}
				await em.save<LogEntity>(logs);
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
				const logs = [];
				let entityType;

				for (const activity of activities) {
					let logEventType;

					switch (linkActivitiesDto.parentType) {
						case EntityType.ACTION: {
							activity.path = `${linkActivitiesDto.parentId}._._`;
							logEventType = LogEventType.LINKED_TO_ACTION;
							entityType = EntityType.ACTION;
							activity.sector = parentEntity?.sector;
							break;
						}
						case EntityType.PROGRAMME: {
							activity.path = parentEntity.path && parentEntity.path.trim() !== '' ? `${parentEntity.path}.${linkActivitiesDto.parentId}._` : `_.${linkActivitiesDto.parentId}._`;
							logEventType = LogEventType.LINKED_TO_PROGRAMME;
							entityType = EntityType.PROGRAMME;
							activity.sector = parentEntity?.sector;
							break;
						}
						case EntityType.PROJECT: {
							activity.path = parentEntity.path && parentEntity.path.trim() !== '' ? `${parentEntity.path}.${linkActivitiesDto.parentId}` : `_._.${linkActivitiesDto.parentId}`;
							logEventType = LogEventType.LINKED_TO_PROJECT;
							entityType = EntityType.PROJECT;
							activity.sector = parentEntity?.sector;
							break;
						}
					}
					activity.parentId = linkActivitiesDto.parentId;
					activity.parentType = linkActivitiesDto.parentType;

					if (activity.validated) {
						activity.validated = false;
						logs.push(
							this.buildLogEntity(
								LogEventType.ACTIVITY_UNVERIFIED_DUE_ATTACHMENT_CHANGE,
								EntityType.ACTIVITY,
								activity.activityId,
								0,
								linkActivitiesDto.parentId
							)
						)
					}

					const linkedActivity = await em.save<ActivityEntity>(activity);

					if (linkedActivity) {
						const supports = [];
						if (activity.support && activity.support.length > 0) {
							activity.support.forEach((support) => {
								support.sector = linkedActivity.sector;

								if (support.validated) {
									support.validated = false;
									logs.push(
										this.buildLogEntity(
											LogEventType.SUPPORT_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
											EntityType.SUPPORT,
											support.supportId,
											0,
											linkActivitiesDto.parentId
										)
									)
								}
								supports.push(support);
							});
						}

						await em.save<SupportEntity>(supports);

						logs.push(
							this.buildLogEntity(
								logEventType,
								EntityType.ACTIVITY,
								activity.activityId,
								user.id,
								linkActivitiesDto.parentId
							)
						)
					}
				}
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
					activity.sector = null;
					activity.validated = false;

					const unlinkedActivity = await em.save<ActivityEntity>(activity);

					if (unlinkedActivity) {
						const supports = [];
						if (activity.support && activity.support.length > 0) {
							activity.support.forEach((support) => {
								support.sector = null;
								support.validated = false;
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
		parts[0] = currentProgrammePath && currentProgrammePath.trim() !== '' ? currentProgrammePath : "_";
		parts[1] = programmeId;
		return [parts[0], parts[1], parts[2]].join(".");
	}

	addProgrammeToProjectPath(currentProjectPath: string, programmeId: string, currentProgrammePath: string) {
		const parts = currentProjectPath.split(".");
		parts[0] = currentProgrammePath && currentProgrammePath.trim() !== '' ? currentProgrammePath : "_";
		parts[1] = programmeId;
		return [parts[0], parts[1]].join(".");
	}

	async unvalidateAction(
		action: ActionEntity,
		sourceEntityId: string,
		logType: LogEventType,
		entityManager: EntityManager
	) {
		await entityManager
			.transaction(async (em) => {
				const logs = [];
				if (action.validated) {
					action.validated = false;
					logs.push(
						this.buildLogEntity(
							logType,
							EntityType.ACTION,
							action.actionId,
							0,
							sourceEntityId
						)
					)
				}

				await em.save<ActionEntity>(action);
				await em.save<LogEntity>(logs);
			})
	}

	async unvalidateProgrammes(
		programmes: ProgrammeEntity[],
		sourceEntityId: string,
		logType: LogEventType,
		entityManager: EntityManager
	) {
		await entityManager
			.transaction(async (em) => {
				const logs = [];
				const unvalidatedProgrammes: ProgrammeEntity[] = [];

				for (const programme of programmes) {
					if (programme.validated) {
						programme.validated = false;
						unvalidatedProgrammes.push(programme);
						logs.push(
							this.buildLogEntity(
								logType,
								EntityType.PROGRAMME,
								programme.programmeId,
								0,
								sourceEntityId
							)
						)
					}

				}
				await em.save<ProgrammeEntity>(unvalidatedProgrammes);
				await em.save<LogEntity>(logs);
			})
	}

	async unvalidateProjects(
		projects: ProjectEntity[],
		sourceEntityId: string,
		logType: LogEventType,
		entityManager: EntityManager
	) {
		await entityManager
			.transaction(async (em) => {
				const logs = [];
				const unvalidatedProjects: ProjectEntity[] = [];

				for (const project of projects) {
					if (project.validated) {
						project.validated = false;
						unvalidatedProjects.push(project);
						logs.push(
							this.buildLogEntity(
								logType,
								EntityType.PROJECT,
								project.projectId,
								0,
								sourceEntityId
							)
						)
					}

				}
				await em.save<ProjectEntity>(unvalidatedProjects);
				await em.save<LogEntity>(logs);
			})
	}

	async unvalidateActivities(
		activities: ActivityEntity[],
		sourceEntityId: string,
		logType: LogEventType,
		entityManager: EntityManager
	) {
		await entityManager
			.transaction(async (em) => {
				const logs = [];
				const unvalidatedActivities: ActivityEntity[] = [];

				for (const activity of activities) {
					if (activity.validated) {
						activity.validated = false;
						unvalidatedActivities.push(activity);
						logs.push(
							this.buildLogEntity(
								logType,
								EntityType.ACTIVITY,
								activity.activityId,
								0,
								sourceEntityId
							)
						)
					}

				}
				await em.save<ActivityEntity>(unvalidatedActivities);
				await em.save<LogEntity>(logs);
			})
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