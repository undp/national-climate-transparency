import { Empty, Tag } from 'antd';
import Chart from 'react-apexcharts';
import {
  CustomFormatDate,
  DashboardTotalFormatter,
  getArraySum,
} from '../../../Utils/utilServices';
import { PieChartData, chartColorMappings } from '../../../Definitions/dashboard.definitions';

interface Props {
  chart: PieChartData;
  t: any;
}

const PieChart: React.FC<Props> = ({ chart, t }) => {
  const total = getArraySum(chart.values);
  const chartColorMapping: string[] = [1, 2, 5, 6].includes(chart.chartId)
    ? chartColorMappings.sectors
    : chart.chartId === 5
    ? chartColorMappings.support
    : chartColorMappings.finance;

  return (
    <div className="status-chip">
      {total > 0 ? (
        <>
          <Chart
            type="donut"
            options={{
              labels: chart.categories,
              colors: chartColorMapping,
              dataLabels: {
                enabled: false,
              },
              tooltip: {
                enabled: false,
              },
              plotOptions: {
                pie: {
                  donut: {
                    labels: {
                      show: true,
                      name: {
                        show: true,
                        formatter: (name) => (name.length > 12 ? `${name.slice(0, 12)}...` : name),
                      },
                      value: {
                        show: true,
                        formatter: (value) => (chart.chartId === 4 ? `$ ${value}` : value),
                      },
                      total: {
                        show: true,
                        label: 'Total',
                        color: '#373d3f',
                        fontWeight: 500,
                        formatter: () =>
                          DashboardTotalFormatter(total, chart.chartId === 4 ? true : false),
                      },
                    },
                  },
                },
              },
              legend: {
                position: 'right',
                floating: false,
              },
            }}
            series={chart.values}
            width={450}
          />
          <div className="chart-update-time">
            <Tag className="time-chip">{CustomFormatDate(chart.lastUpdatedTime)}</Tag>
          </div>
        </>
      ) : (
        <Empty
          className="empty-chart"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('noChartDataAvailable')}
        />
      )}
    </div>
  );
};

export default PieChart;
