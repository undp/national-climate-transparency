import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { DocType } from "../enum/document.type";

export class ProgrammeDocumentDto {
    @IsNotEmpty()
    @ApiProperty({ enum: DocType })
    @IsEnum(DocType, {
        message:
        "Invalid doc type. Supported following types:" + Object.values(DocType),
    })
    type: DocType;

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    data: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    programmeId: string;

    @IsOptional()
    @ApiPropertyOptional()
    @IsString()
    actionId: string;
}