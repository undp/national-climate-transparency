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
	Matches,
	MaxLength,
	ValidateIf,
} from "class-validator";
import { Role, SubRole } from "../casl/role.enum";
import { Organisation } from "../enums/organisation.enum";
import { IsValidCountry } from "../util/validcountry.decorator";
import { Sector } from "../enums/sector.enum";
import { GHGInventoryManipulate, SubRoleManipulate, ValidateEntity } from "../enums/user.enum";

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
	@IsNotEmpty()
	@IsOptional()
	@Matches(/^[+]\d{1,3}(?:\s?\d{1,15})+$/, { message: 'Invalid phone number format. Please provide a valid country code followed by a phone number.' })
	@ApiPropertyOptional()
	phoneNo: string;
  
  @IsValidCountry()
  @IsOptional()
  @ApiPropertyOptional()
  country: string;

  @ValidateIf(
    (c) => ![Role.Root, Role.Admin].includes(c.role)
  )
  @IsNotEmpty()
  @ApiProperty({ enum: Organisation })
  @IsEnum(Organisation, {
    message: "Invalid organisation. Supported following Organisations:" + Object.values(Organisation),
  })
  organisation: Organisation;

  password: string;

  apiKey?: string;

  @ValidateIf(
    (c) => ![Role.Observer].includes(c.role)
  )
  @IsNotEmpty()
  @ApiProperty({ enum: ValidateEntity })
  @IsEnum(ValidateEntity, {
    message: "Invalid Entity Validate Permission. Supported following type:" + Object.values(ValidateEntity),
  })
  validatePermission: ValidateEntity;

  @ValidateIf(
    (c) => ![Role.Root, Role.Admin, Role.Observer].includes(c.role)
  )
  @IsNotEmpty()
  @ApiProperty({ enum: SubRoleManipulate })
  @IsEnum(SubRoleManipulate, {
    message: "Invalid Sub Role Manipulate Permission. Supported following type:" + Object.values(SubRoleManipulate),
  })
  subRolePermission: SubRoleManipulate;

  @ValidateIf(
    (c) => ![Role.Observer].includes(c.role)
  )
  @IsNotEmpty()
  @ApiProperty({ enum: GHGInventoryManipulate })
  @IsEnum(GHGInventoryManipulate, {
    message: "Invalid GHG Inventory Manipulate Permission. Supported following type:" + Object.values(GHGInventoryManipulate),
  })
  ghgInventoryPermission: GHGInventoryManipulate;
}
