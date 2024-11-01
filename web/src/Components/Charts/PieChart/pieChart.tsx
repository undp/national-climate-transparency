import { Empty, Tag } from 'antd';
import Chart from 'react-apexcharts';
import {
  CustomFormatDate,
  DashboardTotalFormatter,
  getArraySum,
} from '../../../Utils/utilServices';
import { ChartData, chartColorMappings } from '../../../Definitions/dashboard.definitions';
import { useEffect, useState } from 'react';

interface Props {
  chart: ChartData;
  t: any;
  chartWidth: number;
}

const PieChart: React.FC<Props> = ({ chart, t, chartWidth }) => {
  // Screen Dimension Context

  // Pie Chart General State

  const [total, setTotal] = useState<number>(0);
  const [chartColorMapping, setChartColorMapping] = useState<string[]>([]);

  // Setting the Total value

  useEffect(() => {
    const arraySum = getArraySum(chart.values);
    setTotal(arraySum);
  }, [chart.values]);

  // Setting the Color Mapping

  useEffect(() => {
    const tempChartColorMapping: string[] = [1, 2, 5, 6].includes(chart.chartId)
      ? chartColorMappings.sectors
      : chart.chartId === 3
      ? chartColorMappings.support
      : chartColorMappings.finance;

    setChartColorMapping(tempChartColorMapping);
  }, [chart.chartId]);

  return (
    <div>
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
                        formatter: (value) =>
                          chart.chartId === 4 ? `$ ${Math.round(parseFloat(value))}` : value,
                      },
                      total: {
                        show: true,
                        label: 'Total',
                        color: '#373d3f',
                        fontWeight: 500,
                        formatter: function (w) {
                          return DashboardTotalFormatter(
                            w.globals.seriesTotals.reduce((a: number, b: number) => {
                              return a + b;
                            }, 0),
                            chart.chartId === 4 ? true : false
                          );
                        },
                      },
                    },
                  },
                },
              },
              legend: {
                width: 200,
                fontSize: '12px',
                position: 'right',
                floating: false,
              },
            }}
            series={chart.values}
            width={chartWidth}
          />
          <div className="chart-update-time">
            <Tag className="time-chip">{CustomFormatDate(chart.lastUpdatedTime)}</Tag>
          </div>
        </>
      ) : (
        <Empty
          className={
            chartWidth === 560
              ? 'empty-chart-xxl'
              : chartWidth === 480
              ? 'empty-chart-xl'
              : 'empty-chart'
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('noChartDataAvailable')}
        />
      )}
    </div>
  );
};

export default PieChart;
