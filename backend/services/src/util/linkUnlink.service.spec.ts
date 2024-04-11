import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
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

describe('LinkUnlinkService', () => {
	let service: LinkUnlinkService;
	let em: EntityManager;
	let entityManagerMock: Partial<EntityManager>;

	beforeEach(async () => {
		entityManagerMock = {
      transaction: jest.fn(),
    };
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LinkUnlinkService,
				{ provide: EntityManager, useValue: entityManagerMock },
			],
		}).compile();

		service = module.get<LinkUnlinkService>(LinkUnlinkService);
		em = module.get<EntityManager>(EntityManager);
	});

	describe('linkUnlinkProgrammes', () => {
		it('should link programmes to action and save logs', async () => {
			const programme = new ProgrammeEntity;
			programme.programmeId = "P1";

			const user = new User();
			user.sector = [Sector.Agriculture]

			const action = new ActionEntity();

			const programme1 = new ProgrammeEntity();
			programme1.programmeId = '1';
			programme1.action = null;
			programme1.affectedSectors = [Sector.Agriculture];

			const programme2 = new ProgrammeEntity();
			programme2.programmeId = '2';
			programme2.action = null;
			programme2.affectedSectors = [Sector.Agriculture];

			const programme3 = new ProgrammeEntity();
			programme3.programmeId = '3';
			programme3.action = null;
			programme3.affectedSectors = [Sector.Agriculture];

			const payload = new LinkProgrammesDto();

			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
				};
				const updatedProgramme = await callback(emMock);
	
				expect(programme1.action).toBe(action);
				expect(programme1.path).toBe(action.actionId);
				expect(programme2.action).toBe(action);
				expect(programme2.path).toBe(action.actionId);
				expect(programme3.action).toBe(action);
				expect(programme3.path).toBe(action.actionId);
	
				expect(emMock.save).toHaveBeenCalledTimes(6);
	
				return updatedProgramme;
			});

			const buildLogEntitySpy = jest.spyOn(service, 'buildLogEntity');
			await service.linkProgrammesToAction(action, [programme1, programme2, programme3], payload, user, em);

			expect(buildLogEntitySpy).toHaveBeenCalledWith(LogEventType.LINKED_TO_ACTION, EntityType.PROGRAMME, programme1.programmeId, user.id, payload);
			expect(entityManagerMock.transaction).toHaveBeenCalled();
		});

		it('should unlink programmes from action', async () => {
			const unlinkProgrammesDto: UnlinkProgrammesDto = { programmes: ['1', '2', '3'] };
			const user = new User();
			user.sector = [Sector.Agriculture]
	
			const programme1 = new ProgrammeEntity();
			programme1.programmeId = '1';
			programme1.action = new ActionEntity();
			programme1.path = 'path1';
			programme1.affectedSectors = [Sector.Agriculture];
	
			const programme2 = new ProgrammeEntity();
			programme2.programmeId = '2';
			programme2.action = new ActionEntity();
			programme2.path = 'path2';
			programme2.affectedSectors = [Sector.Agriculture];
	
			const programme3 = new ProgrammeEntity();
			programme3.programmeId = '3';
			programme3.action = new ActionEntity();
			programme3.path = 'path3';
			programme3.affectedSectors = [Sector.Agriculture];
	
			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProgrammeEntity()]),
				};
				const updatedProgrammes = await callback(emMock);
	
				expect(programme1.action).toBeNull();
				expect(programme1.path).toBe('');
				expect(programme2.action).toBeNull();
				expect(programme2.path).toBe('');
				expect(programme3.action).toBeNull();
				expect(programme3.path).toBe('');
	
				expect(emMock.save).toHaveBeenCalledTimes(6);
	
				return updatedProgrammes;
			});
	
			const buildLogEntitySpy = jest.spyOn(service, 'buildLogEntity');
			await service.unlinkProgrammesFromAction([programme1, programme2, programme3], unlinkProgrammesDto, user, em);

			expect(buildLogEntitySpy).toBeCalledWith(LogEventType.UNLINKED_FROM_ACTION, EntityType.PROGRAMME, programme1.programmeId, user.id, unlinkProgrammesDto);
			expect(buildLogEntitySpy).toBeCalledWith(LogEventType.UNLINKED_FROM_ACTION, EntityType.PROGRAMME, programme2.programmeId, user.id, unlinkProgrammesDto);
			expect(buildLogEntitySpy).toBeCalledWith(LogEventType.UNLINKED_FROM_ACTION, EntityType.PROGRAMME, programme3.programmeId, user.id, unlinkProgrammesDto);
			expect(entityManagerMock.transaction).toHaveBeenCalled();
		});
	});

	describe('linkUnlinkProjects', () => {

		it('should link projects to programme', async () => {
			const linkProjectsDto: LinkProjectsDto = { programmeId: '1', projectIds: ['1', '2', '3'] };
			const user = new User();
			user.sector = [Sector.Agriculture]
	
			const programme = new ProgrammeEntity();
			programme.programmeId = "P1";
	
			const project1 = new ProjectEntity();
			project1.projectId = '1';
			project1.path = ""
			project1.programme = null;
	
			const project2 = new ProjectEntity();
			project2.path = ""
			project2.projectId = '2';
			project2.programme = null;
	
			const project3 = new ProjectEntity();
			project3.projectId = '3';
			project3.path = ""
			project3.programme = null;
	
			// jest.spyOn(service, 'findAllProjectsByIds').mockResolvedValue([project1, project2, project3]);
	
			entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
				const emMock = {
					save: jest.fn().mockResolvedValue([new ProjectEntity()]),
				};
				const updatedProjects = await callback(emMock);
	
				expect(project1.programme).toBe(programme);
				expect(project1.path).toBe("_.P1");
				expect(project2.programme).toBe(programme);
				expect(project2.path).toBe("_.P1");
				expect(project3.programme).toBe(programme);
				expect(project3.path).toBe("_.P1");
	
				expect(emMock.save).toHaveBeenCalledTimes(6);
	
				return updatedProjects;
			});
	
			const buildLogEntitySpy = jest.spyOn(service, 'buildLogEntity');
			await service.linkProjectsToProgramme(programme, [project1, project2, project3], linkProjectsDto, user, em);

			expect(buildLogEntitySpy).toBeCalledWith(LogEventType.LINKED_TO_PROGRAMME, EntityType.PROJECT, project1.projectId, user.id, linkProjectsDto);
			expect(buildLogEntitySpy).toBeCalledWith(LogEventType.LINKED_TO_PROGRAMME, EntityType.PROJECT, project2.projectId, user.id, linkProjectsDto);
			expect(buildLogEntitySpy).toBeCalledWith(LogEventType.LINKED_TO_PROGRAMME, EntityType.PROJECT, project3.projectId, user.id, linkProjectsDto);
			expect(entityManagerMock.transaction).toHaveBeenCalled();
		});

		
	it('should unlink projects from programme', async () => {
		const unlinkProjectsDto: UnlinkProjectsDto = { projects: ['1', '2', '3'] };
		const user = new User();
		user.sector = [Sector.Agriculture]

		const programme = new ProgrammeEntity();
		programme.programmeId = "P1";
		programme.affectedSectors = [Sector.Agriculture];
		// jest.spyOn(programmeServiceMock, 'findProgrammeById').mockResolvedValue(programme);

		const project1 = new ProjectEntity();
		project1.projectId = '1';
		project1.programme = programme;

		const project2 = new ProjectEntity();
		project2.projectId = '2';
		project2.programme = programme;

		const project3 = new ProjectEntity();
		project3.projectId = '3';
		project3.programme = programme;

		// jest.spyOn(service, 'findAllProjectsByIds').mockResolvedValue([project1, project2, project3]);

		entityManagerMock.transaction = jest.fn().mockImplementation(async (callback: any) => {
			const emMock = {
				save: jest.fn().mockResolvedValue([new ProjectEntity()]),
			};
			const updatedProjects = await callback(emMock);

			expect(project1.programme).toBe(null);
			expect(project1.path).toBe("_._");
			expect(project2.programme).toBe(null);
			expect(project2.path).toBe("_._");
			expect(project3.programme).toBe(null);
			expect(project3.path).toBe("_._");

			expect(emMock.save).toHaveBeenCalledTimes(6);

			return updatedProjects;
		});

		const buildLogEntitySpy = jest.spyOn(service, 'buildLogEntity');
		await service.unlinkProjectsFromProgramme([project1, project2, project3], unlinkProjectsDto, user, em);

		expect(buildLogEntitySpy).toBeCalledWith(LogEventType.UNLINKED_FROM_PROGRAMME, EntityType.PROJECT, project1.projectId, user.id, unlinkProjectsDto);
		expect(buildLogEntitySpy).toBeCalledWith(LogEventType.UNLINKED_FROM_PROGRAMME, EntityType.PROJECT, project2.projectId, user.id, unlinkProjectsDto);
		expect(buildLogEntitySpy).toBeCalledWith(LogEventType.UNLINKED_FROM_PROGRAMME, EntityType.PROJECT, project3.projectId, user.id, unlinkProjectsDto);
		expect(entityManagerMock.transaction).toHaveBeenCalled();
	});

	});
});
