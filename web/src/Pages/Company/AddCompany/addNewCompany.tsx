import { useEffect, useState } from 'react';
import { Button, Col, Form, Input, Radio, Row, Select, Upload, UploadFile, message } from 'antd';
import PhoneInput, {
  formatPhoneNumber,
  formatPhoneNumberIntl,
  isPossiblePhoneNumber,
} from 'react-phone-number-input';
import { AuditOutlined, BankOutlined, UploadOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserProps, getBase64, useConnection, useUserContext } from '@undp/carbon-library';
import { RcFile } from 'antd/lib/upload';
import { OrganisationType } from '../../../Definitions/organisation.type.enum';
import validator from 'validator';
import './addNewCompanyComponent.scss';
import '../../../Styles/app.scss';
import { Sector } from '../../../Enums/sector.enum';

const AddNewCompany = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['addCompany']);

  const maximumImageSize = process.env.REACT_APP_MAXIMUM_FILE_SIZE
    ? parseInt(process.env.REACT_APP_MAXIMUM_FILE_SIZE)
    : 5000000;

  const onNavigateToCompanyManagement = () => {
    navigate('/companyManagement/viewAll', { replace: true });
  };

  const [formOne] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [contactNoInput] = useState<any>();
  const [isUpdate, setIsUpdate] = useState(false);
  const { put, get, post } = useConnection();
  const { setUserInfo, userInfoState } = useUserContext();
  const { state } = useLocation();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [countries, setCountries] = useState<[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [regionsList, setRegionsList] = useState<any[]>([]);
  const [companyRole, setCompanyRole] = useState<any>(state?.record?.organisationType);

  const regionField = true;

  const getCountryList = async () => {
    const response = await get('national/organisation/countries');
    if (response.data) {
      const alpha2Names = response.data.map((item: any) => {
        return item.alpha2;
      });
      setCountries(alpha2Names);
    }
  };

  const getRegionList = async () => {
    setLoadingList(true);
    try {
      const response = await post('national/organisation/regions', {
        page: 1,
        size: 100,
        filterAnd: [
          {
            key: 'lang',
            operation: '=',
            value: 'en',
          },
        ],
      });
      if (response.data) {
        const regionNames = response.data.map((item: any) => item.regionName);
        const uniqueRegionNames: any = Array.from(new Set(regionNames));
        setRegionsList([t('national'), ...uniqueRegionNames]);
      }
    } catch (error: any) {
      console.log('Error in getting regions list', error);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    setIsUpdate(state?.record ? true : false);
    setCompanyRole(state?.record ? state?.record.organisationType : OrganisationType.DEPARTMENT);
    getCountryList();
    getRegionList();
    if (state?.record?.logo) {
      setFileList([
        {
          uid: '1',
          name: `${state?.record?.name}.png`,
          status: 'done',
          url: state?.record?.logo,
          type: 'image/png',
        },
      ]);
    }
  }, []);

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const onChangeRegion = (values: any[]) => {
    if (values.includes(t('national'))) {
      const buyerCountryValues = regionsList;
      const newBuyerValues = buyerCountryValues?.filter((item: any) => item !== t('national'));
      formOne.setFieldValue('regions', [...newBuyerValues]);
    }
  };

  const onFinish = async (values: any) => {
    const requestData = values;
    setLoading(true);
    try {
      requestData.phoneNo = formatPhoneNumberIntl(requestData.phoneNo);
      if (requestData.website) {
        requestData.website = 'https://' + requestData.website;
      } else {
        requestData.website = undefined;
      }
      const logoBase64 = await getBase64(requestData?.logo[0]?.originFileObj as RcFile);
      const logoUrls = logoBase64.split(',');
      requestData.logo = logoUrls[1];
      const response = await post('national/organisation/add', requestData);
      if (response.status === 200 || response.status === 201) {
        if (isUpdate && values.organisationId === userInfoState?.companyId) {
          setUserInfo({
            companyLogo: response.data.logo,
          } as UserProps);
        }
        message.open({
          type: 'success',
          content: t('companyAddedSuccess'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        onNavigateToCompanyManagement();
        setLoading(false);
      }
    } catch (error: any) {
      message.open({
        type: 'error',
        content: `${error.message}`,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } finally {
      setLoading(false);
    }
  };

  const onUpdateCompany = async () => {
    setLoading(true);
    const formOneValues = formOne.getFieldsValue();
    formOneValues.phoneNo = formatPhoneNumberIntl(formOneValues.phoneNo);

    try {
      let values: any = {};

      values = {
        organisationId: state?.record?.organisationId,
        name: formOneValues.name,
        email: formOneValues.email,
        phoneNo: formOneValues.phoneNo,
        address: formOneValues.address,
        organisationType: state?.record?.organisationType,
        sector: formOneValues.sector,
      };
      if (regionField) {
        values.regions = formOneValues.regions;
      }

      if (formOneValues.website) {
        values.website = 'https://' + formOneValues.website;
      } else {
        values.website = undefined;
      }

      if (formOneValues.logo) {
        if (formOneValues.logo.length !== 0) {
          const logoBase64 = await getBase64(formOneValues.logo[0]?.originFileObj as RcFile);
          const logoUrls = logoBase64.split(',');
          values.logo = logoUrls[1];
        }
      }

      const response = await put('national/organisation/update', values);
      if (response.status === 200 || response.status === 201) {
        if (values.organisationId === userInfoState?.companyId) {
          setUserInfo({
            companyLogo: response.data.logo,
          } as UserProps);
        }

        message.open({
          type: 'success',
          content: t('companyUpdatedSuccess'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        onNavigateToCompanyManagement();
      }
      setLoading(false);
    } catch (error: any) {
      message.open({
        type: 'error',
        content: `${t('errorInUpdatingCompany')} ${error.message}`,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      setLoading(false);
    }
  };

  const onCancel = () => {
    onNavigateToCompanyManagement();
  };

  const onChangeCompanyRole = (event: any) => {
    const value = event.target.value;
    setCompanyRole(value);
  };

  const CompanyDetailsForm = () => {
    return (
      <div className="company-details-form-container">
        <div className="company-details-form">
          <Form
            name="company-details"
            className="company-details-form"
            layout="vertical"
            requiredMark={true}
            form={formOne}
            onFinish={isUpdate ? onUpdateCompany : onFinish}
          >
            <Row className="row" gutter={[16, 16]}>
              <Col xl={12} md={24}>
                <div className="details-part-one">
                  <Form.Item
                    label={t('addCompany:name')}
                    name="name"
                    initialValue={state?.record?.name}
                    rules={[
                      {
                        required: true,
                        message: '',
                      },
                      {
                        validator: async (rule, value) => {
                          if (
                            String(value).trim() === '' ||
                            String(value).trim() === undefined ||
                            value === null ||
                            value === undefined
                          ) {
                            throw new Error(`${t('addCompany:name')} ${t('isRequired')}`);
                          }
                        },
                      },
                    ]}
                  >
                    <Input size="large" />
                  </Form.Item>
                  {companyRole === OrganisationType.DEPARTMENT && (
                    <Form.Item
                      label={t('addCompany:sector')}
                      name="sector"
                      initialValue={state?.record?.sector}
                      rules={[
                        {
                          required: true,
                          message: `${t('addCompany:sector')} ${t('isRequired')}`,
                        },
                      ]}
                    >
                      <Select size="large" mode="multiple" maxTagCount={2} allowClear>
                        {Object.values(Sector).map((sector: any) => (
                          <Select.Option value={sector}>{sector}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}
                  {companyRole !== OrganisationType.GOVERNMENT && (
                    <Form.Item
                      label={t('addCompany:email')}
                      name="email"
                      initialValue={state?.record?.email}
                      rules={[
                        {
                          required: true,
                          message: '',
                        },
                        {
                          validator: async (rule, value) => {
                            if (
                              String(value).trim() === '' ||
                              String(value).trim() === undefined ||
                              value === null ||
                              value === undefined
                            ) {
                              throw new Error(`${t('addCompany:email')} ${t('isRequired')}`);
                            } else {
                              const val = value.trim();
                              const reg =
                                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                              const matches = val.match(reg) ? val.match(reg) : [];
                              if (matches.length === 0) {
                                throw new Error(`${t('addCompany:email')} ${t('isInvalid')}`);
                              }
                            }
                          },
                        },
                      ]}
                    >
                      <Input size="large" />
                    </Form.Item>
                  )}
                  <Form.Item
                    className="website"
                    label={t('addCompany:website')}
                    initialValue={state?.record?.website?.split('://')[1]}
                    name="website"
                    rules={[
                      {
                        required: false,
                        validator: async (rule, value) => {
                          if (
                            String(value).trim() !== '' ||
                            String(value).trim() !== undefined ||
                            value !== null ||
                            value !== undefined
                          ) {
                            if (value && !validator.isURL('https://' + value))
                              throw new Error(`${t('addCompany:website')} ${t('isInvalid')}`);
                          }
                        },
                      },
                    ]}
                    getValueFromEvent={(event: any) => event?.target?.value.trim()}
                  >
                    <Input addonBefore="https://" size="large" />
                  </Form.Item>

                  <Form.Item
                    name="logo"
                    label={t('addCompany:companyLogoWithType')}
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    required={true}
                    rules={[
                      {
                        validator: async (rule, file) => {
                          if (file === null || file === undefined) {
                            if (!state?.record?.logo)
                              throw new Error(`${t('addCompany:companyLogo')} ${t('isRequired')}`);
                          } else {
                            if (file.length === 0) {
                              throw new Error(`${t('addCompany:companyLogo')} ${t('isRequired')}`);
                            } else {
                              let isCorrectFormat = false;
                              if (file[0]?.type === 'image/png') {
                                isCorrectFormat = true;
                              } else if (file[0]?.type === 'image/jpeg') {
                                isCorrectFormat = true;
                              } else if (file[0]?.type === 'image/svg') {
                                isCorrectFormat = true;
                              }
                              if (!isCorrectFormat) {
                                throw new Error(`${t('unsupportedFormat')}`);
                              } else if (file[0]?.size > maximumImageSize) {
                                // default size format of files would be in bytes -> 1MB = 1000000bytes
                                throw new Error(`${t('maxUploadSize')}`);
                              }
                            }
                          }
                        },
                      },
                    ]}
                  >
                    <Upload
                      beforeUpload={() => {
                        return false;
                      }}
                      className="logo-upload-section"
                      name="logo"
                      action="/upload.do"
                      listType="picture"
                      multiple={false}
                      defaultFileList={fileList}
                      maxCount={1}
                    >
                      <Button size="large" icon={<UploadOutlined />}>
                        {t('addCompany:upload')}
                      </Button>
                    </Upload>
                  </Form.Item>
                </div>
              </Col>
              <Col xl={12} md={24}>
                <div className="details-part-two">
                  <Form.Item
                    className="role-group"
                    label={t('addCompany:role')}
                    name="organisationType"
                    initialValue={companyRole}
                    rules={[
                      {
                        required: true,
                        message: `${t('addCompany:role')} ${t('isRequired')}`,
                      },
                    ]}
                  >
                    <Radio.Group size="large" disabled={isUpdate} onChange={onChangeCompanyRole}>
                      {isUpdate ? (
                        <div className={`${companyRole}-radio-container`}>
                          <Radio.Button className="department" value={companyRole}>
                            {companyRole === OrganisationType.DEPARTMENT ? (
                              <AuditOutlined className="role-icons" />
                            ) : (
                              <BankOutlined className="role-icons" />
                            )}
                            {companyRole}
                          </Radio.Button>
                        </div>
                      ) : (
                        <>
                          <div className="Department-radio-container">
                            <Radio.Button className="department" value="Department">
                              <AuditOutlined className="role-icons" />
                              {t('addCompany:dep')}
                            </Radio.Button>
                          </div>
                        </>
                      )}
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    name="phoneNo"
                    label={t('addCompany:phoneNo')}
                    initialValue={state?.record?.phoneNo}
                    rules={[
                      {
                        required: true,
                        message: '',
                      },
                      {
                        validator: async (rule: any, value: any) => {
                          if (
                            String(value).trim() === '' ||
                            String(value).trim() === undefined ||
                            value === null ||
                            value === undefined
                          ) {
                            throw new Error(`${t('addCompany:phoneNo')} ${t('isRequired')}`);
                          } else {
                            const phoneNo = formatPhoneNumber(String(value));
                            if (String(value).trim() !== '') {
                              if (phoneNo === null || phoneNo === '' || phoneNo === undefined) {
                                throw new Error(`${t('addCompany:phoneNo')} ${t('isRequired')}`);
                              } else {
                                if (!isPossiblePhoneNumber(String(value))) {
                                  throw new Error(`${t('addCompany:phoneNo')} ${t('isInvalid')}`);
                                }
                              }
                            }
                          }
                        },
                      },
                    ]}
                  >
                    <PhoneInput
                      placeholder={t('addCompany:phoneNo')}
                      international
                      value={formatPhoneNumberIntl(contactNoInput)}
                      defaultCountry="LK"
                      countryCallingCodeEditable={false}
                      onChange={() => {}}
                      countries={countries}
                    />
                  </Form.Item>
                  {regionField && (
                    <Form.Item
                      label={t('addCompany:region')}
                      name="regions"
                      initialValue={state?.record?.regions}
                      rules={[
                        {
                          required: true,
                          message: `${t('addCompany:region')} ${t('isRequired')}`,
                        },
                      ]}
                    >
                      <Select
                        mode="multiple"
                        size="large"
                        maxTagCount={2}
                        onChange={onChangeRegion}
                        loading={loadingList}
                        allowClear
                      >
                        {regionsList.map((region: any) => (
                          <Select.Option value={region}>{region}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}

                  <Form.Item
                    name="address"
                    label={t('addCompany:addresss')}
                    initialValue={state?.record?.address}
                    rules={[
                      { required: true, message: '' },
                      {
                        validator: async (rule, value) => {
                          if (
                            String(value).trim() === '' ||
                            String(value).trim() === undefined ||
                            value === null ||
                            value === undefined
                          ) {
                            throw new Error(`${t('addCompany:addresss')} ${t('isRequired')}`);
                          }
                        },
                      },
                    ]}
                  >
                    <Input.TextArea rows={3} maxLength={100} />
                  </Form.Item>
                </div>
              </Col>
            </Row>
            <div className="steps-actions">
              {isUpdate ? (
                <Row>
                  <Button loading={loading} onClick={onCancel}>
                    {t('addCompany:cancel')}
                  </Button>
                  <Button loading={loading} className="mg-left-1" type="primary" htmlType="submit">
                    {t('addCompany:submit')}
                  </Button>
                </Row>
              ) : (
                <Row>
                  <Button loading={loading} onClick={onCancel}>
                    {t('addCompany:cancel')}
                  </Button>
                  <Button loading={loading} type="primary" className="mg-left-1" htmlType="submit">
                    {t('addCompany:add')}
                  </Button>
                </Row>
              )}
            </div>
          </Form>
        </div>
      </div>
    );
  };

  return (
    <div className="add-company-main-container">
      <div className="title-container">
        <div className="main">
          {isUpdate ? t('addCompany:editCompany') : t('addCompany:addNewCompany')}
        </div>
        <div className="sub">
          {isUpdate ? t('addCompany:editCompanySub') : t('addCompany:addCompanySub')}
        </div>
      </div>
      <div className="adding-section">
        <>
          <div className="step-title-container">
            <div className="title">{t('addCompany:companyDetailsTitle')}</div>
          </div>
          <CompanyDetailsForm />
        </>
      </div>
    </div>
  );
};

export default AddNewCompany;
