import { Col, Form, Input, InputNumber, Radio, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const GenderParity = (props: any) => {
  const { onFormSubmit } = props;
  const { t } = useTranslation(['genderParity']);
  const [formOne] = Form.useForm();
  const [formTwo] = Form.useForm();
  const [genderParityDetails, setGenderParityDetails] = useState();

  const genderParityDetailsOne = [
    {
      label: t('benifit1'),
      name: 'descriminationAgainstGirls',
      value: true,
    },
    {
      label: t('benifit2'),
      name: 'violationAgainstGirls',
      value: true,
    },
    {
      label: t('benifit3'),
      name: 'harmfulPracticesAgainstGirls',
      value: true,
    },
    {
      label: t('benifit4'),
      name: 'equealRightsToGirls',
      value: true,
    },
    {
      label: t('benifit5'),
      name: 'equealRightsToHealthToGirls',
      value: true,
    },
  ];

  const genderParityDetailsTwo = [
    {
      label: t('benifit6'),
      name: 'numberOfWomenEmpoyed',
      col: { md: 18, lg: 10 },
      labelCol: 24,
      wrapperCol: 18,
    },
    {
      label: t('benifit7'),
      name: 'numberOfWomenTrained',
      col: { md: 18, lg: 10 },
      labelCol: 24,
      wrapperCol: 18,
    },
    {
      label: t('benifit8'),
      name: 'numberOfWomenSelectedForDecisionMaking',
      col: { md: 18, lg: 16 },
      labelCol: 24,
      wrapperCol: 11,
    },
    {
      label: t('benifit9'),
      name: 'numberOfWomenProvidedAccessForTech',
      col: { md: 18, lg: 16 },
      labelCol: 24,
      wrapperCol: 11,
    },
  ];

  useEffect(() => {
    onFormSubmit(genderParityDetails);
  }, [genderParityDetails]);

  const onGenderParityValuesChanged = (changedValues: any) => {
    setGenderParityDetails((pre: any) => ({ ...pre, ...changedValues }));
  };

  const onGenderParityValuesChangedSub = (changedValues: any) => {
    setGenderParityDetails((pre: any) => ({ ...pre, ...changedValues }));
  };

  return (
    <div className="co-benifits-tab-item">
      <Form
        name="gender-parity-details"
        className="benifits-details-gender-parity"
        labelCol={{ md: 16, lg: 19, xl: 19 }}
        wrapperCol={{ md: 8, lg: 5, xl: 5 }}
        layout="horizontal"
        requiredMark={true}
        form={formOne}
        onValuesChange={onGenderParityValuesChanged}
      >
        <div className="part-one">
          {genderParityDetailsOne?.map((genderParityItem: any) => {
            return (
              <Form.Item
                label={genderParityItem?.label}
                className="form-item"
                name={genderParityItem?.name}
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Radio.Group size="middle" onChange={() => {}}>
                  <div className="yes-no-radio-container">
                    <Radio.Button className="yes-no-radio" value={genderParityItem?.value}>
                      {t('yes')}
                    </Radio.Button>
                  </div>
                  <div className="yes-no-radio-container">
                    <Radio.Button className="yes-no-radio" value={!genderParityItem?.value}>
                      {t('no')}
                    </Radio.Button>
                  </div>
                </Radio.Group>
              </Form.Item>
            );
          })}
        </div>
        <div className="part-two">
          <Form
            name="additional-details"
            layout="vertical"
            form={formTwo}
            onValuesChange={onGenderParityValuesChangedSub}
          >
            <Row gutter={[16, 16]}>
              {genderParityDetailsTwo?.map((genderDetail: any) => (
                <Col md={genderDetail?.col?.md} lg={genderDetail?.col?.lg}>
                  <Form.Item
                    labelCol={{ span: genderDetail?.labelCol }}
                    wrapperCol={{ span: genderDetail?.wrapperCol }}
                    label={genderDetail?.label}
                    className="form-item"
                    name={genderDetail?.name}
                    rules={[
                      {
                        required: false,
                      },
                    ]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Form>
        </div>
      </Form>
    </div>
  );
};

export default GenderParity;
