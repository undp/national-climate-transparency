import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { CounterService } from "../util/counter.service";
import { HelperService } from "../util/helpers.service";
import { EntityManager, In, Repository } from "typeorm";
import { ProgrammeDto } from "../dtos/programme.dto";
import { User } from "../entities/user.entity";
import { plainToClass } from "class-transformer";
import { ProgrammeEntity } from "../entities/programme.entity";
import { CounterType } from "../enums/counter.type.enum";
import { FileUploadService } from "../util/fileUpload.service";
import { DocumentEntityDto } from "../dtos/document.entity.dto";
import { EntityType, LogEventType } from "../enums/shared.enum";
import { LogEntity } from "../entities/log.entity";
import { KpiEntity } from "../entities/kpi.entity";
import { PayloadValidator } from "../validation/payload.validator";
import { DataResponseMessageDto } from "../dtos/data.response.message";
import { ActionService } from "../action/action.service";
import { LinkProgrammesDto } from "../dtos/link.programmes.dto";
import { UnlinkProgrammesDto } from "../dtos/unlink.programmes.dto";
import { QueryDto } from "../dtos/query.dto";
import { DataListResponseDto } from "../dtos/data.list.response";
import { OrganisationService } from "../organisation/organisation.service";
import { Role } from "../casl/role.enum";
import { Organisation } from "../entities/organisation.entity";
import { FilterEntry } from "../dtos/filter.entry";
import { ProgrammeViewDto } from "../dtos/programme.view.dto";
import { ProjectType } from "../enums/project.enum";
import { ProjectEntity } from "../entities/project.entity";

@Injectable()
export class ProgrammeService {
    constructor(
        @InjectEntityManager() private entityManger: EntityManager,
        @InjectRepository(ProgrammeEntity) private programmeRepo: Repository<ProgrammeEntity>,
        private actionService: ActionService,
        private organisationService: OrganisationService,
        private counterService: CounterService,
        private helperService: HelperService,
        private fileUploadService: FileUploadService,
        private payloadValidator: PayloadValidator

    ) { }

    async createProgramme(programmeDto: ProgrammeDto, user: User) {

        const programme: ProgrammeEntity = plainToClass(ProgrammeEntity, programmeDto);

        const eventLog = [];

        programme.programmeId = 'P' + await this.counterService.incrementCount(CounterType.PROGRAMME, 3);

        // upload the documents and create the doc array here
        if (programmeDto.documents) {
            const documents = [];
            for (const documentItem of programmeDto.documents) {
                const response = await this.fileUploadService.uploadDocument(documentItem.data, documentItem.title);
                const docEntity = new DocumentEntityDto();
                docEntity.title = documentItem.title;
                docEntity.url = response;
                docEntity.createdTime = new Date().getTime();
                documents.push(docEntity)
            };
            programme.documents = documents;

        }
        this.addEventLogEntry(eventLog, LogEventType.PROGRAMME_CREATED, EntityType.PROGRAMME, programme.programmeId, user.id, programmeDto);

        const kpiList = [];
        if (programmeDto.kpis) {
            for (const kpiItem of programmeDto.kpis) {
                this.payloadValidator.validateKpiPayload(kpiItem, EntityType.PROGRAMME);
                const kpi: KpiEntity = plainToClass(KpiEntity, kpiItem);
                kpi.kpiId = parseInt(await this.counterService.incrementCount(CounterType.KPI, 3));
                kpi.creatorId = programme.programmeId;
                kpiList.push(kpi);
            }
            // Add event log entry after the loop completes
            this.addEventLogEntry(eventLog, LogEventType.KPI_ADDED, EntityType.PROGRAMME, programme.programmeId, user.id, kpiList);
        }

        programme.path = "";

        if (programmeDto.actionId) {
            const action = await this.actionService.findActionById(programmeDto.actionId);
            if (!action) {
                throw new HttpException(
                    this.helperService.formatReqMessagesString(
                        "programme.actionNotFound",
                        [programmeDto.actionId]
                    ),
                    HttpStatus.BAD_REQUEST
                );
            }
            programme.action = action;
            programme.path = programmeDto.actionId;
            this.addEventLogEntry(eventLog, LogEventType.PROGRAMME_LINKED, EntityType.ACTION, action.actionId, user.id, programme.programmeId);
            this.addEventLogEntry(eventLog, LogEventType.LINKED_TO_ACTION, EntityType.PROGRAMME, programme.programmeId, user.id, action.actionId);
        }

        const prog = await this.entityManger
            .transaction(async (em) => {
                const savedProgramme = await em.save<ProgrammeEntity>(programme);
                if (savedProgramme) {
                    // link projects here
                    if (programmeDto.kpis) {
                        kpiList.forEach(async kpi => {
                            await em.save<KpiEntity>(kpi)
                        });
                    }

                    //add log here
                    eventLog.forEach(async event => {
                        await em.save<LogEntity>(event);
                    });
                }
                return savedProgramme;
            })
            .catch((err: any) => {
                console.log(err);
                throw new HttpException(
                    this.helperService.formatReqMessagesString(
                        "programme.programmeCreationFailed",
                        [err]
                    ),
                    HttpStatus.BAD_REQUEST
                );
            });

        return new DataResponseMessageDto(
            HttpStatus.CREATED,
            this.helperService.formatReqMessagesString("programme.createProgrammeSuccess", []),
            prog
        );

    }

