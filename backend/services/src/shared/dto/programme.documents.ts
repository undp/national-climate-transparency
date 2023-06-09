import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsOptional,
} from "class-validator";

export class ProgrammeDocuments {

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  designDocument?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  methodologyDocument?: string;
}
