import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsEnum, isNotEmpty, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Role } from "../casl/role.enum";
import { UserState } from "src/enums/user.state.enum";

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
    @ApiPropertyOptional({ enum: UserState })
    @IsEnum(UserState, {
        message: 'Invalid role. Supported following roles:' + Object.values(UserState)
    })
    state: UserState;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    remarks: string;
}

