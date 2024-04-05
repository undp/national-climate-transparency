import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	ArrayMinSize,
	IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
	MaxLength,
	ValidateIf,
} from "class-validator";
import { Role, SubRole } from "../casl/role.enum";
import { Organisation, OrganisationType } from "../enums/organisation.enum";
import { IsValidCountry } from "../util/validcountry.decorator";
import { Sector } from "src/enums/sector.enum";

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

	@ValidateIf(
    (c) => ![Role.Root, Role.Admin].includes(c.role)
  )
	@IsNotEmpty()
  @ApiProperty({ enum: SubRole })
  @IsEnum(SubRole, {
    message: "Invalid sub role. Supported following roles:" + Object.values(SubRole),
  })
  subRole: SubRole;

	@ValidateIf(
    (c) => ![Role.Root, Role.Admin].includes(c.role)
  )
  @IsArray()
  @ArrayMinSize(1)
  @MaxLength(100, { each: true })
  @IsNotEmpty({ each: true })
  @IsEnum(Sector, {
      each: true,
      message: 'Invalid Sector. Supported following sectors:' + Object.values(Sector)
  })
  @ApiProperty({
    type: [String],
    enum: Object.values(Sector),
  })
  sector: Sector[];

  @IsString()
  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsOptional()
  phoneNo: string;
  
  @IsValidCountry()
  @IsOptional()
  @ApiPropertyOptional()
  country: string;

  @IsNotEmpty()
  @ApiProperty({ enum: Organisation })
  @IsEnum(Organisation, {
    message: "Invalid organisation. Supported following Organisations:" + Object.values(Organisation),
  })
  organisation: Organisation;

  password: string;

  apiKey?: string;
}
