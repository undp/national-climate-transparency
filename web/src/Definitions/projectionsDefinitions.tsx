import { ProjectionSections } from '../Enums/projection.enum';

export interface ProjectionTimeline {
  key: string;
  projectionType: 'withMeasures' | 'withoutMeasures' | 'withAdditionalMeasures';
  topicId: string;
  [year: string]: any;
}

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

export const getInitTimeline = (
  projectionType: 'withMeasures' | 'withoutMeasures' | 'withAdditionalMeasures'
) => {
  const initProjectionTimeline: ProjectionTimeline[] = [];

  for (const section of Object.values(projectionSectionOrder)) {
    section.forEach((topicId) => {
      initProjectionTimeline.push({
        key: (initProjectionTimeline.length + 1).toString(),
        projectionType: projectionType,
        topicId: topicId,
      });
    });
  }

  console.log(initProjectionTimeline.length);

  return initProjectionTimeline;
};
