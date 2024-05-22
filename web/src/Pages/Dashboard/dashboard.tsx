import { Col, Row, Tag, message } from 'antd';
import './dashboard.scss';
import { InfoCircleOutlined } from '@ant-design/icons';
import ChartInformation from '../../Components/Popups/chartInformation';
import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { PieChartData } from '../../Definitions/dashboard.definitions';
import LayoutTable from '../../Components/common/Table/layout.table';
import ScrollableList from '../../Components/ScrollableList/scrollableList';
import { useTranslation } from 'react-i18next';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { CustomFormatDate } from '../../Utils/utilServices';

interface Item {
  key: number;
  actionId: number;
  title: string;
  actionType: string;
  affectedSectors: string[];
  financeNeeded: number;
  financeReceived: number;
  status: string;
  validationStatus: string;
  nationalImplementingEntity: string[];
}

const Dashboard = () => {
  const { t } = useTranslation(['actionList', 'tableAction']);
  const { get, post, statServerUrl } = useConnection();

  const [loading, setLoading] = useState<boolean>(false);
  // Table Data State

  const [tableData, setTableData] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [totalRowCount, setTotalRowRowCount] = useState<number>();

  // Chart State
  const [openChartInfo, setOpenChartInfo] = useState<boolean>(false);
  const [chartContent, setChartContent] = useState<{ title: string; body: string }>({
    title: '',
    body: '',
  });
  const [chartData, setChartData] = useState<PieChartData[]>([]);
  const [actionChart, setActionChart] = useState<{
    labels: string[];
    count: number[];
    updatedTime: number;
  }>();
  const [projectChart, setProjectChart] = useState<{
    labels: string[];
    count: number[];
    updatedTime: number;
  }>();

  const getAllData = async () => {
    setLoading(true);
    try {
      const payload: any = { page: currentPage, size: pageSize };

      // Adding Sort By Conditions

      payload.sort = {
        key: 'actionId',
        order: 'DESC',
      };

      // Adding Filter Conditions

      // if (appliedFilterValue.statusFilter !== 'All') {
      //   payload.filterAnd = [];
      //   payload.filterAnd.push({
      //     key: 'status',
      //     operation: '=',
      //     value: appliedFilterValue.statusFilter,
      //   });
      // }

      // if (appliedFilterValue.validationFilter !== 'All') {
      //   if (!payload.hasOwnProperty('filterAnd')) {
      //     payload.filterAnd = [];
      //   }
      //   payload.filterAnd.push({
      //     key: 'validated',
      //     operation: '=',
      //     value: appliedFilterValue.validationFilter === 'Validated' ? true : false,
      //   });
      // }

      // if (searchValue !== '') {
      //   if (!payload.hasOwnProperty('filterAnd')) {
      //     payload.filterAnd = [];
      //   }
      //   payload.filterAnd.push({
      //     key: appliedFilterValue.searchBy,
      //     operation: 'LIKE',
      //     value: `%${searchValue}%`,
      //   });
      // }

      const response: any = await post('national/actions/query', payload);
      if (response) {
        const unstructuredData: any[] = response.data;
        const structuredData: Item[] = [];
        for (let i = 0; i < unstructuredData.length; i++) {
          structuredData.push({
            key: i,
            actionId: unstructuredData[i].actionId,
            title: unstructuredData[i].title,
            status: unstructuredData[i].status,
            validationStatus: unstructuredData[i].validated ? 'validated' : 'pending',
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

  useEffect(() => {
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
      const actionChartData = response.data;
      setProjectChart({
        labels: actionChartData.stats.sectors.map((sector: string) =>
          sector === null ? 'No Sector Attached' : sector
        ),
        count: actionChartData.stats.counts.map((count: string) => parseInt(count, 10)),
        updatedTime: actionChartData.lastUpdate,
      });
    };
    getProjectChartData();

    getAllData();
  }, []);

  useEffect(() => {
    const tempChartData: PieChartData[] = [];

    if (actionChart) {
      tempChartData.push({
        chartTitle: 'Climate Action',
        chartDescription: 'Climate Action Description',
        categories: actionChart.labels,
        values: actionChart.count,
        lastUpdatedTime: actionChart.updatedTime,
      });
    }

    if (projectChart) {
      tempChartData.push({
        chartTitle: 'Projects',
        chartDescription: 'Climate Projects Description',
        categories: projectChart.labels,
        values: projectChart.count,
        lastUpdatedTime: projectChart.updatedTime,
      });
    }
    setChartData(tempChartData);
  }, [actionChart, projectChart]);

  // Action List Table Columns

  const columns = [
    { title: t('actionId'), width: 100, dataIndex: 'actionId', key: 'actionId', sorter: false },
    { title: t('titleOfAction'), width: 120, dataIndex: 'title', key: 'title', sorter: false },
    {
      title: t('actionType'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.actionType}></ScrollableList>;
      },
    },
    {
      title: t('sectorAffected'),
      width: 120,
      dataIndex: 'affectedSectors',
      key: 'affectedSectors',
      sorter: false,
    },
    { title: t('actionStatus'), width: 120, dataIndex: 'status', key: 'status', sorter: false },
    {
      title: t('nationalImplementingEntity'),
      width: 180,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.nationalImplementingEntity}></ScrollableList>;
      },
    },
    {
      title: t('financeNeeded'),
      width: 120,
      dataIndex: 'financeNeeded',
      key: 'financeNeeded',
      sorter: false,
    },
    {
      title: t('financeReceived'),
      width: 130,
      dataIndex: 'financeReceived',
      key: 'financeReceived',
      sorter: false,
    },
  ];

  // Handling Table Pagination and Sorting Changes

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    // Setting Pagination
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

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
              <div className="chart-update-time">
                <Tag className="time-chip">{CustomFormatDate(chart.lastUpdatedTime)}</Tag>
              </div>
            </div>
          </Col>
        ))}
      </Row>
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
