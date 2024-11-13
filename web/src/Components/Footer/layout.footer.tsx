import { Col, Divider, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import sliderLogo from '../../Assets/Images/mrvlogo.svg';
import './layout.footer.scss';
import { CcCircle } from 'react-bootstrap-icons';

const LayoutFooter = () => {
  const { t } = useTranslation(['common', 'homepage']);

  return (
    <div className="homepage-footer-container">
      <Row>
        <Col md={24} lg={24}>
          <div className="logocontainer">
            <div className="logo">
              <img src={sliderLogo} alt="slider-logo" />
            </div>
            <div>
              <div style={{ display: 'flex' }}>
                <div className="title">{'NDC TRANSPARENCY'}</div>
                <div className="title-sub">{'SYSTEM'}</div>
              </div>
              <div className="footer-country-name">
                {process.env.REACT_APP_COUNTRY_NAME || 'CountryX'}
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <Divider className="divider" style={{ backgroundColor: '#FFFF' }} />
      <Row>
        <Col md={24} lg={24}>
          <div className="footertext">{t('homepage:footertext1')}</div>
        </Col>
      </Row>
      <Row>
        <Col md={10} lg={10}>
          <div className="footertext-bottom">
            {process.env.REACT_APP_COUNTRY_NAME || 'CountryX'}
            <CcCircle className="cc" color="#FFFF" size="10px" />
          </div>
        </Col>
        <Col md={14} lg={14}>
          <div className="footertext-link-container">
            <div>
              <a href="/info/help" className="footertext-links">
                {t('homepage:Help')}
              </a>
              <a href="/info/status" className="footertext-links">
                {t('homepage:Status')}
              </a>
              <a href="/info/cookie" className="footertext-links">
                {t('homepage:Cookie')}
              </a>
              <a href="/info/codeOfConduct" className="footertext-links">
                {t('homepage:codeOfConduct')}
              </a>
              <a href="/info/termsOfUse" className="footertext-links">
                {t('homepage:terms')}
              </a>
              <a href="/info/privacy" className="footertext-links">
                {t('homepage:privacy')}
              </a>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default LayoutFooter;
