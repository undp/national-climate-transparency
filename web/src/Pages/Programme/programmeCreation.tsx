import React, { useEffect, useState } from 'react';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Steps,
  Tooltip,
  Upload,
  message,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import './programmeCreation.scss';
import '../../Styles/app.scss';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { Sector } from '../../Casl/enums/sector.enum';
import { SectoralScope } from '../../Casl/enums/sectoral.scope.enum';
import { InfoCircle } from 'react-bootstrap-icons';
import { useUserContext } from '../../Context/UserInformationContext/userInformationContext';
import moment from 'moment';
import { RcFile } from 'antd/lib/upload';

type SizeType = Parameters<typeof Form>[0]['size'];

const maximumImageSize = process.env.MAXIMUM_IMAGE_SIZE
  ? parseInt(process.env.MAXIMUM_IMAGE_SIZE)
  : 7145728;

export const AddProgrammeComponent = () => {
  const { state } = useLocation();
  const [formOne] = Form.useForm();
  const [formTwo] = Form.useForm();
  const navigate = useNavigate();
  const [formChecks] = Form.useForm();
  const { put, get, post } = useConnection();
  const { userInfoState } = useUserContext();
  const { t } = useTranslation(['common', 'addProgramme']);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [ndcScopeChanged, setNdcScopeChanged] = useState<boolean>(false);
  const [contactNoInput] = useState<any>();
  const [stepOneData, setStepOneData] = useState<any>();
  const [stepTwoData, setStepTwoData] = useState<any>();
  const [current, setCurrent] = useState<number>(0);
  const [isUpdate, setIsUpdate] = useState(false);
  const [includedInNDC, setIncludedInNDC] = useState<any>();
  const [includedInNAP, setIncludedInNAP] = useState<any>();
  const [countries, setCountries] = useState<[]>([]);
  const [organisationsList, setOrganisationList] = useState<any[]>([]);
  const [userOrgTaxId, setUserOrgTaxId] = useState<any>('');
  const [regionsList, setRegionsList] = useState<any[]>([]);

  const initialOrganisationOwnershipValues: any[] = [
    {
      organisation: userInfoState?.companyName,
      proponentPercentage: 100,
    },
  ];

  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const getCountryList = async () => {
    setLoadingList(true);
    try {
      const response = await get('national/organisation/countries');
      if (response.data) {
        setCountries(response.data);
      }
    } catch (error: any) {
      console.log('Error in getting country list', error);
    } finally {
      setLoadingList(false);
    }
  };

  const getRegionList = async () => {
    setLoadingList(true);
    try {
      const response = await post('national/organisation/regions', { page: 1, size: 100 });
      if (response.data) {
        const regionNames = response.data.map((item: any) => item.regionName);
        setRegionsList(['National', ...regionNames]);
      }
    } catch (error: any) {
      console.log('Error in getting regions list', error);
    } finally {
      setLoadingList(false);
    }
  };

  const getOrganisationsDetails = async () => {
    setLoadingList(true);
    try {
      const response = await post('national/organisation/queryNames', { page: 1, size: 100 });
      if (response.data) {
        setOrganisationList(response?.data);
        const userOrganisation = response?.data.find(
          (company: any) => company.name === userInfoState?.companyName
        );
        const taxId = userOrganisation ? userOrganisation.taxId : null;
        setUserOrgTaxId(taxId);
      }
    } catch (error: any) {
      console.log('Error in getting organisation list', error);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    getOrganisationsDetails();
    getCountryList();
    getRegionList();
  }, []);

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const nextOne = (val: any) => {
    console.log(val);
    setCurrent(current + 1);
    setStepOneData(val);
  };

  const prevOne = () => {
    setCurrent(current - 1);
  };

  const onFinishStepOne = async (values: any) => {
    setLoading(true);
    let programmeDetails: any;
    const ownershipPercentage = values?.ownershipPercentage;
    const totalPercentage = ownershipPercentage.reduce(
      (sum: any, field: any) => sum + field.proponentPercentage,
      0
    );
    const proponentPercentages = ownershipPercentage.map((item: any) => item.proponentPercentage);
    const proponentTxIds = ownershipPercentage.slice(1).map((item: any) => item.organisation);
    const logoBase64 = await getBase64(values?.designDocument[0]?.originFileObj as RcFile);
    const logoUrls = logoBase64.split(',');
    if (totalPercentage !== 100) {
      message.open({
        type: 'error',
        content: t('addProgramme:proponentPercentValidation'),
        duration: 4,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      setLoading(false);
    } else {
      programmeDetails = {
        title: values?.title,
        externalId: values?.externalId,
        sectoralScope: values?.sectoralScope,
        sector: values?.sector,
        startTime: moment(values?.startTime).startOf('day').unix(),
        endTime: moment(values?.endTime).endOf('day').unix(),
        proponentTaxVatId: [userOrgTaxId, ...proponentTxIds],
        proponentPercentage: proponentPercentages,
        designDocument: logoUrls[1],
        programmeProperties: {
          buyerCountryEligibility: values?.buyerCountryEligibility,
          geographicalLocation: values?.geographicalLocation,
          greenHouseGasses: values?.greenHouseGasses,
          ndcScope: values?.ndcScope === 'true' ? true : false,
          includedInNDC: includedInNDC,
          includedInNap: includedInNDC,
        },
      };
      setLoading(false);
      nextOne(programmeDetails);
    }
  };

  const onFinishStepTwo = async (values: any) => {
    setLoading(true);
    console.log('form two values ------------------- ');
    console.log(values);
    console.log(stepOneData);
    const programmeDetails: any = stepOneData;
    programmeDetails.creditEst = Number(values?.creditEst);
    programmeDetails.programmeProperties.estimatedProgrammeCostUSD = Number(
      values?.estimatedProgrammeCostUSD
    );
    programmeDetails.programmeProperties.carbonPriceUSDPerTon = Number(
      values?.minViableCarbonPrice
    );
    console.log(programmeDetails);
    try {
      const response: any = await post('national/programme/create', programmeDetails);
      console.log('Programme creation -> ', response);
      if (response?.statusText === 'SUCCESS') {
        message.open({
          type: 'success',
          content: t('addProgramme:programmeCreationSuccess'),
          duration: 4,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
      }
      navigate('/programmeManagement/view');
    } catch (error: any) {
      console.log('Error in programme creation - ', error);
    } finally {
      setLoading(false);
    }
  };

  const onFormTwoValuesChane = (changedValues: any, allValues: any) => {
    console.log('form two ============== > ', changedValues, allValues);
    if (allValues?.creditEst !== undefined && allValues?.estimatedProgrammeCostUSD !== undefined) {
      formTwo.setFieldValue(
        'minViableCarbonPrice',
        Number(allValues?.estimatedProgrammeCostUSD / allValues?.creditEst).toFixed(2)
      );
    }
  };

  const onChangeNDCScope = (event: any) => {
    if (event?.target) {
      setNdcScopeChanged(true);
      setIncludedInNDC(true);
    }
  };

  const onChangeGeoLocation = (values: any[]) => {
    if (values.includes('National')) {
      const buyerCountryValues = regionsList;
      const newBuyerValues = buyerCountryValues?.filter((item: any) => item !== 'National');
      formOne.setFieldValue('geographicalLocation', [...newBuyerValues]);
    }
  };

  const onInCludedNAPChange = (event: any) => {
    if (event?.target?.value === 'inNAP') {
      setIncludedInNAP(true);
    } else if (event?.target?.value === 'notInNAP') {
      setIncludedInNAP(false);
    }
  };

  const onInCludedNDCChange = (event: any) => {
    if (event?.target?.value === 'inNDC') {
      setIncludedInNDC(true);
    } else if (event?.target?.value === 'notInNDC') {
      setIncludedInNDC(false);
    }
  };

  const ProgrammeDetailsForm = () => {
    const companyRole = state?.record?.companyRole;
    return (
      <div className="programme-details-form-container">
        <div className="programme-details-form">
          <Form
            labelCol={{ span: 20 }}
            wrapperCol={{ span: 24 }}
            name="programme-details"
            className="programme-details-form"
            layout="vertical"
            requiredMark={true}
            form={formOne}
            onFinish={onFinishStepOne}
          >
            <Row className="row" gutter={[16, 16]}>
              <Col xl={12} md={24}>
                <div className="details-part-one">
                  <Form.Item
                    label={t('addProgramme:title')}
                    name="title"
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
                            throw new Error(`${t('addProgramme:title')} ${t('isRequired')}`);
                          }
                        },
                      },
                    ]}
                  >
                    <Input size="large" />
                  </Form.Item>
                  <Form.Item
                    label={t('addProgramme:sector')}
                    name="sector"
                    rules={[
                      {
                        required: true,
                        message: `${t('addProgramme:sector')} ${t('isRequired')}`,
                      },
                    ]}
                  >
                    <Select size="large">
                      {Object.values(Sector).map((sector: any) => (
                        <Select.Option value={sector}>{sector}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    wrapperCol={{ span: 13 }}
                    label={t('addProgramme:startTime')}
                    name="startTime"
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
                            throw new Error(`${t('addProgramme:startTime')} ${t('isRequired')}`);
                          } else {
                            const endTime = formOne.getFieldValue('endTime');
                            if (endTime && value >= endTime) {
                              throw new Error(`${t('addProgramme:endTimeVal')}`);
                            }
                          }
                        },
                      },
                    ]}
                  >
                    <DatePicker
                      size="large"
                      disabledDate={(currentDate: any) => currentDate < moment().startOf('day')}
                    />
                  </Form.Item>
                  <Form.Item
                    label={t('addProgramme:ghgCovered')}
                    name="greenHouseGasses"
                    rules={[
                      {
                        required: true,
                        message: `${t('addProgramme:ghgCovered')} ${t('isRequired')}`,
                      },
                    ]}
                  >
                    <Select size="large" mode="multiple" maxTagCount={2}>
                      <Select.Option value="CO2">
                        CO<sub>2</sub>
                      </Select.Option>
                      <Select.Option value="CH4">
                        CH<sub>4</sub>
                      </Select.Option>
                      <Select.Option value="N2O">
                        N<sub>2</sub>O
                      </Select.Option>
                      <Select.Option value="HFCs">
                        HFC<sub>s</sub>
                      </Select.Option>
                      <Select.Option value="PFCs">
                        PFC<sub>s</sub>
                      </Select.Option>
                      <Select.Option value="SF6">
                        SF<sub>6</sub>
                      </Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label={t('addProgramme:designDoc')}
                    name="designDocument"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    required={false}
                    rules={[
                      {
                        validator: async (rule, file) => {
                          let isCorrectFormat = false;
                          if (file[0]?.type === 'application/pdf') {
                            isCorrectFormat = true;
                          }
                          if (!isCorrectFormat) {
                            throw new Error(`${t('addProgramme:invalidFileFormat')}`);
                          } else if (file[0]?.size > maximumImageSize) {
                            // default size format of files would be in bytes -> 1MB = 1000000bytes
                            throw new Error(`${t('addProgramme:maxSizeVal')}`);
                          }
                        },
                      },
                    ]}
                  >
                    <Upload
                      beforeUpload={(file: any) => {
                        return false;
                      }}
                      className="design-upload-section"
                      name="design"
                      action="/upload.do"
                      listType="picture"
                      multiple={false}
                      // defaultFileList={fileList}
                      maxCount={1}
                    >
                      <Button className="upload-doc" size="large" icon={<UploadOutlined />}>
                        Upload
                      </Button>
                    </Upload>
                  </Form.Item>
                  <Form.Item
                    label={t('addProgramme:buyerCountryEligibility')}
                    name="buyerCountryEligibility"
                    initialValue={state?.record?.name}
                    rules={[
                      {
                        required: false,
                      },
                      {
                        validator: async (rule, value) => {
                          if (
                            String(value).trim() === '' ||
                            String(value).trim() === undefined ||
                            value === null ||
                            value === undefined
                          ) {
                            throw new Error(
                              `${t('addProgramme:buyerCountryEligibility')} ${t('isRequired')}`
                            );
                          }
                        },
                      },
                    ]}
                  >
                    <Select size="large" loading={loadingList}>
                      {countries.map((country: any) => (
                        <Select.Option key={country.alpha2} value={country.alpha2}>
                          {country.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.List
                    name="ownershipPercentage"
                    initialValue={initialOrganisationOwnershipValues}
                  >
                    {(fields, { add, remove }) => (
                      <div className="space-container" style={{ width: '100%' }}>
                        {fields.map(({ key, name, ...restField }) => {
                          return (
                            <Space
                              wrap={true}
                              key={key}
                              style={{ display: 'flex', marginBottom: 8 }}
                              align="center"
                              size={'large'}
                            >
                              <div className="ownership-list-item">
                                <Form.Item
                                  {...restField}
                                  label={t('addProgramme:company')}
                                  name={[name, 'organisation']}
                                  wrapperCol={{ span: 24 }}
                                  className="organisation"
                                  rules={[
                                    {
                                      required: true,
                                      message: `${t('addProgramme:company')} ${t('isRequired')}`,
                                    },
                                  ]}
                                >
                                  <Select size="large" loading={loadingList} disabled={name === 0}>
                                    {organisationsList.map((organisation) => (
                                      <Select.Option
                                        key={organisation.companyId}
                                        value={organisation.taxId}
                                      >
                                        {organisation.name}
                                      </Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  label={t('addProgramme:proponentPercentage')}
                                  className="ownership-percent"
                                  name={[name, 'proponentPercentage']}
                                  labelCol={{ span: 24 }}
                                  wrapperCol={{ span: 24 }}
                                  rules={[
                                    {
                                      required: true,
                                      message: `${t('addProgramme:proponentPercentage')} ${t(
                                        'isRequired'
                                      )}`,
                                    },
                                    // { validator: validateOwnershipPercentage },
                                  ]}
                                >
                                  <InputNumber
                                    size="large"
                                    min={1}
                                    max={100}
                                    formatter={(value) => `${value}%`}
                                    parser={(value: any) => value.replace('%', '')}
                                    disabled={fields?.length < 2}
                                  />
                                </Form.Item>
                                {fields?.length > 1 && name !== 0 && (
                                  <MinusCircleOutlined
                                    className="dynamic-delete-button"
                                    onClick={() => remove(name)}
                                  />
                                )}
                              </div>
                            </Space>
                          );
                        })}
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            icon={<PlusOutlined />}
                          ></Button>
                        </Form.Item>
                      </div>
                    )}
                  </Form.List>
                </div>
              </Col>
              <Col xl={12} md={24}>
                <div className="details-part-two">
                  <Form.Item
                    label={t('addProgramme:externalId')}
                    name="externalId"
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
                            throw new Error(`${t('addProgramme:externalId')} ${t('isRequired')}`);
                          }
                        },
                      },
                    ]}
                  >
                    <Input size="large" />
                  </Form.Item>
                  <Form.Item
                    label={t('addProgramme:sectoralScope')}
                    name="sectoralScope"
                    rules={[
                      {
                        required: true,
                        message: `${t('addProgramme:sectoralScope')} ${t('isRequired')}`,
                      },
                    ]}
                  >
                    <Select size="large">
                      {Object.entries(SectoralScope).map(([key, value]) => (
                        <Select.Option key={value} value={value}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    wrapperCol={{ span: 13 }}
                    label={t('addProgramme:endTime')}
                    name="endTime"
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
                            throw new Error(`${t('addProgramme:endTime')} ${t('isRequired')}`);
                          } else {
                            const startTime = formOne.getFieldValue('startTime');
                            if (startTime && value <= startTime) {
                              throw new Error(`${t('addProgramme:endTimeVal')}`);
                            }
                          }
                        },
                      },
                    ]}
                  >
                    <DatePicker
                      size="large"
                      disabledDate={(currentDate: any) => currentDate < moment().endOf('day')}
                    />
                  </Form.Item>
                  <Form.Item
                    label={t('addProgramme:ndcScope')}
                    wrapperCol={{ span: 13 }}
                    className="role-group"
                    name="ndcScope"
                    initialValue={companyRole}
                    rules={[
                      {
                        required: false,
                      },
                    ]}
                  >
                    <Radio.Group size="large" onChange={onChangeNDCScope}>
                      <div className="condition-radio-container">
                        <Radio.Button className="condition-radio" value="true">
                          {t('addProgramme:conditional')}
                        </Radio.Button>
                      </div>
                      <div className="condition-radio-container">
                        <Radio.Button className="condition-radio" value="false">
                          {t('addProgramme:unConditional')}
                        </Radio.Button>
                      </div>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item
                    label={t('addProgramme:geographicalLocation')}
                    name="geographicalLocation"
                    rules={[
                      {
                        required: true,
                        message: `${t('addProgramme:geographicalLocation')} ${t('isRequired')}`,
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      size="large"
                      maxTagCount={2}
                      onChange={onChangeGeoLocation}
                      loading={loadingList}
                    >
                      {regionsList.map((region: any) => (
                        <Select.Option value={region}>{region}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </Col>
            </Row>
            <Row className="selection-details-row" gutter={[16, 16]}>
              <Col md={24} xl={12} className="in-ndc-col">
                <Row className="in-ndc-row">
                  <Col md={16} lg={18} xl={19}>
                    <div className="included-label">
                      <div>{t('addProgramme:inNDC')}</div>
                      <div className="info-container">
                        <Tooltip
                          arrowPointAtCenter
                          placement="bottomRight"
                          trigger="hover"
                          title={t('addProgramme:inNDCToolTip')}
                        >
                          <InfoCircle color="#000000" size={17} />
                        </Tooltip>
                      </div>
                    </div>
                  </Col>
                  <Col md={8} lg={6} xl={5} className="included-val">
                    <Radio.Group
                      size="small"
                      disabled={ndcScopeChanged}
                      defaultValue={
                        ndcScopeChanged
                          ? 'inNDC'
                          : includedInNDC
                          ? 'inNDC'
                          : includedInNDC === false
                          ? 'notInNDC'
                          : undefined
                      }
                      onChange={onInCludedNDCChange}
                    >
                      <div className="yes-no-radio-container">
                        <Radio.Button className="yes-no-radio" value="inNDC">
                          {t('addProgramme:yes')}
                        </Radio.Button>
                      </div>
                      <div className="yes-no-radio-container">
                        <Radio.Button className="yes-no-radio" value="notInNDC">
                          {t('addProgramme:no')}
                        </Radio.Button>
                      </div>
                    </Radio.Group>
                  </Col>
                </Row>
              </Col>
              <Col md={24} xl={12} className="in-nap-col">
                <Row className="in-nap-row">
                  <Col md={16} lg={18} xl={19}>
                    <div className="included-label">
                      <div>{t('addProgramme:inNAP')}</div>
                      <div className="info-container">
                        <Tooltip
                          arrowPointAtCenter
                          placement="bottomRight"
                          trigger="hover"
                          title={t('addProgramme:inNAPToolTip')}
                        >
                          <InfoCircle color="#000000" size={17} />
                        </Tooltip>
                      </div>
                    </div>
                  </Col>
                  <Col md={8} lg={6} xl={5} className="included-val">
                    <Radio.Group
                      size="small"
                      onChange={onInCludedNAPChange}
                      defaultValue={
                        includedInNAP ? 'inNAP' : includedInNAP === false ? 'notInNAP' : undefined
                      }
                    >
                      <div className="yes-no-radio-container">
                        <Radio.Button className="yes-no-radio" value="inNAP">
                          {t('addProgramme:yes')}
                        </Radio.Button>
                      </div>
                      <div className="yes-no-radio-container">
                        <Radio.Button className="yes-no-radio" value="notInNAP">
                          {t('addProgramme:no')}
                        </Radio.Button>
                      </div>
                    </Radio.Group>
                  </Col>
                </Row>
              </Col>
            </Row>
            <div className="steps-actions">
              <Button type="primary" htmlType="submit" loading={loading}>
                {t('addProgramme:next')}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    );
  };

  const ProgrammeFinancingSought = () => {
    return (
      <div className="programme-sought-form-container">
        <div className="programme-sought-form">
          <Form
            labelCol={{ span: 20 }}
            wrapperCol={{ span: 24 }}
            name="programme-sought"
            className="programme-sought-form"
            layout="vertical"
            requiredMark={true}
            form={formTwo}
            onFinish={onFinishStepTwo}
            onValuesChange={onFormTwoValuesChane}
          >
            <Row className="row" gutter={[16, 16]}>
              <Col xl={12} md={24}>
                <div className="details-part-one">
                  <Form.Item
                    label={t('addProgramme:estimatedProgrammeCostUSD')}
                    name="estimatedProgrammeCostUSD"
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
                            throw new Error(
                              `${t('addProgramme:estimatedProgrammeCostUSD')} ${t('isRequired')}`
                            );
                          } else if (!isNaN(value) && Number(value) > 0) {
                            return Promise.resolve();
                          } else {
                            throw new Error(
                              `${t('addProgramme:estimatedProgrammeCostUSD')} ${t('isInvalid')}`
                            );
                          }
                        },
                      },
                    ]}
                  >
                    <Input size="large" />
                  </Form.Item>
                  <Form.Item
                    label={t('addProgramme:minViableCarbonPrice')}
                    name="minViableCarbonPrice"
                  >
                    <Input disabled size="large" />
                  </Form.Item>
                </div>
              </Col>
              <Col xl={12} md={24}>
                <div className="details-part-two">
                  <Form.Item
                    label={t('addProgramme:creditEst')}
                    name="creditEst"
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
                            throw new Error(`${t('addProgramme:creditEst')} ${t('isRequired')}`);
                          } else if (!isNaN(value) && Number(value) > 0) {
                            return Promise.resolve();
                          } else {
                            throw new Error(`${t('addProgramme:creditEst')} ${t('isInvalid')}`);
                          }
                        },
                      },
                    ]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </div>
              </Col>
            </Row>
            <div className="steps-actions">
              <Button type="primary" htmlType="submit" loading={loading}>
                {t('addProgramme:submit')}
              </Button>
              <Button
                className="action-btn"
                onClick={() => setCurrent(current + 1)}
                loading={loading}
              >
                {t('addProgramme:addAction')}
              </Button>
              {current === 1 && (
                <Button className="back-btn" onClick={() => prevOne()} loading={loading}>
                  {t('addProgramme:back')}
                </Button>
              )}
            </div>
          </Form>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getOrganisationsDetails();
  }, []);

  return (
    <div className="add-programme-main-container">
      <div className="title-container">
        <div className="main">
          {isUpdate ? t('addProgramme:editProgramme') : t('addProgramme:addProgramme')}
        </div>
        <div className="sub">
          {isUpdate ? t('addProgramme:editProgrammeSub') : t('addProgramme:addProgrammeSub')}
        </div>
      </div>
      <div className="adding-section">
        {isUpdate ? (
          <>
            <div className="step-title-container">
              <div className="title">{t('addCompany:companyDetailsTitle')}</div>
            </div>
            <ProgrammeDetailsForm />
          </>
        ) : (
          <div className="form-section">
            <Steps
              progressDot
              direction="vertical"
              current={current}
              items={[
                {
                  title: (
                    <div className="step-title-container">
                      <div className="step-count">01</div>
                      <div className="title">{t('addProgramme:addProgramme1')}</div>
                    </div>
                  ),
                  description: current === 0 && <ProgrammeDetailsForm />,
                },
                {
                  title: (
                    <div className="step-title-container">
                      <div className="step-count">02</div>
                      <div className="title">{t('addProgramme:addProgramme2')}</div>
                    </div>
                  ),
                  description: current === 1 && (
                    <div>
                      <ProgrammeFinancingSought />
                    </div>
                  ),
                },
                ...(current > 1
                  ? [
                      {
                        title: (
                          <div className="step-title-container">
                            <div className="step-count">03</div>
                            <div className="title">{t('addProgramme:addProgramme3')}</div>
                          </div>
                        ),
                        description: current === 2 && <div>3</div>,
                      },
                      {
                        title: (
                          <div className="step-title-container">
                            <div className="step-count">04</div>
                            <div className="title">{t('addProgramme:addProgramme4')}</div>
                          </div>
                        ),
                        description: current === 3 && <div>4</div>,
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
};
