export type ProjectData = {
  key: string;
  projectId: string;
  projectName: string;
};

export type ProjectMigratedData = {
  type: string[];
  intImplementor: string[];
  recipientEntity: string[];
  ghgsAffected: string;
  achievedReduct: number;
  expectedReduct: number;
};

// // Get Migrated Data for the Activities
// form.setFieldsValue({
//   actionTitle: 'Increase Renewable Electricity Generation',
//   programmeTitle: 'Increase Grid Connected generation',
//   natAnchor: 'NDC',
//   instrTypes: 'Policy',
//   sectorsAffected: 'Energy',
//   subSectorsAffected: 'Grid-Connected Generation',
//   natImplementor: 'Department of Energy',
//   techDevContribution: 'Yes',
//   capBuildObjectives: 'Yes',
//   techType: 'Renewable Energy',
//   neededUSD: 1000000,
//   neededLCL: 2500000,
//   recievedUSD: 50000,
//   recievedLCL: 86520,
// });
