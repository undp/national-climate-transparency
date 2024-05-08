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
							// update each activity's path that are directly linked to the programme
							for (const activity of programme.activities) {
								activity.path = this.addActionToActivityPath(activity.path, action.actionId)
								await em.save<ActivityEntity>(activity);
							}
						}
						if (programme.projects && programme.projects.length > 0) {
							for (const project of programme.projects) {
								// update project's path
								project.path = this.addActionToProjectPath(project.path, action.actionId);
								await em.save<ProjectEntity>(project);

								// update each activity's path that are linked to the project
								if (project.activities && project.activities.length > 0) {
									for (const activity of project.activities) {
										activity.path = this.addActionToActivityPath(activity.path, action.actionId)
										await em.save<ActivityEntity>(activity);
									}
								}

							}
						}
						await em.save<LogEntity>(
							this.buildLogEntity(
								LogEventType.LINKED_TO_ACTION,
								EntityType.PROGRAMME,
								programme.programmeId,
								user.id,
								payload
							)
						);
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
		entityManager: EntityManager
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
						for (const activity of programme.activities) {
							const parts = activity.path.split(".");
							activity.path = ["_", parts[1], parts[2]].join(".");
							await em.save<ActivityEntity>(activity);
						}
					}
					if (programme.projects && programme.projects.length > 0) {
						for (const project of programme.projects) {
							// update project's path
							const parts = project.path.split(".");
							// const partOne = parts[0].replace("_", action.actionId);
							project.path = ["_", parts[1]].join(".");
							await em.save<ProjectEntity>(project);

							// update each activity's path that are linked to the project
							if (project.activities && project.activities.length > 0) {
								for (const activity of project.activities) {
									const parts = activity.path.split(".");
									// const partOne = parts[0].replace("_", action.actionId);
									activity.path = ["_", parts[1], parts[2]].join(".");
									await em.save<ActivityEntity>(activity);
								}
							}

						}
					}
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
				const saveOperations: Promise<any>[] = [];

				for (const project of projects) {
					project.programme = programme;
					project.path = this.addProgrammeToProjectPath(project.path, programme.programmeId);
					project.sectors = programme.affectedSectors;
					const linkedProject = await em.save<ProjectEntity>(project);

					if (linkedProject) {
						// if (project.activities && project.activities.length > 0) {
						// 	for (const activity of project.activities) {
						// 		if (activity.support && activity.support.length > 0) {
						// 			for (const support of activity.support) {
						// 				support.sectors = programme.affectedSectors;
						// 				await em.save<SupportEntity>(support);
						// 			}
						// 		}
						// 		activity.path = this.addProgrammeToActivityPath(activity.path, programme.programmeId);
						// 		activity.sectors = programme.affectedSectors;
						// 		await em.save<ActivityEntity>(activity);
						// 	}
						// }
						// await em.save<LogEntity>(
						// 	this.buildLogEntity(
						// 		LogEventType.LINKED_TO_PROGRAMME,
						// 		EntityType.PROJECT,
						// 		project.projectId,
						// 		user.id,
						// 		payload
						// 	)
						// );

						if (project.activities && project.activities.length > 0) {
							for (const activity of project.activities) {
								if (activity.support && activity.support.length > 0) {
									activity.support.forEach((support) => {
										support.sectors = programme.affectedSectors;
										saveOperations.push(em.save<SupportEntity>(support));
									});
								}
								activity.path = this.addProgrammeToActivityPath(activity.path, programme.programmeId);
								activity.sectors = programme.affectedSectors;
								saveOperations.push(em.save<ActivityEntity>(activity));
							}
						}

						saveOperations.push(
							em.save<LogEntity>(
								this.buildLogEntity(
									LogEventType.LINKED_TO_PROGRAMME,
									EntityType.PROJECT,
									project.projectId,
									user.id,
									payload
								)
							)
						);
					}
				}
				await Promise.all(saveOperations);
			});
	}

	async unlinkProjectsFromProgramme(projects: ProjectEntity[], payload: any, user: User, entityManager: EntityManager) {
		const proj = await entityManager
			.transaction(async (em) => {
				const saveOperations: Promise<any>[] = [];

				for (const project of projects) {
					project.programme = null;
					project.path = `_._`;
					project.sectors = null;
					const unLinkedProgramme = await em.save<ProjectEntity>(project);

					if (unLinkedProgramme) {

						if (project.activities && project.activities.length > 0) {
							for (const activity of project.activities) {
								if (activity.support && activity.support.length > 0) {
									activity.support.forEach((support) => {
										support.sectors = null;
										saveOperations.push(em.save<SupportEntity>(support));
									});
								}
								activity.path = `_._.${project.projectId}`
								activity.sectors = null;
								saveOperations.push(em.save<ActivityEntity>(activity));
							}
						}

						saveOperations.push(
							em.save<LogEntity>(
								this.buildLogEntity(
									LogEventType.UNLINKED_FROM_PROGRAMME,
									EntityType.PROJECT,
									project.projectId,
									user.id,
									payload
								)
							)
						);

						// if (project.activities && project.activities.length > 0) {
						// 	for (const activity of project.activities) {
						// 		activity.path = `_._.${project.projectId}`
						// 		activity.sectors = null;
						// 		await em.save<ActivityEntity>(activity);
						// 	}
						// }
						// await em.save<LogEntity>(
						// 	this.buildLogEntity(
						// 		LogEventType.UNLINKED_FROM_PROGRAMME,
						// 		EntityType.PROJECT,
						// 		project.projectId,
						// 		user.id,
						// 		payload
						// 	)
						// );
					}
				}
				await Promise.all(saveOperations);
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
				const saveOperations: Promise<any>[] = [];
				for (const activity of activities) {
					let logEventType;
					switch (linkActivitiesDto.parentType) {
						case EntityType.ACTION: {
							activity.path = `${linkActivitiesDto.parentId}._._`;
							logEventType = LogEventType.LINKED_TO_ACTION;
							activity.sectors = parentEntity?.migratedData?.sectorsAffected;
							break;
						}
						case EntityType.PROGRAMME: {
							activity.path = parentEntity.path ? `${parentEntity.path}.${linkActivitiesDto.parentId}._` : `_.${linkActivitiesDto.parentId}._`;
							logEventType = LogEventType.LINKED_TO_PROGRAMME;
							activity.sectors = parentEntity?.affectedSectors;
							break;
						}
						case EntityType.PROJECT: {
							activity.path = parentEntity.path ? `${parentEntity.path}.${linkActivitiesDto.parentId}` : `_._.${linkActivitiesDto.parentId}`;
							logEventType = LogEventType.LINKED_TO_PROJECT;
							activity.sectors = parentEntity?.sectors;
							break;
						}
					}
					activity.parentId = linkActivitiesDto.parentId;
					activity.parentType = linkActivitiesDto.parentType;

					const linkedActivity = await em.save<ActivityEntity>(activity);

					if (linkedActivity) {
						if (activity.support && activity.support.length > 0) {
							activity.support.forEach((support) => {
								support.sectors = linkedActivity.sectors;
								saveOperations.push(em.save<SupportEntity>(support));
							});
						}
						saveOperations.push(
							em.save<LogEntity>(
								this.buildLogEntity(
									logEventType,
									EntityType.ACTIVITY,
									activity.activityId,
									user.id,
									linkActivitiesDto.parentId
								)
							)
						);
					}
				}
				await Promise.all(saveOperations);
			});

	}

	async unlinkActivitiesFromParent(
		activities: ActivityEntity[],
		unlinkActivitiesDto: UnlinkActivitiesDto,
		user: User,
		entityManager: EntityManager
	) {
		const act = await entityManager
			.transaction(async (em) => {
				const saveOperations: Promise<any>[] = [];
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
						if (activity.support && activity.support.length > 0) {
							activity.support.forEach((support) => {
								support.sectors = null;
								saveOperations.push(em.save<SupportEntity>(support));
							});
						}
						saveOperations.push(
							em.save<LogEntity>(
								this.buildLogEntity(
									logEventType,
									EntityType.ACTIVITY,
									activity.activityId,
									user.id,
									unlinkActivitiesDto
								)
							)
						);
					}
				}
				await Promise.all(saveOperations);
			});

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

	addProgrammeToActivityPath(currentActivityPath: string, programmeId: string) {
		const parts = currentActivityPath.split(".");
		parts[1] = programmeId;
		return [parts[0], parts[1], parts[2]].join(".");
	}

	addProgrammeToProjectPath(currentProjectPath: string, programmeId: string) {
		const parts = currentProjectPath.split(".");
		parts[0] = parts[0] ? parts[0] : "_";
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