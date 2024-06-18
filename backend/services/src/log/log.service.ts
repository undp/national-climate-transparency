import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LogEntity } from "../entities/log.entity";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { LogDto } from "../dtos/log.dto";
import { LogEventType } from "../enums/shared.enum";


@Injectable()
export class LogService {
    constructor(
        @InjectRepository(LogEntity) private logRepo: Repository<LogEntity>,
    ) { }

    async getLogData(logDto: LogDto) {
        const eventTypes = [
            LogEventType.LINKED_TO_ACTION,
            LogEventType.LINKED_TO_PROGRAMME,
            LogEventType.LINKED_TO_PROJECT,
            LogEventType.LINKED_TO_ACTIVITY,
            LogEventType.ACTION_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
            LogEventType.PROGRAMME_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
            LogEventType.PROJECT_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
            LogEventType.ACTIVITY_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
            LogEventType.SUPPORT_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE,
        ];

        const queryBuilder = await this.logRepo
            .createQueryBuilder("log")
            .select([
                '"logId"',
                '"recordType"',
                '"eventType"',
                '"recordId"',
                '"userId"',
                'CASE WHEN log.eventType IN (:...eventTypes) THEN "log"."logData" ELSE NULL END AS "logData"',
                '"log"."createdTime"',
                '"user"."id" AS "user_id"',
                '"user"."email" AS "user_email"',
                '"user"."name" AS "user_name"',
            ])
            .leftJoin(
                User,
                "user",
                "user.id = log.userId"
            )
            .where('log.recordId = :recordId AND log.recordType = :recordType', { recordId: logDto.recordId, recordType: logDto.recordType })
            .setParameter('eventTypes', eventTypes)
            .orderBy('log.createdTime', 'DESC')
            .addOrderBy('log.logId', 'DESC');
        const result = await queryBuilder.getRawMany();
        return result;
    }
}