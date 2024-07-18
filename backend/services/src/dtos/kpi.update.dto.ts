import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { EntityType } from "../enums/shared.enum";
import { KpiUnits } from "../enums/kpi.enum";
import { KPIAction } from "../enums/shared.enum";

export class KpiUpdateDto {

		@IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    kpiId: number;

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    name: string;

		@IsNotEmpty()
    @ApiProperty({ enum: KpiUnits })
    @IsEnum(KpiUnits, {
        message: "Invalid Unit. Supported following creator types:" + Object.values(KpiUnits),
    })
    kpiUnit: string;

    @IsNotEmpty()
    @ApiProperty({ enum: EntityType })
    @IsEnum(EntityType, {
        message: "Invalid creator type. Supported following creator types:" + Object.values(EntityType),
    })
    creatorType: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    creatorId: string;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    expected: number;

		@IsNotEmpty()
    @ApiProperty({ enum: KPIAction })
    @IsEnum(KPIAction, {
        message: "Invalid KPI Action. Supported following KPI Actions:" + Object.values(KPIAction),
    })
    kpiAction: string;            // To check KPI is Updated or not for Update Timeline
}