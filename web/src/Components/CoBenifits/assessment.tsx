import { UploadOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Empty,
  Form,
  Input,
  Radio,
  RadioChangeEvent,
  Row,
  Select,
  Upload,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RadioButtonStatus, titleList } from '../../Definitions/commonEnums';
import PhoneInput, { formatPhoneNumberIntl } from 'react-phone-number-input';
import { getBase64 } from '../../Definitions/InterfacesAndType/programme.definitions';
import { RcFile } from 'antd/lib/upload';

const Assessment = (props: any) => {
  const { onFormSubmit, assessmentViewData, viewOnly } = props;
  const { t } = useTranslation(['coBenifits']);
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();
  const [form4] = Form.useForm();
  const [cobenefitsAssessmentDetails, setCobenefitsAssessmentDetails] = useState();
  const [isVerifyingOrgVisible, setIsVerifyingOrgVisible] = useState(false);
  const [isVerifyingDetailsVisible, setIsVerifyingDetailsVisible] = useState(false);
  const [isPersonListedDetailsVisible, setIsPersonListedDetailsVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);

  useEffect(() => {
    onFormSubmit(cobenefitsAssessmentDetails, isFormValid);
  }, [cobenefitsAssessmentDetails, isFormValid]);

  useEffect(() => {
    if (assessmentViewData) {
      setCobenefitsAssessmentDetails(assessmentViewData);
      form1.setFieldsValue(assessmentViewData);
      form2.setFieldsValue(assessmentViewData);
      form3.setFieldsValue(assessmentViewData);
    }
  }, [assessmentViewData]);

  const validateForms = async () => {
    setIsFormValid(true);
    if (isVerifyingOrgVisible) {
      const verifyingOrgName = form1.getFieldValue('verifyingOrgName');
      if (verifyingOrgName === undefined || verifyingOrgName === '') {
        setIsFormValid(false);
      }
    }

    if (isPersonListedDetailsVisible) {
      const personListedDetails = form3.getFieldValue('personListedDetails');
      if (personListedDetails === undefined || personListedDetails === '') {
        setIsFormValid(false);
      }
    }
  };

  useEffect(() => {
    validateForms();
  });

  const onFormChanged = async (formName: string, info: any) => {
    const changedValues: any = {};
    if (info.changedFields && info.changedFields.length > 0) {
      info.changedFields.map(async (changedField: any) => {
        if (changedField.name[0] === 'document') {
          const base64Value = await getBase64(changedField.value[0].originFileObj as RcFile);
          const values = base64Value.split(',');

          setCobenefitsAssessmentDetails((pre: any) => ({ ...pre, document: values[1] }));
        } else {
          changedValues[changedField.name[0]] = changedField.value;
        }
      });

      setCobenefitsAssessmentDetails((pre: any) => ({ ...pre, ...changedValues }));
    }
  };

  const onIsThirdPartyVerifiedChanged = (e: any) => {
    if (e?.target?.value === RadioButtonStatus.YES) {
      setIsVerifyingOrgVisible(true);
    } else {
      setIsVerifyingOrgVisible(false);
    }
  };

  const onIsWillingToVerifiedChanged = (e: any) => {
    if (e?.target?.value === RadioButtonStatus.YES) {
      setIsVerifyingDetailsVisible(true);
    } else {
      setIsVerifyingDetailsVisible(false);
    }
  };

  const onIsThePersonListedChanged = (e: any) => {
    if (e?.target?.value !== RadioButtonStatus.YES) {
      setIsPersonListedDetailsVisible(true);
    } else {
      setIsPersonListedDetailsVisible(false);
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <div className="assesment-tab-item">
      {viewOnly && !assessmentViewData && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      {((viewOnly && assessmentViewData) || !viewOnly) && (
        <Form.Provider onFormChange={onFormChanged}>
          <Row>
            <Form
              name="from1"
              labelCol={{ span: 19 }}
              labelWrap={true}
              labelAlign="left"
              wrapperCol={{ span: 5 }}
              layout="horizontal"
              requiredMark={true}
              form={form1}
              onValuesChange={() => validateForms()}
            >
              {!viewOnly && (
                <div className="radio-content">
                  <Form.Item
                    label={t('assessmentIsThirdPartyVerified')}
                    className="form-item"
                    name="IsThirdPartyVerified"
                  >
                    <Radio.Group size="middle" onChange={onIsThirdPartyVerifiedChanged}>
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
                  {isVerifyingOrgVisible === true && (
                    <Form.Item
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
                      label={t('verifyingOrgNamelbl')}
                      name="verifyingOrgName"
                      rules={[
                        {
                          required: true,
                          message: '',
                        },
                      ]}
                    >
                      <Input style={{ width: 303 }} />
                    </Form.Item>
                  )}
                  <Form.Item
                    label={t('assesmentIsWillingToVerified')}
                    className="form-item"
                    name="IsWillingToVerified"
                  >
                    <Radio.Group size="middle" onChange={onIsWillingToVerifiedChanged}>
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
                  {isVerifyingDetailsVisible === true && (
                    <Form.Item
                      label={t('verifyingDetailslbl')}
                      name="verifyingDetails"
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
                    >
                      <Input style={{ width: 303 }} />
                    </Form.Item>
                  )}
                </div>
              )}
              {viewOnly && (
                <div className="radio-content view-section">
                  <Form.Item
                    label={t('assessmentIsThirdPartyVerified')}
                    className="form-item"
                    name="IsThirdPartyVerified"
                  >
                    <Radio.Group size="middle" disabled>
                      <div className="radio-container">
                        <Radio.Button className="radio">
                          {assessmentViewData.IsThirdPartyVerified}
                        </Radio.Button>
                      </div>
                    </Radio.Group>
                  </Form.Item>
                  {assessmentViewData.IsThirdPartyVerified === RadioButtonStatus.YES && (
                    <Form.Item
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
                      label={t('verifyingOrgNamelbl')}
                      name="verifyingOrgName"
                    >
                      <Input
                        disabled
                        style={{ width: 303 }}
                        defaultValue={assessmentViewData.verifyingOrgName}
                      />
                    </Form.Item>
                  )}
                  <Form.Item
                    label={t('assesmentIsWillingToVerified')}
                    className="form-item"
                    name="IsWillingToVerified"
                  >
                    <Radio.Group size="middle" disabled>
                      <div className="radio-container">
                        <Radio.Button className="radio">
                          {assessmentViewData.IsWillingToVerified}
                        </Radio.Button>
                      </div>
                    </Radio.Group>
                  </Form.Item>
                  {assessmentViewData.IsWillingToVerified === RadioButtonStatus.YES && (
                    <Form.Item
                      label={t('verifyingDetailslbl')}
                      name="verifyingDetails"
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
                    >
                      <Input
                        disabled
                        defaultValue={assessmentViewData.verifyingDetails}
                        style={{ width: 303 }}
                      />
                    </Form.Item>
                  )}
                </div>
              )}
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
              form={form2}
            >
              <Row className="mg-bottom-1">
                <label className="co-sub-title-text">{t('contactInformation')}</label>
              </Row>
              <Row justify="start" gutter={16}>
                <Col flex="139px">
                  <>
                    {!viewOnly && (
                      <Form.Item label={t('assessmentTitle')} name="title">
                        <Select
                          size="large"
                          style={{
                            width: '139px',
                            borderRadius: '4px',
                          }}
                          options={titleList}
                        ></Select>
                      </Form.Item>
                    )}
                    {viewOnly && (
                      <Form.Item label={t('assessmentTitle')} name="title">
                        <Input
                          disabled
                          defaultValue={assessmentViewData.title}
                          style={{ width: 303 }}
                        />
                      </Form.Item>
                    )}
                  </>
                </Col>
                <Col flex="303px">
                  <>
                    {!viewOnly && (
                      <Form.Item label={t('assessmentFirstName')} name="firstName">
                        <Input style={{ width: 303 }} />
                      </Form.Item>
                    )}
                    {viewOnly && (
                      <Form.Item label={t('assessmentFirstName')} name="firstName">
                        <Input
                          disabled
                          defaultValue={assessmentViewData.firstName}
                          style={{ width: 303 }}
                        />
                      </Form.Item>
                    )}
                  </>
                </Col>
                <Col flex="303px">
                  <>
                    {!viewOnly && (
                      <Form.Item label={t('assessmentLastName')} name="lastName">
                        <Input style={{ width: 303 }} />
                      </Form.Item>
                    )}
                    {viewOnly && (
                      <Form.Item label={t('assessmentLastName')} name="lastName">
                        <Input
                          disabled
                          defaultValue={assessmentViewData.lastName}
                          style={{ width: 303 }}
                        />
                      </Form.Item>
                    )}
                  </>
                </Col>
              </Row>
              <Row justify="start" gutter={16}>
                <Col flex="462px">
                  <>
                    {!viewOnly && (
                      <Form.Item label={t('assessmentOrganisation')} name="organisation">
                        <Input style={{ width: 462 }} />
                      </Form.Item>
                    )}
                    {viewOnly && (
                      <Form.Item label={t('assessmentOrganisation')} name="organisation">
                        <Input
                          disabled
                          defaultValue={assessmentViewData.organisation}
                          style={{ width: 462 }}
                        />
                      </Form.Item>
                    )}
                  </>
                </Col>
                <Col flex="303px">
                  <>
                    {!viewOnly && (
                      <Form.Item label={t('assessmentTelephone')} name="telephone">
                        <PhoneInput
                          style={{ width: 303 }}
                          international
                          defaultCountry="LK"
                          countryCallingCodeEditable={false}
                          onChange={(v) => {}}
                        />
                      </Form.Item>
                    )}
                    {viewOnly && (
                      <Form.Item label={t('assessmentTelephone')} name="telephone">
                        <Input
                          disabled
                          defaultValue={assessmentViewData.telephone}
                          style={{ width: 303 }}
                        />
                      </Form.Item>
                    )}
                  </>
                </Col>
              </Row>
              <Row justify="start" gutter={16}>
                <Col flex="303px">
                  <>
                    {!viewOnly && (
                      <Form.Item
                        label={t('assessmentEmail')}
                        name="email"
                        rules={[
                          {
                            validator: async (rule, value) => {
                              if (value) {
                                const val = value.trim();
                                const reg =
                                  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                                const matches = val.match(reg) ? val.match(reg) : [];
                                if (matches.length === 0) {
                                  throw new Error(
                                    `${t('addUser:email')} ${t('addUser:isInvalid')}`
                                  );
                                }
                              }
                            },
                          },
                        ]}
                      >
                        <Input style={{ width: 303 }} />
                      </Form.Item>
                    )}
                    {viewOnly && (
                      <Form.Item label={t('assessmentEmail')} name="email">
                        <Input
                          disabled
                          defaultValue={assessmentViewData.email}
                          style={{ width: 303 }}
                        />
                      </Form.Item>
                    )}
                  </>
                </Col>
                <Col flex="462px">
                  <>
                    {!viewOnly && (
                      <Form.Item label={t('assessmentAffiliationCDM')} name="affiliationCDM">
                        <Input style={{ width: 462 }} />
                      </Form.Item>
                    )}
                    {viewOnly && (
                      <Form.Item label={t('assessmentAffiliationCDM')} name="affiliationCDM">
                        <Input
                          disabled
                          defaultValue={assessmentViewData.affiliationCDM}
                          style={{ width: 462 }}
                        />
                      </Form.Item>
                    )}
                  </>
                </Col>
              </Row>
            </Form>
          </Row>

          <Row>
            <Col span={24}>
              <Form
                name="form3"
                labelCol={{ span: 19 }}
                labelWrap={true}
                labelAlign="left"
                wrapperCol={{ span: 5 }}
                layout="horizontal"
                requiredMark={true}
                form={form3}
                onValuesChange={() => validateForms()}
              >
                {!viewOnly && (
                  <div className="radio-content">
                    <Form.Item
                      label={t('assesmentIsThePersonListed')}
                      className="form-item"
                      name="isThePersonListed"
                    >
                      <Radio.Group size="middle" onChange={onIsThePersonListedChanged}>
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
                    {isPersonListedDetailsVisible === true && (
                      <Form.Item
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                        label={t('specify')}
                        name="personListedDetails"
                        rules={[
                          {
                            required: true,
                            message: '',
                          },
                        ]}
                      >
                        <Input style={{ width: 303 }} />
                      </Form.Item>
                    )}
                  </div>
                )}
                {viewOnly && (
                  <div className="radio-content">
                    <Form.Item
                      label={t('assesmentIsThePersonListed')}
                      className="form-item"
                      name="isThePersonListed"
                    >
                      <Radio.Group size="middle" disabled>
                        <div className="radio-container">
                          <Radio.Button className="radio">
                            {assessmentViewData.isThePersonListed}
                          </Radio.Button>
                        </div>
                      </Radio.Group>
                    </Form.Item>
                    {assessmentViewData.isThePersonListed === RadioButtonStatus.NO && (
                      <Form.Item
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                        label={t('specify')}
                        name="personListedDetails"
                      >
                        <Input
                          disabled
                          defaultValue={assessmentViewData.personListedDetails}
                          style={{ width: 303 }}
                        />
                      </Form.Item>
                    )}
                  </div>
                )}
              </Form>
            </Col>
          </Row>

          <Row>
            <Form layout="vertical" name="form4" form={form4}>
              <Row className="mg-bottom-1">
                <label className="co-sub-title-text">{t('feasibilityReport')}</label>
              </Row>
              <Row justify="start" gutter={16}>
                <Col flex="303px">
                  <>
                    {!viewOnly && (
                      <Form.Item label={t('assessmentStudyName')} name="studyName">
                        <Input style={{ width: 303 }} />
                      </Form.Item>
                    )}
                    {viewOnly && (
                      <Form.Item label={t('assessmentStudyName')} name="studyName">
                        <Input
                          disabled
                          defaultValue={assessmentViewData.studyName}
                          style={{ width: 303 }}
                        />
                      </Form.Item>
                    )}
                  </>
                </Col>
                <Col flex="303px">
                  <>
                    {!viewOnly && (
                      <Form.Item label={t('assessmentFunder')} name="funder">
                        <Input style={{ width: 303 }} />
                      </Form.Item>
                    )}
                    {viewOnly && (
                      <Form.Item label={t('assessmentFunder')} name="funder">
                        <Input
                          disabled
                          defaultValue={assessmentViewData.funder}
                          style={{ width: 303 }}
                        />
                      </Form.Item>
                    )}
                  </>
                </Col>
              </Row>
              <Row>
                {!viewOnly && (
                  <Form.Item
                    label={t('assessmentDocuments')}
                    name="document"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    required={false}
                  >
                    <Upload
                      beforeUpload={(file: any) => {
                        return false;
                      }}
                      className="design-upload-section"
                      name="document"
                      listType="picture"
                      multiple={false}
                      maxCount={1}
                    >
                      <Button className="upload-doc" size="large" icon={<UploadOutlined />}>
                        Upload
                      </Button>
                    </Upload>
                  </Form.Item>
                )}
                {viewOnly && assessmentViewData.document && (
                  <a
                    href={assessmentViewData.document}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    {assessmentViewData.document}
                  </a>
                )}
              </Row>
            </Form>
          </Row>
        </Form.Provider>
      )}
    </div>
  );
};

export default Assessment;
