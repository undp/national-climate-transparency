import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Tooltip,
  Upload,
  UploadFile,
  UploadProps,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NdcActionTypes, ndcActionTypeList } from '../../Definitions/ndcActionTypes.enum';
import {
  MitigationTypes,
  mitigationTypeList,
  sectorMitigationTypesListMapped,
} from '../../Definitions/mitigationTypes.enum';
import {
  EnergyGenerationUnits,
  energyGenerationUnitList,
} from '../../Definitions/energyGenerationUnits.enum';
import { consumerGroupList } from '../../Definitions/consumerGroups.enum';
import { LandAreaUnits, landAreaUnitList } from '../../Definitions/landAreaUnits.enum';
import { UploadOutlined } from '@ant-design/icons';
import './ndcActionDetails.scss';
import '../../Pages/Common/common.table.scss';
import {
  addCommSepRound,
  getBase64,
} from '../../Definitions/InterfacesAndType/programme.definitions';
import { RcFile } from 'rc-upload/lib/interface';
import {
  AgricultureCreationRequest,
  SolarCreationRequest,
  calculateCredit,
} from '@undp/carbon-credit-calculator';
import { Sector } from '../../Casl/enums/sector.enum';
import { error } from 'console';
import { InfoCircle } from 'react-bootstrap-icons';

export interface NdcActionDetailsProps {
  isBackBtnVisible: boolean;
  onClickedBackBtn?: any;
  onFormSubmit: any;
  ndcActionDetails: any;
  programmeDetails?: any;
}

