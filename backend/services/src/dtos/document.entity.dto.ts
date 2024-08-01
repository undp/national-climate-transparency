import { IsNotEmpty, IsString } from "class-validator";

export class DocumentEntityDto {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    url: string;

    createdTime: number;

    updatedTime: number;
}