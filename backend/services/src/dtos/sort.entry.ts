import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
} from "class-validator";

export class SortEntry {
  @IsNotEmpty()
  @ApiProperty()
  key: any;

  @IsNotEmpty()
  @ApiProperty()
  order: any;

  @ApiPropertyOptional()
  nullFirst?: boolean;
}
