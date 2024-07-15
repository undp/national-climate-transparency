import { ProjectionLeafSection, ProjectionSections } from '../Enums/projection.enum';
import { BaselineTimeline } from './configurationDefinitions';

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

export const getInitTimeline = (dbResponse?: any) => {
  const initProjectionTimeline: ProjectionTimeline[] = [];

  for (const section of Object.values(projectionSectionOrder)) {
    section.forEach((topicId) => {
      if (!nonLeafSections.includes(topicId)) {
        initProjectionTimeline.push({
          key: `${topicId}_edit_init`,
          topicId: topicId,
          values: dbResponse?.[topicId] ?? new Array(51).fill(0),
        });
      }
    });
  }

  return initProjectionTimeline;
};

export const getInitBaseline = (dbResponse?: any) => {
  const initBaselineTimeline: BaselineTimeline[] = [];

  for (const section of Object.values(projectionSectionOrder)) {
    section.forEach((topicId) => {
      if (!nonLeafSections.includes(topicId)) {
        initBaselineTimeline.push({
          key: `${topicId}_edit_init`,
          topicId: topicId,
          values: dbResponse?.[topicId] ?? [0, 2000, 0, 0, 0],
        });
      }
    });
  }

  return initBaselineTimeline;
};

export const getEmptyPayload = (method: 'Projection' | 'Growth Rate') => {
  const defaultFillerValue = method === 'Projection' ? new Array(51).fill(0) : [0, 2000, 0, 0, 0];
  const emptyPayload = {
    [ProjectionLeafSection.ENERGY_INDUSTRIES]: [...defaultFillerValue],
    [ProjectionLeafSection.MANUFACTURING_CONSTRUCTION]: [...defaultFillerValue],
    [ProjectionLeafSection.CIVIL_AVIATION]: [...defaultFillerValue],
    [ProjectionLeafSection.ROAD_TRANSPORTATION]: [...defaultFillerValue],
    [ProjectionLeafSection.RAILWAYS]: [...defaultFillerValue],
    [ProjectionLeafSection.WATER_NAVIGATION]: [...defaultFillerValue],
    [ProjectionLeafSection.OTHER_TRANSPORTATION]: [...defaultFillerValue],
    [ProjectionLeafSection.OTHER_SECTORS]: [...defaultFillerValue],
    [ProjectionLeafSection.NON_SPECIFIED]: [...defaultFillerValue],
    [ProjectionLeafSection.SOLID_FUELS]: [...defaultFillerValue],
    [ProjectionLeafSection.OIL_NATURAL_GAS]: [...defaultFillerValue],
    [ProjectionLeafSection.OTHER_EMISSIONS]: [...defaultFillerValue],
    [ProjectionLeafSection.TRANSPORT_CO2]: [...defaultFillerValue],
    [ProjectionLeafSection.INJECTION_STORAGE]: [...defaultFillerValue],
    [ProjectionLeafSection.OTHER_CO2]: [...defaultFillerValue],

    [ProjectionLeafSection.MINERAL_INDUSTRY]: [...defaultFillerValue],
    [ProjectionLeafSection.CHEMICAL_INDUSTRY]: [...defaultFillerValue],
    [ProjectionLeafSection.METAL_INDUSTRY]: [...defaultFillerValue],
    [ProjectionLeafSection.NON_ENERGY_PRODUCTS]: [...defaultFillerValue],
    [ProjectionLeafSection.ELECTRONICS_INDUSTRY]: [...defaultFillerValue],
    [ProjectionLeafSection.SUBSTITUTES_OZONE]: [...defaultFillerValue],
    [ProjectionLeafSection.OTHER_MANUFACTURE]: [...defaultFillerValue],
    [ProjectionLeafSection.OTHER_INDUSTRIAL]: [...defaultFillerValue],

    [ProjectionLeafSection.ENTERIC_FERMENTATION]: [...defaultFillerValue],
    [ProjectionLeafSection.MANURE_MANAGEMENT]: [...defaultFillerValue],
    [ProjectionLeafSection.FOREST_LAND]: [...defaultFillerValue],
    [ProjectionLeafSection.CROPLAND]: [...defaultFillerValue],
    [ProjectionLeafSection.GRASSLAND]: [...defaultFillerValue],
    [ProjectionLeafSection.WETLANDS]: [...defaultFillerValue],
    [ProjectionLeafSection.SETTLEMENTS]: [...defaultFillerValue],
    [ProjectionLeafSection.OTHER_LAND]: [...defaultFillerValue],

    [ProjectionLeafSection.SOLID_WASTE]: [...defaultFillerValue],
    [ProjectionLeafSection.BIOLOGICAL_TREATMENT]: [...defaultFillerValue],
    [ProjectionLeafSection.INCINERATION_BURNING]: [...defaultFillerValue],
    [ProjectionLeafSection.WASTEWATER_TREATMENT]: [...defaultFillerValue],
    [ProjectionLeafSection.OTHER_WASTE]: [...defaultFillerValue],

    [ProjectionLeafSection.INDIRECT_N2O]: [...defaultFillerValue],
    [ProjectionLeafSection.OTHER]: [...defaultFillerValue],
  };

  return emptyPayload;
};
