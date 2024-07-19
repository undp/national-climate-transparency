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
import { useUserContext } from '../../Context/UserInformationContext/userInformationContext';

const GhgEmissions = () => {
  // Page Context

  const { t } = useTranslation(['emission']);
  const { get } = useConnection();
  const { isGhgAllowed } = useUserContext();

  // Years State for Tab Panel

  const [availableReports, setAvailableReports] =
    useState<{ year: string; state: 'SAVED' | 'FINALIZED' }[]>();
  const [tabItems, setTabItems] = useState<EmissionTabItem[]>();

  // Active Tab State

  const [activeYear, setActiveYear] = useState<string>();

  // Getter of all available emission report years and their state

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

  // Init Function at first render

  useEffect(() => {
    getAvailableEmissionReports();
  }, []);

  // Tab Pane Population when the available reports change

  useEffect(() => {
    const tempTabItems: EmissionTabItem[] = [];

    if (availableReports) {
      availableReports.forEach((report, index) => {
        tempTabItems.push({
          key: report.year,
          label: report.year,
          icon: report.state === 'FINALIZED' ? <LockOutlined /> : null,
          content: (
            <EmissionForm
              index={index + 1}
              year={report.year}
              availableYears={tabItems ? tabItems.map((item) => parseInt(item.label)) : []}
              setActiveYear={setActiveYear}
              finalized={report.state === 'FINALIZED' ? true : false}
              getAvailableEmissionReports={getAvailableEmissionReports}
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
        <div className="body-title">{t('emissionTitle')}</div>
      </div>
      <div className="emission-section-card">
        <Tabs
          centered
          activeKey={activeYear}
          onTabClick={(key: string) => setActiveYear(key)}
          destroyInactiveTabPane={true}
        >
          {isGhgAllowed && (
            <TabPane
              tab={
                <span>
                  <PlusCircleOutlined />
                  {t('addNew')}
                </span>
              }
              key="addNew"
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
          )}
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
