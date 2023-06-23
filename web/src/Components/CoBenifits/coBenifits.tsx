import React from 'react';
import './coBenifits.scss';
import { Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import GenderParity from './genderParity';

const CoBenifitsComponent = () => {
  const { t } = useTranslation(['coBenifits']);
  const tabItems = [
    {
      label: t('coBenifits:sdgGoals'),
      key: '1',
      children: 'SDG Goals',
    },
    {
      label: t('coBenifits:genderPart'),
      key: '2',
      children: <GenderParity />,
    },
    {
      label: t('coBenifits:safeguards'),
      key: '3',
      children: 'Safeguards',
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
      children: 'Econimic',
    },
  ];
  return (
    <div className="co-benifits-container">
      <Tabs className="benifits-tabs" defaultActiveKey="1" centered items={tabItems} />
    </div>
  );
};

export default CoBenifitsComponent;
