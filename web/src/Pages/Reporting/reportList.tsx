import { useEffect, useState } from 'react';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { Button, Col, Row } from 'antd';
import './reportList.scss';
import { DownloadOutlined } from '@ant-design/icons';
import LayoutTable from '../../Components/common/Table/layout.table';
import { useTranslation } from 'react-i18next';
import { ExportFileType } from '../../Enums/shared.enum';
import { ReportFiveRecord, ReportTwelveRecord } from '../../Definitions/reportDefinitions';
import {
  getReportFiveColumns,
  getReportTwelveColumns,
} from '../../Definitions/columns/reportColumns';
import { displayErrorMessage } from '../../Utils/errorMessageHandler';
import {
  exportBarBps,
  exportButtonBps,
  reportTitleBps,
} from '../../Definitions/breakpoints/breakpoints';

const reportList = () => {
  const { post } = useConnection();
  const { t } = useTranslation(['report']);

  // General Page State

  const [loading, setLoading] = useState<boolean>(false);

  // Report Five State

  const [reportFiveData, setReportFiveData] = useState<ReportFiveRecord[]>([]);
  const [reportFiveTotal, setReportFiveTotal] = useState<number>();
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<any>(1);

  // Report Twelve State

  const [reportTwelveData, setReportTwelveData] = useState<ReportTwelveRecord[]>([]);
  const [reportTwelveTotal, setReportTwelveTotal] = useState<number>();
  const [twelvePageSize, setTwelvePageSize] = useState<number>(10);
  const [twelveCurrentPage, setTwelveCurrentPage] = useState<any>(1);

  const getTableFiveData = async () => {
    setLoading(true);
    try {
      const payload: any = { page: currentPage, size: pageSize };

      const response: any = await post('national/reports/tableFive/query', payload);
      if (response) {
        const tempReportFiveData: ReportFiveRecord[] = [];

        response.data.forEach((entry: any, index: number) => {
          tempReportFiveData.push({
            key: index,
            source: entry.source,
            titleOfAction: entry.titleOfAction,
            description: entry.description,
            objective: entry.objective,
            instrumentType: entry.instrumentType ?? [],
            status: entry.status,
            sector: entry.sector,
            ghgsAffected: entry.ghgsAffected ?? [],
            startYear: entry.startYear,
            implementingEntities: entry.implementingEntities ?? [],
            achievedGHGReduction: entry.achievedGHGReduction,
            expectedGHGReduction: entry.expectedGHGReduction,
          });
        });

        setReportFiveData(tempReportFiveData);
        setReportFiveTotal(response.response.data.total);
        setLoading(false);
      }
    } catch (error: any) {
      displayErrorMessage(error);
      setLoading(false);
    }
  };

  const getTableTwelveData = async () => {
    setLoading(true);
    try {
      const payload: any = { page: currentPage, size: pageSize };

      const response: any = await post('national/reports/tableTwelve/query', payload);

      if (response) {
        const tempReportTwelveData: ReportTwelveRecord[] = [];

        response.data.forEach((entry: any, index: number) => {
          tempReportTwelveData.push({
            key: index,
            title: entry.title,
            description: entry.description,
            objective: entry.objective,
            status: entry.projectStatus,
            supportDirection: entry.supportReceivedOrNeeded,
            isEnhancingTransparency: entry.transparency,
            startYear: entry.startYear,
            endYear: entry.endYear,
            fundUsd: entry.receivedAmount,
            fundDomestic: entry.receivedAmountDomestic,
            internationalSupportChannel: entry.internationalSupportChannel,
          });
        });

        setReportTwelveData(tempReportTwelveData);
        setReportTwelveTotal(response.response.data.total);
        setLoading(false);
      }
    } catch (error: any) {
      displayErrorMessage(error);
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: any) => {
    // Setting Pagination
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleTableTwelveChange = (pagination: any) => {
    // Setting Pagination
    setTwelveCurrentPage(pagination.current);
    setTwelvePageSize(pagination.pageSize);
  };

  useEffect(() => {
    getTableFiveData();
  }, [currentPage, pageSize]);

  useEffect(() => {
    getTableTwelveData();
  }, [twelveCurrentPage, twelvePageSize]);

  //Export Report Data

  const downloadReportData = async (exportFileType: string) => {
    setLoading(true);
    try {
      const payload: any = { fileType: exportFileType };
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
      displayErrorMessage(error);
      setLoading(false);
    }
  };

  const reportFiveColumns = getReportFiveColumns(t);
  const reportTwelveColumns = getReportTwelveColumns(t);

  return (
    <div className="content-container report-table5">
      <div className="title-bar">
        <div className="body-title">{t('viewTitle')}</div>
      </div>
      <div className="content-card">
        <Row className="table-actions-section">
          <Col {...reportTitleBps}>
            <div className="action-bar">
              <div className="title">{t('reportFiveTitle')}</div>
            </div>
          </Col>
          <Col {...exportBarBps}>
            <Row gutter={20} className="export-action-row">
              <Col {...exportButtonBps}>
                <Button
                  className="export-button"
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
              </Col>
              <Col {...exportButtonBps}>
                <Button
                  className="export-button"
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
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <div className="action-bar">
              <div className="subTitle">{t('reportFiveSubTitle')}</div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <LayoutTable
              tableData={reportFiveData}
              columns={reportFiveColumns}
              loading={loading}
              pagination={{
                total: reportFiveTotal,
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
      <div className="content-card">
        <Row className="table-actions-section">
          <Col {...reportTitleBps}>
            <div className="action-bar">
              <div className="title">{t('reportTwelveTitle')}</div>
            </div>
          </Col>
          <Col {...exportBarBps}>
            <Row gutter={20} className="export-action-row">
              <Col {...exportButtonBps}>
                <Button
                  className="export-button"
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
              </Col>
              <Col {...exportButtonBps}>
                <Button
                  className="export-button"
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
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <div className="action-bar">
              <div className="subTitle">{t('reportTwelveSubTitle')}</div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <LayoutTable
              tableData={reportTwelveData}
              columns={reportTwelveColumns}
              loading={loading}
              pagination={{
                total: reportTwelveTotal,
                current: twelveCurrentPage,
                pageSize: twelvePageSize,
                showQuickJumper: true,
                pageSizeOptions: ['10', '20', '30'],
                showSizeChanger: true,
                style: { textAlign: 'center' },
                locale: { page: '' },
                position: ['bottomRight'],
              }}
              handleTableChange={handleTableTwelveChange}
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
