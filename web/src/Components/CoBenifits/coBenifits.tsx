import React, { useState } from 'react';
import './coBenifits.scss';
import { Button, Row, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import GenderParity from './genderParity';
import Assessment from './assessment';
import SdgGoals from './sdgGoals';
import Safeguards from './safeguards';

export interface CoBenefitProps {
  onClickedBackBtn: any;
  onFormSubmit: any;
  coBenefitsDetails?: any;
  submitButtonText?: any;
}

const CoBenifitsComponent = (props: CoBenefitProps) => {
  const { onClickedBackBtn, onFormSubmit, coBenefitsDetails, submitButtonText } = props;
  const { t } = useTranslation(['coBenifits']);
  const [coBenefitDetails, setCoBenefitDetails] = useState();

  const onAssessmentFormSubmit = (coBenefitsAssessmentDetails: any) => {
    setCoBenefitDetails((pre: any) => ({ ...pre, assessmentDetails: coBenefitsAssessmentDetails }));
  };

  const onSafeguardFormSubmit = (safeguardDetails: any) => {
    setCoBenefitDetails((pre: any) => ({ ...pre, safeguardDetails: safeguardDetails }));
  };

  const tabItems = [
    {
      label: t('coBenifits:sdgGoals'),
      key: '1',
      children: <SdgGoals />,
    },
    {
      label: t('coBenifits:genderPart'),
      key: '2',
      children: <GenderParity />,
    },
    {
      label: t('coBenifits:safeguards'),
      key: '3',
      children: <Safeguards onFormSubmit={onSafeguardFormSubmit} />,
    },
    {
      label: t('coBenifits:environmental'),
      key: '4',
      children: 'Environmental',
    },
    {
      label: t('coBenifits:social'),
      key: '5',
      children: 'Social',
    },
    {
      label: t('coBenifits:economic'),
      key: '6',
      children: 'Econimic',
    },
    {
      label: t('coBenifits:assessment'),
      key: '7',
      children: <Assessment onFormSubmit={onAssessmentFormSubmit} />,
    },
  ];
  return (
    <div className="co-benifits-container">
      <div>
        <Tabs className="benifits-tabs" defaultActiveKey="1" centered items={tabItems} />
      </div>
      <div className="steps-actions">
        <Row>
          <Button onClick={onClickedBackBtn}>{t('back')}</Button>
          <Button
            className="mg-left-1"
            type="primary"
            onClick={() => onFormSubmit(coBenefitDetails)}
          >
            {submitButtonText ? submitButtonText : t('submit')}
          </Button>
        </Row>
      </div>
    </div>
  );
};

export default CoBenifitsComponent;
