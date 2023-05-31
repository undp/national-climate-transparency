import { MapComponentProps, MapTypes } from 'carbon-library';
import MapboxComponent from './MapboxComponent';

const MapComponent = (props: MapComponentProps) => {
  const { mapType } = props;

  return <div>{mapType === MapTypes.Mapbox ? MapboxComponent(props) : ''}</div>;
};

export default MapComponent;
