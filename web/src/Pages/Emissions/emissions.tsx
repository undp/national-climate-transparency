import { Tabs } from 'antd';
import './emissions.scss';
import { EmissionForm } from '../../Components/Inventory/emissionForm';
import { displayErrorMessage } from '../../Utils/errorMessageHandler';
import { useTranslation } from 'react-i18next';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { useEffect, useState } from 'react';
import TabPane from 'antd/lib/tabs/TabPane';
import { LockOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { EmissionTabItem } from '../../Definitions/emissionDefinitions';

const GhgEmissions = () => {
  // Page Context

  const { t } = useTranslation(['emission']);
  const { get } = useConnection();

  // Years State for Tab Panel
  const [availableReports, setAvailableReports] =
    useState<{ year: string; state: 'SAVED' | 'FINALIZED' }[]>();
  const [tabItems, setTabItems] = useState<EmissionTabItem[]>();

  // Active Tab State

  const [activeKey, setActiveKey] = useState<string>('1');
  const [activeYear, setActiveYear] = useState<string>();

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
    const tempTabItems: EmissionTabItem[] = [];

    if (availableReports) {
      availableReports.forEach((report, index) => {
        if (activeYear === report.year) {
          setActiveKey(`${index + 2}`);
          setActiveYear(undefined);
        }
        tempTabItems.push({
          key: `${index + 2}`,
          label: report.year,
          icon: report.state === 'FINALIZED' ? <LockOutlined /> : null,
          content: (
            <EmissionForm
              index={index + 1}
              year={report.year}
              availableYears={tabItems ? tabItems.map((item) => parseInt(item.label)) : []}
              setActiveYear={setActiveYear}
              finalized={report.state === 'FINALIZED' ? true : false}
            />
          ),
        });
      });
    }

    tempTabItems.sort((a, b) => parseFloat(a.label) - parseFloat(b.label));
    setTabItems(tempTabItems);
  }, [availableReports]);

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{'emissionTitle'}</div>
      </div>
      <div className="emission-section-card">
        <Tabs centered activeKey={activeKey} onTabClick={(key: string) => setActiveKey(key)}>
          <TabPane
            tab={
              <span>
                <PlusCircleOutlined />
                {t('addNew')}
              </span>
            }
            key="1"
          >
            <EmissionForm
              index={0}
              year={null}
              finalized={false}
              availableYears={tabItems ? tabItems.map((item) => parseInt(item.label)) : []}
              setActiveYear={setActiveYear}
              getAvailableEmissionReports={getAvailableEmissionReports}
            />
          </TabPane>
          {tabItems &&
            tabItems.map((tab: any) => (
              <TabPane
                tab={
                  <span>
                    <span style={{ marginRight: '8px' }}>{tab.label}</span>
                    <span>{tab.icon}</span>
                  </span>
                }
                key={tab.key}
              >
                {tab.content}
              </TabPane>
            ))}
        </Tabs>
      </div>
    </div>
  );
};

export default GhgEmissions;
