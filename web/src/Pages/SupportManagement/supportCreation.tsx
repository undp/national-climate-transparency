import { SupportCreationComponent } from '@undp/carbon-library';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AddSupportComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'programme']);

  const onNavigateToProgrammeView = () => {
    navigate('/programmeManagement/view');
  };

  const onNavigateToProgrammeManagementView = () => {
    navigate('/programmeManagement/viewAll');
  };

  return (
    <SupportCreationComponent
      t={t}
      useLocation={useLocation}
      onNavigateToProgrammeManagementView={onNavigateToProgrammeManagementView}
      onNavigateToProgrammeView={onNavigateToProgrammeView}
    ></SupportCreationComponent>
  );
};

export default AddSupportComponent;
