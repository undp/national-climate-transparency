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
  const [availableReports, setAvailableReports] =
    useState<{ year: string; state: 'SAVED' | 'FINALIZED' }[]>();
  const [tabItems, setTabItems] = useState<any>();

  const getAvailableEmissionReports = async () => {
    try {
      const response: any = await get('national/emissions/summary/available');
      if (response.status === 200 || response.status === 201) {
        setAvailableReports(response.data);
      }
    } catch (error: any) {
      displayErrorMessage(error, t('yearFetchingFailed'));
      return null;
    }
  };

  useEffect(() => {
    getAvailableEmissionReports();
  }, []);

  useEffect(() => {
    const tempTabItems = [
      {
        label: t('addNew'),
        key: '1',
        children: <EmissionForm index={0} year={null} finalized={false} />,
      },
    ];

    if (availableReports) {
      availableReports.forEach((report, index) =>
        tempTabItems.push({
          label: report.year,
          key: `${index + 2}`,
          children: (
            <EmissionForm
              index={index + 1}
              year={report.year}
              finalized={report.state === 'FINALIZED' ? true : false}
            />
          ),
        })
      );
    }

    setTabItems(tempTabItems);
  }, [availableReports]);

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