    async getProgrammeViewData(programmeId: string, abilityCondition: string) {
        const filterAnd: FilterEntry[] = [];
        filterAnd.push({
            key: 'programmeId',
            operation: '=',
            value: programmeId,
        });

        const queryDto = new QueryDto();
        queryDto.filterAnd = filterAnd;

        const programme = await this.query(queryDto, abilityCondition);

        if (!programme) {
            throw new HttpException(
                this.helperService.formatReqMessagesString(
                    "programme.programmesNotFound",
                    []
                ),
                HttpStatus.BAD_REQUEST
            );
        }

        return this.getProgrammeViewDto(programme.data[0]);
    }

    async query(query: QueryDto, abilityCondition: string): Promise<any> {
        const queryBuilder = await this.programmeRepo
            .createQueryBuilder("programme")
            .where(
                this.helperService.generateWhereSQL(
                    query,
                    this.helperService.parseMongoQueryToSQLWithTable(
                        '"programme"',
                        abilityCondition
                    ),
                    '"programme"'
                )
            )
            .leftJoinAndSelect("programme.action", "action")
            .leftJoinAndSelect("programme.projects", "projects")
            .orderBy(
                query?.sort?.key ? `"programme"."${query?.sort?.key}"` : `"programme"."programmeId"`,
                query?.sort?.order ? query?.sort?.order : "DESC"
            );
        // .offset(query.size * query.page - query.size)
        // .limit(query.size)
        // .getManyAndCount();

        if (query.size && query.page) {
            queryBuilder.offset(query.size * query.page - query.size)
                .limit(query.size);
        }

        const resp = await queryBuilder.getManyAndCount();

        return new DataListResponseDto(
            resp.length > 0 ? resp[0] : undefined,
            resp.length > 1 ? resp[1] : undefined
        );
    }

    async linkProgrammesToAction(linkProgrammesDto: LinkProgrammesDto, user: User) {
        const action = await this.actionService.findActionById(linkProgrammesDto.actionId);
        if (!action) {
            throw new HttpException(
                this.helperService.formatReqMessagesString(
                    "programme.actionNotFound",
                    [linkProgrammesDto.actionId]
                ),
                HttpStatus.BAD_REQUEST
            );
        }

        const programmes = await this.findAllProgrammeByIds(linkProgrammesDto.programmes);

        if (!programmes) {
            throw new HttpException(
                this.helperService.formatReqMessagesString(
                    "programme.programmesNotFound",
                    []
                ),
                HttpStatus.BAD_REQUEST
            );
        }
        let department: Organisation;
        if (user.role === Role.DepartmentUser) {
            department = await this.organisationService.findByCompanyId(user.organisationId);
        }
        const departmentSectors = department?.sector || [];

        const prog = await this.entityManger
            .transaction(async (em) => {
                for (const programme of programmes) {

                    if (departmentSectors.length > 0) {
                        const commonSectors = programme.affectedSectors.filter(sector => departmentSectors.includes(sector));
                        if (commonSectors.length === 0) {
                            throw new HttpException(
                                this.helperService.formatReqMessagesString(
                                    "programme.cannotLinkNotRelatedProgrammes",
                                    [programme.programmeId]
                                ),
                                HttpStatus.BAD_REQUEST
                            );
                        }
                    }
                    if (programme.action) {
                        throw new HttpException(
                            this.helperService.formatReqMessagesString(
                                "programme.programmeAlreadyLinked",
                                [programme.programmeId]
                            ),
                            HttpStatus.BAD_REQUEST
                        );
                    }
                    programme.action = action;
                    programme.path = action.actionId;
                    const linkedProgramme = await em.save<ProgrammeEntity>(programme);

                    if (linkedProgramme) {
                        await em.save<LogEntity>(
                            this.buildLogEntity(
                                LogEventType.LINKED_TO_ACTION,
                                EntityType.PROGRAMME,
                                programme.programmeId,
                                user.id,
                                linkProgrammesDto
                            )
                        );
                    }
                }
            });

        return new DataResponseMessageDto(
            HttpStatus.OK,
            this.helperService.formatReqMessagesString("programme.programmesLinkedToAction", []),
            prog
        );
    }

