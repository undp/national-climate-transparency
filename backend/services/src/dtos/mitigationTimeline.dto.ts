import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";

class ExpectedData {
    @IsArray()
    @ApiProperty()
    baselineEmissions: number[];

    @IsArray()
    @ApiProperty()
    activityEmissionsWithM: number[];

    @IsArray()
    @ApiProperty()
    activityEmissionsWithAM: number[];

    @IsArray()
    @ApiProperty()
    expectedEmissionReductWithM: number[];

    @IsArray()
    @ApiProperty()
    expectedEmissionReductWithAM: number[];
}

class ActualData {
    @IsArray()
    @ApiProperty()
    baselineActualEmissions: number[];

    @IsArray()
    @ApiProperty()
    activityActualEmissions: number[];

    @IsArray()
    @ApiProperty()
    actualEmissionReduct: number[];
}


export class mitigationTimelineDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    activityId: string;

    //     mitigationTimeline: {
    //     expected: {
    //         baselineEmissions: number[];
    //         activityEmissionsWithM: number[];
    //         activityEmissionsWithAM: number[];
    //         expectedEmissionReductWithM: number[];
    //         expectedEmissionReductWithAM: number[];
    //     };
    //     actual: {
    //         baselineActualEmissions: number[];
    //         activityActualEmissions: number[];
    //         actualEmissionReduct: number[];
    //     };
    // }

    @ValidateNested()
    @ApiProperty()
    mitigationTimeline: {
        expected: ExpectedData;
        actual: ActualData;
    };

}