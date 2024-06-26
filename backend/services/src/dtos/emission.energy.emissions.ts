import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { EmissionProperties } from './emission.properties';

export class EmissionFuelCombustionActivities {
  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => EmissionProperties)
  energyIndustries: EmissionProperties;

  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => EmissionProperties)
  manufacturingIndustriesConstruction: EmissionProperties;

  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => EmissionProperties)
  transport: EmissionProperties;

  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => EmissionProperties)
  otherSectors: EmissionProperties;

  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => EmissionProperties)
  nonSpecified: EmissionProperties;
}

export class EmissionFugitiveEmissionsFromFuels {
  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => EmissionProperties)
  solidFuels: EmissionProperties;

  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => EmissionProperties)
  oilNaturalGas: EmissionProperties;

  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => EmissionProperties)
  otherEmissionsEnergyProduction: EmissionProperties;
}

export class EmissionCarbonDioxideTransportStorage {
  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => EmissionProperties)
  solidFuels: EmissionProperties;

  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => EmissionProperties)
  oilNaturalGas: EmissionProperties;

  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => EmissionProperties)
  otherEmissionsEnergyProduction: EmissionProperties;
}

export class EmissionEnergyEmissions {
  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => EmissionFuelCombustionActivities)
  fuelCombustionActivities: EmissionFuelCombustionActivities;

  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => EmissionFugitiveEmissionsFromFuels)
  fugitiveEmissionsFromFuels: EmissionFugitiveEmissionsFromFuels;

  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => EmissionCarbonDioxideTransportStorage)
  carbonDioxideTransportStorage: EmissionCarbonDioxideTransportStorage;
}
