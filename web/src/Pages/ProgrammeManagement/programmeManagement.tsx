import { useNavigate } from 'react-router-dom';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '../../Context/UserInformationContext/userInformationContext';
import { ProgrammeManagementComponent, ProgrammeManagementColumns } from 'carbon-library';
import './programmeManagement.scss';

const ProgrammeManagement = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'programme']);

  const visibleColumns = [
    ProgrammeManagementColumns.title,
    ProgrammeManagementColumns.company,
    ProgrammeManagementColumns.sector,
    ProgrammeManagementColumns.currentStage,
  ];

  const onNavigateToProgrammeView = (record: any) => {
    navigate('/programmeManagement/view', { state: { record } });
  };

  return (
    <ProgrammeManagementComponent
      t={t}
      visibleColumns={visibleColumns}
      useUserContext={useUserContext}
      useConnection={useConnection}
      onNavigateToProgrammeView={onNavigateToProgrammeView}
    ></ProgrammeManagementComponent>
  );
};

export default ProgrammeManagement;
