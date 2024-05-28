import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateIf } from "class-validator";
import { FinanceNature, FinancingStatus, IntFinInstrument, IntSource, IntSupChannel, NatFinInstrument, SupportDirection } from "src/enums/support.enum";
import { IsTwoDecimalPoints } from "src/util/twoDecimalPointNumber.decorator";

export class SupportUpdateDto {

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
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

	@ValidateIf((c) => c.financeNature == FinanceNature.INTERNATIONAL)
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

	@ValidateIf((c) => c.financeNature == FinanceNature.INTERNATIONAL)
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

	@ValidateIf((c) => c.financeNature == FinanceNature.NATIONAL)
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

	@ValidateIf((c) => c.direction == SupportDirection.RECEIVED)
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
	@IsArray()
	@MaxLength(100, { each: true })
	@IsNotEmpty({ each: true })
	@IsEnum(IntSource, {
		each: true,
		message: 'Invalid International Source. Supported followings:' + Object.values(IntSource)
	})
	@ApiProperty({
		type: [String],
		enum: Object.values(IntSource),
	})
	internationalSource: IntSource[];

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