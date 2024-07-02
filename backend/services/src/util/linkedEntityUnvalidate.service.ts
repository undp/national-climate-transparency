import { Injectable } from "@nestjs/common";
import { ActionEntity } from "../entities/action.entity";
import { LogEntity } from "../entities/log.entity";
import { ProgrammeEntity } from "../entities/programme.entity";
import { ProjectEntity } from "../entities/project.entity";
import { EntityType, LogEventType } from "../enums/shared.enum";
import { EntityManager } from "typeorm";

@Injectable()
export class LinkedEntityUnvalidateService {

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