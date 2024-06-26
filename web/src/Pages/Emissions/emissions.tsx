import { Tabs } from 'antd';
import './emissions.scss';
import { useTranslation } from 'react-i18next';
import { EmissionForm } from '../../Components/Inventory/Emission/emissionForm';
import { useState } from 'react';

const GhgEmissions = () => {
  const { t } = useTranslation(['emission']);

  const [uploadedFile, setUploadedFile] = useState<{
    key: string;
    title: string;
    data: string;
    url: string;
  }>();

  const tabItems = [
    {
      label: t('Add New'),
      key: '1',
      children: (
        <EmissionForm
          index={0}
          t={t}
          uploadedFile={uploadedFile}
          setUploadedFile={setUploadedFile}
        />
      ),
    },
    {
      label: t('2023'),
      key: '2',
      children: (
        <EmissionForm
          index={1}
          t={t}
          uploadedFile={uploadedFile}
          setUploadedFile={setUploadedFile}
        />
      ),
    },
    {
      label: t('2024'),
      key: '3',
      children: (
        <EmissionForm
          index={1}
          t={t}
          uploadedFile={uploadedFile}
          setUploadedFile={setUploadedFile}
        />
      ),
    },
  ];

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('emissionTitle')}</div>
      </div>
      <div className="emission-section-card">
        <Tabs defaultActiveKey="1" centered items={tabItems} />
      </div>
    </div>
  );
};

export default GhgEmissions;
