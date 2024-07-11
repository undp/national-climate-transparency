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
