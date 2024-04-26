import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsEmail, IsEnum, isNotEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";
import { Role, SubRole } from "../casl/role.enum";
import { UserState } from "src/enums/user.state.enum";
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

