import { Empty, Tabs } from 'antd';
import './emissions.scss';
import { EmissionForm } from '../../Components/Inventory/emissionForm';
import { displayErrorMessage } from '../../Utils/errorMessageHandler';
import { useTranslation } from 'react-i18next';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { useEffect, useState } from 'react';
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
  const [dataExistToView, setDataExistToView] = useState<boolean>(false);

  // Active Tab State

  const [activeYear, setActiveYear] = useState<string>();

  // Getter of all available emission report years and their state

  const getAvailableEmissionReports = async () => {
    try {
      const response: any = await get('national/emissions/summary/available');
      if (response.status === 200 || response.status === 201) {
        setAvailableReports(response.data);
        if (response.data.length > 0) {
          setDataExistToView(true);
        }
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

  // Tab Item Population when the available reports change

  useEffect(() => {
    const tempTabItems: EmissionTabItem[] = isGhgAllowed
      ? [
          {
            key: 'addNew',
            label: (
              <span>
                <PlusCircleOutlined />
                {t('addNew')}
              </span>
            ),
            children: (
              <EmissionForm
                index={0}
                year={null}
                finalized={false}
                availableYears={tabItems ? tabItems.map((item) => parseInt(item.label)) : []}
                setActiveYear={setActiveYear}
                getAvailableEmissionReports={getAvailableEmissionReports}
              />
            ),
          },
        ]
      : [];

    if (availableReports) {
      availableReports.forEach((report, index) => {
        tempTabItems.push({
          key: report.year,
          label: (
            <span>
              <span style={{ marginRight: '8px' }}>{report.year}</span>
              <span>{report.state === 'FINALIZED' ? <LockOutlined /> : null}</span>
            </span>
          ),
          children: (
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

    tempTabItems.sort((a, b) => parseFloat(a.key) - parseFloat(b.key));
    setTabItems(tempTabItems);
  }, [availableReports]);

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('emissionTitle')}</div>
      </div>
      <div className="emission-section-card">
        {isGhgAllowed || (!isGhgAllowed && dataExistToView) ? (
          <Tabs
            centered
            activeKey={activeYear}
            onTabClick={(key: string) => setActiveYear(key)}
            destroyInactiveTabPane={true}
            items={tabItems}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={'No Emission Reports Available'}
          />
        )}
      </div>
    </div>
  );
};

export default GhgEmissions;
