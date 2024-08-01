import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EntityType } from "../enums/shared.enum";

export class LogDto {

    @IsNotEmpty()
    @ApiProperty({ enum: EntityType })
    @IsEnum(EntityType, {
        message: "Invalid Record Type. Supported following types:" + Object.values(EntityType),
    })
    recordType: EntityType;

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    recordId: string;

}