import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { ProgrammeEntity } from '../entities/programme.entity';
import { ProjectEntity } from '../entities/project.entity';
import { User } from '../entities/user.entity';
import { LogEventType, EntityType } from '../enums/shared.enum';
import { ActionEntity } from '../entities/action.entity';
import { Sector } from '../enums/sector.enum';
import { LinkUnlinkService } from './linkUnlink.service';
import { LinkProgrammesDto } from '../dtos/link.programmes.dto';
import { UnlinkProgrammesDto } from '../dtos/unlink.programmes.dto';
import { LinkProjectsDto } from '../dtos/link.projects.dto';
import { UnlinkProjectsDto } from '../dtos/unlink.projects.dto';
import { LinkActivitiesDto } from '../dtos/link.activities.dto';
import { ActivityEntity } from '../entities/activity.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SupportEntity } from '../entities/support.entity';
import { AchievementEntity } from '../entities/achievement.entity';

describe('LinkUnlinkService', () => {
	let service: LinkUnlinkService;
	let em: EntityManager;
	let entityManagerMock: Partial<EntityManager>;
	let programmeRepositoryMock: Partial<Repository<ProgrammeEntity>>;
	let projectRepositoryMock: Partial<Repository<ProjectEntity>>;
	let activityRepositoryMock: Partial<Repository<ActivityEntity>>;

	beforeEach(async () => {
		entityManagerMock = {
			transaction: jest.fn(),
		};

		programmeRepositoryMock = {
			save: jest.fn(),
			createQueryBuilder: jest.fn(() => ({
				where: jest.fn().mockReturnThis(),
				getMany: jest.fn(),
			})) as unknown as () => SelectQueryBuilder<ProgrammeEntity>,
		};
		projectRepositoryMock = {
			save: jest.fn(),
			createQueryBuilder: jest.fn(() => ({
				where: jest.fn().mockReturnThis(),
				getMany: jest.fn(),
			})) as unknown as () => SelectQueryBuilder<ProjectEntity>,
		};
		activityRepositoryMock = {
			save: jest.fn(),
			createQueryBuilder: jest.fn(() => ({
				where: jest.fn().mockReturnThis(),
				getMany: jest.fn(),
			})) as unknown as () => SelectQueryBuilder<ActivityEntity>,
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LinkUnlinkService,
				{ provide: EntityManager, useValue: entityManagerMock },
				{
					provide: getRepositoryToken(ProgrammeEntity),
					useValue: programmeRepositoryMock,
				},
				{
					provide: getRepositoryToken(ProjectEntity),
					useValue: projectRepositoryMock,
				},
				{
					provide: getRepositoryToken(ActivityEntity),
					useValue: activityRepositoryMock,
				},
			],
		}).compile();

		service = module.get<LinkUnlinkService>(LinkUnlinkService);
		em = module.get<EntityManager>(EntityManager);
	});

	describe('linkUnlinkProgrammes', () => {
		it('should link programme to action and save logs, acton not validated', async () => {

			const user = new User();
			user.sector = [Sector.Agriculture]

			const action = new ActionEntity();
			action.actionId = "A001";
			action.validated = false

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;
			activity.support = [support]
			activity.path = "_.P001.J001"

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = false;
			project.activities = [activity];
			project.path = "_.P001"

			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.action = null;
			programme.sector = Sector.Agriculture;
			programme.validated = true;
			programme.projects = [project];

			const payload = new LinkProgrammesDto();

			const updateAllValidatedChildrenStatusByActionIdMock = jest.spyOn(service, 'updateAllValidatedChildrenStatusByActionId');

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
				};
				const updatedProgramme = await callback(emMock);

				expect(programme.action).toBe(action);
				expect(programme.path).toBe(action.actionId);
				expect(project.path).toBe("A001.P001");
				expect(activity.path).toBe("A001.P001.J001");

				expect(programme.validated).toBe(false);
				expect(project.validated).toBe(false);
				expect(activity.validated).toBe(false);
				expect(support.validated).toBe(false);

				expect(emMock.save).toHaveBeenCalledTimes(5);

				return updatedProgramme;
			});

			const buildLogEntitySpy = jest.spyOn(service, 'buildLogEntity');
			await service.linkProgrammesToAction(action, [programme], payload, user, em);

			expect(buildLogEntitySpy).toHaveBeenCalledWith(LogEventType.LINKED_TO_ACTION, EntityType.PROGRAMME, programme.programmeId, user.id, payload);
			expect(entityManagerMock.transaction).toHaveBeenCalled();
			expect(updateAllValidatedChildrenStatusByActionIdMock).toBeCalledTimes(0);
		});

		it('should link programme to action and save logs, acton validated, action children should unvalidated', async () => {

			const user = new User();
			user.sector = [Sector.Agriculture]

			const action = new ActionEntity();
			action.actionId = "A001";
			action.validated = true

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;
			activity.support = [support]
			activity.path = "_.P001.J001"

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = false;
			project.activities = [activity];
			project.path = "_.P001"

			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.action = null;
			programme.sector = Sector.Agriculture;
			programme.validated = true;
			programme.projects = [project];

			const payload = new LinkProgrammesDto();

			jest.spyOn(service, 'updateAllValidatedChildrenStatusByActionId').mockResolvedValue(null);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
				};
				const updatedProgramme = await callback(emMock);

				expect(programme.action).toBe(action);
				expect(programme.path).toBe(action.actionId);
				expect(project.path).toBe("A001.P001");
				expect(activity.path).toBe("A001.P001.J001");

				expect(action.validated).toBe(false);
				expect(programme.validated).toBe(false);
				expect(project.validated).toBe(false);
				expect(activity.validated).toBe(false);
				expect(support.validated).toBe(false);

				expect(emMock.save).toHaveBeenCalledTimes(6);

				return updatedProgramme;
			});

			const buildLogEntitySpy = jest.spyOn(service, 'buildLogEntity');
			await service.linkProgrammesToAction(action, [programme], payload, user, em);

			expect(buildLogEntitySpy).toHaveBeenCalledWith(LogEventType.LINKED_TO_ACTION, EntityType.PROGRAMME, programme.programmeId, user.id, payload);
			expect(entityManagerMock.transaction).toHaveBeenCalled();
			expect(service.updateAllValidatedChildrenStatusByActionId).toBeCalledTimes(1);
		});

		it('should unlink programme from action, with action kpi achievements, not action delete', async () => {
			const unlinkProgrammesDto: UnlinkProgrammesDto = { programme: '1' };
			const user = new User();
			user.sector = [Sector.Agriculture]

			const action = new ActionEntity();
			action.actionId = "A001";
			action.validated = true;

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;
			activity.support = [support]
			activity.path = "A001.P001.J001"

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = false;
			project.activities = [activity];
			project.path = "A001.P001"

			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.action = null;
			programme.sector = Sector.Agriculture;
			programme.validated = true;
			programme.projects = [project];
			programme.action = action;
			programme.path = "A001";

			const achievementsToRemove = [new AchievementEntity()]

			const deleteAchievementsMock = jest.spyOn(service, "deleteAchievements").mockReturnValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenStatusByActionId').mockResolvedValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenAndParentStatusByProgrammeId').mockResolvedValue(null);


			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
				};
				const updatedProgrammes = await callback(emMock);

				expect(programme.action).toBeNull();
				expect(programme.path).toBe('');
				expect(project.path).toBe("_.P001");
				expect(activity.path).toBe("_.P001.J001");

				expect(action.validated).toBe(false);
				expect(programme.validated).toBe(false);
				expect(project.validated).toBe(false);
				expect(activity.validated).toBe(false);
				expect(support.validated).toBe(false);

				expect(emMock.save).toHaveBeenCalledTimes(6);

				return updatedProgrammes;
			});

			const buildLogEntitySpy = jest.spyOn(service, 'buildLogEntity');
			await service.unlinkProgrammesFromAction([programme], action, unlinkProgrammesDto, user, em, achievementsToRemove, false);

			expect(buildLogEntitySpy).toBeCalledWith(LogEventType.UNLINKED_FROM_ACTION, EntityType.PROGRAMME, programme.programmeId, user.id, unlinkProgrammesDto);
			expect(entityManagerMock.transaction).toHaveBeenCalled();
			expect(deleteAchievementsMock).toHaveBeenCalledTimes(1);
			expect(service.updateAllValidatedChildrenStatusByActionId).toHaveBeenCalledTimes(1);
			expect(service.updateAllValidatedChildrenAndParentStatusByProgrammeId).toHaveBeenCalledTimes(1);
		});

		it('should unlink programme from action, with action kpi achievements, is action delete', async () => {
			const unlinkProgrammesDto: UnlinkProgrammesDto = { programme: '1' };
			const user = new User();
			user.sector = [Sector.Agriculture]

			const action = new ActionEntity();
			action.actionId = "A001";
			action.validated = true;

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;
			activity.support = [support]
			activity.path = "A001.P001.J001"

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;
			project.activities = [activity];
			project.path = "A001.P001"

			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.action = null;
			programme.sector = Sector.Agriculture;
			programme.validated = true;
			programme.projects = [project];
			programme.action = action;
			programme.path = "A001";

			const achievementsToRemove = [new AchievementEntity()]

			const deleteAchievementsMock = jest.spyOn(service, "deleteAchievements").mockReturnValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenStatusByActionId').mockResolvedValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenAndParentStatusByProgrammeId').mockResolvedValue(null);


			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
				};
				const updatedProgrammes = await callback(emMock);

				expect(programme.action).toBeNull();
				expect(programme.path).toBe('');
				expect(project.path).toBe("_.P001");
				expect(activity.path).toBe("_.P001.J001");

				expect(programme.validated).toBe(false);
				expect(project.validated).toBe(false);
				expect(activity.validated).toBe(false);
				expect(support.validated).toBe(false);

				expect(emMock.save).toHaveBeenCalledTimes(5);

				return updatedProgrammes;
			});

			const buildLogEntitySpy = jest.spyOn(service, 'buildLogEntity');
			await service.unlinkProgrammesFromAction([programme], action, unlinkProgrammesDto, user, em, achievementsToRemove, true);

			expect(buildLogEntitySpy).toBeCalledWith(LogEventType.UNLINKED_FROM_ACTION, EntityType.PROGRAMME, programme.programmeId, user.id, unlinkProgrammesDto);
			expect(entityManagerMock.transaction).toHaveBeenCalled();
			expect(deleteAchievementsMock).toHaveBeenCalledTimes(1);
			expect(service.updateAllValidatedChildrenStatusByActionId).toHaveBeenCalledTimes(0);
			expect(service.updateAllValidatedChildrenAndParentStatusByProgrammeId).toHaveBeenCalledTimes(1);
		});

		it('should unlink programme from action, no action kpi achievements, is action delete', async () => {
			const unlinkProgrammesDto: UnlinkProgrammesDto = { programme: '1' };
			const user = new User();
			user.sector = [Sector.Agriculture]

			const action = new ActionEntity();
			action.actionId = "A001";
			action.validated = true;

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;
			activity.support = [support]
			activity.path = "A001.P001.J001"

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;
			project.activities = [activity];
			project.path = "A001.P001"

			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.action = null;
			programme.sector = Sector.Agriculture;
			programme.validated = true;
			programme.projects = [project];
			programme.action = action;
			programme.path = "A001";

			const deleteAchievementsMock = jest.spyOn(service, "deleteAchievements").mockReturnValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenStatusByActionId').mockResolvedValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenAndParentStatusByProgrammeId').mockResolvedValue(null);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
				};
				const updatedProgrammes = await callback(emMock);

				expect(programme.action).toBeNull();
				expect(programme.path).toBe('');
				expect(project.path).toBe("_.P001");
				expect(activity.path).toBe("_.P001.J001");

				expect(programme.validated).toBe(false);
				expect(project.validated).toBe(false);
				expect(activity.validated).toBe(false);
				expect(support.validated).toBe(false);

				expect(emMock.save).toHaveBeenCalledTimes(5);

				return updatedProgrammes;
			});

			const buildLogEntitySpy = jest.spyOn(service, 'buildLogEntity');
			await service.unlinkProgrammesFromAction([programme], action, unlinkProgrammesDto, user, em, [], true);

			expect(buildLogEntitySpy).toBeCalledWith(LogEventType.UNLINKED_FROM_ACTION, EntityType.PROGRAMME, programme.programmeId, user.id, unlinkProgrammesDto);
			expect(entityManagerMock.transaction).toHaveBeenCalled();
			expect(deleteAchievementsMock).toHaveBeenCalledTimes(0);
			expect(service.updateAllValidatedChildrenStatusByActionId).toHaveBeenCalledTimes(0);
			expect(service.updateAllValidatedChildrenAndParentStatusByProgrammeId).toHaveBeenCalledTimes(1);
		});
	});

	describe('linkUnlinkProjects', () => {
		it('should link project to programme, project programme action verified', async () => {
			const linkProjectsDto: LinkProjectsDto = { programmeId: 'P001', projectIds: ['J001'] };
			const user = new User();
			user.sector = [Sector.Agriculture]

			const action = new ActionEntity();
			action.actionId = "A001";
			action.validated = true;

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;
			activity.support = [support]
			activity.path = "_._.J001"

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;
			project.activities = [activity];
			project.path = "_._"

			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.action = null;
			programme.sector = Sector.Agriculture;
			programme.validated = true;
			programme.action = action;
			programme.path = "A001";

			jest.spyOn(service, 'updateAllValidatedChildrenStatusByActionId').mockResolvedValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenAndParentStatusByProgrammeId').mockResolvedValue(null);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProjectEntity()]),
				};
				const updatedProjects = await callback(emMock);

				expect(project.programme).toBe(programme);
				expect(project.path).toBe("A001.P001");
				expect(activity.path).toBe("A001.P001.J001");

				expect(action.validated).toBe(false);
				expect(programme.validated).toBe(false);
				expect(project.validated).toBe(false);
				expect(activity.validated).toBe(false);
				expect(support.validated).toBe(false);

				expect(emMock.save).toHaveBeenCalledTimes(6);

				return updatedProjects;
			});

			const buildLogEntitySpy = jest.spyOn(service, 'buildLogEntity');
			await service.linkProjectsToProgramme(programme, [project], linkProjectsDto, user, em);

			expect(buildLogEntitySpy).toBeCalledWith(LogEventType.LINKED_TO_PROGRAMME, EntityType.PROJECT, project.projectId, user.id, linkProjectsDto);
			expect(entityManagerMock.transaction).toHaveBeenCalled();
			expect(service.updateAllValidatedChildrenStatusByActionId).toHaveBeenCalledTimes(1);
			expect(service.updateAllValidatedChildrenAndParentStatusByProgrammeId).toHaveBeenCalledTimes(0);
		});

		it('should link project to programme, project programme verified, programme not linked to action', async () => {
			const linkProjectsDto: LinkProjectsDto = { programmeId: 'P001', projectIds: ['J001'] };
			const user = new User();
			user.sector = [Sector.Agriculture]

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;
			activity.support = [support]
			activity.path = "_._.J001"

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;
			project.activities = [activity];
			project.path = "_._"

			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.action = null;
			programme.sector = Sector.Agriculture;
			programme.validated = true;
			programme.path = "";

			jest.spyOn(service, 'updateAllValidatedChildrenStatusByActionId').mockResolvedValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenAndParentStatusByProgrammeId').mockResolvedValue(null);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProjectEntity()]),
				};
				const updatedProjects = await callback(emMock);

				expect(project.programme).toBe(programme);
				expect(project.path).toBe("_.P001");
				expect(activity.path).toBe("_.P001.J001");

				expect(programme.validated).toBe(false);
				expect(project.validated).toBe(false);
				expect(activity.validated).toBe(false);
				expect(support.validated).toBe(false);

				expect(emMock.save).toHaveBeenCalledTimes(5);

				return updatedProjects;
			});

			const buildLogEntitySpy = jest.spyOn(service, 'buildLogEntity');
			await service.linkProjectsToProgramme(programme, [project], linkProjectsDto, user, em);

			expect(buildLogEntitySpy).toBeCalledWith(LogEventType.LINKED_TO_PROGRAMME, EntityType.PROJECT, project.projectId, user.id, linkProjectsDto);
			expect(entityManagerMock.transaction).toHaveBeenCalled();
			expect(service.updateAllValidatedChildrenStatusByActionId).toHaveBeenCalledTimes(0);
			expect(service.updateAllValidatedChildrenAndParentStatusByProgrammeId).toHaveBeenCalledTimes(1);
		});

		it('should unlink project from programme, with programme kpi achievements, project programme action verified, not programme delete', async () => {
			const unlinkProjectsDto: UnlinkProjectsDto = { projects: ['J001'] };
			const user = new User();
			user.sector = [Sector.Agriculture]

			const action = new ActionEntity();
			action.actionId = "A001";
			action.validated = true;

			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.action = null;
			programme.sector = Sector.Agriculture;
			programme.validated = true;
			programme.action = action;
			programme.path = "A001";

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;
			activity.support = [support]
			activity.path = "A001.P001.J001"

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;
			project.activities = [activity];
			project.path = "A001.P001";
			project.programme = programme;

			const achievementsToRemove = [new AchievementEntity()]

			const deleteAchievementsMock = jest.spyOn(service, "deleteAchievements").mockReturnValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenStatusByActionId').mockResolvedValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenAndParentStatusByProgrammeId').mockResolvedValue(null);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
				};
				const updatedProgrammes = await callback(emMock);

				expect(project.programme).toBe(null);
				expect(project.path).toBe("_._");
				expect(activity.path).toBe("_._.J001");

				expect(project.validated).toBe(false);
				expect(activity.validated).toBe(false);
				expect(support.validated).toBe(false);

				expect(emMock.save).toHaveBeenCalledTimes(5);

				return updatedProgrammes;
			});

			const buildLogEntitySpy = jest.spyOn(service, 'buildLogEntity');
			await service.unlinkProjectsFromProgramme([project], unlinkProjectsDto, user, em, achievementsToRemove, false);

			expect(buildLogEntitySpy).toBeCalledWith(LogEventType.UNLINKED_FROM_PROGRAMME, EntityType.PROJECT, project.projectId, user.id, unlinkProjectsDto);
			expect(entityManagerMock.transaction).toHaveBeenCalled();
			expect(deleteAchievementsMock).toHaveBeenCalledTimes(1);
			expect(service.updateAllValidatedChildrenStatusByActionId).toHaveBeenCalledTimes(1);
			expect(service.updateAllValidatedChildrenAndParentStatusByProgrammeId).toHaveBeenCalledTimes(0);
		});

		it('should unlink project from programme, with programme kpi achievements, project programme verified, not programme delete', async () => {
			const unlinkProjectsDto: UnlinkProjectsDto = { projects: ['J001'] };
			const user = new User();
			user.sector = [Sector.Agriculture]

			const action = new ActionEntity();
			action.actionId = "A001";
			action.validated = false;

			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.action = null;
			programme.sector = Sector.Agriculture;
			programme.validated = true;
			programme.action = action;
			programme.path = "A001";

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;
			activity.support = [support]
			activity.path = "A001.P001.J001"

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;
			project.activities = [activity];
			project.path = "A001.P001";
			project.programme = programme;

			const achievementsToRemove = [new AchievementEntity()]

			const deleteAchievementsMock = jest.spyOn(service, "deleteAchievements").mockReturnValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenStatusByActionId').mockResolvedValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenAndParentStatusByProgrammeId').mockResolvedValue(null);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
				};
				const updatedProgrammes = await callback(emMock);

				expect(project.programme).toBe(null);
				expect(project.path).toBe("_._");
				expect(activity.path).toBe("_._.J001");

				expect(project.validated).toBe(false);
				expect(activity.validated).toBe(false);
				expect(support.validated).toBe(false);

				expect(emMock.save).toHaveBeenCalledTimes(5);

				return updatedProgrammes;
			});

			const buildLogEntitySpy = jest.spyOn(service, 'buildLogEntity');
			await service.unlinkProjectsFromProgramme([project], unlinkProjectsDto, user, em, achievementsToRemove, false);

			expect(buildLogEntitySpy).toBeCalledWith(LogEventType.UNLINKED_FROM_PROGRAMME, EntityType.PROJECT, project.projectId, user.id, unlinkProjectsDto);
			expect(entityManagerMock.transaction).toHaveBeenCalled();
			expect(deleteAchievementsMock).toHaveBeenCalledTimes(1);
			expect(service.updateAllValidatedChildrenStatusByActionId).toHaveBeenCalledTimes(0);
			expect(service.updateAllValidatedChildrenAndParentStatusByProgrammeId).toHaveBeenCalledTimes(1);
		});

		it('should unlink project from programme, with programme kpi achievements, project programme verified, not programme delete', async () => {
			const unlinkProjectsDto: UnlinkProjectsDto = { projects: ['J001'] };
			const user = new User();
			user.sector = [Sector.Agriculture]

			const action = new ActionEntity();
			action.actionId = "A001";
			action.validated = false;

			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.action = null;
			programme.sector = Sector.Agriculture;
			programme.validated = true;
			programme.action = action;
			programme.path = "A001";

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;
			activity.support = [support]
			activity.path = "A001.P001.J001"

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;
			project.activities = [activity];
			project.path = "A001.P001";
			project.programme = programme;

			const achievementsToRemove = [new AchievementEntity()]

			const deleteAchievementsMock = jest.spyOn(service, "deleteAchievements").mockReturnValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenStatusByActionId').mockResolvedValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenAndParentStatusByProgrammeId').mockResolvedValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenAndParentStatusByProject').mockResolvedValue(null);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
				};
				const updatedProgrammes = await callback(emMock);

				expect(project.programme).toBe(null);
				expect(project.path).toBe("_._");
				expect(activity.path).toBe("_._.J001");

				expect(project.validated).toBe(false);
				expect(activity.validated).toBe(false);
				expect(support.validated).toBe(false);

				expect(emMock.save).toHaveBeenCalledTimes(5);

				return updatedProgrammes;
			});

			const buildLogEntitySpy = jest.spyOn(service, 'buildLogEntity');
			await service.unlinkProjectsFromProgramme([project], unlinkProjectsDto, user, em, achievementsToRemove, false);

			expect(buildLogEntitySpy).toBeCalledWith(LogEventType.UNLINKED_FROM_PROGRAMME, EntityType.PROJECT, project.projectId, user.id, unlinkProjectsDto);
			expect(entityManagerMock.transaction).toHaveBeenCalled();
			expect(deleteAchievementsMock).toHaveBeenCalledTimes(1);
			expect(service.updateAllValidatedChildrenStatusByActionId).toHaveBeenCalledTimes(0);
			expect(service.updateAllValidatedChildrenAndParentStatusByProgrammeId).toHaveBeenCalledTimes(1);
			expect(service.updateAllValidatedChildrenAndParentStatusByProject).toHaveBeenCalledTimes(0);
		});

		it('should unlink project from programme, with programme kpi achievements, action project programme verified, is programme delete', async () => {
			const unlinkProjectsDto: UnlinkProjectsDto = { projects: ['J001'] };
			const user = new User();
			user.sector = [Sector.Agriculture]

			const action = new ActionEntity();
			action.actionId = "A001";
			action.validated = true;

			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.action = null;
			programme.sector = Sector.Agriculture;
			programme.validated = true;
			programme.action = action;
			programme.path = "A001";

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;
			activity.support = [support]
			activity.path = "A001.P001.J001"

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;
			project.activities = [activity];
			project.path = "A001.P001";
			project.programme = programme;

			const achievementsToRemove = [new AchievementEntity()]

			const deleteAchievementsMock = jest.spyOn(service, "deleteAchievements").mockReturnValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenStatusByActionId').mockResolvedValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenAndParentStatusByProgrammeId').mockResolvedValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenAndParentStatusByProject').mockResolvedValue(null);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
				};
				const updatedProgrammes = await callback(emMock);

				expect(project.programme).toBe(null);
				expect(project.path).toBe("_._");
				expect(activity.path).toBe("_._.J001");

				expect(project.validated).toBe(false);
				expect(activity.validated).toBe(false);
				expect(support.validated).toBe(false);

				expect(emMock.save).toHaveBeenCalledTimes(5);

				return updatedProgrammes;
			});

			const buildLogEntitySpy = jest.spyOn(service, 'buildLogEntity');
			await service.unlinkProjectsFromProgramme([project], unlinkProjectsDto, user, em, achievementsToRemove, true);

			expect(buildLogEntitySpy).toBeCalledWith(LogEventType.UNLINKED_FROM_PROGRAMME, EntityType.PROJECT, project.projectId, user.id, unlinkProjectsDto);
			expect(entityManagerMock.transaction).toHaveBeenCalled();
			expect(deleteAchievementsMock).toHaveBeenCalledTimes(1);
			expect(service.updateAllValidatedChildrenStatusByActionId).toHaveBeenCalledTimes(1);
			expect(service.updateAllValidatedChildrenAndParentStatusByProgrammeId).toHaveBeenCalledTimes(0);
			expect(service.updateAllValidatedChildrenAndParentStatusByProject).toHaveBeenCalledTimes(1);
		});

		it('should unlink project from programme, with programme kpi achievements, project programme verified, is programme delete', async () => {
			const unlinkProjectsDto: UnlinkProjectsDto = { projects: ['J001'] };
			const user = new User();
			user.sector = [Sector.Agriculture]

			const action = new ActionEntity();
			action.actionId = "A001";
			action.validated = false;

			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.action = null;
			programme.sector = Sector.Agriculture;
			programme.validated = true;
			programme.action = action;
			programme.path = "A001";

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;
			activity.support = [support]
			activity.path = "A001.P001.J001"

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;
			project.activities = [activity];
			project.path = "A001.P001";
			project.programme = programme;

			const achievementsToRemove = [new AchievementEntity()]

			const deleteAchievementsMock = jest.spyOn(service, "deleteAchievements").mockReturnValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenStatusByActionId').mockResolvedValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenAndParentStatusByProgrammeId').mockResolvedValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenAndParentStatusByProject').mockResolvedValue(null);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
				};
				const updatedProgrammes = await callback(emMock);

				expect(project.programme).toBe(null);
				expect(project.path).toBe("_._");
				expect(activity.path).toBe("_._.J001");

				expect(project.validated).toBe(false);
				expect(activity.validated).toBe(false);
				expect(support.validated).toBe(false);

				expect(emMock.save).toHaveBeenCalledTimes(4);

				return updatedProgrammes;
			});

			const buildLogEntitySpy = jest.spyOn(service, 'buildLogEntity');
			await service.unlinkProjectsFromProgramme([project], unlinkProjectsDto, user, em, achievementsToRemove, true);

			expect(buildLogEntitySpy).toBeCalledWith(LogEventType.UNLINKED_FROM_PROGRAMME, EntityType.PROJECT, project.projectId, user.id, unlinkProjectsDto);
			expect(entityManagerMock.transaction).toHaveBeenCalled();
			expect(deleteAchievementsMock).toHaveBeenCalledTimes(1);
			expect(service.updateAllValidatedChildrenStatusByActionId).toHaveBeenCalledTimes(0);
			expect(service.updateAllValidatedChildrenAndParentStatusByProgrammeId).toHaveBeenCalledTimes(0);
			expect(service.updateAllValidatedChildrenAndParentStatusByProject).toHaveBeenCalledTimes(1);
		});

	});


	describe('linkUnlinkActivities', () => {

		it('should link activities to programme, programme validated', async () => {
			const linkActivitiesDto: LinkActivitiesDto = { parentId: 'P001', parentType: EntityType.PROGRAMME, activityIds: ['T001'] };
			const user = new User();
			user.sector = [Sector.Agriculture]

			const programme = new ProgrammeEntity();
			programme.programmeId = "P001";
			programme.sector = Sector.Agriculture;
			programme.validated = true;

			const activity = new ActivityEntity();
			activity.activityId = 'T001';
			activity.path = ""
			activity.parentId = null;
			activity.parentType = null;

			jest.spyOn(service, 'findProgrammeById').mockResolvedValue(programme);
			jest.spyOn(service, 'updateAllValidatedChildrenStatusByActionId').mockResolvedValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenAndParentStatusByProgrammeId').mockResolvedValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenAndParentStatusByProject').mockResolvedValue(null);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ActivityEntity()]),
				};
				const updatedProjects = await callback(emMock);

				expect(activity.parentId).toBe("P001");
				expect(activity.parentType).toBe(EntityType.PROGRAMME);
				expect(activity.path).toBe("_.P001._");
				expect(activity.sector).toEqual(Sector.Agriculture);

				expect(emMock.save).toHaveBeenCalledTimes(3);
				return updatedProjects;
			});

			const buildLogEntitySpy = jest.spyOn(service, 'buildLogEntity');
			await service.linkActivitiesToParent(programme, [activity], linkActivitiesDto, user, em);

			expect(buildLogEntitySpy).toBeCalledWith(LogEventType.LINKED_TO_PROGRAMME, EntityType.ACTIVITY, activity.activityId, user.id, linkActivitiesDto.parentId);

			expect(entityManagerMock.transaction).toHaveBeenCalled();
			expect(service.updateAllValidatedChildrenStatusByActionId).toHaveBeenCalledTimes(0);
			expect(service.updateAllValidatedChildrenAndParentStatusByProgrammeId).toHaveBeenCalledTimes(1);
			expect(service.updateAllValidatedChildrenAndParentStatusByProject).toHaveBeenCalledTimes(0);

		});

	});

	describe('updateActionChildrenSector', () => {
		it('should update action children sector', async () => {
			const user = new User();
			user.sector = [Sector.Agriculture, Sector.Forestry]

			const action = new ActionEntity();
			action.actionId = "A001";
			action.validated = false;

			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.action = null;
			programme.sector = Sector.Forestry;
			programme.validated = true;
			programme.action = action;
			programme.path = "A001";

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;
			activity.support = [support]
			activity.path = "A001.P001.J001"

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;
			project.activities = [activity];
			project.path = "A001.P001";
			project.programme = programme;

			jest.spyOn(service, 'updateAllValidatedChildrenStatusByActionId').mockResolvedValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenAndParentStatusByProgrammeId').mockResolvedValue(null);
			jest.spyOn(service, 'updateAllValidatedChildrenAndParentStatusByProject').mockResolvedValue(null);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
				};
				const updatedProgrammes = await callback(emMock);

				expect(programme.sector).toBe(Sector.Agriculture);
				expect(project.sector).toBe(Sector.Agriculture);
				expect(activity.sector).toBe(Sector.Agriculture);
				expect(support.sector).toBe(Sector.Agriculture);

				expect(emMock.save).toHaveBeenCalledTimes(5);

				return updatedProgrammes;
			});

			await service.updateActionChildrenSector("A001", {
				haveChildren: true,
				programmeChildren: [programme],
				projectChildren: [project],
				activityChildren: [activity],
			}, Sector.Agriculture, em);

			expect(entityManagerMock.transaction).toHaveBeenCalled();
			expect(service.updateAllValidatedChildrenStatusByActionId).toHaveBeenCalledTimes(1);
			expect(service.updateAllValidatedChildrenAndParentStatusByProgrammeId).toHaveBeenCalledTimes(0);
			expect(service.updateAllValidatedChildrenAndParentStatusByProject).toHaveBeenCalledTimes(0);
		});

	});

	describe('updateAllValidatedChildrenStatusByActionId', () => {
		it('should update action children validation status', async () => {
			const user = new User();
			user.sector = [Sector.Agriculture, Sector.Forestry]

			const action = new ActionEntity();
			action.actionId = "A001";
			action.validated = false;

			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.action = null;
			programme.sector = Sector.Forestry;
			programme.validated = true;
			programme.path = "A001";

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;
			activity.support = [support]
			activity.path = "A001.P001.J001"

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;
			project.activities = [activity];
			project.path = "A001.P001";

			const queryBuilderProgrammeMock: Partial<SelectQueryBuilder<ProgrammeEntity>> = {
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValueOnce([programme]),
			};

			const queryBuilderProjectMock: Partial<SelectQueryBuilder<ProjectEntity>> = {
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValueOnce([project]),
			};

			const queryBuilderActivityMock: Partial<SelectQueryBuilder<ActivityEntity>> = {
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValueOnce([activity]),
			};

			jest.spyOn(programmeRepositoryMock, 'createQueryBuilder').mockReturnValue(queryBuilderProgrammeMock as SelectQueryBuilder<ProgrammeEntity>);
			jest.spyOn(projectRepositoryMock, 'createQueryBuilder').mockReturnValue(queryBuilderProjectMock as SelectQueryBuilder<ProjectEntity>);
			jest.spyOn(activityRepositoryMock, 'createQueryBuilder').mockReturnValue(queryBuilderActivityMock as SelectQueryBuilder<ActivityEntity>);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
				};
				const updatedProgrammes = await callback(emMock);

				expect(programme.validated).toBe(false);
				expect(project.validated).toBe(false);
				expect(activity.validated).toBe(false);
				expect(support.validated).toBe(false);

				expect(emMock.save).toHaveBeenCalledTimes(5);

				return updatedProgrammes;
			});

			await service.updateAllValidatedChildrenStatusByActionId("A001", em);

			expect(entityManagerMock.transaction).toHaveBeenCalled();
		});

	});

	describe('updateAllValidatedChildrenAndParentStatusByProgrammeId', () => {
		it('should update programme children validation status, not update parent', async () => {
			const user = new User();
			user.sector = [Sector.Agriculture, Sector.Forestry]

			const action = new ActionEntity();
			action.actionId = "A001";
			action.validated = false;

			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.action = null;
			programme.sector = Sector.Forestry;
			programme.validated = true;
			programme.path = "A001";

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;
			activity.support = [support]
			activity.path = "A001.P001.J001"

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;
			project.activities = [activity];
			project.path = "A001.P001";

			const queryBuilderProjectMock: Partial<SelectQueryBuilder<ProjectEntity>> = {
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValueOnce([project]),
			};

			const queryBuilderActivityMock: Partial<SelectQueryBuilder<ActivityEntity>> = {
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValueOnce([activity]),
			};

			jest.spyOn(projectRepositoryMock, 'createQueryBuilder').mockReturnValue(queryBuilderProjectMock as SelectQueryBuilder<ProjectEntity>);
			jest.spyOn(activityRepositoryMock, 'createQueryBuilder').mockReturnValue(queryBuilderActivityMock as SelectQueryBuilder<ActivityEntity>);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
				};
				const updatedProgrammes = await callback(emMock);

				expect(project.validated).toBe(false);
				expect(activity.validated).toBe(false);
				expect(support.validated).toBe(false);

				expect(emMock.save).toHaveBeenCalledTimes(4);

				return updatedProgrammes;
			});

			await service.updateAllValidatedChildrenAndParentStatusByProgrammeId(programme, em, true);

			expect(entityManagerMock.transaction).toHaveBeenCalled();
		});

		it('should update programme children validation status, update parent', async () => {
			const user = new User();
			user.sector = [Sector.Agriculture, Sector.Forestry]

			const action = new ActionEntity();
			action.actionId = "A001";
			action.validated = true;

			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.action = null;
			programme.sector = Sector.Forestry;
			programme.validated = true;
			programme.path = "A001";
			programme.action = action;

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;
			activity.support = [support]
			activity.path = "A001.P001.J001"

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;
			project.activities = [activity];
			project.path = "A001.P001";

			const queryBuilderProjectMock: Partial<SelectQueryBuilder<ProjectEntity>> = {
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValueOnce([project]),
			};

			const queryBuilderActivityMock: Partial<SelectQueryBuilder<ActivityEntity>> = {
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValueOnce([activity]),
			};

			jest.spyOn(projectRepositoryMock, 'createQueryBuilder').mockReturnValue(queryBuilderProjectMock as SelectQueryBuilder<ProjectEntity>);
			jest.spyOn(activityRepositoryMock, 'createQueryBuilder').mockReturnValue(queryBuilderActivityMock as SelectQueryBuilder<ActivityEntity>);
			jest.spyOn(service, 'updateAllValidatedChildrenStatusByActionId').mockResolvedValue(null);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
				};
				const updatedProgrammes = await callback(emMock);

				expect(action.validated).toBe(false);

				expect(emMock.save).toHaveBeenCalledTimes(2);

				return updatedProgrammes;
			});

			await service.updateAllValidatedChildrenAndParentStatusByProgrammeId(programme, em, false);

			expect(entityManagerMock.transaction).toHaveBeenCalled();
			expect(service.updateAllValidatedChildrenStatusByActionId).toBeCalledTimes(1)
		});

	});

	describe('updateAllValidatedChildrenAndParentStatusByProject', () => {
		it('should update project children validation status, not update parent', async () => {
			const user = new User();
			user.sector = [Sector.Agriculture, Sector.Forestry]

			const action = new ActionEntity();
			action.actionId = "A001";
			action.validated = false;

			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.action = null;
			programme.sector = Sector.Forestry;
			programme.validated = true;
			programme.path = "A001";

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;
			activity.support = [support]
			activity.path = "A001.P001.J001"

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;
			project.activities = [activity];
			project.path = "A001.P001";
			project.programme = programme;

			const queryBuilderActivityMock: Partial<SelectQueryBuilder<ActivityEntity>> = {
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValueOnce([activity]),
			};

			jest.spyOn(activityRepositoryMock, 'createQueryBuilder').mockReturnValue(queryBuilderActivityMock as SelectQueryBuilder<ActivityEntity>);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
				};
				const updatedProgrammes = await callback(emMock);

				expect(activity.validated).toBe(false);
				expect(support.validated).toBe(false);

				expect(emMock.save).toHaveBeenCalledTimes(3);

				return updatedProgrammes;
			});

			await service.updateAllValidatedChildrenAndParentStatusByProject(project, em, true);

			expect(entityManagerMock.transaction).toHaveBeenCalled();
		});

		it('should update project children validation status, update parent', async () => {
			const user = new User();
			user.sector = [Sector.Agriculture, Sector.Forestry]

			const action = new ActionEntity();
			action.actionId = "A001";
			action.validated = true;

			const programme = new ProgrammeEntity();
			programme.programmeId = 'P001';
			programme.action = null;
			programme.sector = Sector.Forestry;
			programme.validated = true;
			programme.path = "A001";
			programme.action = action;

			const support = new SupportEntity();
			support.supportId = 'S001';
			support.sector = Sector.Forestry;
			support.validated = true;

			const activity = new ActivityEntity;
			activity.parentId = 'J001';
			activity.parentType = EntityType.PROJECT;
			activity.activityId = "T1"
			activity.sector = Sector.Forestry;
			activity.validated = true;
			activity.support = [support]
			activity.path = "A001.P001.J001"

			const project = new ProjectEntity;
			project.projectId = 'J001'
			project.sector = Sector.Forestry;
			project.validated = true;
			project.activities = [activity];
			project.path = "A001.P001";
			project.programme = programme;

			const queryBuilderActivityMock: Partial<SelectQueryBuilder<ActivityEntity>> = {
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValueOnce([activity]),
			};

			jest.spyOn(activityRepositoryMock, 'createQueryBuilder').mockReturnValue(queryBuilderActivityMock as SelectQueryBuilder<ActivityEntity>);
			jest.spyOn(service, 'updateAllValidatedChildrenAndParentStatusByProgrammeId').mockResolvedValue(null);

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
				};
				const updatedProgrammes = await callback(emMock);

				expect(programme.validated).toBe(false);

				expect(emMock.save).toHaveBeenCalledTimes(4);

				return updatedProgrammes;
			});

			await service.updateAllValidatedChildrenAndParentStatusByProject(project, em, false);

			expect(entityManagerMock.transaction).toHaveBeenCalled();
			expect(service.updateAllValidatedChildrenAndParentStatusByProgrammeId).toBeCalledTimes(1)
		});

	});

});
