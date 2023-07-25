import React, { useEffect, useState } from 'react';
import NdcActionDetails from '../../Components/NdcAction/ndcActionDetails';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input, Row, Steps, Tooltip, Upload, UploadProps, message } from 'antd';
import './addNdcAction.scss';
import { UploadOutlined } from '@ant-design/icons';
import { FormInstance } from 'rc-field-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { RcFile } from 'rc-upload/lib/interface';
import { MitigationTypes } from '../../Definitions/mitigationTypes.enum';
import { NdcActionTypes } from '../../Definitions/ndcActionTypes.enum';
import { Programme, ProgrammeStage } from '@undp/carbon-library';
import { getBase64 } from '../../Definitions/InterfacesAndType/programme.definitions';
import { InfoCircle } from 'react-bootstrap-icons';
import CoBenifitsComponent from '../../Components/CoBenifits/coBenifits';

const AddNdcAction = () => {
  const { t } = useTranslation(['ndcAction']);
  const [current, setCurrent] = useState<number>(1);
  const [programmeDetails, setprogrammeDetails] = useState<Programme>();
  const [ndcActionDetails, setNdcActionDetails] = useState<any>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { post } = useConnection();
  const [loading, setLoading] = useState(false);

  const maximumImageSize = process.env.REACT_APP_MAXIMUM_FILE_SIZE
    ? parseInt(process.env.REACT_APP_MAXIMUM_FILE_SIZE)
    : 5000000;

  useEffect(() => {
    if (!state?.record) {
      navigate('/programmeManagement/viewAll', { replace: true });
    } else {
      setprogrammeDetails(state.record);
      setNdcActionDetails(undefined);
    }
  }, []);

  const isProjectReportsVisible = () => {
    return programmeDetails?.currentStage === ProgrammeStage.Authorised;
  };

  const saveNdcAction = async (ndcActionDetailsObj: any) => {
    setLoading(true);
    try {
      if (ndcActionDetailsObj.enablementReportData) {
        delete ndcActionDetailsObj.enablementReportData;
      }

      ndcActionDetailsObj.methodology = t('ndcAction:goldStandard');
      const response: any = await post('national/programme/addNDCAction', ndcActionDetailsObj);
      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: `${t('ndcSuccessfullyCreated')}`,
          duration: 4,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        navigate('/programmeManagement/view', { state: { record: programmeDetails } });
      }
    } catch (error: any) {
      message.open({
        type: 'error',
        content: error && error.message ? error.message : `${'ndcCreationFailed'}`,
        duration: 4,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } finally {
      setLoading(false);
    }
  };

  const onClickNext = () => {
    setCurrent((pre) => pre + 1);
  };

  const onClickBack = () => {
    setCurrent((pre) => pre - 1);
  };

  const onClickBackCoBenefits = (savedCoBenefitsDetails: any) => {
    const updatedNdcActionDetails = {
      ...ndcActionDetails,
      coBenefitsProperties: savedCoBenefitsDetails,
    };
    setNdcActionDetails(updatedNdcActionDetails);
    onClickBack();
  };

  const onProjectReportSubmit = async (projectReportFormValues: any) => {
    const updatedNdcActionDetails = {
      ...ndcActionDetails,
    };

    if (
      projectReportFormValues.monitoringReport &&
      projectReportFormValues.monitoringReport.length > 0
    ) {
      const logoBase64 = await getBase64(
        projectReportFormValues.monitoringReport[0].originFileObj as RcFile
      );

      updatedNdcActionDetails.monitoringReport = logoBase64;
    }

    setNdcActionDetails(updatedNdcActionDetails);
    saveNdcAction(updatedNdcActionDetails);
  };

  const onNdcActionDetailsSubmit = async (ndcActionDetailsObj: any) => {
    ndcActionDetailsObj.programmeId = programmeDetails?.programmeId;
    setNdcActionDetails((pre: any) => ({ ...pre, ...ndcActionDetailsObj }));
    onClickNext();
  };

  const onCoBenefitsSubmit = async (coBenefitsFormValues: any) => {
    const updatedNdcActionDetails = {
      ...ndcActionDetails,
      coBenefitsProperties: coBenefitsFormValues,
    };
    setNdcActionDetails(updatedNdcActionDetails);
    if (isProjectReportsVisible()) {
      onClickNext();
    } else {
      saveNdcAction(updatedNdcActionDetails);
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const stepItems = [
    {
      title: (
        <div className="step-title-container">
          <div className="step-count">01</div>
          <div className="title">{t('ndcAction:ndcActionDetailsTitle')}</div>
          <div className="info-container">
            <Tooltip
              arrowPointAtCenter
              placement="right"
              trigger="hover"
              title={t('ndcAction:ndcToolTip')}
              overlayClassName="custom-tooltip"
            >
              <InfoCircle color="#000000" size={17} />
            </Tooltip>
          </div>
        </div>
      ),
      description: (
        <div className={current !== 1 ? 'hide' : ''}>
          <NdcActionDetails
            isBackBtnVisible={false}
            onFormSubmit={onNdcActionDetailsSubmit}
            ndcActionDetails={ndcActionDetails}
            programmeDetails={programmeDetails}
          ></NdcActionDetails>
        </div>
      ),
    },
    {
      title: (
        <div className="step-title-container">
          <div className="step-count">02</div>
          <div className="title">{t('ndcAction:coBenefitsTitle')}</div>
        </div>
      ),
      description: (
        <div className={current !== 2 ? 'hide' : ''}>
          <CoBenifitsComponent
            onClickedBackBtn={onClickBackCoBenefits}
            coBenefitsDetails={ndcActionDetails ? ndcActionDetails.coBenefitsProperties : {}}
            onFormSubmit={onCoBenefitsSubmit}
            submitButtonText={
              isProjectReportsVisible() ? t('ndcAction:next') : t('ndcAction:submit')
            }
            loading={loading}
          />
        </div>
      ),
    },
  ];

  if (isProjectReportsVisible()) {
    stepItems.push({
      title: (
        <div className="step-title-container">
          <div className="step-count">03</div>
          <div className="title">{t('ndcAction:projectReportsTitle')}</div>
        </div>
      ),
      description: (
        <div className={current !== 3 ? 'hide' : ''}>
          <Form
            name="projectReports"
            layout="vertical"
            requiredMark={true}
            onFinish={onProjectReportSubmit}
          >
            <Form.Item
              label={t('ndcAction:monitoringReport')}
              name="monitoringReport"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              required={false}
              rules={[
                {
                  validator: async (rule, file) => {
                    if (file?.length > 0) {
                      let isCorrectFormat = false;
                      if (file[0]?.type === 'application/pdf') {
                        isCorrectFormat = true;
                      } else if (
                        file[0]?.type ===
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                      ) {
                        isCorrectFormat = true;
                      } else if (file[0]?.type === 'text/csv') {
                        isCorrectFormat = true;
                      }
                      if (!isCorrectFormat) {
                        throw new Error(`${t('ndcAction:invalidFileFormat')}`);
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
                beforeUpload={(file: any) => {
                  return false;
                }}
                className="design-upload-section"
                name="monitoringReport"
                listType="picture"
                multiple={false}
                maxCount={1}
              >
                <Button className="upload-doc" size="large" icon={<UploadOutlined />}>
                  Upload
                </Button>
              </Upload>
            </Form.Item>
            <div className="steps-actions">
              <Row>
                <Button onClick={onClickBack}>{t('ndcAction:back')}</Button>
                <Button className="mg-left-1" htmlType="submit" type="primary" loading={loading}>
                  {t('ndcAction:submit')}
                </Button>
              </Row>
            </div>
          </Form>
        </div>
      ),
    });
  }

  return (
    <div className="add-ndc-main-container">
      <div className="title-container">
        <div className="main">{t('ndcAction:addNdcTitle')}</div>
        <div className="sub">{t('ndcAction:addNdcSubTitle')}</div>
      </div>
      <div className="adding-section">
        <div className="form-section">
          <Steps progressDot direction="vertical" current={current} items={stepItems} />
        </div>
      </div>
    </div>
  );
};

export default AddNdcAction;
