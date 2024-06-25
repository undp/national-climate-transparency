import { FC } from 'react';
import { Lock } from 'react-bootstrap-icons';
import { Button, Form, Input, Modal } from 'antd';
import '../../../Styles/app.scss';
import './forceResetPasswordModel.scss';

export interface ForceResetPasswordProps {
  t: any;
  themeColor: string;
  doPasswordReset: any;
  passwordChangeRunning: boolean;
  isModelVisible: boolean;
  setIsModelVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const ForceResetPasswordModel: FC<ForceResetPasswordProps> = ({
  t,
  doPasswordReset,
  passwordChangeRunning,
  themeColor,
  setIsModelVisible,
  isModelVisible,
}) => {
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
      open={isModelVisible}
      centered={true}
      destroyOnClose={true}
      footer={null}
      onCancel={() => setIsModelVisible(false)}
    >
      <Form name="change_password" layout="vertical" onFinish={doPasswordReset}>
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
          <Input.Password className="password-input" />
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
          <Input.Password className="password-input" />
        </Form.Item>
        <div className="mg-top-2 ant-modal-footer">
          <Button htmlType="button" onClick={() => setIsModelVisible(false)}>
            {t('changePassword:cancel')}
          </Button>
          <Button
            className="mg-left-2"
            type="primary"
            htmlType="submit"
            loading={passwordChangeRunning}
          >
            {t('changePassword:setPassword')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ForceResetPasswordModel;