const NdcActionDetails = (props: NdcActionDetailsProps) => {
  const { isBackBtnVisible, onClickedBackBtn, onFormSubmit, ndcActionDetails, programmeDetails } =
    props;
  const { t } = useTranslation(['ndcAction']);
  const [ndcActionType, setNdcActionType] = useState();
  const [mitigationType, setmitigationType] = useState();
  const [sector, setSector] = useState<any>('');
  const [ndcActionTypeListFiltered, setNdcActionTypeListFiltered] =
    useState<any[]>(ndcActionTypeList);
  const [checkedOptionsGhgReduced, setCheckedOptionsGhgReduced] = useState<any[]>([]);
  const [inputNumberValueGhgReduced, setInputNumberValueGhgReduced] = useState<any[]>([]);
  const [checkedOptionsGhgAvoided, setCheckedOptionsGhgAvoided] = useState<any[]>([]);
  const [inputNumberValueGhgAvoided, setInputNumberValueGhgAvoided] = useState<any[]>([]);
  const [includedInNAP, setIncludedInNAP] = useState<any>();
  const [ghgEmissionAvoidedErrors, setGhgEmissionAvoidedErrors] = useState<any>('');
  const [form] = Form.useForm();

  const maximumImageSize = process.env.REACT_APP_MAXIMUM_FILE_SIZE
    ? parseInt(process.env.REACT_APP_MAXIMUM_FILE_SIZE)
    : 5000000;

  const ghgEmissionsGas = ['CO2', 'CH4', 'N20', 'HFCs', 'PFCs', 'SF6'];
  const enablementTypesAndValues = [
    { type: t('ndcAction:capacityBuilding'), value: 'capacityBuilding', col: 4 },
    { type: t('ndcAction:instiArrangement'), value: 'institutionalArrangement', col: 5 },
    { type: t('ndcAction:stakeholderFramework'), value: 'stakeholderFramework', col: 5 },
    { type: t('ndcAction:techTransfer'), value: 'technologyTransfer', col: 4 },
  ];

  useEffect(() => {
    if (programmeDetails) {
      setSector(programmeDetails?.sector);
    }
  }, [programmeDetails]);

  useEffect(() => {
    if (ndcActionDetails) {
      if (ndcActionDetails?.action) {
        setNdcActionType(ndcActionDetails?.action);
      }
      if (ndcActionDetails?.typeOfMitigation) {
        setmitigationType(ndcActionDetails?.typeOfMitigation);
      }

      form.setFieldsValue({
        ndcActionType: ndcActionDetails?.action,
        mitigationType: ndcActionDetails?.typeOfMitigation,
        energyGeneration: ndcActionDetails?.solarProperties?.energyGeneration,
        energyGenerationUnit: ndcActionDetails?.solarProperties?.energyGenerationUnit,
        consumerGroup: ndcActionDetails?.solarProperties?.consumerGroup,
        eligibleLandArea: ndcActionDetails?.agricultureProperties?.landArea,
        landAreaUnit: ndcActionDetails?.agricultureProperties?.landAreaUnit,
        implementingAgency: ndcActionDetails?.adaptationProperties?.implementingAgency,
        nationalPlanObjectives: ndcActionDetails?.adaptationProperties?.nationalPlanObjectives,
        nationalPlanCoverage: ndcActionDetails?.adaptationProperties?.nationalPlanCoverage,
        EnablementTitle: ndcActionDetails?.enablementProperties?.title,
        EnablementType: ndcActionDetails?.enablementProperties?.type,
        EnablementReport: ndcActionDetails?.enablementReportData,
        userEstimatedCredits: ndcActionDetails?.ndcFinancing?.userEstimatedCredits,
        methodologyEstimatedCredits: 0,
      });
    } else {
      form.setFieldsValue({
        methodologyEstimatedCredits: 0,
      });
    }
  }, []);

  const implementingAgencyList = [
    'Ministry of Agriculture, Water and Forestry (MAWF)',
    'Ministry of Defence (MoD)',
    'Ministry of Education, Arts and Culture (MoE)',
    'Ministry of Environment, Forestry and Tourism (MEFT)',
    'Ministry of Finance (MoF)',
    'Ministry of Fisheries and Marine Resources (MFMR)',
    'Ministry of Health and Social Services (MHSS)',
    'Ministry of Higher Education, Training and Innovation (MHETI)',
    'Ministry of Home Affairs, Immigration, Safety and Security (MHAISS)',
    'Ministry of Industrialisation and Trade (MIT)',
    'Ministry of International Relations and Cooperation (MIRCo)',
    'Ministry of Information and Communication Technology (MICT)',
    'Ministry of Justice (MoJ)',
    'Ministry of Labour, Industrial Relations and Employment Creation (MOL)',
    'Ministry of Mines and Energy (MME)',
    'Ministry of Public Enterprises (MPE)',
    'Ministry of Sport, Youth and National Service (MSYNS)',
    'Ministry of Works and Transport (MoW)',
    'Ministry of Urban and Rural Development (MURD)',
  ];

  const nationalPlanObjectives = [
    ' Enhance value addition in key growth opportunities',
    'Strengthen the private sector to create jobs',
    'Consolidate and increase the stock and quality of productive infrastructure',
    'Enhance the productivity and social wellbeing of the population',
    'Strengthen the role of the state in guiding and facilitating development',
  ];

  const nationalPlanCoverageList = [
    'Agro-Industrialization',
    'Mineral-based Industrialization',
    'Petroleum Development',
    'Tourism Development',
    'Water, Climate Change and ENR Management',
    'Private Sector Development',
    'Manufacturing',
    'Digital Transformation ',
    'Integrated Transport Infrastructure and Services',
    'Sustainable Energy Development',
    'Sustainable Urban and Housing Development',
    'Human Capital Development',
    'Community Mobilization and Mindset Change',
    'Innovation, Technology Development and Transfer',
    'Regional Development',
    'Governance and Security',
    'Public Sector Transformation',
    'Development Plan Implementation',
    'Climate Hazard ',
  ];

  const calculateMethodologyEstimatedCredits = () => {
    try {
      let creditRequest: any = {};
      const formValues = form.getFieldsValue();
      if (
        formValues.ndcActionType === NdcActionTypes.Mitigation ||
        formValues.ndcActionType === NdcActionTypes.CrossCutting
      ) {
        if (formValues.mitigationType === MitigationTypes.AGRICULTURE) {
          creditRequest = new AgricultureCreationRequest();
          creditRequest.landArea = formValues.eligibleLandArea;
          creditRequest.landAreaUnit = formValues.landAreaUnit;
          creditRequest.duration = programmeDetails.endTime - programmeDetails.startTime;
          creditRequest.durationUnit = 's';
        } else if (formValues.mitigationType === MitigationTypes.SOLAR) {
          creditRequest = new SolarCreationRequest();
          creditRequest.buildingType = formValues.consumerGroup;
          creditRequest.energyGeneration = formValues.energyGeneration;
          creditRequest.energyGenerationUnit = formValues.energyGenerationUnit;
        }
      }
      const creditResponse = calculateCredit(creditRequest);
      if (!isNaN(creditResponse)) {
        form.setFieldsValue({
          methodologyEstimatedCredits: addCommSepRound(creditResponse),
        });
      } else {
        form.setFieldsValue({
          methodologyEstimatedCredits: 0,
        });
      }
    } catch (exception) {
      form.setFieldsValue({
        methodologyEstimatedCredits: 0,
      });
    }
  };

  const handleNdcActionChange = (selectedNdcType: any) => {
    setNdcActionType(selectedNdcType);
    calculateMethodologyEstimatedCredits();
  };

  const handleMitigationTypeChange = (selectedMitigationType: any) => {
    setmitigationType(selectedMitigationType);
    calculateMethodologyEstimatedCredits();
  };

  const onNdcActionDetailsFormSubmit = async (ndcActionFormvalues: any) => {
    const ndcActionDetailObj: any = {};
    ndcActionDetailObj.action = ndcActionFormvalues.ndcActionType;
    if (ndcActionFormvalues.ndcActionType === NdcActionTypes.Mitigation) {
      ndcActionDetailObj.methodology = t('ndcAction:goldStandard');
    }

    if (
      ndcActionFormvalues.ndcActionType === NdcActionTypes.Mitigation ||
      ndcActionFormvalues.ndcActionType === NdcActionTypes.CrossCutting
    ) {
      ndcActionDetailObj.typeOfMitigation = ndcActionFormvalues.mitigationType;
      if (ndcActionFormvalues.mitigationType === MitigationTypes.AGRICULTURE) {
        ndcActionDetailObj.agricultureProperties = {
          landArea: ndcActionFormvalues.eligibleLandArea ? ndcActionFormvalues.eligibleLandArea : 0,
          landAreaUnit: ndcActionFormvalues.landAreaUnit,
        };
      } else if (ndcActionFormvalues.mitigationType === MitigationTypes.SOLAR) {
        ndcActionDetailObj.solarProperties = {
          energyGeneration: ndcActionFormvalues.energyGeneration
            ? ndcActionFormvalues.energyGeneration
            : 0,
          energyGenerationUnit: ndcActionFormvalues.energyGenerationUnit,
          consumerGroup: ndcActionFormvalues.consumerGroup,
        };
      }
      if (
        ndcActionFormvalues.mitigationType === MitigationTypes.SOLAR ||
        ndcActionFormvalues.mitigationType === MitigationTypes.AGRICULTURE
      ) {
        if (parseFloat(ndcActionFormvalues.methodologyEstimatedCredits) <= 0) {
          message.open({
            type: 'error',
            content: t('methodologyEstimatedCreditsInvalid'),
            duration: 4,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });
          return;
        }
      }

      if (ndcActionFormvalues.userEstimatedCredits > programmeDetails.creditEst) {
        message.open({
          type: 'error',
          content: t('userEstimatedCreditsInvalid'),
          duration: 4,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        return;
      }
    }

    if (
      ndcActionFormvalues.ndcActionType === NdcActionTypes.Adaptation ||
      ndcActionFormvalues.ndcActionType === NdcActionTypes.CrossCutting
    ) {
      ndcActionDetailObj.adaptationProperties = {
        implementingAgency: ndcActionFormvalues.implementingAgency,
        nationalPlanObjectives: ndcActionFormvalues.nationalPlanObjectives,
        nationalPlanCoverage: ndcActionFormvalues.nationalPlanCoverage,
      };
    }

    if (ndcActionFormvalues.ndcActionType === NdcActionTypes.Enablement) {
      ndcActionDetailObj.enablementProperties = {
        title: ndcActionFormvalues.EnablementTitle,
      };

      if (ndcActionFormvalues.EnablementType && ndcActionFormvalues.EnablementType.length > 0) {
        ndcActionDetailObj.enablementProperties.type = ndcActionFormvalues.EnablementType;
      }
      if (ndcActionFormvalues.EnablementReport && ndcActionFormvalues.EnablementReport.length > 0) {
        const enablementReport = await getBase64(
          ndcActionFormvalues.EnablementReport[0]?.originFileObj as RcFile
        );
        const enablementReportData = enablementReport.split(',');
        ndcActionDetailObj.enablementProperties.report = enablementReportData[1];
      }
      ndcActionDetailObj.enablementReportData = ndcActionFormvalues.EnablementReport;
    }

    ndcActionDetailObj.ndcFinancing = {
      userEstimatedCredits: ndcActionFormvalues.userEstimatedCredits
        ? ndcActionFormvalues.userEstimatedCredits
        : 0,
      systemEstimatedCredits: Number(ndcActionFormvalues.methodologyEstimatedCredits),
    };
    console.log('ndc action form values -------- > ', ndcActionDetailObj);

    onFormSubmit(ndcActionDetailObj);
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  useEffect(() => {
    console.log('checkedOptionsGhgAvoided ------  ', checkedOptionsGhgAvoided);
    console.log('inputNumberValueGhgAvoided ------  ', inputNumberValueGhgAvoided);
    console.log('checkedOptionsGhgAvoided ------  ', checkedOptionsGhgReduced);
    console.log('inputNumberValueGhgAvoided ------  ', inputNumberValueGhgReduced);
    if (checkedOptionsGhgAvoided?.length < 1) {
      setGhgEmissionAvoidedErrors(`${t('ndcAction:landAreaUnit')} ${t('ndcAction:isRequired')}`);
    }
  }, [
    checkedOptionsGhgAvoided,
    checkedOptionsGhgReduced,
    inputNumberValueGhgAvoided,
    inputNumberValueGhgReduced,
  ]);

  const onClickIncludedInNAPScope = (value: any) => {
    if (value === includedInNAP) {
      setIncludedInNAP(undefined);
    } else {
      setIncludedInNAP(value);
    }
  };

  const onInCludedNAPChange = (event: any) => {
    if (event?.target?.value === 'inNAP') {
      setIncludedInNAP(true);
    } else if (event?.target?.value === 'notInNAP') {
      setIncludedInNAP(false);
    }
  };

  return (
    <div className="ndc-action-details-container">
      <Form
        name="ndcActionDetails"
        layout="vertical"
        requiredMark={true}
        onFinish={onNdcActionDetailsFormSubmit}
        form={form}
      >
        <Row justify="start" align="middle">
          <Col>
            <Form.Item
              label={t('ndcAction:ndcAction')}
              name="ndcActionType"
              rules={[
                {
                  required: true,
                  message: `${t('ndcAction:ndcAction')} ${t('ndcAction:isRequired')}`,
                },
              ]}
            >
              <Select
                size="large"
                onChange={handleNdcActionChange}
                style={{
                  width: '249px',
                  borderRadius: '4px',
                }}
                dropdownStyle={{ color: 'red' }}
                options={ndcActionTypeListFiltered}
              />
            </Form.Item>
          </Col>
        </Row>

        {ndcActionType === NdcActionTypes.CrossCutting && (
          <Row>
            <label className="label-heading">{t('ndcAction:mitigation')}</label>
          </Row>
        )}

        {(ndcActionType === NdcActionTypes.Mitigation ||
          ndcActionType === NdcActionTypes.CrossCutting) && (
          <>
            <Row justify="start" align="middle">
              <Col>
                <Form.Item
                  label={t('ndcAction:mitigationType')}
                  name="mitigationType"
                  rules={[
                    {
                      required: true,
                      message: `${t('ndcAction:mitigationType')} ${t('ndcAction:isRequired')}`,
                    },
                  ]}
                >
                  <Select
                    size="large"
                    onChange={handleMitigationTypeChange}
                    style={{
                      width: '249px',
                      borderRadius: '4px',
                    }}
                    options={
                      programmeDetails?.sector === Sector.Health ||
                      programmeDetails?.sector === Sector.Education ||
                      programmeDetails?.sector === Sector.Hospitality
                        ? mitigationTypeList
                        : sectorMitigationTypesListMapped[sector]
                    }
                  ></Select>
                </Form.Item>
              </Col>
              {ndcActionType === NdcActionTypes.Mitigation && (
                <Col style={{ marginLeft: '38px' }}>
                  <Form.Item label={t('ndcAction:methodology')} name="methodology">
                    <span
                      style={{
                        display: 'inline-block',
                        border: '1px solid #D9D9D9',
                        width: '154px',
                        height: '38px',
                        borderRadius: '4px',
                        padding: '7px 8px',
                        fontSize: '14px',
                        backgroundColor: '#F0F0F0',
                        color: '#8C8C8C',
                      }}
                    >
                      {' '}
                      {t('ndcAction:goldStandard')}
                    </span>
                  </Form.Item>
                </Col>
              )}
            </Row>
          </>
        )}

        {(ndcActionType === NdcActionTypes.Mitigation ||
          ndcActionType === NdcActionTypes.CrossCutting) &&
          mitigationType === MitigationTypes.SOLAR && (
            <>
              <Row justify="start" align="middle">
                <Col>
                  <Form.Item
                    label={t('ndcAction:energyGeneration')}
                    rules={[
                      {
                        required: true,
                        message: ``,
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
                              `${t('ndcAction:energyGeneration')} ${t('ndcAction:isRequired')}`
                            );
                          }
                        },
                      },
                    ]}
                    name="energyGeneration"
                  >
                    <InputNumber
                      style={{ width: 442, paddingRight: 12 }}
                      onChange={calculateMethodologyEstimatedCredits}
                    />
                  </Form.Item>
                </Col>
                <Col style={{ marginLeft: '38px' }}>
                  <Form.Item
                    label={t('ndcAction:energyGenerationUnit')}
                    name="energyGenerationUnit"
                    rules={[
                      {
                        required: true,
                        message: `${t('ndcAction:energyGenerationUnit')} ${t(
                          'ndcAction:isRequired'
                        )}`,
                      },
                    ]}
                  >
                    <Select
                      size="large"
                      style={{ width: 442 }}
                      options={energyGenerationUnitList}
                      onChange={calculateMethodologyEstimatedCredits}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                label={t('ndcAction:consumerGroup')}
                name="consumerGroup"
                rules={[
                  {
                    required: true,
                    message: `${t('ndcAction:consumerGroup')} ${t('ndcAction:isRequired')}`,
                  },
                ]}
              >
                <Select
                  size="large"
                  style={{ width: 442 }}
                  onChange={calculateMethodologyEstimatedCredits}
                  options={consumerGroupList}
                />
              </Form.Item>
            </>
          )}

        {(ndcActionType === NdcActionTypes.Mitigation ||
          ndcActionType === NdcActionTypes.CrossCutting) &&
          mitigationType === MitigationTypes.AGRICULTURE && (
            <Row justify="start" align="middle">
              <Col>
                <Form.Item
                  label={t('ndcAction:eligibleLandArea')}
                  name="eligibleLandArea"
                  rules={[
                    {
                      required: true,
                      message: ``,
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
                            `${t('ndcAction:eligibleLandArea')} ${t('ndcAction:isRequired')}`
                          );
                        }
                      },
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: 442, paddingRight: 12 }}
                    onChange={calculateMethodologyEstimatedCredits}
                  />
                </Form.Item>
              </Col>
              <Col style={{ marginLeft: '38px' }}>
                <Form.Item
                  label={t('ndcAction:landAreaUnit')}
                  name="landAreaUnit"
                  rules={[
                    {
                      required: true,
                      message: `${t('ndcAction:landAreaUnit')} ${t('ndcAction:isRequired')}`,
                    },
                  ]}
                >
                  <Select
                    onChange={calculateMethodologyEstimatedCredits}
                    size="large"
                    style={{ width: 442 }}
                    options={landAreaUnitList}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

        {(ndcActionType === NdcActionTypes.Mitigation ||
          ndcActionType === NdcActionTypes.CrossCutting) && (
          <Row justify="start" align="middle">
            <Col>
              <Form.Item
                name="userEstimatedCredits"
                label={t('ndcAction:userEstimatedCredits')}
                style={{ display: 'inline-block', width: 'calc(100% - 15px)' }}
              >
                <InputNumber style={{ width: 442, paddingRight: 12 }} />
              </Form.Item>
            </Col>
            <Col style={{ marginLeft: '38px' }}>
              <Form.Item
                name="methodologyEstimatedCredits"
                label={t('ndcAction:methodologyEstimatedCredits')}
                style={{ display: 'inline-block', width: '100%' }}
              >
                <InputNumber disabled style={{ width: 442, paddingRight: 12 }} />
              </Form.Item>
            </Col>
          </Row>
        )}

        {ndcActionType === NdcActionTypes.CrossCutting && (
          <Row>
            <label className="label-heading">{t('ndcAction:adaptation')}</label>
          </Row>
        )}

        {(ndcActionType === NdcActionTypes.Adaptation ||
          ndcActionType === NdcActionTypes.CrossCutting) && (
          <>
            <Row justify="start" align="middle">
              <Col>
                <Form.Item label={t('ndcAction:implementingAgency')} name="implementingAgency">
                  <Select
                    style={{ width: 442 }}
                    size="large"
                    options={implementingAgencyList.map((item) => ({ value: item, label: item }))}
                  />
                </Form.Item>
              </Col>
              <Col style={{ marginLeft: '38px' }} className="included-nap-col">
                <Row className="in-nap-row">
                  <Col span={9}>
                    <div className="included-label">
                      <div>{t('ndcAction:inNAP')}</div>
                      <div className="info-container">
                        <Tooltip
                          arrowPointAtCenter
                          placement="topLeft"
                          trigger="hover"
                          title={t('ndcAction:inNAPToolTip')}
                          overlayClassName="custom-tooltip"
                        >
                          <InfoCircle color="#000000" size={17} />
                        </Tooltip>
                      </div>
                    </div>
                  </Col>
                  <Col span={8} className="included-val">
                    <Radio.Group size="middle" onChange={onInCludedNAPChange} value={includedInNAP}>
                      <div className="yes-no-radio-container">
                        <Radio.Button
                          className="yes-no-radio"
                          value={true}
                          onClick={() => onClickIncludedInNAPScope(true)}
                        >
                          {t('ndcAction:yes')}
                        </Radio.Button>
                      </div>
                      <div className="yes-no-radio-container">
                        <Radio.Button
                          className="yes-no-radio"
                          value={false}
                          onClick={() => onClickIncludedInNAPScope(false)}
                        >
                          {t('ndcAction:no')}
                        </Radio.Button>
                      </div>
                    </Radio.Group>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row justify="start" align="middle">
              <Col>
                <Form.Item
                  label={t('ndcAction:nationalPlanObjectives')}
                  name="nationalPlanObjectives"
                >
                  <Select
                    size="large"
                    style={{ width: 442 }}
                    options={nationalPlanObjectives.map((item) => ({ value: item, label: item }))}
                  />
                </Form.Item>
              </Col>
              <Col style={{ marginLeft: '38px' }}>
                <Form.Item label={t('ndcAction:nationalPlanCoverage')} name="nationalPlanCoverage">
                  <Select
                    style={{ width: 442 }}
                    size="large"
                    options={nationalPlanCoverageList.map((item) => ({ value: item, label: item }))}
                  />
                </Form.Item>
              </Col>
            </Row>
            {ndcActionType === NdcActionTypes.Adaptation && (
              <Row justify="start" align="middle">
                <Col>
                  <Form.Item
                    label={t('ndcAction:ghgEmiReduced')}
                    name="ghgEmissionsReduced"
                    style={{ width: 442 }}
                  >
                    {ghgEmissionsGas.map((option: any, i: any) => (
                      <div key={option} className="row-custom">
                        <Checkbox
                          value={option}
                          checked={checkedOptionsGhgReduced.includes(option)}
                          onChange={(e: any) => {
                            if (e?.target?.checked) {
                              setInputNumberValueGhgReduced([...inputNumberValueGhgReduced, 0]);
                              setCheckedOptionsGhgReduced([...checkedOptionsGhgReduced, option]);
                            } else if (!e?.target?.checked) {
                              setInputNumberValueGhgReduced([
                                ...inputNumberValueGhgReduced.filter((value) => value !== option),
                              ]);
                              setCheckedOptionsGhgReduced([
                                ...checkedOptionsGhgReduced.filter((value) => value !== option),
                              ]);
                            }
                          }}
                        >
                          {option}
                        </Checkbox>
                        <InputNumber
                          size="small"
                          disabled={!checkedOptionsGhgReduced.includes(option)}
                          onChange={(e: any) => {
                            setInputNumberValueGhgReduced([
                              ...inputNumberValueGhgReduced,
                              e?.target?.value,
                            ]);
                          }}
                        />
                      </div>
                    ))}
                  </Form.Item>
                </Col>
                <Col style={{ marginLeft: '38px' }}>
                  <Form.Item
                    label={t('ndcAction:ghgEmiAvoided')}
                    name="ghgEmissionsAvoided"
                    style={{ width: 442 }}
                  >
                    {ghgEmissionsGas.map((option, i) => (
                      <div key={option} className="row-custom">
                        <Checkbox
                          value={option}
                          checked={checkedOptionsGhgAvoided.includes(option)}
                          onChange={(e: any) => {
                            if (e?.target?.checked) {
                              setInputNumberValueGhgAvoided([...inputNumberValueGhgAvoided, 0]);
                              setCheckedOptionsGhgAvoided([...checkedOptionsGhgAvoided, option]);
                            } else if (!e?.target?.checked) {
                              setInputNumberValueGhgAvoided([
                                ...inputNumberValueGhgAvoided.filter((value) => value !== option),
                              ]);
                              setCheckedOptionsGhgAvoided([
                                ...checkedOptionsGhgAvoided.filter((value) => value !== option),
                              ]);
                            }
                          }}
                        >
                          {option}
                        </Checkbox>
                        <InputNumber
                          size="small"
                          disabled={!checkedOptionsGhgAvoided.includes(option)}
                          onChange={(e: any) => {
                            setInputNumberValueGhgAvoided([
                              ...inputNumberValueGhgAvoided,
                              e?.target?.value,
                            ]);
                          }}
                        />
                      </div>
                    ))}
                  </Form.Item>
                </Col>
              </Row>
            )}
          </>
        )}

        {ndcActionType === NdcActionTypes.Enablement && (
          <>
            <Form.Item label={t('ndcAction:title')} name="EnablementTitle">
              <Input style={{ width: 442 }} />
            </Form.Item>
            <Form.Item
              label={t('ndcAction:type')}
              name="EnablementType"
              className="enablement-type-item"
            >
              <Checkbox.Group className="type-checkbox-grp">
                <Row className="grp-row">
                  {enablementTypesAndValues?.map((type: any) => (
                    <Col lg={type.col} md={type.col + 1}>
                      <Checkbox value={type.value} style={{ lineHeight: '32px' }}>
                        {type.type}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
            <Row justify="space-between" align="middle">
              <Form.Item
                label={t('ndcAction:report')}
                name="EnablementReport"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                required={false}
                rules={[
                  {
                    validator: async (rule, file) => {
                      let isCorrectFormat = false;
                      if (file && file.length > 0) {
                        if (file[0]?.type === 'application/pdf') {
                          isCorrectFormat = true;
                        }
                        if (!isCorrectFormat) {
                          throw new Error(`${t('ndcAction:invalidFileFormat')}`);
                        } else if (file[0]?.size > maximumImageSize) {
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
                  listType="picture"
                  multiple={false}
                  maxCount={1}
                >
                  <Button className="upload-doc" size="large" icon={<UploadOutlined />}>
                    Upload
                  </Button>
                </Upload>
              </Form.Item>
            </Row>
          </>
        )}

        <div className="steps-actions">
          <Row>
            {isBackBtnVisible && <Button onClick={onClickedBackBtn}>{t('ndcAction:back')}</Button>}
            <Button className="mg-left-1" type="primary" htmlType="submit">
              {t('ndcAction:next')}
            </Button>
          </Row>
        </div>
      </Form>
    </div>
  );
};

export default NdcActionDetails;
