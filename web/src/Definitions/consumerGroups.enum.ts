export enum ConsumerGroups {
  Household,
  HealthCenter,
  Dispensary,
  School,
  PrimarySchool,
  SecondarySchool,
  PublicAdministration,
  TradingPlace,
  BusStop,
}

export const consumerGroupList = [
  { value: ConsumerGroups.Household.valueOf(), label: 'Household' },
  { value: ConsumerGroups.HealthCenter.valueOf(), label: 'Health Center' },
  { value: ConsumerGroups.Dispensary.valueOf(), label: 'Dispensary' },
  { value: ConsumerGroups.School.valueOf(), label: 'School' },
  { value: ConsumerGroups.PrimarySchool.valueOf(), label: 'Primary School' },
  { value: ConsumerGroups.SecondarySchool.valueOf(), label: 'Secondary School' },
  { value: ConsumerGroups.PublicAdministration.valueOf(), label: 'Public Administration' },
  { value: ConsumerGroups.TradingPlace.valueOf(), label: 'Trading Place' },
  { value: ConsumerGroups.BusStop.valueOf(), label: 'Bus Stop' },
];
