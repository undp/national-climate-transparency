import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsArray } from "class-validator";

export class UnlinkProjectsDto {
  
    @IsNotEmpty()
    @IsArray()
    @ApiProperty()
    projects: string[];

}