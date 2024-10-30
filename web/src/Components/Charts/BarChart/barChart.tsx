import { Empty, Tag } from 'antd';
import Chart from 'react-apexcharts';
import { CustomFormatDate } from '../../../Utils/utilServices';
import { ChartData, chartColorMappings } from '../../../Definitions/dashboard.definitions';
import { useEffect, useState } from 'react';

interface Props {
  chart: ChartData;
  t: any;
  chartHeight: number;
}

const BarChart: React.FC<Props> = ({ chart, t, chartHeight }) => {
  // Bar Chart General State

  const [chartColorMapping, setChartColorMapping] = useState<string[]>([]);

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
      {chart.values.length > 0 ? (
        <>
          <Chart
            type="bar"
            options={{
              chart: {
                id: `Chart_${chart.chartId}`,
                toolbar: {
                  show: false,
                },
              },
              tooltip: {
                enabled: false,
              },
              plotOptions: {
                bar: {
                  distributed: true,
                  colors: {
                    backgroundBarOpacity: 0,
                  },
                  dataLabels: {
                    position: 'top',
                  },
                },
              },
              colors: chartColorMapping,
              dataLabels: {
                enabled: true,
                offsetY: -25,
                style: {
                  colors: ['#615d67'],
                },
              },
              xaxis: {
                categories: chart.categories,
              },
              legend: {
                show: false,
              },
              annotations: {
                yaxis: [
                  {
                    y: 0,
                    borderColor: '#000',
                    borderWidth: 1,
                    strokeDashArray: 0,
                  },
                ],
              },
            }}
            series={[{ name: 'mtg_data', data: chart.values }]}
            height={chartHeight}
          />

          <div className="chart-update-time">
            <Tag className="time-chip">{CustomFormatDate(chart.lastUpdatedTime)}</Tag>
          </div>
        </>
      ) : (
        <Empty
          className={
            chartHeight === 303
              ? 'empty-chart-xxl'
              : chartHeight === 223
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

export default BarChart;
