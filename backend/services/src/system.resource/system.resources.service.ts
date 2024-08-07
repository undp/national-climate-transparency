import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "../casl/role.enum";
import { DataListResponseDto } from "../dtos/data.list.response";
import { DataResponseMessageDto } from "../dtos/data.response.message";
import { QueryDto } from "../dtos/query.dto";
import { SystemResourceDto } from "../dtos/systemResourceDto";
import { SystemResourcesEntity } from "../entities/systemResource.entity";
import { User } from "../entities/user.entity";
import { SystemResourceCategory, SystemResourceType } from "../enums/shared.enum";
import { FileUploadService } from "../util/fileUpload.service";
import { HelperService } from "../util/helpers.service";
import { Repository } from "typeorm";

@Injectable()
export class SystemResourcesService {
	constructor(
		@InjectRepository(SystemResourcesEntity) private systemResourcesRepo: Repository<SystemResourcesEntity>,
		private helperService: HelperService,
		private fileUploadService: FileUploadService,
	) { }

	//MARK: Create Resource
	async createResource(resourceDto: SystemResourceDto, user: User) {

		const response = await this.fileUploadService.uploadDocument(resourceDto.data, resourceDto.title, resourceDto.resourceCategory);

		const resourceEntity = new SystemResourcesEntity();
		resourceEntity.resourceCategory = resourceDto.resourceCategory;
		resourceEntity.resourceType = resourceDto.resourceType;
		resourceEntity.title = resourceDto.title;
		resourceEntity.user = user.id;
		resourceEntity.dataValue = response;

		const resource = await this.systemResourcesRepo.save<SystemResourcesEntity>(resourceEntity);

		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("common.resourceCreatedSuccess", []),
			resource
		);

	}

	//MARK: Resource Query
	async query(query: QueryDto, abilityCondition: string): Promise<any> {

		// Validate the filter
		if (query.filterAnd) {
			for (const filter of query.filterAnd) {
				if (filter.key === 'resourceCategory' && !this.isValidEnumValue(filter.value, SystemResourceCategory)) {
					throw new BadRequestException(`Invalid resource category: ${filter.value}`);
				}
				if (filter.key === 'resourceType' && !this.isValidEnumValue(filter.value, SystemResourceType)) {
					throw new BadRequestException(`Invalid resource type: ${filter.value}`);
				}
			}
		}

		// Validate the filter
		if (query.filterOr) {
			for (const filter of query.filterOr) {
				if (filter.key === 'resourceCategory' && !this.isValidEnumValue(filter.value, SystemResourceCategory)) {
					throw new BadRequestException(`Invalid resource category: ${filter.value}`);
				}
				if (filter.key === 'resourceType' && !this.isValidEnumValue(filter.value, SystemResourceType)) {
					throw new BadRequestException(`Invalid resource type: ${filter.value}`);
				}
			}
		}

		const queryBuilder = this.systemResourcesRepo
			.createQueryBuilder("system_resources")
			.where(
				this.helperService.generateWhereSQL(
					query,
					this.helperService.parseMongoQueryToSQLWithTable(
						'"system_resources"',
						abilityCondition
					),
					'"system_resources"'
				)
			)
			.orderBy(
				query?.sort?.key ? `"system_resources"."${query?.sort?.key}"` : `"system_resources"."id"`,
				query?.sort?.order ? query?.sort?.order : "DESC"
			);

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

	//MARK: Delete Resource
	async deleteResource(resourceId: number, user: User) {

		if (user.role !== Role.Admin && user.role !== Role.Root) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"user.userUnAUth",
					[]
				),
				HttpStatus.FORBIDDEN
			);
		}

		const resource = await this.systemResourcesRepo.findOneBy({ id: resourceId });

		if (!resource) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"common.resourceNotFound",
					[resourceId]
				),
				HttpStatus.BAD_REQUEST
			);
		}

		try {
			await this.systemResourcesRepo.delete(resource.id);
		} catch (error) {
			throw new HttpException(
				this.helperService.formatReqMessagesString(
					"common.deleteResourceFailed",
					[error]
				),
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}

		return new DataResponseMessageDto(
			HttpStatus.OK,
			this.helperService.formatReqMessagesString("common.deleteResourceSuccess", []),
			null
		);

	}

	isValidEnumValue(value: any, enumType: object): boolean {
		return Object.values(enumType).includes(value);
	}

}