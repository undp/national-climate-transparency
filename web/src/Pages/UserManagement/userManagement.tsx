import { useNavigate } from 'react-router-dom';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { AbilityContext } from '../../Casl/Can';
import { UserManagementComponent, userManagementColumns } from 'carbon-library';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '../../Context/UserInformationContext/userInformationContext';

const UserManagement = () => {
  const navigate = useNavigate();
  const { userInfoState } = useUserContext();
  const { post, delete: del } = useConnection();
  const { t } = useTranslation(['company']);

  const visibleColumns = [
    userManagementColumns.logo,
    userManagementColumns.name,
    userManagementColumns.email,
    userManagementColumns.phoneNo,
    userManagementColumns.company,
    userManagementColumns.companyRole,
    userManagementColumns.role,
  ];

  const navigateToUpdateUser = (record: any) => {
    navigate('/userManagement/updateUser', { state: { record } });
  };

  const navigateToAddNewUser = () => {
    navigate('/userManagement/addUSer');
  };

  return (
    <UserManagementComponent
      t={t}
      AbilityContext={AbilityContext}
      post={post}
      del={del}
      visibleColumns={visibleColumns}
      onNavigateToUpdateUser={navigateToUpdateUser}
      onClickAddUser={navigateToAddNewUser}
      userInfoState={userInfoState}
    ></UserManagementComponent>
  );
};

export default UserManagement;
