import React, { useEffect, useState } from 'react';
import NdcActionDetails from '../../Components/NdcAction/ndcActionDetails';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input, Row, Steps, Upload, UploadProps } from 'antd';
import './addNdcAction.scss';
import { UploadOutlined } from '@ant-design/icons';
import { FormInstance } from 'rc-field-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { RcFile } from 'rc-upload/lib/interface';
import { MitigationTypes } from '../../Definitions/mitigationTypes.enum';
import { NdcActionTypes } from '../../Definitions/ndcActionTypes.enum';
import { Programme } from '@undp/carbon-library';

const AddNdcAction = () => {
  const { t } = useTranslation(['ndcAction']);
  const [current, setCurrent] = useState<number>(1);
  const [maxSteps, setMaxSteps] = useState<number>(3);
  const [programmeDetails, setprogrammeDetails] = useState<Programme>();
  const [formProjectreports] = Form.useForm();
  const [ndcActionDetailsValues, setNdcActionDetailsValues] = useState<any>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { post } = useConnection();

  useEffect(() => {
    if (!state.record) {
      navigate('/programmeManagement/viewAll', { replace: true });
    } else {
      setprogrammeDetails(state.record);
    }
  }, []);

  const onClickNext = () => {
    setCurrent((pre) => pre + 1);
  };

  const onClickBack = () => {
    setCurrent((pre) => pre - 1);
  };

  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const onClickSubmit = async () => {
    const formProjectreportValues = formProjectreports.getFieldsValue();
    console.log('formProjectreportValues', formProjectreportValues);
    console.log('ndcActionDetailsValues', ndcActionDetailsValues);

    const ndcActionDetails: any = {};
    ndcActionDetails.programmeId = programmeDetails?.programmeId;
    ndcActionDetails.action = ndcActionDetailsValues.ndcActionType;
    ndcActionDetails.methodology = 'methodology';

    if (
      ndcActionDetailsValues.ndcActionType === NdcActionTypes.Mitigation ||
      ndcActionDetailsValues.ndcActionType === NdcActionTypes.CrossCutting
    ) {
      ndcActionDetails.typeOfMitigation = ndcActionDetailsValues.mitigationType;
      if (ndcActionDetailsValues.mitigationType === MitigationTypes.AGRICULTURE) {
        ndcActionDetails.agricultureProperties = {
          landArea: parseInt(ndcActionDetailsValues.eligibleLandArea),
          landAreaUnit: ndcActionDetailsValues.landAreaUnit,
        };
      } else if (ndcActionDetailsValues.mitigationType === MitigationTypes.SOLAR) {
        ndcActionDetails.solarProperties = {
          energyGeneration: parseInt(ndcActionDetailsValues.energyGeneration),
          energyGenerationUnit: ndcActionDetailsValues.energyGenerationUnit + '/year/unit',
          consumerGroup: ndcActionDetailsValues.consumerGroup,
        };
      }
    } else if (
      ndcActionDetailsValues.ndcActionType === NdcActionTypes.Adaptation ||
      ndcActionDetailsValues.ndcActionType === NdcActionTypes.CrossCutting
    ) {
      ndcActionDetails.adaptationProperties = {
        implementingAgency: ndcActionDetailsValues.implementingAgency,
        nationalPlanObjectives: ndcActionDetailsValues.nationalPlanObjectives,
        nationalPlanCoverage: ndcActionDetailsValues.nationalPlanCoverage,
      };
    }

    ndcActionDetails.ndcFinancing = {
      userEstimatedCredits: parseInt(ndcActionDetailsValues.userEstimatedCredits),
      systemEstimatedCredits: ndcActionDetailsValues.methodologyEstimatedCredits,
    };

    const logoBase64 = await getBase64(
      formProjectreportValues.monitoringReport.file.originFileObj as RcFile
    );
    const logoUrls = logoBase64.split(',');
    ndcActionDetails.monitoringReport = logoUrls[1];

    const response: any = await post('national/programme/addNDCAction', ndcActionDetails);
    console.log('response', response);
    if (response.statusCode === 200 || response.statusCode === 201) {
      navigate('/programmeManagement/view', { state: { programmeDetails } });
    }
  };

  const onFormChange = (formName: any, formData: any) => {
    if (formData?.forms?.ndcActionDetails) {
      const ndcActionDetails = formData.forms.ndcActionDetails.getFieldsValue();
      setNdcActionDetailsValues(ndcActionDetails);
    }
  };

  const props: UploadProps = {
    //need to add
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <div className="add-ndc-main-container">
      <div className="title-container">
        <div className="main">{t('ndcAction:addNdcTitle')}</div>
        <div className="sub">{t('ndcAction:addNdcSubTitle')}</div>
      </div>
      <div className="adding-section">
        <div className="form-section">
          <Form.Provider onFormChange={onFormChange}>
            <Steps
              progressDot
              direction="vertical"
              current={current}
              items={[
                {
                  title: (
                    <div className="step-title-container">
                      <div className="step-count">01</div>
                      <div className="title">{t('ndcAction:ndcActionDetailsTitle')}</div>
                    </div>
                  ),
                  description: current === 1 && <NdcActionDetails></NdcActionDetails>,
                },
                {
                  title: (
                    <div className="step-title-container">
                      <div className="step-count">02</div>
                      <div className="title">{t('ndcAction:coBenefitsTitle')}</div>
                    </div>
                  ),
                  description: current === 2 && <div></div>,
                },
                {
                  title: (
                    <div className="step-title-container">
                      <div className="step-count">03</div>
                      <div className="title">{t('ndcAction:projectReportsTitle')}</div>
                    </div>
                  ),
                  description: current === 3 && (
                    <Form
                      name="projectReports"
                      form={formProjectreports}
                      layout="vertical"
                      requiredMark={true}
                    >
                      <Form.Item label={t('ndcAction:monitoringReport')} name="monitoringReport">
                        <Upload {...props}>
                          <Button icon={<UploadOutlined />}>Upload</Button>
                        </Upload>
                      </Form.Item>
                    </Form>
                  ),
                },
              ]}
            />
          </Form.Provider>
        </div>
        <div className="steps-actions">
          <Row>
            {current > 1 && <Button onClick={onClickBack}>{t('ndcAction:back')}</Button>}
            {current < maxSteps && current !== maxSteps && (
              <Button className="mg-left-1" type="primary" onClick={onClickNext}>
                {t('ndcAction:next')}
              </Button>
            )}
            {current === maxSteps && (
              <Button className="mg-left-1" type="primary" onClick={onClickSubmit}>
                {t('ndcAction:submit')}
              </Button>
            )}
          </Row>
        </div>
      </div>
    </div>
  );
};

export default AddNdcAction;
