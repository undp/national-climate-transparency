import { Tabs } from 'antd';
import './configurations.scss';
import { useTranslation } from 'react-i18next';
import { BaselineForm } from '../../Components/Inventory/baselineForm';

const GhgConfigurations = () => {
  // Page Context

  const { t } = useTranslation(['configuration']);

  const items = [
    {
      key: '1',
      label: t('withMeasuresTitle'),
      children: <BaselineForm index={1} projectionType="withMeasures" />,
    },
    {
      key: '2',
      label: t('withAdditionalMeasuresTitle'),
      children: <BaselineForm index={1} projectionType="withAdditionalMeasures" />,
    },
    {
      key: '3',
      label: t('withoutMeasuresTitle'),
      children: <BaselineForm index={1} projectionType="withoutMeasures" />,
    },
  ];

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('configurationTitle')}</div>
      </div>
      <div className="configuration-section-card">
        <div className="form-section-header">{t('gwpConfigurationTitle')}</div>
      </div>
      <div className="configuration-section-card">
        <div className="form-section-header">{t('growthRateConfigurationTitle')}</div>
        <Tabs defaultActiveKey="1" centered items={items} />
      </div>
    </div>
  );
};

export default GhgConfigurations;
