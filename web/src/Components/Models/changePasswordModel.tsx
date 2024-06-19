import React, { FC } from 'react';
import { Lock } from 'react-bootstrap-icons';
import { Alert, Button, Form, Input, Modal } from 'antd';
import '../../Styles/app.scss';

export interface ChangePasswordProps {
  t: any;
  onPasswordChanged: any;
  onFieldsChanged: any;
  onCanceled: any;
  openModal: any;
  errorMsg: any;
  loadingBtn: boolean;
  themeColor: string;
}

const ChangePasswordModel: FC<ChangePasswordProps> = (props: ChangePasswordProps) => {
  const {
    t,
    onPasswordChanged,
    onFieldsChanged,
    onCanceled,
    openModal,
    errorMsg,
    loadingBtn,
    themeColor,
  } = props;

  return (
    <Modal
      width={450}
      title={
        <div className="popup-header">
          <div className="icon">
            <Lock size={100} color={themeColor} />
          </div>
          <div>{t('changePassword:changePassword')}</div>
        </div>
      }
      open={openModal}
      className={'popup-success password-reset-model'}
      centered={true}
      destroyOnClose={true}
      footer={null}
      onCancel={onCanceled}
    >
      <Form
        name="change_password"
        layout="vertical"
        className="login-form"
        onFieldsChange={onFieldsChanged}
        onFinish={onPasswordChanged}
      >
        <Form.Item
          className="mg-top-1"
          name="oldPassword"
          label={t('changePassword:oldPassword')}
          rules={[
            {
              required: true,
              message: `${t('changePassword:oldPassword')} ${t('changePassword:isRequired')}`,
            },
          ]}
        >
          <Input.Password placeholder="" className="border-radius-5" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label={t('changePassword:newPassword')}
          rules={[
            {
              required: true,
              message: `${t('changePassword:newPassword')} ${t('changePassword:isRequired')}`,
            },
          ]}
        >
          <Input.Password placeholder="" className="border-radius-5" />
        </Form.Item>

        <Form.Item
          name="confirm_password"
          label={t('changePassword:confirmNewPassword')}
          dependencies={['newPassword']}
          rules={[
            {
              required: true,
              message: `${t('changePassword:confirmNewPassword')} ${t(
                'changePassword:isRequired'
              )}`,
            },
            ({ getFieldValue }) => ({
              // eslint-disable-next-line no-unused-vars
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(t('changePassword:passwordsNotMatchedErr').toString())
                );
              },
            }),
          ]}
        >
          <Input.Password placeholder="" className="border-radius-5" />
        </Form.Item>

        {errorMsg && <Alert className="error" message={errorMsg} type="error" showIcon />}

        <div className="mg-top-2 ant-modal-footer">
          <Button htmlType="button" onClick={onCanceled}>
            {t('changePassword:cancel')}
          </Button>
          <Button className="mg-left-2" type="primary" htmlType="submit" loading={loadingBtn}>
            {t('changePassword:setPassword')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModel;
