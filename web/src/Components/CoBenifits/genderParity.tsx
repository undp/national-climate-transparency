import { Col, Form, Radio, Row } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

const GenderParity = () => {
  const { t } = useTranslation(['genderParity']);
  const [formOne] = Form.useForm();
  const [formTwo] = Form.useForm();
  const onFinishFormOne = () => {};
  return (
    <div className="co-benifits-tab-item">
      <Form
        name="gender-parity-details"
        className="benifits-details"
        labelCol={{ md: 18, lg: 18, xl: 18 }}
        wrapperCol={{ md: 18, lg: 18, xl: 18 }}
        layout="horizontal"
        requiredMark={true}
        form={formOne}
        onFinish={onFinishFormOne}
      >
        <Form.Item
          label={t('benifit1')}
          className="form-item"
          name="benifit1"
          rules={[
            {
              required: false,
            },
          ]}
        >
          <Radio.Group className="radio-group" size="large" onChange={() => {}}>
            <Radio.Button className="condition-radio" value="true">
              {t('genderParity:yes')}
            </Radio.Button>
            <Radio.Button className="condition-radio" value="false">
              {t('genderParity:no')}
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Form>
    </div>
  );
};

export default GenderParity;
