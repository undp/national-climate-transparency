import { Col, Empty, Row, Select, Spin, Tag, message } from 'antd';
import './dashboard.scss';
import { InfoCircleOutlined } from '@ant-design/icons';
import ChartInformation from '../../Components/Popups/chartInformation';
import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import {
  ChartData,
  DashboardActionItem,
  PieChartData,
} from '../../Definitions/dashboard.definitions';
import LayoutTable from '../../Components/common/Table/layout.table';
import { useTranslation } from 'react-i18next';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { CustomFormatDate, DashboardTotalFormatter, getArraySum } from '../../Utils/utilServices';
import { getActionTableColumns } from '../../Definitions/columns/actionColumns';

const { Option } = Select;

const Dashboard = () => {
  // Context Information

  const { t } = useTranslation(['dashboard', 'actionList']);
  const { get, post, statServerUrl } = useConnection();

  const [loading, setLoading] = useState<boolean>(false);
  const [chartLoading, setChartLoading] = useState<boolean>(false);

  // Table Data State

  const [tableData, setTableData] = useState<DashboardActionItem[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [totalRowCount, setTotalRowRowCount] = useState<number>();

  // Chart State
  const [openChartInfo, setOpenChartInfo] = useState<boolean>(false);
  const [chartContent, setChartContent] = useState<{ title: string; body: string }>();
  const [chartData, setChartData] = useState<PieChartData[]>([]);

  // Year State for the GHG MYG Chart 5

  const [mtgYear, setMtgYear] = useState<number>(2015);

  // Individual Chart Data

  const [actionChart, setActionChart] = useState<ChartData>();
  const [projectChart, setProjectChart] = useState<ChartData>();
  const [supportChart, setSupportChart] = useState<ChartData>();
  const [financeChart, setFinanceChart] = useState<ChartData>();
  const [mitigationRecentChart, setMitigationRecentChart] = useState<ChartData>();
  const [mitigationIndividualChart, setMitigationIndividualChart] = useState<ChartData>();

  // Year List to be shown in the Year Selector in Chart 5

  const yearsList: number[] = [];

  for (let year = 2015; year <= 2050; year++) {
    yearsList.push(year);
  }

  // BE Call to fetch Action Data

  const getAllData = async () => {
    setLoading(true);
    try {
      const payload: any = { page: currentPage, size: pageSize };

      // Adding Sort By Conditions

      payload.sort = {
        key: 'actionId',
        order: 'DESC',
      };

      const response: any = await post('national/actions/query', payload);
      if (response) {
        const unstructuredData: any[] = response.data;
        const structuredData: DashboardActionItem[] = [];
        for (let i = 0; i < unstructuredData.length; i++) {
          structuredData.push({
            key: i,
            actionId: unstructuredData[i].actionId,
            title: unstructuredData[i].title,
            status: unstructuredData[i].status,
            actionType: unstructuredData[i].migratedData[0]?.types ?? [],
            affectedSectors: unstructuredData[i].sector,
            nationalImplementingEntity: unstructuredData[i].migratedData[0]?.natImplementors ?? [],
            financeNeeded: unstructuredData[i].migratedData[0]?.financeNeeded ?? 0,
            financeReceived: unstructuredData[i].migratedData[0]?.financeReceived ?? 0,
          });
        }
        setTableData(structuredData);
        setTotalRowRowCount(response.response.data.total);
        setLoading(false);
      }
    } catch (error: any) {
      message.open({
        type: 'error',
        content: error.message,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      setLoading(false);
    }
  };

  // Data Fetching for GHG MTG Selected Year

  useEffect(() => {
    const getIndividualMitigationChartData = async () => {
      if (mtgYear) {
        const response: any = await get(
          `stats/analytics/ghgMitigationSummaryForYear/${mtgYear}`,
          undefined,
          statServerUrl
        );
        const mitigationIndividualChartData = response.data;
        setMitigationIndividualChart({
          labels: mitigationIndividualChartData.stats.sectors.map((sector: string) =>
            sector === null ? 'No Sector Attached' : sector
          ),
          count: mitigationIndividualChartData.stats.totals.map((count: string) =>
            parseInt(count, 10)
          ),
          updatedTime: mitigationIndividualChartData.lastUpdate,
        });
      }
    };
    getIndividualMitigationChartData();
  }, [mtgYear]);

  // Data Fetching at the Initial Loading

  useEffect(() => {
    setChartLoading(true);

    const getClimateActionChartData = async () => {
      const response: any = await get('stats/analytics/actionsSummery', undefined, statServerUrl);
      const actionChartData = response.data;
      setActionChart({
        labels: actionChartData.stats.sectors,
        count: actionChartData.stats.counts.map((count: string) => parseInt(count, 10)),
        updatedTime: actionChartData.lastUpdate,
      });
    };
    getClimateActionChartData();

    const getProjectChartData = async () => {
      const response: any = await get('stats/analytics/projectSummary', undefined, statServerUrl);
      const projectChartData = response.data;
      setProjectChart({
        labels: projectChartData.stats.sectors.map((sector: string) =>
          sector === null ? 'No Sector Attached' : sector
        ),
        count: projectChartData.stats.counts.map((count: string) => parseInt(count, 10)),
        updatedTime: projectChartData.lastUpdate,
      });
    };
    getProjectChartData();

    const getSupportChartData = async () => {
      const response: any = await get('stats/analytics/supportSummary', undefined, statServerUrl);
      const supportChartData = response.data;
      setSupportChart({
        labels: ['Support Received', 'Support Needed'],
        count: [
          supportChartData.stats.supportReceivedActivities,
          supportChartData.stats.supportNeededActivities,
        ],
        updatedTime: supportChartData.lastUpdate,
      });
    };
    getSupportChartData();

    const getFinanceChartData = async () => {
      const response: any = await get(
        'stats/analytics/supportFinanceSummary',
        undefined,
        statServerUrl
      );
      const supportChartData = response.data;
      setFinanceChart({
        labels: ['Support Received', 'Support Needed'],
        count: [supportChartData.stats.supportReceived, supportChartData.stats.supportNeeded],
        updatedTime: supportChartData.lastUpdate,
      });
    };
    getFinanceChartData();

    const getRecentMitigationChartData = async () => {
      const response: any = await get(
        'stats/analytics/getGhgMitigationSummary',
        undefined,
        statServerUrl
      );
      const mitigationIndividualChartData = response.data;
      setMitigationRecentChart({
        labels: mitigationIndividualChartData.stats.sectors.map((sector: string) =>
          sector === null ? 'No Sector Attached' : sector
        ),
        count: mitigationIndividualChartData.stats.totals.map((count: string) =>
          parseInt(count, 10)
        ),
        updatedTime: mitigationIndividualChartData.lastUpdate,
      });
    };
    getRecentMitigationChartData();

    setChartLoading(false);

    getAllData();
  }, []);

  // Updating the Chart Rendering Array when data fetching completes

  useEffect(() => {
    const tempChartData: PieChartData[] = [];

    if (actionChart) {
      tempChartData.push({
        chartId: 1,
        chartTitle: t('actionChartTitle'),
        chartDescription: t('actionChartDescription'),
        categories: actionChart.labels,
        values: actionChart.count,
        total: getArraySum(actionChart.count),
        lastUpdatedTime: actionChart.updatedTime,
      });
    }

    if (projectChart) {
      tempChartData.push({
        chartId: 2,
        chartTitle: t('projectChartTitle'),
        chartDescription: t('projectChartDescription'),
        categories: projectChart.labels,
        values: projectChart.count,
        total: getArraySum(projectChart.count),
        lastUpdatedTime: projectChart.updatedTime,
      });
    }

    if (supportChart) {
      tempChartData.push({
        chartId: 3,
        chartTitle: t('supportChartTitle'),
        chartDescription: t('supportChartDescription'),
        categories: supportChart.labels,
        values: supportChart.count,
        total: getArraySum(supportChart.count),
        lastUpdatedTime: supportChart.updatedTime,
      });
    }

    if (financeChart) {
      tempChartData.push({
        chartId: 4,
        chartTitle: t('financeChartTitle'),
        chartDescription: t('financeChartDescription'),
        categories: financeChart.labels,
        values: financeChart.count,
        total: getArraySum(financeChart.count),
        lastUpdatedTime: financeChart.updatedTime,
      });
    }

    if (mitigationIndividualChart) {
      tempChartData.push({
        chartId: 5,
        chartTitle: t('mtgIndividualChartTitle'),
        chartDescription: t('mtgIndividualChartDescription'),
        categories: mitigationIndividualChart.labels,
        values: mitigationIndividualChart.count,
        total: getArraySum(mitigationIndividualChart.count),
        lastUpdatedTime: mitigationIndividualChart.updatedTime,
      });
    }

    if (mitigationRecentChart) {
      tempChartData.push({
        chartId: 6,
        chartTitle: t('mtgRecentChartTitle'),
        chartDescription: t('mtgRecentChartDescription'),
        categories: mitigationRecentChart.labels,
        values: mitigationRecentChart.count,
        total: getArraySum(mitigationRecentChart.count),
        lastUpdatedTime: mitigationRecentChart.updatedTime,
      });
    }

    setChartData(tempChartData);
  }, [
    actionChart,
    projectChart,
    supportChart,
    financeChart,
    mitigationIndividualChart,
    mitigationRecentChart,
  ]);

  // Action List Table Columns

  const columns = getActionTableColumns(t);

  // Handling Table Pagination and Sorting Changes

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    // Setting Pagination
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <div className="dashboard-page">
      {!chartLoading ? (
        <div>
          <ChartInformation
            open={openChartInfo}
            setOpen={setOpenChartInfo}
            content={chartContent}
          ></ChartInformation>
          <Row gutter={30}>
            {chartData.map((chart: PieChartData, index: number) => (
              <Col key={index} className="gutter-row" span={12}>
                <div className="chart-section-card">
                  <div className="chart-title">
                    <Row gutter={30}>
                      <Col span={17}>{chart.chartTitle}</Col>
                      <Col span={5} style={{ display: 'flex', alignItems: 'flex-end' }}>
                        {chart.chartId === 5 && (
                          <Select
                            size="small"
                            style={{ fontSize: '13px' }}
                            defaultValue={mtgYear}
                            showSearch
                            onChange={(value) => {
                              setMtgYear(value);
                            }}
                          >
                            {yearsList.map((year) => (
                              <Option key={year} value={year}>
                                {year}
                              </Option>
                            ))}
                          </Select>
                        )}
                      </Col>
                      <Col span={2}>
                        <InfoCircleOutlined
                          onClick={() => {
                            setChartContent({
                              title: chart.chartTitle,
                              body: chart.chartDescription,
                            });
                            setOpenChartInfo(true);
                          }}
                        />
                      </Col>
                    </Row>
                  </div>
                  {chart.total > 0 ? (
                    <>
                      <Chart
                        key={index}
                        type="donut"
                        options={{
                          labels: chart.categories.map((category) =>
                            category.length > 16 ? `${category.slice(0, 16)}...` : category
                          ),
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
                                  total: {
                                    show: true,
                                    label: 'Total',
                                    formatter: () =>
                                      DashboardTotalFormatter(
                                        chart.total,
                                        [4].includes(chart.chartId)
                                      ),
                                  },
                                },
                              },
                            },
                          },
                        }}
                        series={chart.values}
                        height={250}
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
              </Col>
            ))}
          </Row>{' '}
        </div>
      ) : (
        <div className="loading-charts-spinner">
          <Spin size="large" />
        </div>
      )}
      <Row gutter={30}>
        <Col span={24}>
          <LayoutTable
            tableData={tableData}
            columns={columns}
            loading={loading}
            pagination={{
              total: totalRowCount,
              current: currentPage,
              pageSize: pageSize,
              showQuickJumper: true,
              pageSizeOptions: ['10', '20', '30'],
              showSizeChanger: true,
              style: { textAlign: 'center' },
              locale: { page: '' },
              position: ['bottomRight'],
            }}
            handleTableChange={handleTableChange}
            emptyMessage="No Actions Available"
          />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
