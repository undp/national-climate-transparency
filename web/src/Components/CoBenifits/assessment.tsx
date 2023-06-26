import { UploadOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Radio, RadioChangeEvent, Row, Select, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RadioButtonStatus, titleList } from '../../Definitions/commonEnums';

const Assessment = (props: any) => {
  const { onFormSubmit } = props;
  const { t } = useTranslation(['coBenifits']);
  const [cobenefitsAssessmentDetails, setCobenefitsAssessmentDetails] = useState();

  useEffect(() => {
    onFormSubmit(cobenefitsAssessmentDetails);
  }, [cobenefitsAssessmentDetails]);

  const onFormChanged = (formName: string, info: any) => {
    const changedValues: any = {};
    if (info.changedFields && info.changedFields.length > 0) {
      info.changedFields.map((changedField: any) => {
        changedValues[changedField.name[0]] = changedField.value;
      });

      setCobenefitsAssessmentDetails((pre: any) => ({ ...pre, ...changedValues }));
    }
  };

  return (
    <div className="assesment-tab-item">
      <Form.Provider onFormChange={onFormChanged}>
        <Row>
          <Form
            name="from1"
            labelCol={{ span: 14 }}
            labelWrap={true}
            labelAlign="left"
            wrapperCol={{ span: 8 }}
            layout="horizontal"
            requiredMark={true}
          >
            <div className="radio-content">
              <Form.Item
                label={t('assessmentIsThirdPartyVerified')}
                className="form-item"
                name="IsThirdPartyVerified"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Radio.Group size="middle">
                  <div className="radio-container">
                    <Radio.Button className="radio" value={RadioButtonStatus.YES}>
                      {t('yes')}
                    </Radio.Button>
                  </div>
                  <div className="radio-container">
                    <Radio.Button className="radio" value={RadioButtonStatus.NO}>
                      {t('no')}
                    </Radio.Button>
                  </div>
                  <div className="radio-container">
                    <Radio.Button className="radio" value={RadioButtonStatus.NA}>
                      {t('n/a')}
                    </Radio.Button>
                  </div>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                label={t('assesmentIsWillingToVerified')}
                className="form-item"
                name="IsWillingToVerified"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Radio.Group size="middle">
                  <div className="radio-container">
                    <Radio.Button className="radio" value={RadioButtonStatus.YES}>
                      {t('yes')}
                    </Radio.Button>
                  </div>
                  <div className="radio-container">
                    <Radio.Button className="radio" value={RadioButtonStatus.NO}>
                      {t('no')}
                    </Radio.Button>
                  </div>
                  <div className="radio-container">
                    <Radio.Button className="radio" value={RadioButtonStatus.NA}>
                      {t('n/a')}
                    </Radio.Button>
                  </div>
                </Radio.Group>
              </Form.Item>
            </div>
          </Form>
        </Row>

        <Row>
          <Form
            name="form2"
            labelCol={{ span: 14 }}
            labelWrap={true}
            labelAlign="left"
            wrapperCol={{ span: 8 }}
            layout="vertical"
            requiredMark={true}
          >
            <Row justify="start" gutter={16}>
              <Col flex="139px">
                <Form.Item
                  label={t('assessmentTitle')}
                  name="title"
                  rules={[
                    {
                      required: true,
                      message: `${t('assessmentTitle')} ${t('isRequired')}`,
                    },
                  ]}
                >
                  <Select
                    size="large"
                    style={{
                      width: '139px',
                      borderRadius: '4px',
                    }}
                    options={titleList}
                  ></Select>
                </Form.Item>
              </Col>
              <Col flex="303px">
                <Form.Item
                  label={t('assessmentFirstName')}
                  name="firstName"
                  rules={[
                    {
                      required: true,
                      message: `${t('assessmentFirstName')} ${t('isRequired')}`,
                    },
                  ]}
                >
                  <Input style={{ width: 303 }} />
                </Form.Item>
              </Col>
              <Col flex="303px">
                <Form.Item
                  label={t('assessmentLastName')}
                  name="lastName"
                  rules={[
                    {
                      required: true,
                      message: `${t('assessmentLastName')} ${t('isRequired')}`,
                    },
                  ]}
                >
                  <Input style={{ width: 303 }} />
                </Form.Item>
              </Col>
            </Row>
            <Row justify="start" gutter={16}>
              <Col flex="462px">
                <Form.Item
                  label={t('assessmentOrganisation')}
                  name="organisation"
                  rules={[
                    {
                      required: true,
                      message: `${t('assessmentOrganisation')} ${t('isRequired')}`,
                    },
                  ]}
                >
                  <Input style={{ width: 462 }} />
                </Form.Item>
              </Col>
              <Col flex="303px">
                <Form.Item
                  label={t('assessmentTelephone')}
                  name="telephone"
                  rules={[
                    {
                      required: true,
                      message: `${t('assessmentTelephone')} ${t('isRequired')}`,
                    },
                  ]}
                >
                  <Input style={{ width: 303 }} />
                </Form.Item>
              </Col>
            </Row>
            <Row justify="start" gutter={16}>
              <Col flex="303px">
                <Form.Item
                  label={t('assessmentEmail')}
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: `${t('assessmentEmail')} ${t('isRequired')}`,
                    },
                  ]}
                >
                  <Input style={{ width: 303 }} />
                </Form.Item>
              </Col>
              <Col flex="462px">
                <Form.Item
                  label={t('assessmentAffiliationCDM')}
                  name="affiliationCDM"
                  rules={[
                    {
                      required: true,
                      message: `${t('assessmentAffiliationCDM')} ${t('isRequired')}`,
                    },
                  ]}
                >
                  <Input style={{ width: 462 }} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Row>

        <Row>
          <Form
            name="form3"
            labelCol={{ span: 14 }}
            labelWrap={true}
            labelAlign="left"
            wrapperCol={{ span: 8 }}
            layout="horizontal"
            requiredMark={true}
          >
            <div className="radio-content">
              <Form.Item
                label={t('assesmentIsThePersonListed')}
                className="form-item"
                name="isThePersonListed"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Radio.Group size="middle" onChange={() => {}}>
                  <div className="radio-container">
                    <Radio.Button className="radio" value={RadioButtonStatus.YES}>
                      {t('yes')}
                    </Radio.Button>
                  </div>
                  <div className="radio-container">
                    <Radio.Button className="radio" value={RadioButtonStatus.NO}>
                      {t('no')}
                    </Radio.Button>
                  </div>
                  <div className="radio-container">
                    <Radio.Button className="radio" value={RadioButtonStatus.NA}>
                      {t('n/a')}
                    </Radio.Button>
                  </div>
                </Radio.Group>
              </Form.Item>
            </div>
          </Form>
        </Row>

        <Row>
          <Form layout="vertical" name="form4">
            <Row justify="start" gutter={16}>
              <Col flex="303px">
                <Form.Item label={t('assessmentStudyName')} name="studyName">
                  <Input style={{ width: 303 }} />
                </Form.Item>
              </Col>
              <Col flex="303px">
                <Form.Item label={t('assessmentFunder')} name="funder">
                  <Input style={{ width: 303 }} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Form.Item label={t('assessmentDocuments')} name="document">
                <Upload>
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            </Row>
          </Form>
        </Row>
      </Form.Provider>
    </div>
  );
};

export default Assessment;
