import { useTranslation } from 'react-i18next';
import { MrvDashboardComponent } from '@undp/carbon-library';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';
import ButtonGroup from 'antd/lib/button/button-group';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { useUserContext } from '../../Context/UserInformationContext/userInformationContext';

const Dashboard = () => {
  const { t } = useTranslation(['dashboard']);
  return (
    <MrvDashboardComponent
      useConnection={useConnection}
      useUserContext={useUserContext}
      Link={Link}
      Chart={Chart}
      t={t}
      ButtonGroup={ButtonGroup}
    ></MrvDashboardComponent>
  );
};

export default Dashboard;
