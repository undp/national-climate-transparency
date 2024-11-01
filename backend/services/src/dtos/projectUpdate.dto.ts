import { ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ArrayMinSize, MaxLength, Min, Max, ValidateNested, ValidateIf } from 'class-validator';
import { ProjectStatus } from "../enums/project.enum";
import { IntImplementor, KPIAction } from "../enums/shared.enum";
import { DocumentDto } from "./document.dto";
import { KpiUpdateDto } from "./kpi.update.dto";

export class ProjectUpdateDto {

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	projectId: string;

	@IsString()
	@IsOptional()
	@ApiProperty()
	programmeId: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	title: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	description: string;

	@IsString()
	@IsOptional()
	@ApiPropertyOptional()
	additionalProjectNumber: string;

	@IsNotEmpty()
	@IsEnum(ProjectStatus, {
		each: true,
		message: 'Invalid International Implementing Entity. Supported following entities:' + Object.values(ProjectStatus)
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(ProjectStatus),
	})
	projectStatus: ProjectStatus;

	@IsNotEmpty()
	@IsNumber()
	@Min(2013)
	@Max(2049)
	@ApiProperty()
	startYear: number;

	@IsNotEmpty()
	@IsNumber()
	@Min(2014)
	@Max(2050)
	@ApiProperty()
	endYear: number;

	@IsOptional()
	@ApiPropertyOptional()
	@IsString()
	comments: string;

	@IsOptional()
	@ApiPropertyOptional(
		{
			type: "array",
			example: [{
				title: "document 1",
				data: "base64 document string"
			}],
			items: {
				$ref: getSchemaPath(DocumentDto),
			},
		}
	)
	newDocuments: DocumentDto[];

	@IsOptional()
	@ApiPropertyOptional(
		{
			type: "array",
			example: ["http://test.com/documents/project_documents/testDoc1_1713334127897.csv"],
		}
	)
	removedDocuments: string[];

	@IsOptional()
	@ValidateNested()
	@ApiPropertyOptional(
		{
			type: "array",
			example: [{
				kpiId: "1",
				kpiUnit: "mWp-installed",
				name: "KPI 1",
				creatorType: "action",
				expected: 100,
				KPIAction: KPIAction.CREATED,       // To check KPI is Updated or not. this is for Update Timeline
		}],
			items: {
				$ref: getSchemaPath(KpiUpdateDto),
			},
		}
	)
	kpis: KpiUpdateDto[];

}