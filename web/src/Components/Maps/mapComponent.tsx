import { MapComponentProps, MapTypes } from '../../Definitions/mapComponent.definitions';
import { MapBoxComponent } from './mapBoxComponent';

export const MapComponent = (props: MapComponentProps) => {
  const { mapType } = props;

  return <div>{mapType === MapTypes.Mapbox ? MapBoxComponent(props) : ''}</div>;
};
