import { SupportManagementComponent } from '@undp/carbon-library';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../Context/UserInformationContext/userInformationContext';
import { useTranslation } from 'react-i18next';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { useSettingsContext } from '../../Context/SettingsContext/settingsContext';
import './supportCreationStyles.scss';

const SupportManagement = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['common', 'programme']);

  const onNavigateToProgrammeView = (programmeId: any) => {
    navigate('/programmeManagement/view', { state: { id: programmeId } });
  };

  const onNavigateAddSupport = () => {
    navigate('/supportManagement/addSupport');
  };

  return (
    <SupportManagementComponent
      translator={i18n}
      useConnection={useConnection}
      onNavigateToProgrammeView={onNavigateToProgrammeView}
      useUserContext={useUserContext}
      useSettingsContext={useSettingsContext}
      enableAddSupport={true}
      onClickAddSupport={onNavigateAddSupport}
    ></SupportManagementComponent>
  );
};

export default SupportManagement;
