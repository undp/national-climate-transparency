import { Tabs } from 'antd';
import './emissions.scss';
import { EmissionForm } from '../../Components/Inventory/emissionForm';

const GhgEmissions = () => {
  const tabItems = [
    {
      label: 'Add New',
      key: '1',
      children: <EmissionForm index={0} />,
    },
    {
      label: '2023',
      key: '2',
      children: <EmissionForm index={1} />,
    },
    {
      label: '2024',
      key: '3',
      children: <EmissionForm index={1} />,
    },
  ];

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{'emissionTitle'}</div>
      </div>
      <div className="emission-section-card">
        <Tabs defaultActiveKey="1" centered items={tabItems} />
      </div>
    </div>
  );
};

export default GhgEmissions;