    async unlinkProgrammesFromAction(unlinkProgrammesDto: UnlinkProgrammesDto, user: User) {
        const programmes = await this.findAllProgrammeByIds(unlinkProgrammesDto.programmes);

        if (!programmes) {
            throw new HttpException(
                this.helperService.formatReqMessagesString(
                    "programme.programmesNotFound",
                    []
                ),
                HttpStatus.BAD_REQUEST
            );
        }

        const prog = await this.entityManger
            .transaction(async (em) => {
                for (const programme of programmes) {
                    if (!programme.action) {
                        throw new HttpException(
                            this.helperService.formatReqMessagesString(
                                "programme.programmeIsNotLinked",
                                [programme.programmeId]
                            ),
                            HttpStatus.BAD_REQUEST
                        );
                    }
                    programme.action = null;
                    programme.path = "";
                    const linkedProgramme = await em.save<ProgrammeEntity>(programme);

                    if (linkedProgramme) {
                        await em.save<LogEntity>(
                            this.buildLogEntity(
                                LogEventType.UNLINKED_FROM_ACTION,
                                EntityType.PROGRAMME,
                                programme.programmeId,
                                user.id,
                                unlinkProgrammesDto
                            )
                        );
                    }
                }
            });

        return new DataResponseMessageDto(
            HttpStatus.OK,
            this.helperService.formatReqMessagesString("programme.programmesUnlinkedFromAction", []),
            prog
        );
    }

    async findAllProgrammeByIds(programmeIds: string[]) {
        return await this.programmeRepo.createQueryBuilder('programme')
            .leftJoinAndSelect('programme.action', 'action')
            .where('programme.programmeId IN (:...programmeIds)', { programmeIds })
            .getMany();
    }

    private addEventLogEntry = (
        eventLog: any[],
        eventType: LogEventType,
        recordType: EntityType,
        recordId: any,
        userId: number,
        data: any) => {
        eventLog.push(
            this.buildLogEntity(
                eventType,
                recordType,
                recordId,
                userId,
                data));
        return eventLog;
    }

    private buildLogEntity = (
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

    getProgrammeViewDto(programme: ProgrammeEntity) {

        const typesSet: Set<string> = new Set();
        const recipientEntitySet: Set<string> = new Set();
        const interNationalImplementorSet: Set<string> = new Set();
        
        if (programme.projects && programme.projects.length > 0) {
            for (const project of programme.projects) {
                if (project.type) typesSet.add(project.type);
                if (project.recipient) recipientEntitySet.add(project.recipient);
                if (project.intImplementor) interNationalImplementorSet.add(project.intImplementor);
            }
        }
        
        const types: string[] = Array.from(typesSet);
        const recipientEntity: string[] = Array.from(recipientEntitySet);
        const interNationalImplementor: string[] = Array.from(interNationalImplementorSet);

        const programmeViewDto = new ProgrammeViewDto();
        programmeViewDto.programmeId = programme.programmeId;
        programmeViewDto.actionId = programme.action?.actionId;
        programmeViewDto.types = types;
        programmeViewDto.title = programme.title;
        programmeViewDto.description = programme.description;
        programmeViewDto.objectives = programme.objective;
        programmeViewDto.instrumentType = programme.action?.instrumentType;
        programmeViewDto.affectedSectors = programme.affectedSectors;
        programmeViewDto.affectedSubSector = programme.affectedSubSector;
        programmeViewDto.programmeStatus = null;
        programmeViewDto.recipientEntity = recipientEntity;
        programmeViewDto.startYear = programme.startYear;
        programmeViewDto.interNationalImplementor = interNationalImplementor;
        programmeViewDto.nationalImplementor = programme.natImplementor;
        programmeViewDto.investment = programme.investment;
        programmeViewDto.documents = programme.documents;
        programmeViewDto.comments = programme.comments;

        return programmeViewDto;

    }
}