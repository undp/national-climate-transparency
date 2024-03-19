import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Role } from "../casl/role.enum";
import { OrganisationType } from "../enums/organisation.type.enum";
import { IsValidCountry } from "../util/validcountry.decorator";

export class UserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @ApiProperty({ enum: Role })
  @IsEnum(Role, {
    message: "Invalid role. Supported following roles:" + Object.values(Role),
  })
  role: Role;

  @IsString()
  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsOptional()
  phoneNo: string;
  
  @IsValidCountry()
  @IsOptional()
  @ApiPropertyOptional()
  country: string;

  @IsNumber()
  @ApiPropertyOptional()
  @IsNotEmpty()
  organisationId: number;

  @IsNotEmpty()
  @ApiProperty({ enum: OrganisationType })
  @IsEnum(OrganisationType, {
    message: "Invalid organisation type. Supported following types:" + Object.values(OrganisationType),
  })
  organisationType: OrganisationType;

  password: string;

  apiKey?: string;
}
