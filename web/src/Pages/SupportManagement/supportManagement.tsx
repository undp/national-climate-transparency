import { SupportManagementComponent } from '@undp/carbon-library';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
      onNavigateToProgrammeView={onNavigateToProgrammeView}
      enableAddSupport={true}
      onClickAddSupport={onNavigateAddSupport}
    ></SupportManagementComponent>
  );
};

export default SupportManagement;
