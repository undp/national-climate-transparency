import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  ArrayMinSize,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { Role } from "../casl/role.enum";
import { OrganisationType } from "../enums/organisation.type.enum";
// import { IsValidCountry, Ministry } from '@undp/carbon-services-lib';
import { Sector } from "../enums/sector.enum";
import { IsValidCountry } from "src/util/validcountry.decorator";
// import { CompanyState } from "../enum/company.state.enum";
// import { GovDepartment } from "../enum/govDep.enum";
// import { Ministry } from "../enum/ministry.enum";

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

  // @ValidateIf(
  //   (c) => ![OrganisationType.GOVERNMENT].includes(c.organisationType)
  // )
  @IsUrl()
  @IsOptional()
  @ApiPropertyOptional()
  website: string;

  // @ValidateIf(
  //   (c) => ![OrganisationType.GOVERNMENT].includes(c.organisationType)
  // )
  // @IsNotEmpty()
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  address: string;

  @ValidateIf((c) => c.logo)
  @IsString()
  // @IsNotEmpty()
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

  // @ValidateIf((c) => c.companyRole === CompanyRole.MINISTRY)
  // @IsNotEmpty()
  // @IsString()
  // @ApiProperty()
  // nameOfMinister: string;

  // @ValidateIf((c) => c.companyRole === CompanyRole.MINISTRY)
  // @ApiProperty({ enum: GovDepartment })
  // @IsNotEmpty()
  // @IsEnum(GovDepartment, {
  //     message: 'Invalid Government Department. Supported following Departments:' + Object.values(GovDepartment)
  // })
  // govDep: GovDepartment;

  // @ValidateIf((c) => c.organisationType === OrganisationType.DEPARTMENT)
  // @ApiProperty({ enum: SectoralScope })
  // @IsNotEmpty()
  // @IsEnum(SectoralScope, {
  //     message: 'Invalid sector. Supported following sector:' + Object.values(SectoralScope)
  // })
  // sectoralScope: SectoralScope;  

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

  createdTime: number;

  geographicalLocationCordintes?: any;

  // @IsOptional()
  // @IsEnum(CompanyState, {
  //   message:
  //     "Invalid state. Supported following roles:" + Object.values(CompanyState),
  // })
  // state: CompanyState;
}
