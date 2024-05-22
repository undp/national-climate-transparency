import {
	ApiProperty,
} from "@nestjs/swagger";
import {
	IsEnum,
	IsNotEmpty,
} from "class-validator";
import { ExportFileType } from "src/enums/shared.enum";

export class DataExportQueryDto {

	@IsNotEmpty()
	@ApiProperty({ enum: ExportFileType })
	@IsEnum(ExportFileType, {
		message: "Invalid file export type. Supported following types:" + Object.values(ExportFileType),
	})
	fileType: ExportFileType;

}
