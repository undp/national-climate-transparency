import { BankOutlined } from '@ant-design/icons';
import { Col, Card, Skeleton, Row } from 'antd';
import './companyDetailsComponent.scss';
import CompanyRoleIcon from '../CompanyRoleIcon/companyRoleIcon';
import { OrganisationType } from '../../Definitions/organisation.type.enum';
import { Sector } from '../../Enums/sector.enum';

export const CompanyDetailsComponent = (props: any) => {
  const { t, companyDetails, userDetails, isLoading, regionField, systemType } = props;

  const getEnumKeysFromValues = (values: string[]): string[] => {
    const enumKeys: string[] = [];
    for (const key in Sector) {
      if (values.includes(Sector[key as keyof typeof Sector])) {
        enumKeys.push(key);
      }
    }

    return enumKeys;
  };

  return (
    <Card className="card-container">
      <div className="info-view">
        <div className="title">
          <span className="title-icon">
            <BankOutlined />
          </span>
          <span className="title-text">{t('companyDetails:organisationDetailsHeading')}</span>
        </div>
        <Skeleton loading={isLoading} active>
          <Row className="field">
            <Col span={12} className="field-key">
              {t('companyDetails:name')}
            </Col>
            <Col span={12} className="field-value">
              {companyDetails.name ? companyDetails.name : '-'}
            </Col>
          </Row>
          <Row className="field">
            <Col span={12} className="field-key">
              {t('companyDetails:organisationType')}
            </Col>
            <Col span={12} className="field-value">
              <CompanyRoleIcon role={companyDetails.organisationType} />
            </Col>
          </Row>
          {companyDetails?.organisationType === OrganisationType.DEPARTMENT && (
            <>
              <Row className="field">
                <Col span={12} className="field-key">
                  {t('companyDetails:sector')}
                </Col>
                <Col span={12} className="field-value">
                  {getEnumKeysFromValues(companyDetails.sector).join(', ')}
                </Col>
              </Row>
            </>
          )}
          <Row className="field">
            <Col span={12} className="field-key">
              {t('companyDetails:email')}
            </Col>
            <Col span={12} className="field-value nextline-overflow">
              {companyDetails.email ? companyDetails.email : '-'}
            </Col>
          </Row>
          <Row className="field">
            <Col span={12} className="field-key">
              {t('companyDetails:phoneNo')}
            </Col>
            <Col span={12} className="field-value">
              {companyDetails.phoneNo ? companyDetails.phoneNo : '-'}
            </Col>
          </Row>
          <Row className="field">
            <Col span={12} className="field-key">
              {t('companyDetails:website')}
            </Col>
            <Col span={12} className="field-value ellipsis-overflow">
              {companyDetails.website ? (
                <a target={'blank'} href={companyDetails.website}>
                  {companyDetails.website}
                </a>
              ) : (
                '-'
              )}
            </Col>
          </Row>
          <Row className="field">
            <Col span={12} className="field-key">
              {t('companyDetails:address')}
            </Col>
            <Col span={12} className="field-value">
              {companyDetails.address ? companyDetails.address : '-'}
            </Col>
          </Row>
          {regionField && (
            <Row className="field">
              <Col span={12} className="field-key">
                {t('companyDetails:region')}
              </Col>
              <Col span={12} className="field-value">
                {companyDetails.regions ? companyDetails.regions.join(', ') : '-'}
              </Col>
            </Row>
          )}
          <Row className="field">
            <Col span={12} className="field-key">
              {t('companyDetails:userCount')}
            </Col>
            <Col span={12} className="field-value">
              {companyDetails.userCount ? companyDetails.userCount : '-'}
            </Col>
          </Row>
        </Skeleton>
      </div>
    </Card>
  );
};
