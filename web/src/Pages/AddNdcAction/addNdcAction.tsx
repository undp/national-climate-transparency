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
import { Programme, ProgrammeStage } from '@undp/carbon-library';
import { getBase64 } from '../../Definitions/InterfacesAndType/programme.definitions';

const AddNdcAction = () => {
  const { t } = useTranslation(['ndcAction']);
  const [current, setCurrent] = useState<number>(1);
  const [programmeDetails, setprogrammeDetails] = useState<Programme>();
  const [ndcActionDetails, setNdcActionDetails] = useState<any>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { post } = useConnection();

  useEffect(() => {
    if (!state.record) {
      navigate('/programmeManagement/viewAll', { replace: true });
    } else {
      setprogrammeDetails(state.record);
      setNdcActionDetails(undefined);
    }
  }, []);

  const isProjectReportsVisible = () => {
    return programmeDetails?.currentStage === ProgrammeStage.Authorised;
  };

  const saveNdcAction = async () => {
    const response: any = await post('national/programme/addNDCAction', ndcActionDetails);
    console.log('response', response);
    if (response.status === 200 || response.status === 201) {
      navigate('/programmeManagement/view', { state: { record: programmeDetails } });
    }
  };

  const onClickNext = () => {
    setCurrent((pre) => pre + 1);
  };

  const onClickBack = () => {
    setCurrent((pre) => pre - 1);
  };

  const onProjectReportSubmit = async (projectReportFormValues: any) => {
    const logoBase64 = await getBase64(
      projectReportFormValues.monitoringReport.file.originFileObj as RcFile
    );
    const logoUrls = logoBase64.split(',');
    setNdcActionDetails((pre: any) => ({ ...pre, monitoringReport: logoUrls[1] }));
    saveNdcAction();
  };

  const onNdcActionDetailsSubmit = async (ndcActionDetailsObj: any) => {
    ndcActionDetailsObj.programmeId = programmeDetails?.programmeId;
    setNdcActionDetails(ndcActionDetailsObj);
    onClickNext();
  };

  const onCoBenefitsSubmit = async (coBenefitsFormValues: any) => {
    if (isProjectReportsVisible()) {
      onClickNext();
    } else {
      saveNdcAction();
    }
  };

  const props: UploadProps = {
    //need to add
  };

  const getStepItems = () => {
    const stepItems = [
      {
        title: (
          <div className="step-title-container">
            <div className="step-count">01</div>
            <div className="title">{t('ndcAction:ndcActionDetailsTitle')}</div>
          </div>
        ),
        description: current === 1 && (
          <NdcActionDetails
            isBackBtnVisible={false}
            onFormSubmit={onNdcActionDetailsSubmit}
            ndcActionDetails={ndcActionDetails}
          ></NdcActionDetails>
        ),
      },
      {
        title: (
          <div className="step-title-container">
            <div className="step-count">02</div>
            <div className="title">{t('ndcAction:coBenefitsTitle')}</div>
          </div>
        ),
        description: current === 2 && (
          <div>
            <div className="steps-actions">
              <Row>
                <Button onClick={onClickBack}>{t('ndcAction:back')}</Button>
                <Button className="mg-left-1" type="primary" onClick={onCoBenefitsSubmit}>
                  {isProjectReportsVisible() ? t('ndcAction:next') : t('ndcAction:submit')}
                </Button>
              </Row>
            </div>
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
        description: current === 3 && (
          <Form
            name="projectReports"
            layout="vertical"
            requiredMark={true}
            onFinish={onProjectReportSubmit}
          >
            <Form.Item label={t('ndcAction:monitoringReport')} name="monitoringReport">
              <Upload {...props}>
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Form.Item>
            <div className="steps-actions">
              <Row>
                <Button onClick={onClickBack}>{t('ndcAction:back')}</Button>
                <Button className="mg-left-1" htmlType="submit" type="primary">
                  {t('ndcAction:submit')}
                </Button>
              </Row>
            </div>
          </Form>
        ),
      });
    }

    return stepItems;
  };

  return (
    <div className="add-ndc-main-container">
      <div className="title-container">
        <div className="main">{t('ndcAction:addNdcTitle')}</div>
        <div className="sub">{t('ndcAction:addNdcSubTitle')}</div>
      </div>
      <div className="adding-section">
        <div className="form-section">
          <Steps progressDot direction="vertical" current={current} items={getStepItems()} />
        </div>
      </div>
    </div>
  );
};

export default AddNdcAction;
