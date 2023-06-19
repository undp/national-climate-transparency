export enum EnergyGenerationUnits {
  Wh = 'Wh',
  mWh = 'mWh',
  kWh = 'kWh',
  MWh = 'MWh',
  GWh = 'GWh',
  J = 'J',
  KJ = 'KJ',
}

export const energyGenerationUnitList = [
  { value: EnergyGenerationUnits.Wh.valueOf(), label: 'Wh' },
  { value: EnergyGenerationUnits.mWh.valueOf(), label: 'mWh' },
  { value: EnergyGenerationUnits.kWh.valueOf(), label: 'kWh' },
  { value: EnergyGenerationUnits.MWh.valueOf(), label: 'MWh' },
  { value: EnergyGenerationUnits.GWh.valueOf(), label: 'GWh' },
  { value: EnergyGenerationUnits.J.valueOf(), label: 'J' },
  { value: EnergyGenerationUnits.KJ.valueOf(), label: 'KJ' },
];
