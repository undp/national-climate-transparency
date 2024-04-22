import { Layout } from 'antd';
import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
const { Header, Content } = Layout;
import { Outlet } from 'react-router-dom';
import LayoutHeader from '../Header/layout.header';
import LayoutSider from '../Sider/layout.sider';
import './layout.scss';
import { PauseCircleFill } from 'react-bootstrap-icons';
import { Loading } from '../Loading/loading';
import { ConfigurationSettingsType } from '../../Enums/configuration.setting.type.enum';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { useSettingsContext } from '../../Context/SettingsContext/settingsContext';

const CustomLayout = (props: any) => {
  const { selectedKey } = props;
  const { get } = useConnection();
  const { isTransferFrozen, setTransferFrozen } = useSettingsContext();
  const { t } = useTranslation(['creditTransfer']);

  const getTransferFrozenStatus = async () => {
    const response = await get(
      `national/Settings/query?id=${ConfigurationSettingsType.isTransferFrozen}`
    );
    if (response && response.data) {
      setTransferFrozen(response.data);
    } else {
      setTransferFrozen(false);
    }
  };

  useEffect(() => {
    getTransferFrozenStatus();
  }, []);

  return (
    <div className="layout-main-container">
      {isTransferFrozen && (
        <div className="transfer-freeze-label">
          <span className="pause-circle">
            <PauseCircleFill size={25} className="pause-circle-icon" />
            {t('creditTransfer:allTransfersPausedLabelTxt')}
          </span>
        </div>
      )}
      <Layout hasSider>
        <LayoutSider selectedKey={selectedKey} />
        <Layout className="layout-container">
          <Header className="layout-header-container">
            <LayoutHeader />
          </Header>
          <Content>
            <div className="layout-content-container">
              <Suspense fallback={<Loading />}>
                <Outlet />
              </Suspense>
            </div>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default CustomLayout;
