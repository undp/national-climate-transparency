import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsArray } from "class-validator";

export class LinkProjectsDto {
    @IsNotEmpty()
    @ApiProperty()
    programmeId: string;
  
    @IsNotEmpty()
    @IsArray()
    @ApiProperty()
    projectIds: string[];

}