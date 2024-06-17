import React, { useState } from 'react';
import './login.scss';
import { Button, Col, Form, Input, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { useNavigate } from 'react-router-dom';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export interface UserForgotPasswordProps {
  email: string;
}

const ForgotPassword = () => {
  const { post } = useConnection();
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'forgotPassword']);

  // Forgot Password Page State

  const [loading, setLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<boolean>(false);

  // Forgot Password form submit

  const onSubmit = async (values: UserForgotPasswordProps) => {
    setLoading(true);
    try {
      const email = values.email.trim();
      const response = await post('national/auth/forgotPassword', {
        email: email.trim(),
      });

      if (response.status === 200 || response.status === 201) {
        setEmailSent(true);
        setEmailError(false);
      }
    } catch (error: any) {
      console.log('Error in sending resetting password', error);
      setEmailError(true);
    } finally {
      setLoading(false);
    }
  };

  // Go Back to Sign in Page Handler

  const onClickBackToSignIn = () => {
    navigate('/login', { replace: true });
  };

  // Email Change Handler

  const handleEmailChange = () => {
    setEmailError(false);
    setEmailSent(false);
  };

  return (
    <div className="row-container">
      <Row className="centred-row">
        <Col>
          <div className="login-text-contents">
            <span className="login-text-sign">{t('forgotPassword:forgot-pwd-title')}</span>
          </div>
        </Col>
      </Row>
      <Row className="centred-row">
        <Col>
          <div className="note-container">
            <div className="note">
              <p>{t('forgotPassword:note-1')}</p>
            </div>
          </div>
        </Col>
      </Row>
      <Form layout="vertical" onFinish={onSubmit} name="login-details" requiredMark={false}>
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
                      return Promise.reject(`${t('common:email')} ${t('common:isInvalid')}`);
                    }
                    return Promise.resolve();
                  },
                }),
                {
                  required: true,
                  message: `${t('common:email')} ${t('common:isRequired')}`,
                },
              ]}
            >
              <Input
                className="form-input-box"
                onChange={() => handleEmailChange()}
                type="username"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row className="centred-row">
          <Col span={24}>
            <Form.Item>
              <Button
                style={{ marginTop: '5px' }}
                type="primary"
                size="large"
                htmlType="submit"
                block
                disabled={emailSent}
                loading={loading}
              >
                {t('forgotPassword:submit')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
        {emailError && (
          <Row className="centred-row" style={{ marginBottom: '20px' }}>
            <Col span={1}>
              <ExclamationCircleOutlined className="error-message-icon" />
            </Col>
            <Col span={23}>
              <span className="error-message-text">
                {`${t('common:email')} ${t('common:isInvalid')}`}
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

export default ForgotPassword;
