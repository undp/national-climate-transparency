import { Tabs } from 'antd';
import './emissions.scss';
import { EmissionForm } from '../../Components/Inventory/emissionForm';
import { displayErrorMessage } from '../../Utils/errorMessageHandler';
import { useTranslation } from 'react-i18next';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { useEffect, useState } from 'react';

const GhgEmissions = () => {
  // Page Context

  const { t } = useTranslation(['emission']);
  const { get } = useConnection();

  // Years State for Tab Panel
  const [availableYears, setAvailableYears] = useState<string[]>();
  const [tabItems, setTabItems] = useState<any>();

  const getAvailableYears = async () => {
    try {
      const response: any = await get('national/emissions/year/available');
      if (response.status === 200 || response.status === 201) {
        setAvailableYears(response.data);
      }
    } catch (error: any) {
      displayErrorMessage(error, t('yearFetchingFailed'));
      return null;
    }
  };

  useEffect(() => {
    getAvailableYears();
  }, []);

  useEffect(() => {
    const tempTabItems = [
      {
        label: t('addNew'),
        key: '1',
        children: <EmissionForm index={0} year={null} />,
      },
    ];

    if (availableYears) {
      console.log(availableYears);
      availableYears.forEach((year, index) =>
        tempTabItems.push({
          label: year,
          key: `${index + 2}`,
          children: <EmissionForm index={index + 1} year={year} />,
        })
      );
    }

    setTabItems(tempTabItems);
  }, [availableYears]);

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
