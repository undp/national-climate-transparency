import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsEmail, IsEnum, isNotEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength } from "class-validator";
import { Role, SubRole } from "../casl/role.enum";
import { UserState } from "src/enums/user.enum";
import { Sector } from "src/enums/sector.enum";
import { Organisation } from "src/enums/organisation.enum";

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
    @Matches(/^[+]\d{1,3}(?:\s?\d{1,15})+$/, { message: 'Invalid phone number format. Please provide a valid country code followed by a phone number.' })
    @ApiPropertyOptional()
    phoneNo: string;

    @IsOptional()
    @IsEmail()
    @ApiPropertyOptional()
    email: string;

		@IsOptional()
		@ApiProperty({ enum: SubRole })
		@IsEnum(SubRole, {
			message: "Invalid sub role. Supported following roles:" + Object.values(SubRole),
		})
		subRole: SubRole;

    @IsOptional()
    @ApiPropertyOptional({ enum: UserState })
    @IsEnum(UserState, {
        message: 'Invalid user state. Supported following roles:' + Object.values(UserState)
    })
    state: UserState;

		@IsArray()
		@ArrayMinSize(1)
		@MaxLength(100, { each: true })
		@IsOptional()
		@IsEnum(Sector, {
				each: true,
				message: 'Invalid Sector. Supported following sectors:' + Object.values(Sector)
		})
		@ApiProperty({
			type: [String],
			enum: Object.values(Sector),
		})
		sector: Sector[];

		@IsOptional()
		@ApiProperty({ enum: Organisation })
		@IsEnum(Organisation, {
			message: "Invalid organisation. Supported following Organisations:" + Object.values(Organisation),
		})
		organisation: Organisation;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    remarks: string;
}

