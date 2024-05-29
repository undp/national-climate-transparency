import { useEffect, useState } from 'react';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { Button, Col, Row, message } from 'antd';
import './reportList.scss';
import { DownloadOutlined } from '@ant-design/icons';
import LayoutTable from '../../Components/common/Table/layout.table';
import { useTranslation } from 'react-i18next';
import ScrollableList from '../../Components/ScrollableList/scrollableList';
import { ExportFileType } from '../../Enums/shared.enum';

interface Item {
  key: number;
  source: 'action' | 'programme' | 'project';
  actionId: string;
  programmeId: string;
  projectId: string;
  titleOfAction: string;
  titleOfProgramme: string;
  titleOfProject: string;
  description: string;
  objective: string;
  instrumentType: string[];
  status: string;
  sector: string;
  ghgsAffected: string;
  startYear: number;
  implementingEntities: string[];
  achievedGHGReduction: number;
  expectedGHGReduction: number;
}

const reportList = () => {
  const { post } = useConnection();
  const { t } = useTranslation(['reportTableFive', 'tableAction']);

  // General Page State

  const [loading, setLoading] = useState<boolean>(false);

  // Table Data State

  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [tableData, setTableData] = useState<Item[]>([]);
  const [totalRowCount, setTotalRowRowCount] = useState<number>();

  const getTableFiveData = async () => {
    setLoading(true);
    try {
      const payload: any = { page: currentPage, size: pageSize };

      const response: any = await post('national/reports/tableFive/query', payload);
      if (response) {
        const tempReportFiveData: Item[] = [];

        response.data.forEach((entry: any, index: number) => {
          tempReportFiveData.push({
            key: index,
            source: entry.source,
            actionId: entry.actionId,
            programmeId: entry.programmeId,
            projectId: entry.projectId,
            titleOfAction: entry.titleOfAction,
            titleOfProgramme: entry.titleOfProgramme,
            titleOfProject: entry.titleOfProject,
            description: entry.description,
            objective: entry.objective,
            instrumentType: entry.instrumentType,
            status: entry.status,
            sector: entry.sector,
            ghgsAffected: entry.ghgsAffected ?? [],
            startYear: entry.startYear,
            implementingEntities: entry.implementingEntities ?? [],
            achievedGHGReduction: entry.achievedGHGReduction,
            expectedGHGReduction: entry.expectedGHGReduction,
          });
        });

        setTableData(tempReportFiveData);
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

  const handleTableChange = (pagination: any) => {
    // Setting Pagination
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  useEffect(() => {
    getTableFiveData();
  }, [currentPage, pageSize]);

  //Export Report Data

  const downloadReportData = async (exportfileType: string) => {
    setLoading(true);
    try {
      const payload: any = { fileType: exportfileType };
      const response: any = await post('national/reports/tableFive/export', payload);
      if (response && response.data) {
        const url = response.data.url;
        const a = document.createElement('a');
        a.href = url;
        a.download = response.data.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      setLoading(false);
    } catch (error: any) {
      console.log('Error in exporting report data', error);
      message.open({
        type: 'error',
        content: error.message,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      setLoading(false);
    }
  };

  const columns = [
    { title: t('actionId'), dataIndex: 'actionId', key: 'actionId' },
    { title: t('programmeId'), dataIndex: 'programmeId', key: 'programmeId' },
    { title: t('projectId'), dataIndex: 'projectId', key: 'projectId' },
    {
      title: t('titleOfAction'),
      dataIndex: 'titleOfAction',
      key: 'titleOfAction',
    },
    {
      title: t('titleOfProgramme'),
      dataIndex: 'titleOfProgramme',
      key: 'titleOfProgramme',
    },
    {
      title: t('titleOfProject'),
      dataIndex: 'titleOfProject',
      key: 'titleOfProject',
    },
    { title: t('description'), dataIndex: 'description', key: 'description' },
    { title: t('objective'), dataIndex: 'objective', key: 'objective' },
    {
      title: t('instrumentType'),
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: Item) => {
        return <ScrollableList listToShow={record.instrumentType}></ScrollableList>;
      },
    },
    { title: t('status'), dataIndex: 'status', key: 'status' },
    { title: t('sector'), dataIndex: 'sector', key: 'sector' },
    { title: t('ghgsAffected'), dataIndex: 'ghgsAffected', key: 'ghgsAffected' },
    { title: t('startYear'), dataIndex: 'startYear', key: 'startYear' },
    {
      title: t('implementingEntities'),
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: Item) => {
        return <ScrollableList listToShow={record.implementingEntities}></ScrollableList>;
      },
    },
    {
      title: t('achievedGHGReduction'),
      dataIndex: 'achievedGHGReduction',
      key: 'achievedGHGReduction',
    },
    {
      title: t('expectedGHGReduction'),
      dataIndex: 'expectedGHGReduction',
      key: 'expectedGHGReduction',
    },
  ];

  return (
    <div className="content-container report-table5">
      <div className="content-card">
        <Row className="table-actions-section">
          <Col md={5} xs={24}>
            <div className="action-bar">
              <div className="title">{t('title')}</div>
            </div>
          </Col>
          <Col md={4} xs={24}>
            <div className="action-bar">
              <Button
                type="primary"
                size="large"
                block
                icon={<DownloadOutlined />}
                onClick={() => {
                  downloadReportData(ExportFileType.XLSX);
                }}
              >
                {t('exportAsExcel')}
              </Button>
            </div>
          </Col>
          <Col md={4} xs={24}>
            <div className="action-bar">
              <Button
                type="primary"
                size="large"
                block
                icon={<DownloadOutlined />}
                onClick={() => {
                  downloadReportData(ExportFileType.CSV);
                }}
              >
                {t('exportAsCsv')}
              </Button>
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={24}>
            <div className="action-bar">
              <div className="subTitle">{t('subTitle')}</div>
            </div>
          </Col>
        </Row>
        <Row>
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
              emptyMessage="No Report Data Available"
              handleHorizontalOverflow={true}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default reportList;
