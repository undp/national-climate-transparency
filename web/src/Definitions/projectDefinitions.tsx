export type ProjectData = {
  key: string;
  projectId: string;
  projectName: string;
  internationalImplementingEntities: string[];
  recipientEntities: string[];
  ghgsAffected: string[];
  achievedReduction: number;
  estimatedReduction: number;
};

export type ProjectMigratedData = {
  techDevContribution: 'Yes' | 'No';
  capBuildObjectives: 'Yes' | 'No';
  techType: string[];
  neededUSD: number;
  neededLCL: number;
  receivedUSD: number;
  receivedLCL: number;
  achievedGHGReduction: number;
  expectedGHGReduction: number;
};
