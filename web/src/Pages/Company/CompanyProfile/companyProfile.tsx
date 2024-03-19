import { Button, Card, Col, Row, Skeleton } from 'antd';
import { plainToClass } from 'class-transformer';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import './companyProfileComponent.scss';
import { CarbonSystemType, OrganisationStatus, useConnection } from '@undp/carbon-library';
import { useAbilityContext } from '../../../Casl/Can';
import { Action } from '../../../Enums/action.enum';
import { Organisation } from '../../../Entities/organisation';
import { CompanyDetailsComponent } from '../../../Components/CompanyDetails/companyDetailsComponent';

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['companyProfile', 'companyDetails']);

  const onNavigateToCompanyManagement = () => {
    navigate('/companyManagement/viewAll');
  };

  const onNavigateToCompanyEdit = (companyDetails: any) => {
    navigate('/companyManagement/updateCompany', { state: { record: companyDetails } });
  };

  const { get, post } = useConnection();
  const [companyDetails, setCompanyDetails] = useState<any>(undefined);
  const [userDetails, setUserDetails] = useState<any>(undefined);
  const { state } = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<any>('');
  const [companyRole, setCompanyRole] = useState<any>('');
  const ability = useAbilityContext();

  const getCompanyDetails = async (organisationId: string) => {
    try {
      setIsLoading(true);
      const response = await get(`national/organisation/profile?id=${organisationId}`);
      if (response.data) {
        setCompanyDetails(response.data);
        setIsLoading(false);
      }
    } catch (exception) {}
  };

  const getUserDetails = async (organisationId: string) => {
    setIsLoading(true);
    try {
      const response: any = await post('national/user/query', {
        page: 1,
        size: 10,
        filterAnd: [
          {
            key: 'organisationId',
            operation: '=',
            value: organisationId,
          },
          {
            key: 'isPending',
            operation: '=',
            value: true,
          },
        ],
      });
      if (response && response.data) {
        setUserDetails(response.data[0]);
      }
      setIsLoading(false);
    } catch (error: any) {
      console.log('Error in getting users', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!state) {
      onNavigateToCompanyManagement();
    } else {
      getCompanyDetails(state.record.organisationId);
      const userRoleValue = localStorage.getItem('userRole') as string;
      setUserRole(userRoleValue);
      setCompanyRole(localStorage.getItem('companyRole') as string);
      // eslint-disable-next-line eqeqeq
      if (state.record?.state == '2' || state.record?.state == '3') {
        getUserDetails(state.record.organisationId);
      }
    }
  }, []);

  return (
    <div className="content-container company-profile">
      <div className="title-bar">
        <div>
          <div className="body-title">{t('companyProfile:title')}</div>
          <div className="body-sub-title">{t('companyProfile:subTitle')}</div>
        </div>
        <div className="flex-display">
          {ability.can(Action.Update, plainToClass(Organisation, companyDetails)) &&
            !isLoading &&
            companyDetails && (
              <Button
                className="mg-left-1"
                type="primary"
                onClick={() => onNavigateToCompanyEdit(companyDetails)}
              >
                {t('common:edit')}
              </Button>
            )}
        </div>
      </div>
      {!companyDetails && (
        <div className="content-body">
          <Skeleton active loading={true}></Skeleton>
        </div>
      )}
      {companyDetails && (
        <div className="content-body">
          <Row gutter={16}>
            <Col md={24} lg={8}>
              <Card className="card-container">
                <Skeleton loading={isLoading} active>
                  <Row justify="center">
                    <img className="profile-img" alt="profile image" src={companyDetails.logo} />
                  </Row>
                  <Row justify="center">
                    <div className="padding-top-1 company-name">{companyDetails.name}</div>
                  </Row>
                  <Row justify="center">
                    <OrganisationStatus
                      t={t}
                      organisationStatus={parseInt(companyDetails.state)}
                    ></OrganisationStatus>
                  </Row>
                </Skeleton>
              </Card>
            </Col>
            <Col md={24} lg={16}>
              <CompanyDetailsComponent
                t={t}
                companyDetails={companyDetails}
                userDetails={userDetails}
                isLoading={isLoading}
                regionField
                systemType={CarbonSystemType.MRV}
              />
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;
