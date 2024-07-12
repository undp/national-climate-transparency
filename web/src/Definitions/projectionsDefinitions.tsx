import { ProjectionLeafSection, ProjectionSections } from '../Enums/projection.enum';

export type ProjectionTimeline = {
  key: string;
  topicId: string;
  values: number[];
};

export type SectionOpen = {
  [ProjectionSections.ENERGY]: boolean;
  [ProjectionSections.INDUSTRY]: boolean;
  [ProjectionSections.AGR_FOR_OTH_LAND]: boolean;
  [ProjectionSections.WASTE]: boolean;
  [ProjectionSections.OTHER]: boolean;
};

export const projectionSectionOrder = {
  [ProjectionSections.ENERGY]: [
    '1',
    '1A',
    '1A1',
    '1A2',
    '1A3',
    '1A3a',
    '1A3b',
    '1A3c',
    '1A3d',
    '1A3e',
    '1A4',
    '1A5',
    '1B',
    '1B1',
    '1B2',
    '1B3',
    '1C',
    '1C1',
    '1C2',
    '1C3',
  ],
  [ProjectionSections.INDUSTRY]: ['2', '2A', '2B', '2C', '2D', '2E', '2F', '2G', '2H'],
  [ProjectionSections.AGR_FOR_OTH_LAND]: [
    '3',
    '3A',
    '3A1',
    '3A2',
    '3B',
    '3B1',
    '3B2',
    '3B3',
    '3B4',
    '3B5',
    '3B6',
  ],
  [ProjectionSections.WASTE]: ['4', '4A', '4B', '4C', '4D', '4E'],
  [ProjectionSections.OTHER]: ['5', '5A', '5B'],
};

export const nonLeafSections: string[] = [
  '1',
  '1A',
  '1A3',
  '1B',
  '1C',
  '2',
  '3',
  '3A',
  '3B',
  '4',
  '5',
];

export const getInitTimeline = () => {
  const initProjectionTimeline: ProjectionTimeline[] = [];

  for (const section of Object.values(projectionSectionOrder)) {
    section.forEach((topicId) => {
      if (!nonLeafSections.includes(topicId)) {
        initProjectionTimeline.push({
          key: `${topicId}_edit_init`,
          topicId: topicId,
          values: new Array(51).fill(0),
        });
      }
    });
  }

  return initProjectionTimeline;
};

export const projectionEmptyPayload = {
  [ProjectionLeafSection.ENERGY_INDUSTRIES]: new Array(51).fill(0),
  [ProjectionLeafSection.MANUFACTURING_CONSTRUCTION]: new Array(51).fill(0),
  [ProjectionLeafSection.CIVIL_AVIATION]: new Array(51).fill(0),
  [ProjectionLeafSection.ROAD_TRANSPORTATION]: new Array(51).fill(0),
  [ProjectionLeafSection.RAILWAYS]: new Array(51).fill(0),
  [ProjectionLeafSection.WATER_NAVIGATION]: new Array(51).fill(0),
  [ProjectionLeafSection.OTHER_TRANSPORTATION]: new Array(51).fill(0),
  [ProjectionLeafSection.OTHER_SECTORS]: new Array(51).fill(0),
  [ProjectionLeafSection.NON_SPECIFIED]: new Array(51).fill(0),
  [ProjectionLeafSection.SOLID_FUELS]: new Array(51).fill(0),
  [ProjectionLeafSection.OIL_NATURAL_GAS]: new Array(51).fill(0),
  [ProjectionLeafSection.OTHER_EMISSIONS]: new Array(51).fill(0),
  [ProjectionLeafSection.TRANSPORT_CO2]: new Array(51).fill(0),
  [ProjectionLeafSection.INJECTION_STORAGE]: new Array(51).fill(0),
  [ProjectionLeafSection.OTHER_CO2]: new Array(51).fill(0),

  [ProjectionLeafSection.MINERAL_INDUSTRY]: new Array(51).fill(0),
  [ProjectionLeafSection.CHEMICAL_INDUSTRY]: new Array(51).fill(0),
  [ProjectionLeafSection.METAL_INDUSTRY]: new Array(51).fill(0),
  [ProjectionLeafSection.NON_ENERGY_PRODUCTS]: new Array(51).fill(0),
  [ProjectionLeafSection.ELECTRONICS_INDUSTRY]: new Array(51).fill(0),
  [ProjectionLeafSection.SUBSTITUTES_OZONE]: new Array(51).fill(0),
  [ProjectionLeafSection.OTHER_MANUFACTURE]: new Array(51).fill(0),
  [ProjectionLeafSection.OTHER_INDUSTRIAL]: new Array(51).fill(0),

  [ProjectionLeafSection.ENTERIC_FERMENTATION]: new Array(51).fill(0),
  [ProjectionLeafSection.MANURE_MANAGEMENT]: new Array(51).fill(0),
  [ProjectionLeafSection.FOREST_LAND]: new Array(51).fill(0),
  [ProjectionLeafSection.CROPLAND]: new Array(51).fill(0),
  [ProjectionLeafSection.GRASSLAND]: new Array(51).fill(0),
  [ProjectionLeafSection.WETLANDS]: new Array(51).fill(0),
  [ProjectionLeafSection.SETTLEMENTS]: new Array(51).fill(0),
  [ProjectionLeafSection.OTHER_LAND]: new Array(51).fill(0),

  [ProjectionLeafSection.SOLID_WASTE]: new Array(51).fill(0),
  [ProjectionLeafSection.BIOLOGICAL_TREATMENT]: new Array(51).fill(0),
  [ProjectionLeafSection.INCINERATION_BURNING]: new Array(51).fill(0),
  [ProjectionLeafSection.WASTEWATER_TREATMENT]: new Array(51).fill(0),
  [ProjectionLeafSection.OTHER_WASTE]: new Array(51).fill(0),

  [ProjectionLeafSection.INDIRECT_N2O]: new Array(51).fill(0),
  [ProjectionLeafSection.OTHER]: new Array(51).fill(0),
};
