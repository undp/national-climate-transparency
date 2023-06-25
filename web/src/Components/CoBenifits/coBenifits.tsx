import React from 'react';
import './coBenifits.scss';
import { Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import GenderParity from './genderParity';
import Assessment from './assessment';
import SdgGoals from './sdgGoals';
import Safeguards from './safeguards';

const CoBenifitsComponent = () => {
  const { t } = useTranslation(['coBenifits']);

  const onAssessmentFormSubmit = (coBenefitsAssessmentDetails: any) => {
    //console.log('coBenefitsAssessmentDetails', coBenefitsAssessmentDetails);
  };

  const onSafeguardFormSubmit = (safeguardDetails: any) => {
    //console.log('safeguardDetails', safeguardDetails);
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
      <Tabs className="benifits-tabs" defaultActiveKey="1" centered items={tabItems} />
    </div>
  );
};

export default CoBenifitsComponent;
