import { Tabs } from 'antd';
import './projection.scss';
import { useTranslation } from 'react-i18next';
import { ProjectionForm } from '../../Components/Inventory/projectionForm';
import { ProjectionType } from '../../Enums/projection.enum';

const GhgProjections = () => {
  // Page Context

  const { t } = useTranslation(['projection']);

  const items = [
    {
      key: '1',
      label: t('withMeasuresTitle'),
      children: <ProjectionForm index={1} projectionType={ProjectionType.WITH_MEASURES} />,
    },
    {
      key: '2',
      label: t('withAdditionalMeasuresTitle'),
      children: (
        <ProjectionForm index={1} projectionType={ProjectionType.WITH_ADDITIONAL_MEASURES} />
      ),
    },
    {
      key: '3',
      label: t('withoutMeasuresTitle'),
      children: <ProjectionForm index={1} projectionType={ProjectionType.WITHOUT_MEASURES} />,
    },
  ];

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('projectionTitle')}</div>
      </div>
      <div className="projection-section-card">
        <Tabs defaultActiveKey="1" centered items={items} />
      </div>
    </div>
  );
};

export default GhgProjections;
