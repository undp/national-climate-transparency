import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  isNotEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  MaxLength,
  IsArray,
  ArrayMinSize,
} from "class-validator";
import { Role } from "../casl/role.enum";
import { CompanyRole } from "../enum/company.role.enum";
import { SectoralScope } from "../enum/sectoral.scope.enum";

export class UserUpdateDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  phoneNo: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional()
  email: string;

  @IsOptional()
  @ApiPropertyOptional({ enum: Role })
  @IsEnum(Role, {
    message: "Invalid role. Supported following roles:" + Object.values(Role),
  })
  role: Role;

  @ValidateIf((c) => c.companyRole === CompanyRole.MINISTRY)
  @IsArray()
  @ArrayMinSize(1)
  @MaxLength(100, { each: true })
  @IsNotEmpty({ each: true })
  @IsEnum(SectoralScope, {
    each: true,
    message:
      "Invalid sectoral scope. Supported following sectoral scope:" +
      Object.values(SectoralScope),
  })
  @ApiProperty({
    type: [String],
    enum: Object.values(SectoralScope),
  })
  sectoralScope: SectoralScope[];
}
