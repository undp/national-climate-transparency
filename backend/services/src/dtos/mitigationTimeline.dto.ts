import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";


export class mitigationTimelineDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    activityId: string;

    @ApiProperty()
    mitigationTimeline: {
        expected: {
            baselineEmissions: number[];
            activityEmissionsWithM: number[];
            activityEmissionsWithAM: number[];
            expectedEmissionReductWithM: number[];
            expectedEmissionReductWithAM: number[];
            total: {
                baselineEmissions:number;
                activityEmissionsWithM:number;
                activityEmissionsWithAM:number;
                expectedEmissionReductWithM:number;
                expectedEmissionReductWithAM:number;
            };
        };
        actual: {
            baselineActualEmissions: number[];
            activityActualEmissions: number[];
            actualEmissionReduct: number[];
            total: {
                baselineActualEmissions: number;
                activityActualEmissions: number;
                actualEmissionReduct: number;
            }
        };
    }

}