import { Injectable } from "@nestjs/common";
import { ActionEntity } from "../entities/action.entity";
import { ActivityEntity } from "../entities/activity.entity";
import { LogEntity } from "../entities/log.entity";
import { ProgrammeEntity } from "../entities/programme.entity";
import { ProjectEntity } from "../entities/project.entity";
import { User } from "../entities/user.entity";
import { LogEventType, EntityType } from "../enums/shared.enum";
import { EntityManager } from "typeorm";

@Injectable()
export class LinkUnlinkService {

	async linkProgrammesToAction(
		action: ActionEntity,
		programmes: ProgrammeEntity[],
		payload: any,
		user: User,
		entityManager: EntityManager
	) {
		const prog = await entityManager
			.transaction(async (em) => {
				for (const programme of programmes) {
					programme.action = action;
					programme.path = action.actionId;
					const linkedProgramme = await em.save<ProgrammeEntity>(programme);

					if (linkedProgramme) {
						if (programme.activities && programme.activities.length > 0) {
							// update each activity's path that are directly linked to the programme
							for (const activity of programme.activities) {
								// const parts = activity.path.split(".");
								// const partOne = parts[0].replace("_", action.actionId);
								// activity.path = [partOne, parts[1], parts[2]].join(".");
								activity.path = this.addActionToActivityPath(activity.path, action.actionId)
								await em.save<ActivityEntity>(activity);
							}
						}
						if (programme.projects && programme.projects.length > 0) {
							for (const project of programme.projects) {
								// update project's path
								// const parts = project.path.split(".");
								// const partOne = parts[0].replace("_", action.actionId);
								// project.path = [partOne, parts[1]].join(".");
								project.path = this.addActionToProjectPath(project.path, action.actionId);
								await em.save<ProjectEntity>(project);

								// update each activity's path that are linked to the project
								if (project.activities && project.activities.length > 0) {
									for (const activity of project.activities) {
										// const parts = activity.path.split(".");
										// const partOne = parts[0].replace("_", action.actionId);
										// activity.path = [partOne, parts[1], parts[2]].join(".");
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
			});
	}

	async unlinkProgrammesFromAction(
		programmes: ProgrammeEntity[],
		payload: any,
		user: User,
		entityManager: EntityManager
	) {
		const prog = await entityManager
			.transaction(async (em) => {
				for (const programme of programmes) {
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
				}
			});
	}

	async linkProjectsToProgramme(programme: ProgrammeEntity, projects: ProjectEntity[], payload: any, user: User, entityManager: EntityManager) {
		const proj = await entityManager
			.transaction(async (em) => {
				for (const project of projects) {
					project.programme = programme;
					project.path = this.addProgrammeToProjectPath(project.path, programme.programmeId);
					const linkedProject = await em.save<ProjectEntity>(project);

					if (linkedProject) {
						if (project.activities && project.activities.length > 0) {
							for (const activity of project.activities) {
								activity.path = this.addProgrammeToActivityPath(activity.path, programme.programmeId);
								await em.save<ActivityEntity>(activity);
							}
						}
						await em.save<LogEntity>(
							this.buildLogEntity(
								LogEventType.LINKED_TO_PROGRAMME,
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

	async unlinkProjectsFromProgramme(projects: ProjectEntity[], payload: any, user: User, entityManager: EntityManager) {
		const proj = await entityManager
			.transaction(async (em) => {
				for (const project of projects) {
					project.programme = null;
					project.path = `_._`;
					const unLinkedProgramme = await em.save<ProjectEntity>(project);

					if (unLinkedProgramme) {
						if (project.activities && project.activities.length > 0) {
							for (const activity of project.activities) {
								activity.path = `_._.${project.projectId}`
								await em.save<ActivityEntity>(activity);
							}
						}
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