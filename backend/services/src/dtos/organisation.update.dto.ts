import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  max,
} from "class-validator";
import { OrganisationType } from "../enums/organisation.type.enum";
import { Sector } from "src/enums/sector.enum";
// import { GovDepartment } from "../enum/govDep.enum";
// import { Ministry } from "../enum/ministry.enum";

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

  // @ValidateIf(
  //   (c) => ![OrganisationType.GOVERNMENT, OrganisationType.API].includes(c.organisationType)
  // )
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

  // @ValidateIf((c) => [CompanyRole.GOVERNMENT, CompanyRole.MINISTRY].includes(c.companyRole))
  // @ApiProperty({ enum: GovDepartment })
  // @IsNotEmpty()
  // @IsEnum(GovDepartment, {
  //     message: 'Invalid Government Department. Supported following Departments:' + Object.values(GovDepartment)
  // })
  // govDep: GovDepartment;
  
  // @ValidateIf((c) => [CompanyRole.GOVERNMENT, CompanyRole.MINISTRY].includes(c.companyRole))
  // @ApiProperty({ enum: Ministry })
  // @IsNotEmpty()
  // @IsEnum(Ministry, {
  //     message: 'Invalid sector. Supported following sector:' + Object.values(Ministry)
  // })
  // ministry: Ministry;  

  // @IsNotEmpty()
  // @ApiProperty({ enum: OrganisationType })
  // @IsEnum(OrganisationType, {
  //   message:
  //     "Invalid role. Supported following roles:" + Object.values(OrganisationType),
  // })
  // organisationType: OrganisationType;

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

  // @ValidateIf(
  //   (c) => CompanyRole.GOVERNMENT==c.companyRole
  // )
  // @IsNotEmpty()
  // @IsNumber()
  // @IsInt()
  // @Min(0)
  // @Max(99)
  // @ApiProperty()
  // omgePercentage: number;

  // @ValidateIf(
  //   (c) => CompanyRole.GOVERNMENT==c.companyRole
  // )
  // @IsNotEmpty()
  // @IsNumber()
  // @IsInt()
  // @Min(0)
  // @Max(99)
  // @ApiProperty()
  // nationalSopValue: number;
}
