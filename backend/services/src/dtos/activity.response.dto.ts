import { ActivityStatus, ImpleMeans, Measure, TechnologyType } from "../enums/activity.enum";
import { EntityType, IntImplementor, NatImplementor } from "../enums/shared.enum";
import { DocumentDto } from "./document.dto";

export class ActivityResponseDto {

	activityId: string;

	title: string;

	description: string;

	parentType: EntityType;

	parentId: string;

	measure: Measure;

	status: ActivityStatus;

	nationalImplementingEntity: NatImplementor[]

	internationalImplementingEntity: IntImplementor[]

	anchoredInNationalStrategy: boolean;

	meansOfImplementation: ImpleMeans;

	technologyType: TechnologyType;

	etfDescription: string;

	documents: DocumentDto[];

	achievedGHGReduction: number;

	expectedGHGReduction: number;

	comments: string;

	mitigationInfo: any;

	mitigationTimeline: any;

	migratedData: any;

}