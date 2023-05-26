import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { useLocation, useNavigate } from 'react-router-dom';
import './programmeView.scss';
import { useTranslation } from 'react-i18next';
import Geocoding from '@mapbox/mapbox-sdk/services/geocoding';
import { useUserContext } from '../../Context/UserInformationContext/userInformationContext';
import { useSettingsContext } from '../../Context/SettingsContext/settingsContext';
import { ProgrammeViewComponent } from 'carbon-library';

const ProgrammeView = () => {
  const { t } = useTranslation(['view']);
  const mapType = process.env.REACT_APP_MAP_TYPE ? process.env.REACT_APP_MAP_TYPE : 'None';

  return (
    <ProgrammeViewComponent
      t={t}
      useConnection={useConnection}
      useLocation={useLocation}
      useNavigate={useNavigate}
      Geocoding={Geocoding}
      useUserContext={useUserContext}
      useSettingsContext={useSettingsContext}
      mapType={mapType}
      mapBoxAccessToken={process.env.REACT_APP_MAPBOXGL_ACCESS_TOKEN}
      countryCode={process.env.COUNTRY_CODE}
    ></ProgrammeViewComponent>
  );
};

export default ProgrammeView;
