import { Col, Grid, Row, Select, Spin, Tag } from 'antd';
import './dashboard.scss';
import { InfoCircleOutlined } from '@ant-design/icons';
import ChartInformation from '../../Components/Popups/chartInformation';
import { useEffect, useState } from 'react';
import { DashboardActionItem, PieChartData } from '../../Definitions/dashboard.definitions';
import LayoutTable from '../../Components/common/Table/layout.table';
import { useTranslation } from 'react-i18next';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';

import { getActionTableColumns } from '../../Definitions/columns/actionColumns';
import PieChart from '../../Components/Charts/PieChart/pieChart';
import { dashboardHalfColumnBps } from '../../Definitions/breakpoints/breakpoints';
import { displayErrorMessage } from '../../Utils/errorMessageHandler';

const { Option } = Select;
const { useBreakpoint } = Grid;

const Dashboard = () => {
  // Context Information

  const { t } = useTranslation(['dashboard', 'actionList', 'columnHeader']);
  const screens = useBreakpoint();
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

  // Year State for the GHG MYG Chart 5

  const [mtgYear, setMtgYear] = useState<number>(2015);

  // Individual Chart Data

  const [chartWidth, setChartWidth] = useState<number>(450);
  const [actionChart, setActionChart] = useState<PieChartData>();
  const [projectChart, setProjectChart] = useState<PieChartData>();
  const [supportChart, setSupportChart] = useState<PieChartData>();
  const [financeChart, setFinanceChart] = useState<PieChartData>();
  const [mitigationRecentChart, setMitigationRecentChart] = useState<PieChartData>();
  const [mitigationIndividualChart, setMitigationIndividualChart] = useState<PieChartData>();

  // Year List to be shown in the Year Selector in Chart 5

  const yearsList: number[] = [];

  for (let year = 2015; year <= 2050; year++) {
    yearsList.push(year);
  }

  // Setting the chart Width

  useEffect(() => {
    if (screens.xxl) {
      setChartWidth(560);
    } else if (screens.xl) {
      setChartWidth(480);
    } else if (screens.lg) {
      setChartWidth(550);
    } else {
      setChartWidth(450);
    }
  }, [screens]);

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
            financeNeeded: Math.round(unstructuredData[i].migratedData[0]?.financeNeeded ?? 0),
            financeReceived: Math.round(unstructuredData[i].migratedData[0]?.financeReceived ?? 0),
          });
        }
        setTableData(structuredData);
        setTotalRowRowCount(response.response.data.total);
        setLoading(false);
      }
    } catch (error: any) {
      displayErrorMessage(error);
      setLoading(false);
    }
  };

  // Data Fetching for GHG MTG Selected Year

  useEffect(() => {
    const getIndividualMitigationChartData = async () => {
      if (mtgYear) {
        try {
          const response: any = await get(
            `stats/analytics/ghgMitigationSummaryForYear/${mtgYear}`,
            undefined,
            statServerUrl
          );
          const mitigationIndividualChartData = response.data;
          setMitigationIndividualChart({
            chartId: 5,
            chartTitle: t('mtgIndividualChartTitle'),
            chartDescription: t('mtgIndividualChartDescription'),
            categories: mitigationIndividualChartData.stats.sectors.map((sector: string) =>
              sector === null ? 'No Sector Attached' : sector
            ),
            values: mitigationIndividualChartData.stats.totals.map((count: string) =>
              parseInt(count, 10)
            ),
            lastUpdatedTime: mitigationIndividualChartData.lastUpdate,
          });
        } catch (error: any) {
          displayErrorMessage(error);
        }
      }
    };
    getIndividualMitigationChartData();
  }, [mtgYear]);

  // Data Fetching at the Initial Loading

  useEffect(() => {
    setChartLoading(true);

    const getClimateActionChartData = async () => {
      try {
        const response: any = await get('stats/analytics/actionsSummery', undefined, statServerUrl);
        const actionChartData = response.data;
        setActionChart({
          chartId: 1,
          chartTitle: t('actionChartTitle'),
          chartDescription: t('actionChartDescription'),
          categories: actionChartData.stats.sectors,
          values: actionChartData.stats.counts.map((count: string) => parseInt(count, 10)),
          lastUpdatedTime: actionChartData.lastUpdate,
        });
      } catch (error: any) {
        displayErrorMessage(error);
      }
    };
    getClimateActionChartData();

    const getProjectChartData = async () => {
      try {
        const response: any = await get('stats/analytics/projectSummary', undefined, statServerUrl);
        const projectChartData = response.data;
        setProjectChart({
          chartId: 2,
          chartTitle: t('projectChartTitle'),
          chartDescription: t('projectChartDescription'),
          categories: projectChartData.stats.sectors.map((sector: string) =>
            sector === null ? 'No Sector Attached' : sector
          ),
          values: projectChartData.stats.counts.map((count: string) => parseInt(count, 10)),
          lastUpdatedTime: projectChartData.lastUpdate,
        });
      } catch (error: any) {
        displayErrorMessage(error);
      }
    };
    getProjectChartData();

    const getSupportChartData = async () => {
      try {
        const response: any = await get('stats/analytics/supportSummary', undefined, statServerUrl);
        const supportChartData = response.data;
        setSupportChart({
          chartId: 3,
          chartTitle: t('supportChartTitle'),
          chartDescription: t('supportChartDescription'),
          categories: ['Support Received', 'Support Needed'],
          values: [
            supportChartData.stats.supportReceivedActivities,
            supportChartData.stats.supportNeededActivities,
          ],
          lastUpdatedTime: supportChartData.lastUpdate,
        });
      } catch (error: any) {
        displayErrorMessage(error);
      }
    };
    getSupportChartData();

    const getFinanceChartData = async () => {
      try {
        const response: any = await get(
          'stats/analytics/supportFinanceSummary',
          undefined,
          statServerUrl
        );
        const financeChartData = response.data;
        setFinanceChart({
          chartId: 4,
          chartTitle: t('financeChartTitle'),
          chartDescription: t('financeChartDescription'),
          categories: ['Support Received', 'Support Needed'],
          values: [financeChartData.stats.supportReceived, financeChartData.stats.supportNeeded],
          lastUpdatedTime: financeChartData.lastUpdate,
        });
      } catch (error: any) {
        displayErrorMessage(error);
      }
    };
    getFinanceChartData();

    const getRecentMitigationChartData = async () => {
      try {
        const response: any = await get(
          'stats/analytics/getGhgMitigationSummary',
          undefined,
          statServerUrl
        );
        const mitigationIndividualChartData = response.data;
        setMitigationRecentChart({
          chartId: 6,
          chartTitle: t('mtgRecentChartTitle'),
          chartDescription: t('mtgRecentChartDescription'),
          categories: mitigationIndividualChartData.stats.sectors.map((sector: string) =>
            sector === null ? 'No Sector Attached' : sector
          ),
          values: mitigationIndividualChartData.stats.totals.map((count: string) =>
            parseInt(count, 10)
          ),
          lastUpdatedTime: mitigationIndividualChartData.lastUpdate,
        });
      } catch (error: any) {
        displayErrorMessage(error);
      }
    };
    getRecentMitigationChartData();

    setChartLoading(false);
  }, []);

  useEffect(() => {
    getAllData();
  }, [currentPage, pageSize]);

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
            {actionChart && (
              <Col key={'chart_1'} className="gutter-row" {...dashboardHalfColumnBps}>
                <div className="chart-section-card">
                  <div className="chart-title">
                    <Row gutter={30}>
                      <Col span={22}>{actionChart.chartTitle}</Col>
                      <Col span={2}>
                        <InfoCircleOutlined
                          onClick={() => {
                            setChartContent({
                              title: actionChart.chartTitle,
                              body: actionChart.chartDescription,
                            });
                            setOpenChartInfo(true);
                          }}
                        />
                      </Col>
                    </Row>
                  </div>
                  <PieChart chart={actionChart} t={t} chartWidth={chartWidth}></PieChart>
                </div>
              </Col>
            )}
            {projectChart && (
              <Col key={'chart_2'} className="gutter-row" {...dashboardHalfColumnBps}>
                <div className="chart-section-card">
                  <div className="chart-title">
                    <Row gutter={30}>
                      <Col span={22}>{projectChart.chartTitle}</Col>
                      <Col span={2}>
                        <InfoCircleOutlined
                          onClick={() => {
                            setChartContent({
                              title: projectChart.chartTitle,
                              body: projectChart.chartDescription,
                            });
                            setOpenChartInfo(true);
                          }}
                        />
                      </Col>
                    </Row>
                  </div>
                  <PieChart chart={projectChart} t={t} chartWidth={chartWidth}></PieChart>
                </div>
              </Col>
            )}
            {supportChart && (
              <Col key={'chart_3'} className="gutter-row" {...dashboardHalfColumnBps}>
                <div className="chart-section-card">
                  <div className="chart-title">
                    <Row gutter={30}>
                      <Col span={22}>{supportChart.chartTitle}</Col>
                      <Col span={2}>
                        <InfoCircleOutlined
                          onClick={() => {
                            setChartContent({
                              title: supportChart.chartTitle,
                              body: supportChart.chartDescription,
                            });
                            setOpenChartInfo(true);
                          }}
                        />
                      </Col>
                    </Row>
                  </div>
                  <PieChart chart={supportChart} t={t} chartWidth={chartWidth}></PieChart>
                </div>
              </Col>
            )}
            {financeChart && (
              <Col key={'chart_4'} className="gutter-row" {...dashboardHalfColumnBps}>
                <div className="chart-section-card">
                  <div className="chart-title">
                    <Row gutter={30}>
                      <Col span={22}>{financeChart.chartTitle}</Col>
                      <Col span={2}>
                        <InfoCircleOutlined
                          onClick={() => {
                            setChartContent({
                              title: financeChart.chartTitle,
                              body: financeChart.chartDescription,
                            });
                            setOpenChartInfo(true);
                          }}
                        />
                      </Col>
                    </Row>
                  </div>
                  <PieChart chart={financeChart} t={t} chartWidth={chartWidth}></PieChart>
                </div>
              </Col>
            )}
            {mitigationIndividualChart && (
              <Col key={'chart_5'} className="gutter-row" {...dashboardHalfColumnBps}>
                <div className="chart-section-card">
                  <div className="chart-title">
                    <Row gutter={30}>
                      <Col span={17}>{mitigationIndividualChart.chartTitle}</Col>
                      <Col span={5} style={{ display: 'flex', alignItems: 'flex-end' }}>
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
                      </Col>
                      <Col span={2}>
                        <InfoCircleOutlined
                          onClick={() => {
                            setChartContent({
                              title: mitigationIndividualChart.chartTitle,
                              body: mitigationIndividualChart.chartDescription,
                            });
                            setOpenChartInfo(true);
                          }}
                        />
                      </Col>
                    </Row>
                  </div>
                  <PieChart
                    chart={mitigationIndividualChart}
                    t={t}
                    chartWidth={chartWidth}
                  ></PieChart>
                </div>
              </Col>
            )}
            {mitigationRecentChart && (
              <Col key={'chart_6'} className="gutter-row" {...dashboardHalfColumnBps}>
                <div className="chart-section-card">
                  <div className="chart-title">
                    <Row gutter={30}>
                      <Col span={17}>{mitigationRecentChart.chartTitle}</Col>
                      <Col span={5} style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Tag className="year-chip">{t('2023')}</Tag>
                      </Col>
                      <Col span={2}>
                        <InfoCircleOutlined
                          onClick={() => {
                            setChartContent({
                              title: mitigationRecentChart.chartTitle,
                              body: mitigationRecentChart.chartDescription,
                            });
                            setOpenChartInfo(true);
                          }}
                        />
                      </Col>
                    </Row>
                  </div>
                  <PieChart chart={mitigationRecentChart} t={t} chartWidth={chartWidth}></PieChart>
                </div>
              </Col>
            )}
          </Row>
        </div>
      ) : (
        <div className="loading-charts-spinner">
          <Spin size="large" />
        </div>
      )}
      <div className="content-card">
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
    </div>
  );
};

export default Dashboard;
