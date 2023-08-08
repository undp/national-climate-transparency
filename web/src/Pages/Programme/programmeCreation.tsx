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
import { DownOutlined, MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import './programmeCreation.scss';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { Sector } from '../../Casl/enums/sector.enum';
import { SectoralScope } from '../../Casl/enums/sectoral.scope.enum';
import { InfoCircle } from 'react-bootstrap-icons';
import { useUserContext } from '../../Context/UserInformationContext/userInformationContext';
import moment from 'moment';
import { RcFile } from 'antd/lib/upload';
import { CompanyRole } from '@undp/carbon-library';
import NdcActionDetails from '../../Components/NdcAction/ndcActionDetails';
import CoBenifitsComponent from '../../Components/CoBenifits/coBenifits';

type SizeType = Parameters<typeof Form>[0]['size'];

const maximumImageSize = process.env.REACT_APP_MAXIMUM_FILE_SIZE
  ? parseInt(process.env.REACT_APP_MAXIMUM_FILE_SIZE)
  : 5000000;

const sectoralScopes: any = {
  Energy: [
    'Energy Industries (Renewable – / Non-Renewable Sources)',
    'Energy Distribution',
    'Energy Demand',
  ],
  Transport: ['Transport'],
  Manufacturing: ['Manufacturing Industries', 'Chemical Industries', 'Metal Production'],
  Forestry: ['Afforestation and Reforestation'],
  Waste: ['Waste Handling and Disposal', 'Fugitive Emissions From Fuels (Solid, Oil and Gas)'],
  Agriculture: ['Agriculture'],
  Other: [
    'Mining/Mineral Production',
    'Construction',
    'Fugitive Emissions From Production and Consumption of Halocarbons and Sulphur Hexafluoride',
    'Solvent Use',
  ],
};

export const AddProgrammeComponent = () => {
  const { state } = useLocation();
  const [formOne] = Form.useForm();
  const [formTwo] = Form.useForm();
  const [formChecks] = Form.useForm();
  const navigate = useNavigate();
  const { put, get, post } = useConnection();
  const { userInfoState } = useUserContext();
  const { t } = useTranslation(['common', 'addProgramme']);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [ndcScopeChanged, setNdcScopeChanged] = useState<any>();
  const [ndcScopeValue, setNdcScopeValue] = useState<any>();
  const [stepOneData, setStepOneData] = useState<any>();
  const [current, setCurrent] = useState<number>(0);
  const [isUpdate, setIsUpdate] = useState(false);
  const [includedInNDC, setIncludedInNDC] = useState<any>();
  const [includedInNAP, setIncludedInNAP] = useState<any>();
  const [countries, setCountries] = useState<[]>([]);
  const [organisationsList, setOrganisationList] = useState<any[]>([]);
  const [userOrgTaxId, setUserOrgTaxId] = useState<any>('');
  const [regionsList, setRegionsList] = useState<any[]>([]);
  const [programmeDetailsObj, setProgrammeDetailsObj] = useState<any>();
  const [selectedOrgs, setSelectedOrgs] = useState<any[]>();
  const [ownershipPercentageValidation, setOwnershipPercentageValidation] =
    useState<boolean>(false);
  const [selectedSector, setSelectedSector] = useState<string>('');

  const initialOrganisationOwnershipValues: any[] = [
    {
      organisation:
        userInfoState?.companyRole !== CompanyRole.GOVERNMENT && userInfoState?.companyName,
      proponentPercentage: userInfoState?.companyRole !== CompanyRole.GOVERNMENT && 100,
    },
  ];

  const selectedSectoralScopes =
    selectedSector !== String(Sector.Health) &&
    selectedSector !== String(Sector.Education) &&
    selectedSector !== String(Sector.Hospitality)
      ? sectoralScopes[selectedSector]
      : Object.entries(SectoralScope).map(([key, value]) => key);

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
      const response = await post('national/organisation/queryNames', {
        page: 1,
        size: 100,
        filterAnd: [
          {
            key: 'companyRole',
            operation: '=',
            value: CompanyRole.PROGRAMME_DEVELOPER,
          },
        ],
      });
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
    const proponentTxIds =
      userInfoState?.companyRole !== CompanyRole.GOVERNMENT
        ? ownershipPercentage?.slice(1).map((item: any) => item.organisation)
        : ownershipPercentage?.map((item: any) => item.organisation);
    let logoBase64 = '';
    let logoUrls: any[] = [];
    if (values?.designDocument?.length > 0) {
      logoBase64 = await getBase64(values?.designDocument[0]?.originFileObj as RcFile);
      logoUrls = logoBase64?.split(',');
    }
    const propTaxIds =
      userInfoState?.companyRole !== CompanyRole.GOVERNMENT
        ? [userOrgTaxId, ...proponentTxIds]
        : proponentTxIds;
    const duplicateIds = new Set(propTaxIds).size !== propTaxIds.length;
    if (totalPercentage !== 100) {
      message.open({
        type: 'error',
        content: t('addProgramme:proponentPercentValidation'),
        duration: 4,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      setLoading(false);
    } else if (duplicateIds) {
      message.open({
        type: 'error',
        content: t('addProgramme:duplicateOrg'),
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
        proponentTaxVatId:
          userInfoState?.companyRole !== CompanyRole.GOVERNMENT
            ? [userOrgTaxId, ...proponentTxIds]
            : proponentTxIds,
        proponentPercentage: proponentPercentages,
        programmeProperties: {
          buyerCountryEligibility: values?.buyerCountryEligibility,
          geographicalLocation: values?.geographicalLocation,
          greenHouseGasses: values?.greenHouseGasses,
          ...(values?.ndcScope !== undefined &&
            values?.ndcScope !== null && { ndcScope: values?.ndcScope === 'true' ? true : false }),
          ...(includedInNDC !== undefined &&
            includedInNDC !== null && { includedInNdc: includedInNDC }),
          ...(includedInNAP !== undefined &&
            includedInNAP !== null && { includedInNap: includedInNAP }),
        },
      };
      if (logoUrls?.length > 0) {
        programmeDetails.designDocument = logoUrls[1];
      }
      setLoading(false);
      console.log(programmeDetails);
      nextOne(programmeDetails);
    }
  };

  const saveNewProgramme = async (payload: any) => {
    setLoading(true);
    try {
      const response: any = await post('national/programme/create', payload);
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
      message.open({
        type: 'error',
        content: error?.message,
        duration: 4,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } finally {
      setLoading(false);
    }
  };

  const onNdcActionDetailsSubmit = async (ndcActionDetailsObj: any) => {
    if (ndcActionDetailsObj.enablementReportData) {
      delete ndcActionDetailsObj.enablementReportData;
    }
    const updatedProgrammeDetailsObj = { ...programmeDetailsObj, ndcAction: ndcActionDetailsObj };
    setProgrammeDetailsObj(updatedProgrammeDetailsObj);
    setCurrent(current + 1);
  };

  const onCoBenefitFormSubmit = async (coBenefitDetails: any) => {
    const updatedProgrammeDetailsObj = {
      ...programmeDetailsObj,
    };

    if (!updatedProgrammeDetailsObj.ndcAction) {
      updatedProgrammeDetailsObj.ndcAction = {};
    }
    updatedProgrammeDetailsObj.ndcAction.coBenefitsProperties = coBenefitDetails;
    setProgrammeDetailsObj(updatedProgrammeDetailsObj);
    saveNewProgramme(updatedProgrammeDetailsObj);
  };

  const addFinancingSoughtData = (values: any) => {
    const programmeDetails: any = stepOneData;
    programmeDetails.creditEst = Number(values?.creditEst);
    programmeDetails.programmeProperties.estimatedProgrammeCostUSD = Number(
      values?.estimatedProgrammeCostUSD
    );
    programmeDetails.programmeProperties.carbonPriceUSDPerTon = Number(
      values?.minViableCarbonPrice
    );
    setProgrammeDetailsObj(programmeDetails);
    return programmeDetails;
  };

  const onFinishStepTwo = async (values: any) => {
    const updatedProgrammeDetailsObj = addFinancingSoughtData(values);
    saveNewProgramme(updatedProgrammeDetailsObj);
  };

  const onOpenNdcCreate = () => {
    const values = formTwo.getFieldsValue();
    addFinancingSoughtData(values);
    setCurrent(current + 1);
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
    const value = event.target.value;
    if (value === ndcScopeValue) {
      setNdcScopeValue(null);
    } else {
      setNdcScopeChanged(true);
      setIncludedInNDC(true);
      setNdcScopeValue(value);
    }
  };

  const onClickNDCScope = (value: any) => {
    if (value === ndcScopeValue) {
      setNdcScopeValue(null);
      formOne.setFieldValue('ndcScope', null);
      setNdcScopeChanged(undefined);
      setIncludedInNDC(undefined);
    }
  };

  const onClickIncludedInNDCScope = (value: any) => {
    if (value === includedInNDC) {
      setIncludedInNDC(undefined);
    } else {
      setIncludedInNDC(value);
    }
  };

  const onClickIncludedInNAPScope = (value: any) => {
    if (value === includedInNAP) {
      setIncludedInNAP(undefined);
    } else {
      setIncludedInNAP(value);
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

  const onChangeStepOne = (changedValues: any, allValues: any) => {
    const selectedCompanies = allValues?.ownershipPercentage?.map((org: any) => org?.organisation);
    const orgPercentValidation =
      allValues?.ownershipPercentage[0]?.proponentPercentage === false ? true : false;
    setOwnershipPercentageValidation(orgPercentValidation);
    const uniqueOrgs = new Set(selectedCompanies);
    setSelectedOrgs([...uniqueOrgs]);
  };

  const checkOrgPercentageValidation = () => {
    const orgPercentage = formOne.getFieldValue('ownershipPercentage');
    const orgPercentValidation = orgPercentage[0]?.proponentPercentage === false ? true : false;
    setOwnershipPercentageValidation(orgPercentValidation);
  };

  const onChangeSector = (val: any) => {
    setSelectedSector(String(val));
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
                description: current === 0 && (
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
                        onValuesChange={onChangeStepOne}
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
                                        throw new Error(
                                          `${t('addProgramme:title')} ${t('isRequired')}`
                                        );
                                      }
                                    },
                                  },
                                ]}
                              >
                                <Input size="large" />
                              </Form.Item>
                              <Form.Item
                                wrapperCol={{ span: 13 }}
                                label={t('addProgramme:sector')}
                                name="sector"
                                rules={[
                                  {
                                    required: true,
                                    message: `${t('addProgramme:sector')} ${t('isRequired')}`,
                                  },
                                ]}
                              >
                                <Select size="large" onChange={onChangeSector}>
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
                                        throw new Error(
                                          `${t('addProgramme:startTime')} ${t('isRequired')}`
                                        );
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
                                  disabledDate={(currentDate: any) =>
                                    currentDate < moment().startOf('day')
                                  }
                                />
                              </Form.Item>
                              <Form.Item
                                wrapperCol={{ span: 13 }}
                                label={t('addProgramme:ghgCovered')}
                                name="greenHouseGasses"
                                rules={[
                                  {
                                    required: true,
                                    message: `${t('addProgramme:ghgCovered')} ${t('isRequired')}`,
                                  },
                                ]}
                              >
                                <Select size="large" mode="multiple" maxTagCount={2} allowClear>
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
                                required={true}
                                rules={[
                                  {
                                    required: true,
                                    message: `${t('addProgramme:designDoc')} ${t(
                                      'addProgramme:isRequired'
                                    )}`,
                                  },
                                  {
                                    validator: async (rule, file) => {
                                      if (file?.length > 0) {
                                        let isCorrectFormat = false;
                                        if (file[0]?.type === 'application/pdf') {
                                          isCorrectFormat = true;
                                        }
                                        if (!isCorrectFormat) {
                                          throw new Error(`${t('addProgramme:invalidFileFormat')}`);
                                        } else if (file[0]?.size > maximumImageSize) {
                                          // default size format of files would be in bytes -> 1MB = 1000000bytes
                                          throw new Error(`${t('common:maxSizeVal')}`);
                                        }
                                      }
                                    },
                                  },
                                ]}
                              >
                                <Upload
                                  accept=".pdf"
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
                                  <Button
                                    className="upload-doc"
                                    size="large"
                                    icon={<UploadOutlined />}
                                  >
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
                                {(fields, { add, remove }) => {
                                  return (
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
                                                    message: `${t('addProgramme:company')} ${t(
                                                      'isRequired'
                                                    )}`,
                                                    validateTrigger: 'onBlur',
                                                  },
                                                ]}
                                                shouldUpdate
                                              >
                                                <Select
                                                  size="large"
                                                  loading={loadingList}
                                                  disabled={
                                                    name === 0 &&
                                                    userInfoState?.companyRole !==
                                                      CompanyRole.GOVERNMENT
                                                  }
                                                >
                                                  {organisationsList.map((organisation) => (
                                                    <Select.Option
                                                      key={organisation.companyId}
                                                      value={organisation.taxId}
                                                      disabled={
                                                        selectedOrgs?.includes(
                                                          organisation.taxId
                                                        ) ||
                                                        (userInfoState?.companyRole !==
                                                          CompanyRole.GOVERNMENT &&
                                                          userOrgTaxId === organisation?.taxId)
                                                      }
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
                                                required={true}
                                                rules={[
                                                  {
                                                    required: true,
                                                    message: `${t(
                                                      'addProgramme:proponentPercentage'
                                                    )} ${t('isRequired')}`,
                                                  },
                                                  {
                                                    validator: async (rule, value) => {
                                                      if (
                                                        ownershipPercentageValidation &&
                                                        name === 0
                                                      ) {
                                                        throw new Error(
                                                          `${t(
                                                            'addProgramme:proponentPercentage'
                                                          )} ${t('isRequired')}`
                                                        );
                                                      }
                                                    },
                                                  },
                                                ]}
                                                shouldUpdate
                                              >
                                                <InputNumber
                                                  size="large"
                                                  min={1}
                                                  max={100}
                                                  formatter={(value) => `${value}%`}
                                                  parser={(value: any) => value.replace('%', '')}
                                                  disabled={
                                                    fields?.length < 2 &&
                                                    userInfoState?.companyRole !==
                                                      CompanyRole.GOVERNMENT
                                                  }
                                                />
                                              </Form.Item>
                                              {fields?.length > 1 && name !== 0 && (
                                                <MinusCircleOutlined
                                                  className="dynamic-delete-button"
                                                  onClick={() => {
                                                    remove(name);
                                                  }}
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
                                  );
                                }}
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
                                        throw new Error(
                                          `${t('addProgramme:externalId')} ${t('isRequired')}`
                                        );
                                      }
                                    },
                                  },
                                ]}
                              >
                                <Input size="large" />
                              </Form.Item>
                              <Form.Item
                                wrapperCol={{ span: 13 }}
                                label={t('addProgramme:sectoralScope')}
                                name="sectoralScope"
                                rules={[
                                  {
                                    required: true,
                                    message: `${t('addProgramme:sectoralScope')} ${t(
                                      'isRequired'
                                    )}`,
                                  },
                                ]}
                              >
                                <Select size="large">
                                  {selectedSectoralScopes?.map((val: any) => {
                                    if (val in SectoralScope) {
                                      const key = val as keyof typeof SectoralScope;
                                      return (
                                        <Select.Option
                                          key={SectoralScope[key]}
                                          value={SectoralScope[key]}
                                        >
                                          {val}
                                        </Select.Option>
                                      );
                                    }
                                    return null;
                                  })}
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
                                        throw new Error(
                                          `${t('addProgramme:endTime')} ${t('isRequired')}`
                                        );
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
                                  disabledDate={(currentDate: any) =>
                                    currentDate < moment().endOf('day')
                                  }
                                />
                              </Form.Item>
                              <Form.Item
                                label={t('addProgramme:ndcScope')}
                                wrapperCol={{ span: 13 }}
                                className="role-group"
                                name="ndcScope"
                                initialValue={ndcScopeValue}
                                rules={[
                                  {
                                    required: false,
                                  },
                                ]}
                              >
                                <Radio.Group
                                  size="large"
                                  onChange={onChangeNDCScope}
                                  value={ndcScopeValue}
                                >
                                  <div className="condition-radio-container">
                                    <Radio.Button
                                      className="condition-radio"
                                      value="true"
                                      onClick={() => onClickNDCScope('true')}
                                    >
                                      {t('addProgramme:conditional')}
                                    </Radio.Button>
                                  </div>
                                  <div className="condition-radio-container">
                                    <Radio.Button
                                      className="condition-radio"
                                      value="false"
                                      onClick={() => onClickNDCScope('false')}
                                    >
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
                                    message: `${t('addProgramme:geographicalLocation')} ${t(
                                      'isRequired'
                                    )}`,
                                  },
                                ]}
                              >
                                <Select
                                  mode="multiple"
                                  size="large"
                                  maxTagCount={2}
                                  onChange={onChangeGeoLocation}
                                  loading={loadingList}
                                  className="custom-select"
                                  allowClear
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
                              <Col md={16} lg={18} xl={18}>
                                <div className="included-label">
                                  <div>{t('addProgramme:inNDC')}</div>
                                  <div className="info-container">
                                    <Tooltip
                                      arrowPointAtCenter
                                      placement="topLeft"
                                      trigger="hover"
                                      title={t('addProgramme:inNDCToolTip')}
                                      overlayClassName="custom-tooltip"
                                    >
                                      <InfoCircle color="#000000" size={17} />
                                    </Tooltip>
                                  </div>
                                </div>
                              </Col>
                              <Col md={8} lg={6} xl={6} className="included-val">
                                <Radio.Group
                                  size="middle"
                                  disabled={ndcScopeChanged}
                                  value={includedInNDC}
                                  onChange={onInCludedNDCChange}
                                >
                                  <div className="yes-no-radio-container">
                                    <Radio.Button
                                      className="yes-no-radio"
                                      value={true}
                                      onClick={() => onClickIncludedInNDCScope(true)}
                                    >
                                      {t('addProgramme:yes')}
                                    </Radio.Button>
                                  </div>
                                  <div className="yes-no-radio-container">
                                    <Radio.Button
                                      className="yes-no-radio"
                                      value={false}
                                      onClick={() => onClickIncludedInNDCScope(false)}
                                    >
                                      {t('addProgramme:no')}
                                    </Radio.Button>
                                  </div>
                                </Radio.Group>
                              </Col>
                            </Row>
                          </Col>
                          <Col md={24} xl={12} className="in-nap-col">
                            <Row className="in-nap-row">
                              <Col md={16} lg={18} xl={18}>
                                <div className="included-label">
                                  <div>{t('addProgramme:inNAP')}</div>
                                  <div className="info-container">
                                    <Tooltip
                                      arrowPointAtCenter
                                      placement="topLeft"
                                      trigger="hover"
                                      title={t('addProgramme:inNAPToolTip')}
                                      overlayClassName="custom-tooltip"
                                    >
                                      <InfoCircle color="#000000" size={17} />
                                    </Tooltip>
                                  </div>
                                </div>
                              </Col>
                              <Col md={8} lg={6} xl={6} className="included-val">
                                <Radio.Group
                                  size="middle"
                                  onChange={onInCludedNAPChange}
                                  value={includedInNAP}
                                >
                                  <div className="yes-no-radio-container">
                                    <Radio.Button
                                      className="yes-no-radio"
                                      value={true}
                                      onClick={() => onClickIncludedInNAPScope(true)}
                                    >
                                      {t('addProgramme:yes')}
                                    </Radio.Button>
                                  </div>
                                  <div className="yes-no-radio-container">
                                    <Radio.Button
                                      className="yes-no-radio"
                                      value={false}
                                      onClick={() => onClickIncludedInNAPScope(false)}
                                    >
                                      {t('addProgramme:no')}
                                    </Radio.Button>
                                  </div>
                                </Radio.Group>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                        <div className="steps-actions">
                          <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            onClick={checkOrgPercentageValidation}
                          >
                            {t('addProgramme:next')}
                          </Button>
                        </div>
                      </Form>
                    </div>
                  </div>
                ),
              },
              {
                title: (
                  <div className="step-title-container">
                    <div className="step-count">02</div>
                    <div className="title">{t('addProgramme:addProgramme2')}</div>
                  </div>
                ),
                description: current === 1 && (
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
                                          `${t('addProgramme:estimatedProgrammeCostUSD')} ${t(
                                            'isRequired'
                                          )}`
                                        );
                                      } else if (!isNaN(value) && Number(value) > 0) {
                                        return Promise.resolve();
                                      } else {
                                        throw new Error(
                                          `${t('addProgramme:estimatedProgrammeCostUSD')} ${t(
                                            'isInvalid'
                                          )}`
                                        );
                                      }
                                    },
                                  },
                                ]}
                              >
                                <InputNumber
                                  size="large"
                                  style={{ width: '100%', paddingRight: 12 }}
                                />
                              </Form.Item>
                              <Form.Item
                                label={t('addProgramme:minViableCarbonPrice')}
                                name="minViableCarbonPrice"
                              >
                                <InputNumber
                                  disabled
                                  size="large"
                                  style={{ width: '100%', paddingRight: 12 }}
                                />
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
                                        throw new Error(
                                          `${t('addProgramme:creditEst')} ${t('isRequired')}`
                                        );
                                      } else if (!isNaN(value) && Number(value) > 0) {
                                        return Promise.resolve();
                                      } else {
                                        throw new Error(
                                          `${t('addProgramme:creditEst')} ${t('isInvalid')}`
                                        );
                                      }
                                    },
                                  },
                                ]}
                              >
                                <InputNumber
                                  size="large"
                                  style={{ width: '100%', paddingRight: 12 }}
                                />
                              </Form.Item>
                            </div>
                          </Col>
                        </Row>
                        <div className="steps-actions">
                          <Button type="primary" htmlType="submit" loading={loading}>
                            {t('addProgramme:submit')}
                          </Button>
                          {current === 1 && (
                            <Button
                              className="back-btn"
                              onClick={() => prevOne()}
                              loading={loading}
                            >
                              {t('addProgramme:back')}
                            </Button>
                          )}
                        </div>
                      </Form>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
