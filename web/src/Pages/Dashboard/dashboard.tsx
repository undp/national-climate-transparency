import { useTranslation } from 'react-i18next';
import { MrvDashboardComponent } from '@undp/carbon-library';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';
import ButtonGroup from 'antd/lib/button/button-group';

const Dashboard = () => {
  const { t } = useTranslation(['dashboard']);
  return (
    <MrvDashboardComponent
      Link={Link}
      Chart={Chart}
      t={t}
      ButtonGroup={ButtonGroup}
    ></MrvDashboardComponent>
  );
};

export default Dashboard;
