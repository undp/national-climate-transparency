import {
  AgrLevels,
  EmissionUnits,
  EnergyLevels,
  EnergyOne,
  EnergyThree,
  EnergyTwo,
  IndustryLevels,
  OtherLevels,
  WasteLevels,
} from '../Enums/emission.enum';

export type SubSectionsDefinition = {
  id: EnergyLevels;
  sections: EnergyOne[] | EnergyTwo[] | EnergyThree[];
};

export type SectionDefinition = {
  id: string;
  hasSubSections: boolean;
  mainSections: IndustryLevels[] | AgrLevels[] | WasteLevels[] | OtherLevels[] | null;
  subSections: SubSectionsDefinition[] | null;
};

export type EmissionData = {
  [EmissionUnits.CO2]: number | undefined;
  [EmissionUnits.CH4]: number | undefined;
  [EmissionUnits.N2O]: number | undefined;
  [EmissionUnits.CO2EQ]: number | undefined;
};

export type EnergySection = {
  [EnergyLevels.OneA]: {
    [EnergyOne.OneA1]: EmissionData;
    [EnergyOne.OneA2]: EmissionData;
    [EnergyOne.OneA3]: EmissionData;
    [EnergyOne.OneA4]: EmissionData;
    [EnergyOne.OneA5]: EmissionData;
  };
  [EnergyLevels.OneB]: {
    [EnergyTwo.OneB1]: EmissionData;
    [EnergyTwo.OneB2]: EmissionData;
    [EnergyTwo.OneB3]: EmissionData;
  };
  [EnergyLevels.OneC]: {
    [EnergyThree.OneC1]: EmissionData;
    [EnergyThree.OneC2]: EmissionData;
    [EnergyThree.OneC3]: EmissionData;
  };
};

export type IndustrySection = {
  [IndustryLevels.TwoA]: EmissionData;
  [IndustryLevels.TwoB]: EmissionData;
  [IndustryLevels.TwoC]: EmissionData;
  [IndustryLevels.TwoD]: EmissionData;
  [IndustryLevels.TwoE]: EmissionData;
  [IndustryLevels.TwoF]: EmissionData;
  [IndustryLevels.TwoG]: EmissionData;
  [IndustryLevels.TwoH]: EmissionData;
};

export type AgricultureSection = {
  [AgrLevels.ThreeA]: EmissionData;
  [AgrLevels.ThreeB]: EmissionData;
  [AgrLevels.ThreeC]: EmissionData;
  [AgrLevels.ThreeD]: EmissionData;
};

export type WasteSection = {
  [WasteLevels.FourA]: EmissionData;
  [WasteLevels.FourB]: EmissionData;
  [WasteLevels.FourC]: EmissionData;
  [WasteLevels.FourD]: EmissionData;
  [WasteLevels.FourE]: EmissionData;
};

export type OtherSection = {
  [OtherLevels.FiveA]: EmissionData;
  [OtherLevels.FiveB]: EmissionData;
};

export const emissionInitData = {
  [EmissionUnits.CO2]: undefined,
  [EmissionUnits.CH4]: undefined,
  [EmissionUnits.N2O]: undefined,
  [EmissionUnits.CO2EQ]: undefined,
};

export const energySectionInit = {
  [EnergyLevels.OneA]: {
    [EnergyOne.OneA1]: { ...emissionInitData },
    [EnergyOne.OneA2]: { ...emissionInitData },
    [EnergyOne.OneA3]: { ...emissionInitData },
    [EnergyOne.OneA4]: { ...emissionInitData },
    [EnergyOne.OneA5]: { ...emissionInitData },
  },
  [EnergyLevels.OneB]: {
    [EnergyTwo.OneB1]: { ...emissionInitData },
    [EnergyTwo.OneB2]: { ...emissionInitData },
    [EnergyTwo.OneB3]: { ...emissionInitData },
  },
  [EnergyLevels.OneC]: {
    [EnergyThree.OneC1]: { ...emissionInitData },
    [EnergyThree.OneC2]: { ...emissionInitData },
    [EnergyThree.OneC3]: { ...emissionInitData },
  },
};

