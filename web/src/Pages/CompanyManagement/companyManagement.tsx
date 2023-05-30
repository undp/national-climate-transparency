import { useNavigate } from 'react-router-dom';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { AbilityContext } from '../../Casl/Can';
import { CompanyManagementComponent, CompanyManagementColumns } from 'carbon-library';
import { useTranslation } from 'react-i18next';

const CompanyManagement = () => {
  const navigate = useNavigate();
  const { post } = useConnection();
  const { t } = useTranslation(['company']);

  const visibleColumns = [
    CompanyManagementColumns.logo,
    CompanyManagementColumns.name,
    CompanyManagementColumns.taxId,
    CompanyManagementColumns.companyRole,
    CompanyManagementColumns.programmeCount,
  ];

  const navigateToCompanyProfile = (record: any) => {
    navigate('/companyProfile/view', { state: { record } });
  };

  const navigateToAddNewCompany = () => {
    navigate('/companyManagement/addCompany');
  };

  return (
    <CompanyManagementComponent
      t={t}
      AbilityContext={AbilityContext}
      post={post}
      visibleColumns={visibleColumns}
      onNavigateToCompanyProfile={navigateToCompanyProfile}
      onClickAddCompany={navigateToAddNewCompany}
    ></CompanyManagementComponent>
  );
};

export default CompanyManagement;
