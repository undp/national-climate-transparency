import {
  AgricultureSection,
  EmissionPayload,
  EnergySection,
  IndustrySection,
  OtherSection,
  WasteSection,
} from '../Definitions/emissionDefinitions';
import { ProjectionTimeline, getEmptyPayload } from '../Definitions/projectionsDefinitions';
import { ConfigurationSettingsType } from '../Enums/configuration.enum';
import {
  AgrLevels,
  EnergyLevels,
  EnergyOne,
  EnergyThree,
  EnergyTwo,
  IndustryLevels,
  OtherLevels,
  WasteLevels,
} from '../Enums/emission.enum';
import { ProjectionLeafSection, ProjectionType } from '../Enums/projection.enum';

export const getEmissionCreatePayload = (
  year: string,
  energyData: EnergySection,
  industryData: IndustrySection,
  agrData: AgricultureSection,
  wasteData: WasteSection,
  otherData: OtherSection
) => {
  const tempPayload: EmissionPayload = {
    year: year,
    energyEmissions: {
      fuelCombustionActivities: {
        energyIndustries: energyData[EnergyLevels.OneA][EnergyOne.OneA1],
        manufacturingIndustriesConstruction: energyData[EnergyLevels.OneA][EnergyOne.OneA2],
        transport: energyData[EnergyLevels.OneA][EnergyOne.OneA3],
        otherSectors: energyData[EnergyLevels.OneA][EnergyOne.OneA4],
        nonSpecified: energyData[EnergyLevels.OneA][EnergyOne.OneA5],
      },
      fugitiveEmissionsFromFuels: {
        solidFuels: energyData[EnergyLevels.OneB][EnergyTwo.OneB1],
        oilNaturalGas: energyData[EnergyLevels.OneB][EnergyTwo.OneB2],
        otherEmissionsEnergyProduction: energyData[EnergyLevels.OneB][EnergyTwo.OneB3],
      },
      carbonDioxideTransportStorage: {
        solidFuels: energyData[EnergyLevels.OneC][EnergyThree.OneC1],
        oilNaturalGas: energyData[EnergyLevels.OneC][EnergyThree.OneC2],
        otherEmissionsEnergyProduction: energyData[EnergyLevels.OneC][EnergyThree.OneC3],
      },
    },
    industrialProcessesProductUse: {
      mineralIndustry: industryData[IndustryLevels.TwoA],
      chemicalIndustry: industryData[IndustryLevels.TwoB],
      metalIndustry: industryData[IndustryLevels.TwoC],
      nonEnergyProductsFuelsSolventUse: industryData[IndustryLevels.TwoD],
      electronicsIndustry: industryData[IndustryLevels.TwoE],
      productUsesSubstOzoneDepletingSubs: industryData[IndustryLevels.TwoF],
      otherProductManufactureUse: industryData[IndustryLevels.TwoG],
      other: industryData[IndustryLevels.TwoH],
    },
    agricultureForestryOtherLandUse: {
      livestock: agrData[AgrLevels.ThreeA],
      land: agrData[AgrLevels.ThreeB],
      aggregateNonCo2SourcesLand: agrData[AgrLevels.ThreeC],
      other: agrData[AgrLevels.ThreeD],
    },
    waste: {
      solidWasteDisposal: wasteData[WasteLevels.FourA],
      biologicalTreatmentSolidWaste: wasteData[WasteLevels.FourB],
      incinerationOpenBurningWaste: wasteData[WasteLevels.FourC],
      wastewaterTreatmentDischarge: wasteData[WasteLevels.FourD],
      other: wasteData[WasteLevels.FourE],
    },
    other: {
      indirectN2oEmissions: otherData[OtherLevels.FiveA],
      other: otherData[OtherLevels.FiveB],
    },
  };

  return tempPayload;
};

export const getProjectionCreatePayload = (
  editableProjections: ProjectionTimeline[],
  projectionType: ProjectionType
) => {
  const payload = {
    projectionType: projectionType,
    projectionData: getEmptyPayload('Projection'),
  };

  Object.values(ProjectionLeafSection).forEach((value) => {
    const editedRow = editableProjections.find((entry) => entry.topicId === value);

    if (editedRow) {
      payload.projectionData[value] = editedRow.values;
    }
  });

  return payload;
};

export const getBaselineSavePayload = (
  editableProjections: ProjectionTimeline[],
  baselineConfigType:
    | ConfigurationSettingsType.PROJECTIONS_WITH_MEASURES
    | ConfigurationSettingsType.PROJECTIONS_WITH_ADDITIONAL_MEASURES
    | ConfigurationSettingsType.PROJECTIONS_WITHOUT_MEASURES
) => {
  const payload = {
    id: baselineConfigType,
    settingValue: getEmptyPayload('Growth Rate'),
  };

  Object.values(ProjectionLeafSection).forEach((value) => {
    const editedRow = editableProjections.find((entry) => entry.topicId === value);

    if (editedRow) {
      payload.settingValue[value] = editedRow.values;
    }
  });

  return payload;
};
