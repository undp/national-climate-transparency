import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { OrganisationType } from "../enums/organisation.enum";
import { Sector } from "../enums/sector.enum";

export class OrganisationUpdateDto {
  @IsNotEmpty()
  @ApiProperty()
  organisationId: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @ValidateIf(
    (c) => ![OrganisationType.GOVERNMENT, OrganisationType.API].includes(c.organisationType)
  )
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @ApiProperty({ enum: OrganisationType })
  @IsEnum(OrganisationType, {
    message:
      "Invalid role. Supported following roles:" + Object.values(OrganisationType),
  })
  organisationType: OrganisationType;

  @IsUrl()
  @IsOptional()
  @ApiPropertyOptional()
  website: string;

  @ValidateIf(
    (c) => c.logo
  )
  @ApiPropertyOptional()
  @MaxLength(1048576, { message: "Logo cannot exceed 1MB" })
  logo: string;

  @IsString()
  @ApiPropertyOptional()
  phoneNo: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  address: string;

  @ApiPropertyOptional()
  @IsArray()
  @ArrayMinSize(1)
  @MaxLength(100, { each: true })
  @IsNotEmpty({ each: true })
  @IsOptional()
  regions: string[];

  geographicalLocationCordintes?: any

  @ValidateIf((c) => c.organisationType === OrganisationType.DEPARTMENT)
  @IsArray()
  @ArrayMinSize(1)
  @MaxLength(100, { each: true })
  @IsNotEmpty({ each: true })
  @IsEnum(Sector, {
      each: true,
      message: 'Invalid Sector. Supported following sectoral scope:' + Object.values(Sector)
  })
  @ApiProperty({
    type: [String],
    enum: Object.values(Sector),
  })
  sector: Sector[];
}
