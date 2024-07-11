import { Tabs } from 'antd';
import './projection.scss';
import { useTranslation } from 'react-i18next';
import { ProjectionForm } from '../../Components/Inventory/projectionForm';

const GhgProjections = () => {
  // Page Context

  const { t } = useTranslation(['projection']);

  const items = [
    {
      key: '1',
      label: t('withMeasuresTitle'),
      children: <ProjectionForm index={1} projectionType="withMeasures" />,
    },
    {
      key: '2',
      label: t('withAdditionalMeasuresTitle'),
      children: <ProjectionForm index={1} projectionType="withAdditionalMeasures" />,
    },
    {
      key: '3',
      label: t('withoutMeasuresTitle'),
      children: <ProjectionForm index={1} projectionType="withoutMeasures" />,
    },
  ];

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('projectionTitle')}</div>
      </div>
      <div className="emission-section-card">
        <Tabs defaultActiveKey="1" centered items={items} />
      </div>
    </div>
  );
};

export default GhgProjections;
