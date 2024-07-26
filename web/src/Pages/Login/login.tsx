import { Button, Col, Form, Grid, Input, Row, Select, Spin, message } from 'antd';
import { FC, Suspense, useContext, useEffect, useState } from 'react';
import './login.scss';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { useUserContext } from '../../Context/UserInformationContext/userInformationContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { AbilityContext } from '../../Casl/Can';
import { updateUserAbility } from '../../Casl/ability';
import ForgotPassword from './forgotPassword';
import ResetPassword from './resetPassword';
import { UserState } from '../../Enums/user.enum';
import { AvailableLanguages } from '../../Definitions/languageDefinitions';
import TransparencyLogo from '../../Components/logo/transparencyLogo';
import logoLarge from '../../Assets/Images/tran.png';
import logoSmall from '../../Assets/Images/tran_small.png';

const { useBreakpoint } = Grid;

export interface LoginPageProps {
  forgotPassword?: boolean;
  resetPassword?: boolean;
}

interface LoginProps {
  email: string;
  password: string;
}

const Login: FC<LoginPageProps> = (props: LoginPageProps) => {
  const { forgotPassword, resetPassword } = props;

  const navigate = useNavigate();
  const screens = useBreakpoint();
  const ability = useContext(AbilityContext);
  const { state } = useLocation();
  const { i18n, t } = useTranslation(['common', 'login']);
  const { post, updateToken, removeToken } = useConnection();
  const { IsAuthenticated, setUserInfo, isTokenExpired, setIsTokenExpired } = useUserContext();

  // Login Page State

  const [loading, setLoading] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>();
  const [fullScreen, setFullScreen] = useState<boolean>();

  const [imgLoaded, setImgLoaded] = useState<boolean>(false);

  const handleImageLoad = () => {
    setImgLoaded(true);
  };

  // Setting the chart Width

  useEffect(() => {
    if (screens.xxl) {
      setFullScreen(true);
    } else if (screens.xl) {
      setFullScreen(true);
    } else {
      setFullScreen(false);
    }
  }, [screens]);

  // Initialization Logic

  useEffect(() => {
    // Default Language Selection
    const selectedLanguage = localStorage.getItem('i18nextLng') ?? 'en';
    i18next.changeLanguage(selectedLanguage);

    // Redirection to Dashboard if a valid auth token is available
    if (IsAuthenticated()) {
      navigate('/dashboard');
    }

    // Force Logout Message Population
    const currentUserState: string | null = localStorage.getItem('userState');
    if (currentUserState && currentUserState === UserState.SUSPENDED) {
      message.open({
        type: 'error',
        content: t('login:deactivatedUserAccount'),
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      localStorage.removeItem('userState');
    }
  }, []);

  // Language Selection Handler

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  // Forgot Password Handler

  const onClickForgotPassword = () => {
    navigate('/forgotPassword', { replace: true });
  };

  // Login Submit

  const onSubmit = async (values: LoginProps) => {
    const redirectLocation = state?.from?.pathname + state?.from?.search;
    setLoading(true);
    setShowError(false);
    setErrorMsg(undefined);
    try {
      const email = values.email.trim();
      const response = await post('national/auth/login', {
        username: email.trim(),
        password: values.password.trim(),
      });

      updateUserAbility(ability, {
        id: response.data.id,
        role: response.data.role,
        organisationId: response.data.companyId,
        organisationType: response.data.companyRole,
      });

      if (response.status === 200 || response.status === 201) {
        if (showError) setShowError(false);
        updateToken(response.data.access_token);
        setUserInfo({
          id: response.data.id.toString(),
          userRole: response.data.role,
          companyName: response.data.companyName,
          userState: response.data.userState,
          userSectors: response.data.sector,
          validatePermission: response.data.validatePermission,
          subRolePermission: response.data.subRolePermission,
          ghgInventoryPermission: response.data.ghgInventoryPermission,
        });
        removeToken();
        setIsTokenExpired(false);
        return IsAuthenticated(response.data.access_token)
          ? navigate(redirectLocation ? redirectLocation : '/dashboard', { replace: true })
          : navigate('/login');
      }
    } catch (error: any) {
      setErrorMsg(error?.message);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<Spin />}>
      {!IsAuthenticated() ? (
        <Row className="login-container">
          {fullScreen && (
            <Col xl={15} flex="auto">
              <div className="login-img-container">
                <img // Full Res Image to be shown after loaded
                  className="login-img"
                  style={{ display: `${imgLoaded ? 'block' : 'none'}` }}
                  src={logoLarge}
                  onLoad={handleImageLoad}
                />
                <img // Reduced Image to be shown until the full image loads
                  className="login-img-waiting"
                  style={{ display: `${imgLoaded ? 'none' : 'block'}` }}
                  src={logoSmall}
                />
                <div className="gradient-overlay"></div>
                <div className="text-ctn">
                  <span>
                    {t('login:nationalNdc')} <br /> {t('login:creditMrv')} <br />
                    {t('login:management')}
                  </span>
                </div>
              </div>
            </Col>
          )}
          <Col xl={{ span: 9 }} flex="auto">
            <Row className="logo-row">
              <Col span={12}>
                <TransparencyLogo></TransparencyLogo>
              </Col>
            </Row>
            {forgotPassword ? (
              <ForgotPassword />
            ) : resetPassword ? (
              <ResetPassword />
            ) : (
              <div className="row-container">
                <Row className="centred-row">
                  <Col>
                    <div className="login-text-contents">
                      <span className="login-text-sign">
                        {t('common:login')} <br />
                        <span className="login-text-welcome">{t('login:welcome-back')}</span>
                      </span>
                    </div>
                  </Col>
                </Row>
                <Form
                  layout="vertical"
                  onFinish={onSubmit}
                  name="login-details"
                  requiredMark={false}
                >
                  <Row className="centred-row">
                    <Col span={24}>
                      <Form.Item
                        name="email"
                        label={<label className="form-item-header">{t('common:email')}</label>}
                        validateTrigger={'onSubmit'}
                        rules={[
                          ({ getFieldValue }) => ({
                            validator() {
                              if (
                                getFieldValue('email') &&
                                !getFieldValue('email')
                                  ?.trim()
                                  .match(
                                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                                  )
                              ) {
                                return Promise.reject('Please enter a valid email');
                              }
                              return Promise.resolve();
                            },
                          }),
                          {
                            required: true,
                            message: 'Email cannot be empty',
                          },
                        ]}
                      >
                        <Input className="form-input-box" type="username" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row className="centred-row">
                    <Col span={24}>
                      <Form.Item
                        name="password"
                        validateTrigger={'onSubmit'}
                        label={<label className="form-item-header">{t('common:pwd')}</label>}
                        rules={[
                          {
                            required: true,
                            message: 'Password cannot be empty',
                          },
                        ]}
                      >
                        <Input.Password className="form-input-box" type="password" />
                      </Form.Item>
                    </Col>
                  </Row>
                  {showError && (
                    <Row className="centred-row">
                      <Col span={1}>
                        <ExclamationCircleOutlined className="error-message-icon" />
                      </Col>
                      <Col span={23}>
                        <span className="error-message-text">
                          {errorMsg ? errorMsg : t('common:loginFailed')}
                        </span>
                      </Col>
                    </Row>
                  )}
                  <Row className="centred-row">
                    <Col span={24} className="forget-password">
                      <span onClick={() => onClickForgotPassword()}>{t('login:forgot-pwd')}?</span>
                    </Col>
                  </Row>
                  <Row className="centred-row">
                    <Col span={24}>
                      <Form.Item>
                        <Button
                          type="primary"
                          size="large"
                          htmlType="submit"
                          block
                          loading={loading}
                        >
                          {t('common:login')}
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                  {isTokenExpired && !forgotPassword && !resetPassword && !showError && (
                    <Row className="centred-row">
                      <Col span={1}>
                        <ExclamationCircleOutlined className="error-message-icon" />
                      </Col>
                      <Col span={23}>
                        <span className="expiry-message-text">
                          {t('common:sessionExpiredErrorMsg')}
                        </span>
                      </Col>
                    </Row>
                  )}
                </Form>
                <Row className="language-row">
                  <Col span={24} className="language-section">
                    <Select
                      placeholder="Search to Select"
                      defaultValue={
                        localStorage.getItem('i18nextLng') !== null
                          ? localStorage.getItem('i18nextLng')
                          : 'en'
                      }
                      placement="topRight"
                      onChange={(lan: string) => handleLanguageChange(lan)}
                      optionFilterProp="children"
                      filterOption={(input, option) => (option?.label ?? '').includes(input)}
                      filterSort={(optionA, optionB) =>
                        (optionA?.label ?? '')
                          .toLowerCase()
                          .localeCompare((optionB?.label ?? '').toLowerCase())
                      }
                      options={AvailableLanguages}
                    />
                  </Col>
                </Row>
              </div>
            )}
          </Col>
        </Row>
      ) : null}
    </Suspense>
  );
};

export default Login;

// {t('common:language')}
