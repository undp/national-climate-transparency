import { Col, Row } from 'antd';
import './dashboard.scss';
import { InfoCircleOutlined } from '@ant-design/icons';
import ChartInformation from '../../Components/Popups/chartInformation';
import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { PieChartData } from '../../Definitions/dashboard.definitions';

const Dashboard = () => {
  const [openChartInfo, setOpenChartInfo] = useState<boolean>(false);
  const [chartContent, setChartContent] = useState<{ title: string; body: string }>({
    title: '',
    body: '',
  });
  const [chartData, setChartData] = useState<PieChartData[]>([]);

  useEffect(() => {
    const tempChartData: PieChartData[] = [];

    tempChartData.push({
      chartTitle: 'Climate Action',
      chartDescription: 'Climate Action Description',
      categories: ['A', 'B', 'C'],
      values: [50, 20, 80],
    });

    tempChartData.push({
      chartTitle: 'Projects',
      chartDescription: 'Climate Projects Description',
      categories: ['A', 'B', 'C'],
      values: [50, 80, 80],
    });

    tempChartData.push({
      chartTitle: 'Climate Action',
      chartDescription: 'Climate Action Description',
      categories: ['A', 'B', 'C'],
      values: [50, 20, 80],
    });

    tempChartData.push({
      chartTitle: 'Projects',
      chartDescription: 'Climate Projects Description',
      categories: ['A', 'B', 'C'],
      values: [50, 80, 80],
    });
    setChartData(tempChartData);
  }, []);

  return (
    <div className="dashboard-page">
      <ChartInformation
        open={openChartInfo}
        setOpen={setOpenChartInfo}
        content={chartContent}
      ></ChartInformation>
      <Row gutter={30}>
        {chartData.map((chart: PieChartData, index: number) => (
          <Col className="gutter-row" span={12}>
            <div className="chart-section-card">
              <div className="chart-title">
                {chart.chartTitle}
                <InfoCircleOutlined
                  onClick={() => {
                    setChartContent({ title: chart.chartTitle, body: chart.chartDescription });
                    setOpenChartInfo(true);
                  }}
                  style={{ marginLeft: '300px', marginBottom: '20px' }}
                />
              </div>
              <Chart
                key={index}
                type="donut"
                options={{ labels: chart.categories }}
                series={chart.values}
                height={250}
              />
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Dashboard;
