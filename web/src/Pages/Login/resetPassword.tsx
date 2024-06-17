import { useState } from 'react';
import './login.scss';
import { Button, Col, Form, Input, Row, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const ResetPassword = () => {
  const { t } = useTranslation(['common', 'resetPassword']);
  const [resetPasswordForm] = Form.useForm();
  const { put } = useConnection();
  const navigate = useNavigate();
  const { requestId } = useParams();

  // Reset Password Page State

  const [loading, setLoading] = useState<boolean>(false);
  const [resetError, setResetError] = useState<boolean>(false);

  // Reset Password Submit Handler

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);
      const response: any = await put(`national/auth/resetPassword?requestId=${requestId}`, {
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

  // Go Back to Sign in Page Handler

  const onClickBackToSignIn = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className="row-container">
      <Row className="centred-row">
        <Col>
          <div className="login-text-contents">
            <span className="login-text-sign">{t('resetPassword:reset-pwd-title')}</span>
          </div>
        </Col>
      </Row>
      <Form
        form={resetPasswordForm}
        layout="vertical"
        onFinish={onSubmit}
        name="login-details"
        requiredMark={false}
      >
        <Row className="centred-row">
          <Col span={24}>
            <Form.Item
              name="password"
              label={<label className="form-item-header">{t('resetPassword:newPwd')}</label>}
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
              <Input.Password className="form-input-box" type="password" />
            </Form.Item>
          </Col>
        </Row>
        <Row className="centred-row">
          <Col span={24}>
            <Form.Item
              name="confirmPassword"
              className="confirm-password"
              label={<label className="form-item-header">{t('resetPassword:confirmNewPwd')}</label>}
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
              <Input.Password className="form-input-box" type="password" />
            </Form.Item>
          </Col>
        </Row>
        <Row className="centred-row">
          <Col span={24}>
            <Form.Item>
              <div className="login-submit-btn-container">
                <Button type="primary" size="large" htmlType="submit" block loading={loading}>
                  {t('resetPassword:submit')}
                </Button>
              </div>
            </Form.Item>
          </Col>
        </Row>
        {resetError && (
          <Row className="centred-row" style={{ marginBottom: '20px' }}>
            <Col span={1}>
              <ExclamationCircleOutlined className="error-message-icon" />
            </Col>
            <Col span={23}>
              <span className="error-message-text">
                {t('resetPassword:passwordResetNotWorked')}
              </span>
            </Col>
          </Row>
        )}
        <Row className="centred-row">
          <Col span={24}>
            {t('common:backto')}{' '}
            <span onClick={() => onClickBackToSignIn()} className="back-to-sign">
              {t('common:signIn')}
            </span>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ResetPassword;
