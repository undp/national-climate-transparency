import { FC, useState } from 'react';
import './login.scss';
import { Button, Col, Form, Input, Row, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export interface ResetPasswordPageProps {
  forgotPassword?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const ResetPassword: FC<ResetPasswordPageProps> = (props: ResetPasswordPageProps) => {
  const { t } = useTranslation(['common', 'resetPassword']);
  const [resetPasswordForm] = Form.useForm();
  const { put } = useConnection();
  const navigate = useNavigate();
  const { requestid } = useParams();

  const [loading, setLoading] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const [disable, setDisable] = useState<boolean>(false);
  const [resetError, setResetError] = useState<boolean>(false);

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);
      const response: any = await put(`national/auth/resetPassword?requestId=${requestid}`, {
        newPassword: values.password,
      });
      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: response.message,
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        navigate('/login');
      } else {
        setResetError(true);
      }
    } catch (exception: any) {
      setResetError(true);
      console.log('error while resetting password -- ', exception);
    } finally {
      setLoading(false);
    }
  };

  const onClickBacktoSignIn = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className="reset-password-container">
      <Row>
        <Col lg={{ span: 18, offset: 3 }} md={24} flex="auto">
          <div className="login-text-contents">
            <span className="login-text-signin">{t('resetPassword:reset-pwd-title')}</span>
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={{ span: 18, offset: 3 }} md={{ span: 18 }} flex="fill">
          <div className="login-input-fields-container login-input-fields">
            <Form
              form={resetPasswordForm}
              layout="vertical"
              onFinish={onSubmit}
              name="login-details"
              requiredMark={false}
            >
              <Form.Item
                name="password"
                label={`${t('resetPassword:newPwd')}`}
                rules={[
                  {
                    required: true,
                    message: ``,
                  },
                  {
                    // eslint-disable-next-line no-unused-vars
                    validator: async (rule, value) => {
                      if (
                        String(value).trim() === '' ||
                        String(value).trim() === undefined ||
                        value === null ||
                        value === undefined
                      ) {
                        throw new Error(`New Password ${t('common:isRequired')}`);
                      }
                    },
                  },
                ]}
              >
                <div className="login-input-password">
                  <Input.Password type="password" />
                </div>
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                className="confirm-password"
                label={`${t('resetPassword:confirmNewPwd')}`}
                rules={[
                  {
                    // eslint-disable-next-line no-unused-vars
                    validator: async (rule, value) => {
                      if (
                        String(value).trim() === '' ||
                        String(value).trim() === undefined ||
                        value === null ||
                        value === undefined
                      ) {
                        throw new Error(`Confirm New Password ${t('common:isRequired')}`);
                      } else {
                        const val = value;
                        const password = resetPasswordForm.getFieldValue('password');
                        if (password) {
                          if (password !== val) {
                            throw new Error(`${t('resetPassword:passwordNotMatch')}`);
                          }
                        }
                      }
                    },
                  },
                  {
                    required: true,
                    message: '',
                  },
                ]}
              >
                <div className="login-input-password">
                  <Input.Password type="password" />
                </div>
              </Form.Item>
              <Form.Item>
                <div className="login-submit-btn-container">
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    block
                    loading={loading || disable}
                  >
                    {t('resetPassword:submit')}
                  </Button>
                </div>
              </Form.Item>
              {resetError && (
                <div className="logged-out-section">
                  <div className="info-icon">
                    <ExclamationCircleOutlined
                      style={{
                        color: 'rgba(255, 77, 79, 0.8)',
                        marginRight: '0.5rem',
                        fontSize: '1.1rem',
                      }}
                    />
                  </div>
                  <div className="msg">{t('resetPassword:passwordResetNotWorked')}</div>
                </div>
              )}
              <div className="bottom-forgot-password-section">
                {t('common:backto')}&nbsp;
                <span onClick={() => onClickBacktoSignIn()} className="backto-signin-txt">
                  {t('common:signIn')}
                </span>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ResetPassword;
