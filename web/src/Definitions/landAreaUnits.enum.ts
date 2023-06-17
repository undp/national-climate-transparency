export enum LandAreaUnits {
  mm2,
  cm2,
  m2,
  ha,
  km2,
  in2,
  ft2,
  ac,
  Mi2,
}

export const landAreaUnitList = [
  { value: LandAreaUnits.mm2.valueOf(), label: 'mm2' },
  { value: LandAreaUnits.cm2.valueOf(), label: 'cm2' },
  { value: LandAreaUnits.m2.valueOf(), label: 'm2' },
  { value: LandAreaUnits.ha.valueOf(), label: 'ha' },
  { value: LandAreaUnits.km2.valueOf(), label: 'km2' },
  { value: LandAreaUnits.in2.valueOf(), label: 'in2' },
  { value: LandAreaUnits.ft2.valueOf(), label: 'ft2' },
  { value: LandAreaUnits.ac.valueOf(), label: 'ac' },
  { value: LandAreaUnits.Mi2.valueOf(), label: 'Mi2' },
];
