import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EntitySubject } from "./entity.subject";
import { SystemResourceCategory, SystemResourceType } from "../enums/shared.enum";

@Entity("system_resources")
export class SystemResourcesEntity implements EntitySubject {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "enum", enum: SystemResourceCategory, nullable: false })
	resourceCategory: SystemResourceCategory;

	@Column({ type: "enum", enum: SystemResourceType, nullable: false })
	resourceType: SystemResourceType;

	@Column({ nullable: false })
	title: string;

	@Column({ nullable: false })
	dataValue: string;

	@Column({ nullable: false })
	user: number;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	createdTime: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	updatedTime: Date;
}