import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from "class-validator";
import { ProjectType } from "src/enums/project.enum";
import { FinanceNature, FinancingStatus, IntFinInstrument, IntSource, IntSupChannel, NatFinInstrument, SupportDirection } from "src/enums/support.enum";
import { IsTwoDecimalPoints } from "src/util/twoDecimalPointNumber.decorator";

export class SupportDto {

	supportId: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	activityId: string;

	@IsNotEmpty()
	@IsEnum(SupportDirection, {
		each: true,
		message: 'Invalid Support Direction. Supported following directions:' + Object.values(SupportDirection)
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(SupportDirection),
	})
	direction: SupportDirection;

	@IsNotEmpty()
	@IsEnum(FinanceNature, {
		each: true,
		message: 'Invalid Finance Type. Supported following types:' + Object.values(FinanceNature)
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(FinanceNature),
	})
	financeNature: FinanceNature;

	@IsNotEmpty()
	@IsEnum(IntSupChannel, {
		each: true,
		message: 'Invalid International Support Channel. Supported following types:' + Object.values(IntSupChannel)
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(IntSupChannel),
	})
	internationalSupportChannel: IntSupChannel;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	otherInternationalSupportChannel: string;

	@IsNotEmpty()
	@IsEnum(IntFinInstrument, {
		each: true,
		message: 'Invalid International Financial Instrument. Supported following types:' + Object.values(IntFinInstrument)
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(IntFinInstrument),
	})
	internationalFinancialInstrument: IntFinInstrument;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	otherInternationalFinancialInstrument: string;

	@IsNotEmpty()
	@IsEnum(NatFinInstrument, {
		each: true,
		message: 'Invalid National Financial Instrument. Supported following types:' + Object.values(NatFinInstrument)
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(NatFinInstrument),
	})
	nationalFinancialInstrument: NatFinInstrument;

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@ApiPropertyOptional()
	otherNationalFinancialInstrument: string;

	@IsNotEmpty()
	@IsEnum(FinancingStatus, {
		each: true,
		message: 'Invalid Financing Status. Supported following:' + Object.values(FinancingStatus)
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(FinancingStatus),
	})
	financingStatus: FinancingStatus;

	@ValidateIf((c) => c.internationalSource)
	@IsNotEmpty()
	@ApiPropertyOptional({ enum: IntSource })
	@IsEnum(IntSource, {
		message: "Invalid International Source. Supported following:" + Object.values(IntSource),
	})
	internationalSource: IntSource;

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@ApiPropertyOptional()
	nationalSource: string;

	@IsNotEmpty()
	@IsNumber()
	@ApiProperty()
	@IsTwoDecimalPoints()
	requiredAmount: number;

	@IsNotEmpty()
	@IsNumber()
	@ApiProperty()
	@IsTwoDecimalPoints()
  receivedAmount: number;

	@IsNotEmpty()
	@IsNumber()
	@ApiProperty()
  exchangeRate: number;


}