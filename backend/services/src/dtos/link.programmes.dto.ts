import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsArray } from "class-validator";

export class LinkProgrammesDto {
    @IsNotEmpty()
    @ApiProperty()
    actionId: string;
  
    @IsNotEmpty()
    @IsArray()
    @ApiProperty()
    programmes: string[];

}