import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsArray } from "class-validator";

export class UnlinkProgrammesDto {
  
    @IsNotEmpty()
    @ApiProperty()
    programme: string;

}