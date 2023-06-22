import { Button, Col, Form, Input, Row, Select, Upload, UploadFile, UploadProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NdcActionTypes, ndcActionTypeList } from '../../Definitions/ndcActionTypes.enum';
import { MitigationTypes, mitigationTypeList } from '../../Definitions/mitigationTypes.enum';
import {
  EnergyGenerationUnits,
  energyGenerationUnitList,
} from '../../Definitions/energyGenerationUnits.enum';
import { consumerGroupList } from '../../Definitions/consumerGroups.enum';
import { LandAreaUnits, landAreaUnitList } from '../../Definitions/landAreaUnits.enum';
import { UploadOutlined } from '@ant-design/icons';
import './ndcActionDetails.scss';
import '../../Pages/Common/common.table.scss';
import { getBase64 } from '../../Definitions/InterfacesAndType/programme.definitions';
import { RcFile } from 'rc-upload/lib/interface';

export interface NdcActionDetailsProps {
  isBackBtnVisible: boolean;
  onClickedBackBtn?: any;
  onFormSubmit: any;
  ndcActionDetails: any;
}

const NdcActionDetails = (props: NdcActionDetailsProps) => {
  const { isBackBtnVisible, onClickedBackBtn, onFormSubmit, ndcActionDetails } = props;
  const { t } = useTranslation(['ndcAction']);
  const [ndcActionType, setNdcActionType] = useState();
  const [mitigationType, setmitigationType] = useState();
  const [form] = Form.useForm();

  const maximumImageSize = process.env.MAXIMUM_IMAGE_SIZE
    ? parseInt(process.env.MAXIMUM_IMAGE_SIZE)
    : 7145728;

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

  const uploadProps: UploadProps = {
    //need to add
  };

  const handleNdcActionChange = (selectedNdcType: any) => {
    setNdcActionType(selectedNdcType);
  };

  const handleMitigationTypeChange = (selectedMitigationType: any) => {
    setmitigationType(selectedMitigationType);
  };

  const onNdcActionDetailsFormSubmit = async (ndcActionFormvalues: any) => {
    const ndcActionDetailObj: any = {};
    ndcActionDetailObj.action = ndcActionFormvalues.ndcActionType;
    ndcActionDetailObj.methodology = 'methodology';

    if (
      ndcActionFormvalues.ndcActionType === NdcActionTypes.Mitigation ||
      ndcActionFormvalues.ndcActionType === NdcActionTypes.CrossCutting
    ) {
      ndcActionDetailObj.typeOfMitigation = ndcActionFormvalues.mitigationType;
      if (ndcActionFormvalues.mitigationType === MitigationTypes.AGRICULTURE) {
        ndcActionDetailObj.agricultureProperties = {
          landArea: Number.isInteger(parseInt(ndcActionFormvalues.eligibleLandArea))
            ? parseInt(ndcActionFormvalues.eligibleLandArea)
            : 0,
          landAreaUnit: ndcActionFormvalues.landAreaUnit,
        };
      } else if (ndcActionFormvalues.mitigationType === MitigationTypes.SOLAR) {
        ndcActionDetailObj.solarProperties = {
          energyGeneration: Number.isInteger(parseInt(ndcActionFormvalues.energyGeneration))
            ? parseInt(ndcActionFormvalues.energyGeneration)
            : 0,
          energyGenerationUnit: ndcActionFormvalues.energyGenerationUnit,
          consumerGroup: ndcActionFormvalues.consumerGroup,
        };
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
      const enablementReport = await getBase64(
        ndcActionFormvalues.EnablementReport[0]?.originFileObj as RcFile
      );
      const enablementReportData = enablementReport.split(',');
      ndcActionDetailObj.enablementProperties = {
        title: ndcActionFormvalues.EnablementTitle,
        report: enablementReportData[1],
      };
      ndcActionDetailObj.enablementReportData = ndcActionFormvalues.EnablementReport;
    }

    ndcActionDetailObj.ndcFinancing = {
      userEstimatedCredits: Number.isInteger(parseInt(ndcActionFormvalues.userEstimatedCredits))
        ? parseInt(ndcActionFormvalues.userEstimatedCredits)
        : 0,
      systemEstimatedCredits: ndcActionFormvalues.methodologyEstimatedCredits,
    };

    onFormSubmit(ndcActionDetailObj);
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
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
                options={ndcActionTypeList}
              />
            </Form.Item>
          </Col>
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
        </Row>

        {ndcActionType === NdcActionTypes.CrossCutting && (
          <Row>
            <label className="label-heading">{t('ndcAction:mitigation')}</label>
          </Row>
        )}

        {(ndcActionType === NdcActionTypes.Mitigation ||
          ndcActionType === NdcActionTypes.CrossCutting) && (
          <Row justify="start" align="middle">
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
                options={mitigationTypeList}
              ></Select>
            </Form.Item>
          </Row>
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
                    <Input style={{ width: 442 }} />
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
                <Select size="large" style={{ width: 442 }} options={consumerGroupList} />
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
                  <Input style={{ width: 442 }} />
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
                  <Select size="large" style={{ width: 442 }} options={landAreaUnitList} />
                </Form.Item>
              </Col>
            </Row>
          )}

        {(ndcActionType === NdcActionTypes.Mitigation ||
          ndcActionType === NdcActionTypes.CrossCutting) && (
          <Row justify="start" align="middle">
            <Col span={12}>
              <Form.Item
                name="userEstimatedCredits"
                label={t('ndcAction:userEstimatedCredits')}
                style={{ display: 'inline-block', width: 'calc(100% - 15px)', marginRight: '15px' }}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="methodologyEstimatedCredits"
                label={t('ndcAction:methodologyEstimatedCredits')}
                style={{ display: 'inline-block', width: '100%' }}
              >
                <Input disabled />
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
              <Form.Item label={t('ndcAction:implementingAgency')} name="implementingAgency">
                <Select
                  style={{ width: 442 }}
                  size="large"
                  options={implementingAgencyList.map((item) => ({ value: item, label: item }))}
                />
              </Form.Item>
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
          </>
        )}

        {ndcActionType === NdcActionTypes.Enablement && (
          <>
            <Form.Item label={t('ndcAction:title')} name="EnablementTitle">
              <Input style={{ width: 442 }} />
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
                      if (file[0]?.type === 'application/pdf') {
                        isCorrectFormat = true;
                      }
                      if (!isCorrectFormat) {
                        throw new Error(`${t('ndcAction:invalidFileFormat')}`);
                      } else if (file[0]?.size > maximumImageSize) {
                        throw new Error(`${t('ndcAction:maxSizeVal')}`);
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
