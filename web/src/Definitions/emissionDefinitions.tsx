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

export type EmissionTabItem = { key: string; label: string; icon: any; content: any };

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
  [EmissionUnits.CO2]: 0,
  [EmissionUnits.CH4]: 0,
  [EmissionUnits.N2O]: 0,
  [EmissionUnits.CO2EQ]: 0,
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

export const indSectionInit = {
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

export const processIndividualEmissionData = (receivedEmission: any) => {
  const tempEmission = {
    [EmissionUnits.CO2]: receivedEmission[EmissionUnits.CO2] ?? 0,
    [EmissionUnits.CH4]: receivedEmission[EmissionUnits.CH4] ?? 0,
    [EmissionUnits.N2O]: receivedEmission[EmissionUnits.N2O] ?? 0,
    [EmissionUnits.CO2EQ]: receivedEmission[EmissionUnits.CO2EQ] ?? 0,
  };

  return tempEmission;
};

export const processEnergyEmissionData = (energyEmissions: any) => {
  const processedEmission: EnergySection = {
    [EnergyLevels.OneA]: {
      [EnergyOne.OneA1]: processIndividualEmissionData(
        energyEmissions.fuelCombustionActivities.energyIndustries
      ),
      [EnergyOne.OneA2]: processIndividualEmissionData(
        energyEmissions.fuelCombustionActivities.manufacturingIndustriesConstruction
      ),
      [EnergyOne.OneA3]: processIndividualEmissionData(
        energyEmissions.fuelCombustionActivities.transport
      ),
      [EnergyOne.OneA4]: processIndividualEmissionData(
        energyEmissions.fuelCombustionActivities.otherSectors
      ),
      [EnergyOne.OneA5]: processIndividualEmissionData(
        energyEmissions.fuelCombustionActivities.nonSpecified
      ),
    },
    [EnergyLevels.OneB]: {
      [EnergyTwo.OneB1]: processIndividualEmissionData(
        energyEmissions.fugitiveEmissionsFromFuels.solidFuels
      ),
      [EnergyTwo.OneB2]: processIndividualEmissionData(
        energyEmissions.fugitiveEmissionsFromFuels.oilNaturalGas
      ),
      [EnergyTwo.OneB3]: processIndividualEmissionData(
        energyEmissions.fugitiveEmissionsFromFuels.otherEmissionsEnergyProduction
      ),
    },
    [EnergyLevels.OneC]: {
      [EnergyThree.OneC1]: processIndividualEmissionData(
        energyEmissions.carbonDioxideTransportStorage.solidFuels
      ),
      [EnergyThree.OneC2]: processIndividualEmissionData(
        energyEmissions.carbonDioxideTransportStorage.oilNaturalGas
      ),
      [EnergyThree.OneC3]: processIndividualEmissionData(
        energyEmissions.carbonDioxideTransportStorage.otherEmissionsEnergyProduction
      ),
    },
  };

  return processedEmission;
};

export const processIndustryEmissionData = (industryEmissions: any) => {
  const processedEmission: IndustrySection = {
    [IndustryLevels.TwoA]: processIndividualEmissionData(industryEmissions.mineralIndustry),
    [IndustryLevels.TwoB]: processIndividualEmissionData(industryEmissions.chemicalIndustry),
    [IndustryLevels.TwoC]: processIndividualEmissionData(industryEmissions.metalIndustry),
    [IndustryLevels.TwoD]: processIndividualEmissionData(
      industryEmissions.nonEnergyProductsFuelsSolventUse
    ),
    [IndustryLevels.TwoE]: processIndividualEmissionData(industryEmissions.electronicsIndustry),
    [IndustryLevels.TwoF]: processIndividualEmissionData(
      industryEmissions.productUsesSubstOzoneDepletingSubs
    ),
    [IndustryLevels.TwoG]: processIndividualEmissionData(
      industryEmissions.otherProductManufactureUse
    ),
    [IndustryLevels.TwoH]: processIndividualEmissionData(industryEmissions.other),
  };

  return processedEmission;
};

export const processAgrEmissionData = (agrEmissions: any) => {
  const processedEmission: AgricultureSection = {
    [AgrLevels.ThreeA]: processIndividualEmissionData(agrEmissions.livestock),
    [AgrLevels.ThreeB]: processIndividualEmissionData(agrEmissions.land),
    [AgrLevels.ThreeC]: processIndividualEmissionData(agrEmissions.aggregateNonCo2SourcesLand),
    [AgrLevels.ThreeD]: processIndividualEmissionData(agrEmissions.other),
  };

  return processedEmission;
};

export const processWasteEmissionData = (wasteEmissions: any) => {
  const processedEmission: WasteSection = {
    [WasteLevels.FourA]: processIndividualEmissionData(wasteEmissions.solidWasteDisposal),
    [WasteLevels.FourB]: processIndividualEmissionData(
      wasteEmissions.biologicalTreatmentSolidWaste
    ),
    [WasteLevels.FourC]: processIndividualEmissionData(wasteEmissions.incinerationOpenBurningWaste),
    [WasteLevels.FourD]: processIndividualEmissionData(wasteEmissions.wastewaterTreatmentDischarge),
    [WasteLevels.FourE]: processIndividualEmissionData(wasteEmissions.other),
  };

  return processedEmission;
};

export const processOtherEmissionData = (otherEmissions: any) => {
  const processedEmission: OtherSection = {
    [OtherLevels.FiveA]: processIndividualEmissionData(otherEmissions.indirectN2oEmissions),
    [OtherLevels.FiveB]: processIndividualEmissionData(otherEmissions.other),
  };

  return processedEmission;
};

export type EmissionPayload = {
  year: string;
  energyEmissions: {
    fuelCombustionActivities: {
      energyIndustries: any;
      manufacturingIndustriesConstruction: any;
      transport: any;
      otherSectors: any;
      nonSpecified: any;
    };
    fugitiveEmissionsFromFuels: {
      solidFuels: any;
      oilNaturalGas: any;
      otherEmissionsEnergyProduction: any;
    };
    carbonDioxideTransportStorage: {
      solidFuels: any;
      oilNaturalGas: any;
      otherEmissionsEnergyProduction: any;
    };
  };
  industrialProcessesProductUse: {
    mineralIndustry: any;
    chemicalIndustry: any;
    metalIndustry: any;
    nonEnergyProductsFuelsSolventUse: any;
    electronicsIndustry: any;
    productUsesSubstOzoneDepletingSubs: any;
    otherProductManufactureUse: any;
    other: any;
  };
  agricultureForestryOtherLandUse: {
    livestock: any;
    land: any;
    aggregateNonCo2SourcesLand: any;
    other: any;
  };
  waste: {
    solidWasteDisposal: any;
    biologicalTreatmentSolidWaste: any;
    incinerationOpenBurningWaste: any;
    wastewaterTreatmentDischarge: any;
    other: any;
  };
  other: {
    indirectN2oEmissions: any;
    other: any;
  };
  totalCo2WithoutLand: any;
  totalCo2WithLand: any;
};
