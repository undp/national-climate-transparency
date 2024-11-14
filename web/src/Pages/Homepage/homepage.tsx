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
      {/* <Row gutter={[8, 8]}>
        <Col md={24} lg={24} flex="auto">
          <div className="homepage-content-containerwhite">
            <div id="scrollhome" className="title">
              {t('homepage:aboutustitle')}
            </div>
            <div className="homepagebody">
              <div className="homepagebody_aboutusline1">{t('homepage:aboutusline1')}</div>
              <div className="homepagebody_subtitle">{t('homepage:Keyfeatures')}</div>

              <div className="aboutus_cards-container">
                <Row gutter={5} className="aboutus_card-row">
                  <Col xxl={8} xl={8} md={12} className="aboutus_card-col">
                    <div className="aboutus-card-main-container">
                      <Col>
                        <Row className="aboutus_card-row">
                          <div>
                            <BarChart color="#FFFF" size="80px" />
                          </div>
                        </Row>
                        <Row className="aboutus_card-row">
                          <div className="aboutus-card-title">{t('homepage:analytic')}</div>
                        </Row>
                        <Row>
                          <div className="aboutus-card-text">{t('homepage:analyticbody')}</div>
                        </Row>
                      </Col>
                    </div>
                  </Col>
                  <Col xxl={8} xl={8} md={12} className="aboutus_card-col">
                    <div className="aboutus-card-main-container">
                      <Col>
                        <Row className="aboutus_card-row">
                          <div>
                            <Gem color="#FFFF" size="80px" />
                          </div>
                        </Row>
                        <Row className="aboutus_card-row">
                          <div className="aboutus-card-title">{t('homepage:carboncal')}</div>
                        </Row>
                        <Row>
                          <div className="aboutus-card-text">{t('homepage:carboncalbody')}</div>
                        </Row>
                      </Col>
                    </div>
                  </Col>
                  <Col xxl={8} xl={8} md={12} className="aboutus_card-col">
                    <div className="aboutus-card-main-container">
                      <Col>
                        <Row className="aboutus_card-row">
                          <div>
                            <Calculator className="aboutusicon" color="#FFFF" size="80px" />
                          </div>
                        </Row>
                        <Row className="aboutus_card-row">
                          <div className="aboutus-card-title">{t('homepage:serialgen')}</div>
                        </Row>
                        <Row>
                          <div className="aboutus-card-text">{t('homepage:serialgenbody')}</div>
                        </Row>
                      </Col>
                    </div>
                  </Col>
                </Row>
              </div>
              <Row className="homepagebody_aboutusline1">{t('homepage:aboutusline2')}</Row>
              <Row className="homepagebody_aboutusline1">{t('homepage:aboutusline3')}</Row>
              <div className="homepagebody_aboutusline1">
                Developed in Partnership with{' '}
                <a
                  href="https://www.theclimatewarehouse.org/work/digital-4-climate"
                  target="_blank"
                >
                  Digital For Climate (D4C)
                </a>
                . D4C is a collaboration between the{' '}
                <a href="https://www.ebrd.com/" target="_blank">
                  European Bank for Reconstruction and Development (EBRD)
                </a>
                ,{' '}
                <a href="https://www.undp.org/" target="_blank">
                  United Nations Development Program (UNDP)
                </a>
                ,{' '}
                <a href="https://www.unfccc.int/" target="_blank">
                  United Nations Framework Convention on Climate Change (UNFCCC)
                </a>
                ,{' '}
                <a href="https://www.ieta.org/" target="_blank">
                  International Emissions Trading Association (IETA)
                </a>
                ,{' '}
                <a href="https://www.esa.int/" target="_blank">
                  European Space Agency (ESA)
                </a>
                , and{' '}
                <a href="https://www.worldbank.org/" target="_blank">
                  World Bank Group
                </a>{' '}
                that aims to coordinate respective workflows and create a modular and interoperable
                end-to-end digital ecosystem for the carbon market. The overarching goal is to
                support a transparent, high integrity global carbon market that can channel capital
                for impactful climate action and low-carbon development.
              </div>
              <Row className="undplogocontainer">
                <Col className="gutter-row" xl={5} md={8} sm={24} xs={24}>
                  <ImgWithFallback
                    className="erbd"
                    src={EBRD}
                    fallbackSrc={EBRDff}
                    mediaType="image/webp"
                    alt="EBRD"
                  />
                </Col>
                <Col className="gutter-row align-to-end" xl={3} md={8} sm={12} xs={12}>
                  <ImgWithFallback
                    className="undp"
                    src={undpLogo}
                    fallbackSrc={undpLogo}
                    mediaType="image/svg"
                    alt="UNDP"
                  />
                </Col>
                <Col className="gutter-row align-to-start" xl={3} md={8} sm={12} xs={12}>
                  <ImgWithFallback
                    className="unfccc"
                    src={UNFCCC}
                    fallbackSrc={UNFCCCff}
                    mediaType="image/webp"
                    alt="UNFCCC"
                  />
                </Col>
                <Col className="gutter-row" xl={5} md={8} sm={24} xs={24}>
                  <ImgWithFallback
                    className="ieta"
                    src={IETA}
                    fallbackSrc={IETAff}
                    mediaType="image/webp"
                    alt="IETA"
                  />
                </Col>
                <Col className="gutter-row" xl={5} md={8} sm={24} xs={24}>
                  <ImgWithFallback
                    className="esa"
                    src={ESA}
                    fallbackSrc={ESAff}
                    mediaType="image/webp"
                    alt="ESAFF"
                  />
                </Col>
                <Col className="gutter-row" xl={3} md={8} sm={24} xs={24}>
                  <ImgWithFallback
                    className="wbank"
                    src={WBANK}
                    fallbackSrc={WBANKff}
                    mediaType="image/webp"
                    alt="WBANK"
                  />
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row> */}
      {/* <Row gutter={[8, 8]}>
        <Col md={24} lg={24} flex="auto">
          <div className="homepage-image-content-container">
            <Row>
              <Col className="eligicontent" flex={2} md={12} lg={12}>
                <div className="title">{t('homepage:eligibility')}</div>
                <div className="homepagebody">
                  {t('homepage:eligibilitybody')}
                  <ul>
                    <li>{t('homepage:eliglist1')}</li>
                    <li>{t('homepage:eliglist2')}</li>
                    <li>{t('homepage:eliglist3')}</li>
                    <li>{t('homepage:eliglist4')}</li>
                  </ul>
                </div>
              </Col>
              <Col flex={3} md={12} lg={12}>
                <ImgWithFallback
                  className="forest-image"
                  src={forestfall}
                  fallbackSrc={forestfall}
                  mediaType="image/webp"
                  alt="forestry"
                />
              </Col>
            </Row>
          </div>
        </Col>
      </Row> */}
      {/* <Row gutter={[8, 8]}>
        <Col md={24} lg={24} flex="auto">
          <div className="homepage-resources-content-container">
            <Row>
              <Col className="resource-image-container" md={12} lg={12}>
                <ImgWithFallback
                  className="image"
                  src={resources}
                  fallbackSrc={resourcesfall}
                  mediaType="image/webp"
                  alt="resources"
                />
              </Col>
              <Col md={12} lg={12}>
                <div className="title">{t('homepage:resource')}</div>
                <div className="homepagebody">
                  <ul>
                    <li>{t('homepage:reslist1')}</li>
                    <li>{t('homepage:reslist2')}</li>
                    <li>{t('homepage:reslist3')}</li>
                  </ul>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row> */}

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
