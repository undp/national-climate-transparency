import { Button, Col, Collapse, Row } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import i18next from 'i18next';
import sliderLogo from '../../Assets/Images/mrvlogo.svg';
import LayoutFooter from '../../Components/Footer/layout.footer';
import './homepage.scss';
import CollapsePanel from 'antd/lib/collapse/CollapsePanel';

const Homepage = () => {
  const { t } = useTranslation(['common', 'homepage']);
  const navigate = useNavigate();
  const [Visible, setVisible] = useState(true);

  const controlDownArrow = () => {
    if (window.scrollY > 150) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  };

  const handleClickScroll = () => {
    const element = document.getElementById('scrollhome');
    if (element) {
      // 👇 Will scroll smoothly to the top of the next section
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (localStorage.getItem('i18nextLng')!.length > 2) {
      i18next.changeLanguage('en');
    }
    window.addEventListener('scroll', controlDownArrow);
    return () => {
      window.removeEventListener('scroll', controlDownArrow);
    };
  }, []);
  return (
    <div className="homepage-container">
      <Row>
        <Col md={24} lg={24} flex="auto">
          <div className="homepage-img-container image-container">
            <Row className="header-row">
              <Col md={18} lg={21} xs={17} flex="auto">
                <div className="homepage-header-container">
                  <div className="logo">
                    <img src={sliderLogo} alt="slider-logo" />
                  </div>
                  <div>
                    <div style={{ display: 'flex' }}>
                      <div className="title">{'NDC TRANSPARENCY'}</div>
                      <div className="title-sub">{'SYSTEM'}</div>
                    </div>
                    <div className="country-name">
                      {process.env.REACT_APP_COUNTRY_NAME || 'CountryX'}
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={6} lg={3} xs={7} flex="auto">
                <div className="homepage-button-container">
                  <div className="button">
                    <Button type="primary" onClick={() => navigate('/login')}>
                      SIGN IN
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
            <Row>
              <div className="text-ctn">
                <span>
                  {t('homepage:nationalNdc')} {t('homepage:transparency')} <br />
                  {t('homepage:system')}
                </span>
                <div className="subhome">{t('homepage:lorem')}</div>
              </div>
            </Row>
            <Row>
              {Visible && (
                <nav className={'arrows'}>
                  <svg onClick={handleClickScroll}>
                    <path className="a1" d="M0 0 L30 32 L60 0"></path>
                    <path className="a2" d="M0 20 L30 52 L60 20"></path>
                    <path className="a3" d="M0 40 L30 72 L60 40"></path>
                  </svg>
                </nav>
              )}
            </Row>
          </div>
        </Col>
      </Row>
      <Row gutter={[8, 8]}>
        <Col md={24} lg={24} flex="auto">
          <div className="homepage-content-containerwhite">
            <div id="scrollhome" className="title">
              {t('homepage:ourVisionTitle')}
            </div>
            <div className="homepagebody">
              <div className="homepagebody_text">
                {t('homepage:ourVisionContentStart')}
                <strong> {t('homepage:ourVisionContentHighlight')} </strong>
                {t('homepage:ourVisionContentEnd')}
              </div>
              <div className="homepagebody_text">{t('homepage:OurPlatformEnables')}</div>

              <div className="aboutus_cards-container">
                <Row gutter={[5, 5]} className="aboutus_card-row">
                  <Col xxl={8} xl={8} md={24} className="aboutus_card-col">
                    <div className="aboutus-card-main-container">
                      <Col>
                        <Row className="aboutus_card-row">
                          <div className="aboutus-card-title">{t('homepage:governmentsTitle')}</div>
                        </Row>
                        <Row className="aboutus_card-row">
                          <div className="aboutus-card-text">
                            {t('homepage:governmentsBodyTxt1')}
                          </div>
                        </Row>
                        <Row className="aboutus_card-row">
                          <div className="aboutus-card-text">
                            {t('homepage:governmentsBodyTxt2')}
                          </div>
                        </Row>
                        <Row className="aboutus_card-row">
                          <div className="aboutus-card-text">
                            {t('homepage:governmentsBodyTxt3')}
                          </div>
                        </Row>
                        <Row className="aboutus_card-row">
                          <div className="aboutus-card-text">
                            {t('homepage:governmentsBodyTxt4')}
                          </div>
                        </Row>
                      </Col>
                    </div>
                  </Col>
                  <Col xxl={8} xl={8} md={24} className="aboutus_card-col">
                    <div className="aboutus-card-main-container">
                      <Col>
                        <Row className="aboutus_card-row">
                          <div className="aboutus-card-title">
                            {t('homepage:projectDevelopersTitle')}
                          </div>
                        </Row>
                        <Row className="aboutus_card-row">
                          <div className="aboutus-card-text">
                            {t('homepage:projectDevelopersBodyTxt1')}
                          </div>
                        </Row>
                        <Row className="aboutus_card-row">
                          <div className="aboutus-card-text">
                            {t('homepage:projectDevelopersBodyTxt2')}
                          </div>
                        </Row>
                        <Row className="aboutus_card-row">
                          <div className="aboutus-card-text">
                            {t('homepage:projectDevelopersBodyTxt3')}
                          </div>
                        </Row>
                      </Col>
                    </div>
                  </Col>
                  <Col xxl={8} xl={8} md={24} className="aboutus_card-col">
                    <div className="aboutus-card-main-container">
                      <Col>
                        <Row className="aboutus_card-row">
                          <div className="aboutus-card-title">{t('homepage:certifiersTitle')}</div>
                        </Row>
                        <Row className="aboutus_card-row">
                          <div className="aboutus-card-text">
                            {t('homepage:certifiersBodyTxt1')}
                          </div>
                        </Row>
                        <Row className="aboutus_card-row">
                          <div className="aboutus-card-text">
                            {t('homepage:certifiersBodyTxt2')}
                          </div>
                        </Row>
                        <Row className="aboutus_card-row">
                          <div className="aboutus-card-text">
                            {t('homepage:certifiersBodyTxt3')}
                          </div>
                        </Row>
                      </Col>
                    </div>
                  </Col>
                  {/* <Col xxl={6} xl={6} md={12} className="aboutus_card-col">
                    <div className="aboutus-card-main-container">
                      <Col>
                        <Row className="aboutus_card-row">
                          <div>
                            <CartCheck className="aboutusicon" color="#FFFF" size="60px" />
                          </div>
                        </Row>
                        <Row className="aboutus_card-row">
                          <div className="aboutus-card-title">{t('homepage:buyersTitle')}</div>
                        </Row>
                        <Row>
                          <div className="aboutus-card-text">{t('homepage:buyersBody')}</div>
                        </Row>
                      </Col>
                    </div>
                  </Col> */}
                </Row>
              </div>
              <div className="homepagebody_subtitle">{t('homepage:policyContextTitle')}</div>
              <div className="homepagebody_text">{t('homepage:policyContextBody')}</div>
              <div className="homepagebody_text">{t('homepage:policyContextBody2')}</div>
              <div className="homepagebody_subtitle">{t('homepage:digitalPublicTitle')}</div>
              <div className="homepagebody_text">
                <Trans
                  i18nKey="homepage:digitalPublicBody"
                  components={{
                    a0: (
                      <a
                        href="https://digitalpublicgoods.net/digital-public-goods/"
                        target="_blank"
                      />
                    ),
                    a1: (
                      <a
                        href="https://github.com/undp/national-climate-transparency"
                        target="_blank"
                      />
                    ),
                  }}
                />
              </div>
              <div className="homepagebody_subtitle">{t('homepage:demoSiteTitle')}</div>
              <div className="homepagebody_text">
                <Trans
                  i18nKey="homepage:demoSiteBody"
                  components={{
                    b: <strong />,
                    ul: <ul className="homepagebody_text list" />,
                    li: <li />,
                    a: <a href="mailto:digital4planet@undp.org" target="_blank" />,
                    a0: <a href="https://transparency-demo.carbreg.org/" target="_blank" />,
                  }}
                />
              </div>
              <div className="homepagebody_text">
                <Trans
                  i18nKey="homepage:demoSiteBody2"
                  components={{
                    a: (
                      <a
                        href="https://github.com/undp/national-climate-transparency"
                        target="_blank"
                      />
                    ),
                  }}
                />
              </div>
            </div>
            <div className="title">{t('homepage:HdiwTitle')}</div>
            <div className="homepagebody">
              <div className="homepagebody_text">{t('homepage:HdiwBody')}</div>
              <ul className="homepagebody_text list">
                <li>
                  <strong>{t('homepage:feature1Title')}</strong>:{' '}
                  {t('homepage:feature1Description')}
                </li>
                <li>
                  <strong>{t('homepage:feature2Title')}</strong>:{' '}
                  {t('homepage:feature2Description')}
                </li>
                <li>
                  <strong>{t('homepage:feature3Title')}</strong>:{' '}
                  {t('homepage:feature3Description')}
                </li>
                <li>
                  <strong>{t('homepage:feature4Title')}</strong>:{' '}
                  {t('homepage:feature4Description')}
                </li>
                <li>
                  <strong>{t('homepage:feature5Title')}</strong>:{' '}
                  {t('homepage:feature5Description')}
                </li>
              </ul>
            </div>
          </div>
        </Col>
      </Row>
      <Row gutter={[8, 8]}>
        <Col md={24} lg={24} flex="auto">
          <div className="homepage-image-content-container">
            <Row>
              <Col className="eligicontent" flex={2} md={22} lg={23}>
                <div className="title">{t('homepage:faqTitle')}</div>
                <div className="homepagebody homepage_accordian_wrapper">
                  <Collapse accordion defaultActiveKey={['1']} className="homepage_accordian">
                    <CollapsePanel
                      header={t('homepage:faqQ1')}
                      key="1"
                      className="homepage_collapsepanel"
                    >
                      <div className="collapsetext">{t('homepage:faqA1')}</div>
                    </CollapsePanel>
                    <CollapsePanel
                      header={t('homepage:faqQ2')}
                      key="2"
                      className="homepage_collapsepanel"
                    >
                      <div className="collapsetext">
                        <Trans
                          i18nKey="homepage:faqA2"
                          components={{
                            ol: <ol />,
                            li: <li />,
                            b: <strong />,
                          }}
                        />
                      </div>
                    </CollapsePanel>
                    <CollapsePanel
                      header={t('homepage:faqQ3')}
                      key="3"
                      className="homepage_collapsepanel"
                    >
                      <div className="collapsetext">
                        <Trans
                          i18nKey="homepage:faqA3"
                          components={{
                            ul: <ul />,
                            li: <li />,
                            b: <strong />,
                          }}
                        />
                      </div>
                    </CollapsePanel>
                    <CollapsePanel
                      header={t('homepage:faqQ4')}
                      key="4"
                      className="homepage_collapsepanel"
                    >
                      <div className="collapsetext">
                        <Trans
                          i18nKey="homepage:faqA4"
                          components={{
                            ul: <ul />,
                            li: <li />,
                            b: <strong />,
                          }}
                        />
                      </div>
                    </CollapsePanel>
                    <CollapsePanel
                      header={t('homepage:faqQ5')}
                      key="5"
                      className="homepage_collapsepanel"
                    >
                      <div className="collapsetext">{t('homepage:faqA5')}</div>
                      <div className="collapsetext">
                        <Trans
                          i18nKey="homepage:faqA5-2"
                          components={{
                            a: <a href="mailto:digital4planet@undp.org" target="_blank" />,
                          }}
                        />
                      </div>
                      <div className="collapsetext">{t('homepage:faqA5-3')}</div>
                    </CollapsePanel>
                    <CollapsePanel
                      header={t('homepage:faqQ6')}
                      key="6"
                      className="homepage_collapsepanel"
                    >
                      <div className="collapsetext">
                        <Trans
                          i18nKey="homepage:faqA6"
                          components={{
                            ul: <ul />,
                            li: <li />,
                            b: <strong />,
                          }}
                        />
                      </div>
                      <div className="collapsetext">
                        <Trans
                          i18nKey="homepage:faqA6-2"
                          components={{
                            ul: <ul />,
                            li: <li />,
                            b: <strong />,
                          }}
                        />
                      </div>
                      <div className="collapsetext">
                        <Trans
                          i18nKey="homepage:faqA6-3"
                          components={{
                            b: <strong />,
                          }}
                        />
                      </div>
                    </CollapsePanel>
                    <CollapsePanel
                      header={t('homepage:faqQ7')}
                      key="7"
                      className="homepage_collapsepanel"
                    >
                      <div className="collapsetext">
                        <Trans
                          i18nKey="homepage:faqA7"
                          components={{
                            ul: <ul />,
                            li: <li />,
                            b: <strong />,
                          }}
                        />
                      </div>
                    </CollapsePanel>
                  </Collapse>
                </div>
              </Col>
              <Col flex={3} md={8} lg={8}>
                {/* <ImgWithFallback
                  className="forest-image"
                  src={forestfall}
                  fallbackSrc={forestfall}
                  mediaType="image/webp"
                  alt="forestry"
                /> */}
                {/* <img className="image" src={forest} alt="forest" /> */}
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
      <LayoutFooter />
    </div>
  );
};

export default Homepage;
