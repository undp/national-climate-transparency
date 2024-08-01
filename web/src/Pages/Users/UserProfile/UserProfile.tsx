import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../../Context/UserInformationContext/userInformationContext';
import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Skeleton } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { PersonCircle } from 'react-bootstrap-icons';
import { UserRoleIcon } from '../../../Components/UserRoleIcon/userRoleIcon';
import LanguageSelection from '../../../Components/LanguageSelection/languageSelection';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import './userProfileComponent.scss';
import {
  GHGInventoryManipulate,
  SubRoleManipulate,
  ValidateEntity,
} from '../../../Enums/user.enum';
import { Role } from '../../../Enums/role.enum';

const UserProfile = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['userProfile', 'companyDetails']);

  const onNavigateUpdateUser = (userDetails: any) => {
    navigate('/userManagement/updateUser', {
      state: {
        record: {
          ...userDetails,
        },
      },
    });
  };

  const onNavigateToLogin = () => {
    navigate('/login', { replace: true });
  };

  const getsubRoleComponent = (subRole: any) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
        {subRole === 'GovernmentDepartment'
          ? 'Department'
          : subRole === 'Consultant'
          ? 'Consultant'
          : subRole === 'SEO'
          ? 'SEO'
          : subRole === 'TechnicalReviewer'
          ? 'Technical Reviewer'
          : subRole === 'DevelopmentPartner'
          ? 'Development Partner'
          : subRole}
      </div>
    );
  };

  const { get } = useConnection();
  const [userDetails, setUserDetails] = useState<any>(undefined);
  const { updateToken } = useConnection();
  const { removeUserInfo } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);

  const signOut = (): void => {
    updateToken();
    removeUserInfo();
    onNavigateToLogin();
  };

  const getUserProfileDetails = async () => {
    try {
      setIsLoading(true);
      const response = await get('national/Users/profile');
      if (response.data) {
        setUserDetails(response.data.user);
        setIsLoading(false);
      }
    } catch (exception) {}
  };

  useEffect(() => {
    getUserProfileDetails();
  }, []);

  return (
    <div className="content-container user-profile">
      <Row>
        <Col md={24} lg={8}>
          <div className="title-bar">
            <div>
              <div className="body-title">{t('userProfile:title')}</div>
            </div>
          </div>
        </Col>
        <Col md={24} lg={16}>
          <Row justify="end">
            <Button className="mg-left-1 btn-danger mg-bottom-1" onClick={() => signOut()}>
              {t('userProfile:logOut')}
            </Button>
            {userDetails && (
              <Button
                className="mg-left-1 mg-bottom-1"
                type="primary"
                onClick={() => {
                  onNavigateUpdateUser(userDetails);
                }}
              >
                {t('userProfile:edit')}
              </Button>
            )}
            <LanguageSelection i18n={i18n}></LanguageSelection>
          </Row>
        </Col>
      </Row>

      {!userDetails && (
        <div className="content-body">
          <Skeleton active loading={true}></Skeleton>
        </div>
      )}
      {userDetails && (
        <div className="content-body">
          <Row gutter={16}>
            <Col md={24} lg={8}>
              <Card className="card-container">
                <Row justify="center">
                  <Skeleton loading={isLoading} active>
                    {/* <img className="profile-img" alt="profile-img" src={userDetails.logo} /> */}
                    <PersonCircle color="#3A354199" size={100} />
                  </Skeleton>
                </Row>
                <Row justify="center">
                  <div className=" company-name mg-top-1">{userDetails.name}</div>
                </Row>
              </Card>
            </Col>
            <Col md={24} lg={16}>
              <Card className="card-container">
                <div className="info-view">
                  <div className="title">
                    <span className="title-icon">
                      <UserOutlined />
                    </span>
                    <span className="title-text">{t('userProfile:userDetailsHeading')}</span>
                  </div>
                  <Skeleton loading={isLoading} active>
                    <Row className="field">
                      <Col span={12} className="field-key">
                        {t('userProfile:name')}
                      </Col>
                      <Col span={12} className="field-value">
                        {userDetails.name ? userDetails.name : '-'}
                      </Col>
                    </Row>
                    <Row className="field">
                      <Col span={12} className="field-key">
                        {t('userProfile:email')}
                      </Col>
                      <Col span={12} className="field-value nextline-overflow">
                        {userDetails.email ? userDetails.email : '-'}
                      </Col>
                    </Row>
                    <Row className="field">
                      <Col span={12} className="field-key">
                        {t('userProfile:phoneNo')}
                      </Col>
                      <Col span={12} className="field-value">
                        {userDetails.phoneNo ? userDetails.phoneNo : '-'}
                      </Col>
                    </Row>
                    {userDetails.role !== Role.Observer && (
                      <Row className="field">
                        <Col span={12} className="field-key">
                          {t('userProfile:validatePermission')}
                        </Col>
                        <Col span={12} className="field-value">
                          {userDetails.validatePermission === ValidateEntity.CAN ? 'Yes' : 'No'}
                        </Col>
                      </Row>
                    )}
                    {userDetails.role === Role.GovernmentUser && (
                      <Row className="field">
                        <Col span={12} className="field-key">
                          {t('userProfile:subRolePermission')}
                        </Col>
                        <Col span={12} className="field-value">
                          {userDetails.subRolePermission === SubRoleManipulate.CAN ? 'Yes' : 'No'}
                        </Col>
                      </Row>
                    )}
                    {userDetails.role !== Role.Observer && (
                      <Row className="field">
                        <Col span={12} className="field-key">
                          {t('userProfile:ghgInventoryPermission')}
                        </Col>
                        <Col span={12} className="field-value">
                          {userDetails.ghgInventoryPermission === GHGInventoryManipulate.CAN
                            ? 'Yes'
                            : 'No'}
                        </Col>
                      </Row>
                    )}
                    <Row className="field">
                      <Col span={12} className="field-key">
                        {t('userProfile:role')}
                      </Col>
                      <Col span={12} className="field-value">
                        <UserRoleIcon role={userDetails.role} />
                      </Col>
                    </Row>
                    {userDetails.role !== 'Admin' && userDetails.role !== 'Root' && (
                      <Row className="field">
                        <Col span={12} className="field-key">
                          {t('userProfile:subRole')}
                        </Col>
                        <Col span={12} className="field-value">
                          {userDetails.subRole ? getsubRoleComponent(userDetails.subRole) : '-'}
                        </Col>
                      </Row>
                    )}
                    {userDetails.role !== 'Admin' && userDetails.role !== 'Root' && (
                      <Row className="field">
                        <Col span={12} className="field-key">
                          {t('userProfile:organisation')}
                        </Col>
                        <Col span={12} className="field-value">
                          {userDetails.organisation ? userDetails.organisation : '-'}
                        </Col>
                      </Row>
                    )}
                    {userDetails.role !== 'Admin' && userDetails.role !== 'Root' && (
                      <Row className="field">
                        <Col span={12} className="field-key">
                          {t('userProfile:sector')}
                        </Col>
                        <Col span={12} className="field-value">
                          {userDetails.sector ? userDetails.sector.join(', ') : '-'}
                        </Col>
                      </Row>
                    )}
                  </Skeleton>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
