export enum SupportType {
  MITIGATION = 'Mitigation',
  ADAPTION = 'Adaption',
  CROSSCUT = 'Cross-cutting',
  ENABLING = 'Enabling',
}

export enum Measure {
  WITH_MEASURE = 'With Measures',
  WITH_ADD_MEASURES = 'With Additional Measures',
  WITHOUT_MEASURES = 'Without Measures',
}

export enum ActivityStatus {
  PLANNED = 'Planned',
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
}

export enum ImplMeans {
  FINANCE = 'Financing',
  TECH_DEV = 'Technology Development & Transfer',
  CAPACITY_BUILD = 'Capacity Building',
  TRANSP = 'Transparency',
  NONE = 'None',
}

export enum TechnologyType {
  ENERGY_EFI = 'Energy Efficiency',
  REN_ENERGY = 'Renewable Energy',
  EMISSION_ABT = 'Emissions Abatement',
  NATURE_BASED = 'Nature Based Solution',
  CARBON_STORAGE = 'Carbon Storage',
  IT_SOLUTION = 'IT Solutions',
  SYSTEM_MGT = 'Systems Management',
  RESILIENCE = 'Resilience',
  COASTAL_MGT = 'Coastal Management',
  CIVIL = 'Civil',
  OTHER = 'Other',
}