export const industrySectionInit = {
  [IndustryLevels.TwoA]: { ...emissionInitData },
  [IndustryLevels.TwoB]: { ...emissionInitData },
  [IndustryLevels.TwoC]: { ...emissionInitData },
  [IndustryLevels.TwoD]: { ...emissionInitData },
  [IndustryLevels.TwoE]: { ...emissionInitData },
  [IndustryLevels.TwoF]: { ...emissionInitData },
  [IndustryLevels.TwoG]: { ...emissionInitData },
  [IndustryLevels.TwoH]: { ...emissionInitData },
};

export const agricultureSectionInit: AgricultureSection = {
  [AgrLevels.ThreeA]: { ...emissionInitData },
  [AgrLevels.ThreeB]: { ...emissionInitData },
  [AgrLevels.ThreeC]: { ...emissionInitData },
  [AgrLevels.ThreeD]: { ...emissionInitData },
};

export const wasteSectionInit: WasteSection = {
  [WasteLevels.FourA]: { ...emissionInitData },
  [WasteLevels.FourB]: { ...emissionInitData },
  [WasteLevels.FourC]: { ...emissionInitData },
  [WasteLevels.FourD]: { ...emissionInitData },
  [WasteLevels.FourE]: { ...emissionInitData },
};

export const otherSectionInit: OtherSection = {
  [OtherLevels.FiveA]: { ...emissionInitData },
  [OtherLevels.FiveB]: { ...emissionInitData },
};

export const emissionSections: SectionDefinition[] = [
  {
    id: '1',
    hasSubSections: true,
    mainSections: null,
    subSections: [
      {
        id: EnergyLevels.OneA,
        sections: [
          EnergyOne.OneA1,
          EnergyOne.OneA2,
          EnergyOne.OneA3,
          EnergyOne.OneA4,
          EnergyOne.OneA5,
        ],
      },
      { id: EnergyLevels.OneB, sections: [EnergyTwo.OneB1, EnergyTwo.OneB2, EnergyTwo.OneB3] },
      {
        id: EnergyLevels.OneC,
        sections: [EnergyThree.OneC1, EnergyThree.OneC2, EnergyThree.OneC3],
      },
    ],
  },
  {
    id: '2',
    hasSubSections: false,
    mainSections: [
      IndustryLevels.TwoA,
      IndustryLevels.TwoB,
      IndustryLevels.TwoC,
      IndustryLevels.TwoD,
      IndustryLevels.TwoE,
      IndustryLevels.TwoF,
      IndustryLevels.TwoG,
      IndustryLevels.TwoH,
    ],
    subSections: null,
  },
  {
    id: '3',
    hasSubSections: false,
    mainSections: [AgrLevels.ThreeA, AgrLevels.ThreeB, AgrLevels.ThreeC, AgrLevels.ThreeD],
    subSections: null,
  },
  {
    id: '4',
    hasSubSections: false,
    mainSections: [
      WasteLevels.FourA,
      WasteLevels.FourB,
      WasteLevels.FourC,
      WasteLevels.FourD,
      WasteLevels.FourE,
    ],
    subSections: null,
  },
  {
    id: '5',
    hasSubSections: false,
    mainSections: [OtherLevels.FiveA, OtherLevels.FiveB],
    subSections: null,
  },
];

export type EmissionTotals = {
  '1': {
    [EnergyLevels.OneA]: EmissionData;
    [EnergyLevels.OneB]: EmissionData;
    [EnergyLevels.OneC]: EmissionData;
  };
  '2': EmissionData;
  '3': EmissionData;
  '4': EmissionData;
  '5': EmissionData;
};

export const emissionTotals = {
  '1': {
    [EnergyLevels.OneA]: { ...emissionInitData },
    [EnergyLevels.OneB]: { ...emissionInitData },
    [EnergyLevels.OneC]: { ...emissionInitData },
  },
  '2': { ...emissionInitData },
  '3': { ...emissionInitData },
  '4': { ...emissionInitData },
  '5': { ...emissionInitData },
};
