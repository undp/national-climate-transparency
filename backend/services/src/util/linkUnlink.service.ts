import { Injectable } from "@nestjs/common";
import { ActionEntity } from "../entities/action.entity";
import { ActivityEntity } from "../entities/activity.entity";
import { LogEntity } from "../entities/log.entity";
import { ProgrammeEntity } from "../entities/programme.entity";
import { ProjectEntity } from "../entities/project.entity";
import { User } from "../entities/user.entity";
import { LogEventType, EntityType } from "../enums/shared.enum";
import { EntityManager, Repository } from "typeorm";
import { LinkActivitiesDto } from "../dtos/link.activities.dto";
import { UnlinkActivitiesDto } from "../dtos/unlink.activities.dto";
import { Sector } from "../enums/sector.enum";
import { SupportEntity } from "../entities/support.entity";
import { AchievementEntity } from "../entities/achievement.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class LinkUnlinkService {

	constructor(
		@InjectRepository(ProgrammeEntity) private programmeRepo: Repository<ProgrammeEntity>,
		@InjectRepository(ProjectEntity) private projectRepo: Repository<ProjectEntity>,
		@InjectRepository(ActivityEntity) private activityRepo: Repository<ActivityEntity>,
	) { }

	//MARK: Link Programmes To Action
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
				let programmeId;

				const updatedProgrammeIds = [];
				const updatedProjectIds = [];
				const updatedActivityIds = [];

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
					// programme.type = action.type;

					programmeId = programme.programmeId;

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

					updatedProgrammeIds.push(programme.programmeId);

					const linkedProgramme = await em.save<ProgrammeEntity>(programme);

					if (linkedProgramme) {

						if (programme.activities && programme.activities.length > 0) {
							const activities = [];
							const supports = [];

							// update each activity's path that are directly linked to the programme
							for (const activity of programme.activities) {
								activity.sector = action.sector;
								// activity.type = action.type;
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
								updatedActivityIds.push(activity.activityId);

								if (activity.support && activity.support.length > 0) {
									for (const support of activity.support) {
										support.sector = action.sector;
										// support.type = action.type;

										// unvalidate the activity linked to programme
										if (support.validated) {
											support.validated = false;
										}
										supports.push(support);
									}
								}
							}
							await em.save<SupportEntity>(supports);
							await em.save<ActivityEntity>(activities);


						}
						if (programme.projects && programme.projects.length > 0) {
							const projects = [];
							for (const project of programme.projects) {
								// update project's path
								project.sector = action.sector;
								// project.type = action.type;
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
								updatedProjectIds.push(project.projectId);

								// update each activity's path that are linked to the project
								if (project.activities && project.activities.length > 0) {
									const activities = [];
									const supports = [];

									for (const activity of project.activities) {
										activity.sector = action.sector;
										// activity.type = action.type;
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
										updatedActivityIds.push(activity.activityId);

										if (activity.support && activity.support.length > 0) {
											for (const support of activity.support) {
												support.sector = action.sector;
												// support.type = action.type;

												// unvalidate the activity linked to programme
												if (support.validated) {
													support.validated = false;
												}
												supports.push(support);
											}
										}
									}
									await em.save<SupportEntity>(supports);
									await em.save<ActivityEntity>(activities)
								}

							}
							await em.save<ProjectEntity>(projects)
						}
					}
				}

				if (action.validated) {
					action.validated = false;
					await em.save<ActionEntity>(action)
					logs.push(this.buildLogEntity(
						LogEventType.ACTION_UNVERIFIED_DUE_ATTACHMENT_CHANGE,
						EntityType.ACTION,
						action.actionId,
						0,
						programmeId)
					)
					await this.updateAllValidatedChildrenStatusByActionId(action.actionId, em, updatedProgrammeIds, updatedProjectIds, updatedActivityIds);
				}

				await em.save<LogEntity>(logs);
			});
	}

	//MARK: Unlink Programmes From Action
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
				let unvalidateActionTree = false;
				const updatedProjectIds = [];
				const updatedActivityIds = [];

				for (const programme of programmes) {
					const currentAction = programme.action;

					programme.action = null;
					programme.path = "";
					programme.sector = null;
					// programme.type = null;

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
						await this.updateAllValidatedChildrenAndParentStatusByProgrammeId(programme, em, true, updatedProjectIds, updatedActivityIds);
					}

					const unlinkedProgramme = await em.save<ProgrammeEntity>(programme);

					if (unlinkedProgramme) {

						if (currentAction && currentAction.validated && !isActionDelete) {
							action.validated = false;
							logs.push(this.buildLogEntity(LogEventType.ACTION_UNVERIFIED_DUE_ATTACHMENT_CHANGE, EntityType.ACTION, action.actionId, 0, programme.programmeId))
							await em.save<ActionEntity>(action)
							unvalidateActionTree = true;
						}

						if (programme.activities && programme.activities.length > 0) {
							// update each activity's path that are directly linked to the programme
							const activities = [];
							const supports = [];

							for (const activity of programme.activities) {
								const parts = activity.path.split(".");
								activity.path = ["_", parts[1], parts[2]].join(".");
								activity.sector = null;
								// activity.type = null;

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
								updatedActivityIds.push(activity.activityId);

								if (activity.support && activity.support.length > 0) {
									for (const support of activity.support) {
										support.sector = action.sector;
										// support.type = action.type;
	
										// unvalidate the activity linked to programme
										if (support.validated) {
											support.validated = false;
										}
										supports.push(support);
									}
								}

								
							}
							await em.save<ActivityEntity>(activities)
							await em.save<SupportEntity>(supports)
						}
						if (programme.projects && programme.projects.length > 0) {
							const projects = [];
							const activities = [];
							const supports = [];

							for (const project of programme.projects) {
								// update project's path
								const parts = project.path.split(".");
								project.path = ["_", parts[1]].join(".");
								project.sector = null;
								// project.type = null;

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
								updatedProjectIds.push(project.projectId);

								// update each activity's path that are linked to the project
								if (project.activities && project.activities.length > 0) {
									for (const activity of project.activities) {
										const parts = activity.path.split(".");
										activity.path = ["_", parts[1], parts[2]].join(".");
										activity.sector = null;
										// activity.type = null;

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
										updatedActivityIds.push(activity.activityId);

										if (activity.support && activity.support.length > 0) {
											for (const support of activity.support) {
												support.sector = action.sector;
												// support.type = action.type;
			
												// unvalidate the activity linked to programme
												if (support.validated) {
													support.validated = false;
												}
												supports.push(support);
											}
										}

										
									}
								}

							}
							await em.save<ProjectEntity>(projects)
							await em.save<ActivityEntity>(activities)
							await em.save<SupportEntity>(supports)
						}

					}
				}

				if (unvalidateActionTree) {
					await this.updateAllValidatedChildrenStatusByActionId(action.actionId, em, [], updatedProjectIds, updatedActivityIds);
				}

				if (achievementsToRemove.length > 0) {
					await this.deleteAchievements(achievementsToRemove, em);
				}
				await em.save<LogEntity>(logs);

			});
	}

	//MARK: Link Projects To Programme
	async linkProjectsToProgramme(programme: ProgrammeEntity, projects: ProjectEntity[], payload: any, user: User, entityManager: EntityManager) {
		const action = programme.action;

		await entityManager
			.transaction(async (em) => {
				const logs = [];
				const updatedProjectIds = [];
				const updatedActivityIds = [];

				for (const project of projects) {
					project.programme = programme;
					project.path = this.addProgrammeToProjectPath(project.path, programme.programmeId, programme.path);
					project.sector = programme.sector;
					// project.type = programme.type;

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

					updatedProjectIds.push(project.projectId);

					const linkedProject = await em.save<ProjectEntity>(project);

					if (linkedProject) {
						const activities = [];
						const supports = [];
						if (project.activities && project.activities.length > 0) {
							for (const activity of project.activities) {
								if (activity.support && activity.support.length > 0) {
									activity.support.forEach((support) => {

										support.sector = programme.sector;
										// support.type = programme.type;
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
								// activity.type = programme.type;

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
								updatedActivityIds.push(activity.activityId);
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

				logs.push(
					this.buildLogEntity(LogEventType.PROJECT_LINKED, EntityType.PROGRAMME, programme.programmeId, user.id, payload)
				)

				let unvalidateActionTree = false;

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

					if (action && action.validated) {
						action.validated = false;
						logs.push(this.buildLogEntity(
							LogEventType.ACTION_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
							EntityType.ACTION,
							action.actionId,
							0,
							programme.programmeId)
						)
						await em.save<ActionEntity>(action);

						unvalidateActionTree = true;
					}
				}

				await em.save<LogEntity>(logs);

				if (unvalidateActionTree) {
					await this.updateAllValidatedChildrenStatusByActionId(action.actionId, em, [programme.programmeId], updatedProjectIds, updatedActivityIds);
				} else {
					await this.updateAllValidatedChildrenAndParentStatusByProgrammeId(programme, em, true, updatedProjectIds, updatedActivityIds);
				}

			});
	}

	//MARK: Unlink Projects From Programme
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
				const updatedProjectIds = [];
				const updatedActivityIds = [];

				for (const project of projects) {
					let unvalidateProjectTree = false;
					const programme = project.programme;
					const action = project.programme?.action;

					logs.push(this.buildLogEntity(LogEventType.UNLINKED_FROM_PROGRAMME, EntityType.PROJECT, project.projectId, user.id, payload))

					project.programme = null;
					project.path = `_._`;
					project.sector = null;
					// project.type = null;

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
						unvalidateProjectTree = true;
					}

					updatedProjectIds.push(project.projectId);

					const unlinkedProject = await em.save<ProjectEntity>(project);

					if (unlinkedProject) {
						const activities = [];
						const supports = [];
						if (project.activities && project.activities.length > 0) {
							for (const activity of project.activities) {
								if (activity.support && activity.support.length > 0) {
									activity.support.forEach((support) => {
										support.sector = null;
										// support.type = null;

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
								// activity.type = null;

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
								updatedActivityIds.push(activity.activityId);
							}
							await em.save<SupportEntity>(supports);
							await em.save<ActivityEntity>(activities);
						}

						if (action && action.validated) {
							action.validated = false;
							logs.push(this.buildLogEntity(
								(isProgrammeDelete) ? LogEventType.ACTION_UNVERIFIED_DUE_ATTACHMENT_DELETE : LogEventType.ACTION_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
								EntityType.ACTION,
								action.actionId,
								0,
								programme.programmeId)
							)
							await em.save<ActionEntity>(action)
							await this.updateAllValidatedChildrenStatusByActionId(action.actionId, em, [], updatedProjectIds, updatedActivityIds);

						} else if (programme.validated && !isProgrammeDelete) {
							programme.validated = false;
							logs.push(this.buildLogEntity(
								LogEventType.PROGRAMME_UNVERIFIED_DUE_ATTACHMENT_CHANGE,
								EntityType.PROGRAMME,
								programme.programmeId,
								0,
								payload)
							)
							await em.save<ProgrammeEntity>(programme)
							await this.updateAllValidatedChildrenAndParentStatusByProgrammeId(programme, em, true, updatedProjectIds, updatedActivityIds);

						}

						if (isProgrammeDelete && unvalidateProjectTree) {
							await this.updateAllValidatedChildrenAndParentStatusByProject(project, em, true, updatedActivityIds);
						}

					}
				}
				if (achievementsToRemove?.length > 0) {
					await this.deleteAchievements(achievementsToRemove, em);
				}
				await em.save<LogEntity>(logs);
			});
	}

	//MARK: Link Activities To Parent
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
				let rootNodeType: EntityType;
				let rootId: string;

				for (const activity of activities) {
					let logEventType;

					switch (linkActivitiesDto.parentType) {
						case EntityType.ACTION: {
							activity.path = `${linkActivitiesDto.parentId}._._`;
							logEventType = LogEventType.LINKED_TO_ACTION;
							entityType = EntityType.ACTION;
							activity.sector = parentEntity?.sector;
							// activity.type = parentEntity?.type;

							rootNodeType = EntityType.ACTION;
							rootId = linkActivitiesDto.parentId;

							break;
						}
						case EntityType.PROGRAMME: {
							activity.path = parentEntity.path && parentEntity.path.trim() !== '' ? `${parentEntity.path}.${linkActivitiesDto.parentId}._` : `_.${linkActivitiesDto.parentId}._`;
							logEventType = LogEventType.LINKED_TO_PROGRAMME;
							entityType = EntityType.PROGRAMME;
							activity.sector = parentEntity?.sector;
							// activity.type = parentEntity?.type;

							rootNodeType = (parentEntity.path) ? EntityType.ACTION : EntityType.PROGRAMME;
							rootId = (parentEntity.path) ? parentEntity.path : linkActivitiesDto.parentId;
							break;
						}
						case EntityType.PROJECT: {
							activity.path = parentEntity.path && parentEntity.path.trim() !== '' ? `${parentEntity.path}.${linkActivitiesDto.parentId}` : `_._.${linkActivitiesDto.parentId}`;
							logEventType = LogEventType.LINKED_TO_PROJECT;
							entityType = EntityType.PROJECT;
							activity.sector = parentEntity?.sector;
							// activity.type = parentEntity?.type;

							const parts = parentEntity.path?.split(".");
							if (parts && parts.length > 0) {
								if (parts[0] !== '_') {
									rootNodeType = EntityType.ACTION;
									rootId = parts[0];
								} else if (parts[1] !== '_') {
									rootNodeType = EntityType.PROGRAMME;
									rootId = parts[1];
								} else {
									rootNodeType = EntityType.PROJECT;
									rootId = linkActivitiesDto.parentId;
								}
							}

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
								// support.type = linkedActivity.type;

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

				if (rootNodeType == EntityType.ACTION) {
					await this.updateAllValidatedChildrenStatusByActionId(rootId, em);
				} else if (rootNodeType == EntityType.PROGRAMME) {
					const programme = await this.findProgrammeById(rootId);
					await this.updateAllValidatedChildrenAndParentStatusByProgrammeId(programme, em, true);
				} else {
					const project = await this.findProjectById(rootId);
					await this.updateAllValidatedChildrenAndParentStatusByProject(project, em, true);
				}
				await em.save<LogEntity>(logs);
			});
	}

	//MARK: Unlink Activities From Parent
	async unlinkActivitiesFromParent(
		activities: ActivityEntity[],
		unlinkActivitiesDto: UnlinkActivitiesDto,
		user: User,
		entityManager: EntityManager,
		achievementsToRemove: AchievementEntity[]
	) {
		const act = await entityManager
			.transaction(async (em) => {

				let rootNodeType: EntityType;
				let rootId: string;

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

					const parts = activity.path?.split(".");
					if (parts && parts.length > 0) {
						if (parts[0] !== '_') {
							rootNodeType = EntityType.ACTION;
							rootId = parts[0];
						} else if (parts[1] !== '_') {
							rootNodeType = EntityType.PROGRAMME;
							rootId = parts[1];
						} else {
							rootNodeType = EntityType.PROJECT;
							rootId = parts[2];
						}
					}

					activity.parentId = null;
					activity.parentType = null;
					activity.path = '_._._';
					activity.sector = null;
					// activity.type = null;
					activity.validated = false;

					const unlinkedActivity = await em.save<ActivityEntity>(activity);

					if (unlinkedActivity) {
						const supports = [];
						if (activity.support && activity.support.length > 0) {
							activity.support.forEach((support) => {
								support.sector = null;
								// support.type = null;
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

					if (rootNodeType == EntityType.ACTION) {
						await this.updateAllValidatedChildrenStatusByActionId(rootId, em);
					} else if (rootNodeType == EntityType.PROGRAMME) {
						const programme = await this.findProgrammeById(rootId);
						await this.updateAllValidatedChildrenAndParentStatusByProgrammeId(programme, em, true);
					} else {
						const project = await this.findProjectById(rootId);
						await this.updateAllValidatedChildrenAndParentStatusByProject(project, em, true);
					}
				}
			});

	}

	//MARK: Delete Achievements
	// Adding here to avoid circular dependencies
	async deleteAchievements(achievements: any[], em: EntityManager) {
		const queryBuilder = em.createQueryBuilder()
			.delete()
			.from(AchievementEntity);

		for (const achievement of achievements) {
			queryBuilder.orWhere('"kpiId" = :kpiId AND "activityId" = :activityId', { kpiId: achievement.kpiId, activityId: achievement.activityId });
		}

		const query = queryBuilder.getQueryAndParameters();

		const result = await queryBuilder.execute();
		return result;
	}

	//MARK: Add Action To Activity Path
	addActionToActivityPath(currentActivityPath: string, actionId: string) {
		const parts = currentActivityPath.split(".");
		parts[0] = actionId;
		return [parts[0], parts[1], parts[2]].join(".");
	}

	//MARK: Add Action To Project Path
	addActionToProjectPath(currentProjectPath: string, actionId: string) {
		const parts = currentProjectPath.split(".");
		parts[0] = actionId;
		return [parts[0], parts[1]].join(".");
	}

	//MARK: Add Programme To Activity Path
	addProgrammeToActivityPath(currentActivityPath: string, programmeId: string, currentProgrammePath: string) {
		const parts = currentActivityPath.split(".");
		parts[0] = currentProgrammePath && currentProgrammePath.trim() !== '' ? currentProgrammePath : "_";
		parts[1] = programmeId;
		return [parts[0], parts[1], parts[2]].join(".");
	}

	//MARK: Add Programme To Project Path
	addProgrammeToProjectPath(currentProjectPath: string, programmeId: string, currentProgrammePath: string) {
		const parts = currentProjectPath.split(".");
		parts[0] = currentProgrammePath && currentProgrammePath.trim() !== '' ? currentProgrammePath : "_";
		parts[1] = programmeId;
		return [parts[0], parts[1]].join(".");
	}

	//MARK: Update Action Children Sector
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
					programmes.push(programme)
				}

				await em.save<ProgrammeEntity>(programmes);

				const projects = []
				for (const project of children.projectChildren) {
					project.sector = newSector;
					projects.push(project)
				}

				await em.save<ProjectEntity>(projects);

				const activities = []
				for (const activity of children.activityChildren) {
					activity.sector = newSector;
					activities.push(activity)

					const supports = []
					for (const support of activity.support) {
						support.sector = newSector;
						supports.push(support)
					}

					await em.save<SupportEntity>(supports);
				}

				await em.save<ActivityEntity>(activities);
				await em.save<LogEntity>(logs);

				await this.updateAllValidatedChildrenStatusByActionId(actionId, em);

			});
	}

	//MARK: Unvalidate Action Children
	async updateAllValidatedChildrenStatusByActionId(
		actionId: string,
		entityManager: EntityManager,
		excludeProgrammeIds: string[] = [],
		excludeProjectIds: string[] = [],
		excludeActivityIds: string[] = []
	) {

		const programmeQuery = this.programmeRepo.createQueryBuilder('programme')
			.where('programme.actionId = :actionId AND programme.validated IS TRUE', { actionId });

		if (excludeProgrammeIds.length > 0) {
			programmeQuery.andWhere('programme.programmeId NOT IN (:...excludeProgrammeIds)', { excludeProgrammeIds });
		}

		const programmeChildren = await programmeQuery.getMany();

		// Fetch and update validated projects
		const projectQuery = this.projectRepo.createQueryBuilder('project')
			.where("subpath(project.path, 0, 1) = :actionId AND project.validated IS TRUE", { actionId });
		if (excludeProjectIds.length > 0) {
			projectQuery.andWhere('project.projectId NOT IN (:...excludeProjectIds)', { excludeProjectIds });
		}
		const projectChildren = await projectQuery.getMany();

		const activityQuery = this.activityRepo.createQueryBuilder('activity')
			.leftJoinAndSelect('activity.support', 'support')
			.where('subpath(activity.path, 0, 1) = :actionId AND activity.validated = true', { actionId });
		if (excludeActivityIds.length > 0) {
			activityQuery.andWhere('activity.activityId NOT IN (:...excludeActivityIds)', { excludeActivityIds });
		}

		const activityChildren = await activityQuery.getMany();

		if ((programmeChildren.length > 0) || (projectChildren.length > 0) || (activityChildren.length > 0)) {

			await entityManager
				.transaction(async (em) => {
					const logs = [];

					const programmeIdsToUnvalidate = []
					for (const programme of programmeChildren) {
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
						programmeIdsToUnvalidate.push(programme.programmeId);
					}

					if (programmeIdsToUnvalidate.length > 0) {
						await em.createQueryBuilder()
						  .update(ProgrammeEntity)
						  .set({ validated: false })
						  .whereInIds(programmeIdsToUnvalidate)
						  .execute();
					}

					const projectIdsToUnvalidate = []
					for (const project of projectChildren) {
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

						projectIdsToUnvalidate.push(project.projectId);
					}

					if (projectIdsToUnvalidate.length > 0) {
						await em.createQueryBuilder()
						  .update(ProjectEntity)
						  .set({ validated: false })
						  .whereInIds(projectIdsToUnvalidate)
						  .execute();
					}

					const activityIdsToUnvalidate = []
					for (const activity of activityChildren) {
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
						activityIdsToUnvalidate.push(activity.activityId);

						if (activity.support && activity.support.length > 0) {
							const supportIdsToUnvalidate = []
							for (const support of activity.support) {
								support.validated = false;
								supportIdsToUnvalidate.push(support.supportId);
							}

							if (supportIdsToUnvalidate.length > 0) {
								await em.createQueryBuilder()
								  .update(SupportEntity)
								  .set({ validated: false })
								  .whereInIds(supportIdsToUnvalidate)
								  .execute();
							}

						}
					}

					if (activityIdsToUnvalidate.length > 0) {
						await em.createQueryBuilder()
						  .update(ActivityEntity)
						  .set({ validated: false })
						  .whereInIds(activityIdsToUnvalidate)
						  .execute();
					}

					await em.save<LogEntity>(logs);

				});
		}
	}

	//MARK: Unvalidate Programme Children
	async updateAllValidatedChildrenAndParentStatusByProgrammeId(
		programme: ProgrammeEntity,
		entityManager: EntityManager,
		skipParentUpdate: boolean,
		excludeProjectIds: string[] = [],
		excludeActivityIds: string[] = []
	) {
		const programmeId = programme.programmeId;
		const action = programme.action;

		const projectQuery = this.projectRepo.createQueryBuilder('project')
			.where("subpath(project.path, 1, 1) = :programmeId AND project.validated IS TRUE", { programmeId });
		if (excludeProjectIds.length > 0) {
			projectQuery.andWhere('project.projectId NOT IN (:...excludeProjectIds)', { excludeProjectIds });
		}
		const projectChildren = await projectQuery.getMany();

		const activityQuery = this.activityRepo.createQueryBuilder('activity')
			.leftJoinAndSelect('activity.support', 'support')
			.where("subpath(activity.path, 1, 1) = :programmeId AND activity.validated IS TRUE", { programmeId });
		if (excludeActivityIds.length > 0) {
			activityQuery.andWhere('activity.activityId NOT IN (:...excludeActivityIds)', { excludeActivityIds });
		}

		const activityChildren = await activityQuery.getMany();

		if ((projectChildren.length > 0) || (activityChildren.length > 0) || action) {

			await entityManager
				.transaction(async (em) => {
					const logs = [];

					if (action && action.validated && !skipParentUpdate) {
						action.validated = false;
						logs.push(this.buildLogEntity(
							LogEventType.ACTION_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
							EntityType.ACTION,
							action.actionId,
							0,
							programme.programmeId)
						);
						await em.update<ActionEntity>(ActionEntity, action.actionId, { validated: false });

						await this.updateAllValidatedChildrenStatusByActionId(action.actionId, em, [programme.programmeId], excludeProjectIds, excludeActivityIds);

					} else {
						const projectIdsToUnvalidate = []
						for (const project of projectChildren) {
							project.validated = false;
							logs.push(this.buildLogEntity(
								LogEventType.PROJECT_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
								EntityType.PROJECT,
								project.projectId,
								0,
								programme.programmeId)
							);
							projectIdsToUnvalidate.push(project.projectId);
						}

						if (projectIdsToUnvalidate.length > 0) {
							await em.createQueryBuilder()
							  .update(ProjectEntity)
							  .set({ validated: false })
							  .whereInIds(projectIdsToUnvalidate)
							  .execute();
						}

						const activityIdsToUnvalidate = []
						for (const activity of activityChildren) {
							activity.validated = false;

							logs.push(this.buildLogEntity(
								LogEventType.ACTIVITY_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
								EntityType.ACTIVITY,
								activity.activityId,
								0,
								programme.programmeId)
							);
							activityIdsToUnvalidate.push(activity.activityId);

							if (activity.support && activity.support.length > 0) {
								const supportIdsToUnvalidate = []
								for (const support of activity.support) {
									support.validated = false;

									logs.push(this.buildLogEntity(
										LogEventType.SUPPORT_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
										EntityType.SUPPORT,
										support.supportId,
										0,
										programme.programmeId)
									);
									supportIdsToUnvalidate.push(support.supportId);
								}

								if (supportIdsToUnvalidate.length > 0) {
									await em.createQueryBuilder()
									  .update(SupportEntity)
									  .set({ validated: false })
									  .whereInIds(supportIdsToUnvalidate)
									  .execute();
								}
							}
						}

						if (activityIdsToUnvalidate.length > 0) {
							await em.createQueryBuilder()
							  .update(ActivityEntity)
							  .set({ validated: false })
							  .whereInIds(activityIdsToUnvalidate)
							  .execute();
						}
					}


					await em.save<LogEntity>(logs);

				});
		}
	}

	//MARK: Update linked validated entities by Project
	async updateAllValidatedChildrenAndParentStatusByProject(
		project: ProjectEntity,
		entityManager: EntityManager,
		skipParentUpdate: boolean,
		excludeActivityIds: string[] = []
	) {
		const projectId = project.projectId;
		const programme = project.programme;

		const activityQuery = this.activityRepo.createQueryBuilder('activity')
			.leftJoinAndSelect('activity.support', 'support')
			.where("subpath(activity.path, 2, 1) = :projectId AND activity.validated IS TRUE", { projectId });
		if (excludeActivityIds.length > 0) {
			activityQuery.andWhere('activity.activityId NOT IN (:...excludeActivityIds)', { excludeActivityIds });
		}

		const activityChildren = await activityQuery.getMany();

		if ((activityChildren.length > 0) || programme) {

			await entityManager
				.transaction(async (em) => {
					const logs = [];
					const updatedActivityIds = []

					const activities = []
					for (const activity of activityChildren) {
						activity.validated = false;

						logs.push(this.buildLogEntity(
							LogEventType.ACTIVITY_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
							EntityType.ACTIVITY,
							activity.activityId,
							0,
							projectId)
						);
						updatedActivityIds.push(activity.activityId)
						activities.push(activity)

						if (activity.support && activity.support.length > 0) {
							const supports = []
							for (const support of activity.support) {
								support.validated = false;

								logs.push(this.buildLogEntity(
									LogEventType.SUPPORT_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
									EntityType.SUPPORT,
									support.supportId,
									0,
									projectId)
								);
								supports.push(support)
							}

							await em.save<SupportEntity>(supports);
						}
					}
					if (programme && programme.validated && !skipParentUpdate) {
						programme.validated = false;
						logs.push(this.buildLogEntity(
							LogEventType.PROGRAMME_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
							EntityType.PROGRAMME,
							programme.programmeId,
							0,
							projectId)
						);
						await em.save<ProgrammeEntity>(programme);

						await this.updateAllValidatedChildrenAndParentStatusByProgrammeId(programme, em, false, [projectId], updatedActivityIds);
					}

					await em.save<ActivityEntity>(activities);
					await em.save<LogEntity>(logs);

				});
		}
	}

	//MARK: Update linked validated entities by activityId
	async updateAllValidatedChildrenAndParentStatusByActivityId(
		activityId: string,
		entityManager: EntityManager,
		excludeSupportIds: string[] = []
	) {

		const activity = await this.findActivityByIdWithSupports(activityId, excludeSupportIds);

		if (activity) {

			await entityManager
				.transaction(async (em) => {
					if (activity.support && activity.support.length > 0) {
						const supports = []
						for (const support of activity.support) {
							support.validated = false;
							supports.push(support)
						}

						await em.save<SupportEntity>(supports);
					}


				});
		}
	}

	//MARK: Find Project by Id
	async findProjectById(projectId: string) {
		return await this.projectRepo.createQueryBuilder('project')
			.where('project.projectId = :projectId', { projectId })
			.getOne();
	}

	//MARK: Find Programme By Id
	async findProgrammeById(programmeId: string) {
		return await this.programmeRepo.createQueryBuilder('programme')
			.where('programme.programmeId = :programmeId', { programmeId })
			.getOne();
	}

	//MARK: Find All Programme By Ids
	async findAllProgrammeByIds(programmeIds: string[]) {
		return await this.programmeRepo.createQueryBuilder('programme')
			.leftJoinAndSelect('programme.action', 'action')
			.leftJoinAndSelect('programme.projects', 'project')
			.leftJoinAndMapMany(
				"programme.activities",
				ActivityEntity,
				"programmeActivity", // Unique alias for programme activities
				"programmeActivity.parentType = :programme AND programmeActivity.parentId = programme.programmeId",
				{ programme: EntityType.PROGRAMME }
			)
			.leftJoinAndMapMany(
				"programmeActivity.support",
				SupportEntity,
				"programmeActivitySupport",
				"programmeActivitySupport.activityId = programmeActivity.activityId"
			)
			.leftJoinAndMapMany(
				"project.activities",
				ActivityEntity,
				"projectActivity", // Unique alias for project activities
				"projectActivity.parentType = :project AND projectActivity.parentId = project.projectId",
				{ project: EntityType.PROJECT }
			)
			.leftJoinAndMapMany(
				"projectActivity.support",
				SupportEntity,
				"projectActivitySupport",
				"projectActivitySupport.activityId = projectActivity.activityId"
			)
			.where('programme.programmeId IN (:...programmeIds)', { programmeIds })
			.getMany();
	}

	async findActivityByIdWithSupports(activityId: string, excludeSupportIds: string[] = []) {

		const activityQuery = this.activityRepo.createQueryBuilder('activity')
			.leftJoinAndSelect('activity.support', 'support')
			.where('activity.activityId = :activityId', { activityId })
		if (excludeSupportIds.length > 0) {
			activityQuery.andWhere('support.supportId NOT IN (:...excludeSupportIds)', { excludeSupportIds });
		}
		return await activityQuery.getOne();
	}

	getParentIdFromPath(path: string): { parentId: string | null, rootEntityType: string | null } {
		if (!path) return { parentId: null, rootEntityType: null };

		const parts = path.split('.');
		if (parts.length > 0 && parts[0] !== '_') {
			return { parentId: parts[0], rootEntityType: EntityType.ACTION };
		} else if (parts.length > 1 && parts[1] !== '_') {
			return { parentId: parts[1], rootEntityType: EntityType.PROGRAMME };
		} else if (parts.length > 2 && parts[2] !== '_') {
			return { parentId: parts[2], rootEntityType: EntityType.PROJECT };
		}

		return { parentId: null, rootEntityType: null };
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