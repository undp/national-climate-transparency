export type SubSectionsDefinition = {
  id: string;
  sections: string[];
};

export type SectionDefinition = {
  id: string;
  hasSubSections: boolean;
  mainSections: string[] | null;
  subSections: SubSectionsDefinition[] | null;
};

export const emissionSections: SectionDefinition[] = [
  {
    id: '1',
    hasSubSections: true,
    mainSections: null,
    subSections: [
      { id: '1A', sections: ['1A1', '1A2', '1A3', '1A4', '1A5'] },
      { id: '1B', sections: ['1B1', '1B2', '1B3'] },
      { id: '1C', sections: ['1C1', '1C2', '1C3'] },
    ],
  },
  {
    id: '2',
    hasSubSections: false,
    mainSections: ['2A', '2B', '2C', '2D', '2E', '2F', '2G', '2H'],
    subSections: null,
  },
  {
    id: '3',
    hasSubSections: false,
    mainSections: ['3A', '3B', '3C', '3D'],
    subSections: null,
  },
  {
    id: '4',
    hasSubSections: false,
    mainSections: ['4A', '4B', '4C', '4D', '4E'],
    subSections: null,
  },
  {
    id: '5',
    hasSubSections: false,
    mainSections: ['5A', '5B'],
    subSections: null,
  },
];
