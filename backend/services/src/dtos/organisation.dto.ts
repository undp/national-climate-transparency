import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  ArrayMinSize,
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
import { IsValidCountry } from "../util/validcountry.decorator";

export class OrganisationDto {
  organisationId: number; 

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @ValidateIf(
    (c) => ![OrganisationType.GOVERNMENT].includes(c.organisationType)
  )
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  @IsArray()
  @ArrayMinSize(1)
  @MaxLength(100, { each: true })
  @IsNotEmpty({ each: true })
  @IsOptional()
  regions: string[];
  
  @ValidateIf((c) => c.phoneNo != undefined)
  @IsString()
  @ApiPropertyOptional()
  phoneNo: string;

  @IsUrl()
  @IsOptional()
  @ApiPropertyOptional()
  website: string;


  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  address: string;

  @ValidateIf((c) => c.logo)
  @IsString()
  @ApiPropertyOptional()
  @MaxLength(1048576, { message: "Logo cannot exceed 1MB" })
  logo: string;

  @IsValidCountry()
  @IsOptional()
  @ApiPropertyOptional()
  country: string;

  @IsNotEmpty()
  @ApiProperty({ enum: OrganisationType })
  @IsEnum(OrganisationType, {
    message:
      "Invalid role. Supported following roles:" + Object.values(OrganisationType),
  })
  organisationType: OrganisationType;

  @ValidateIf((c) => c.organisationType === OrganisationType.DEPARTMENT)
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

  createdTime: number;

  geographicalLocationCordintes?: any;

}
