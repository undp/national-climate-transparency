import { useEffect, useState } from 'react';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import './reportList.scss';
import { useTranslation } from 'react-i18next';
import {
  ReportFiveRecord,
  ReportTwelveRecord,
} from '../../Definitions/reportIndividualDefinitions';
import {
  getReportFiveColumns,
  getReportTwelveColumns,
} from '../../Definitions/columns/reportColumns';
import { displayErrorMessage } from '../../Utils/errorMessageHandler';
import ReportCard from '../../Components/reportCard/reportCard';
import {
  AggregateReportData,
  AggregateReportTotal,
  AggregateReportCurrentPage,
  AggregateReportPageSize,
} from '../../Definitions/reportBulkDefinitions';
import { ReportType } from '../../Enums/report.enum';
import { Col, Empty, Row, Select, SelectProps, Tag } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
type TagRender = SelectProps['tagRender'];

const reportList = () => {
  const { post } = useConnection();
  const { t } = useTranslation(['report']);

  // General Page State

  const [loading, setLoading] = useState<boolean>(false);

  // Reports to Display

  const [reportsToDisplay, setReportsToDisplay] = useState<ReportType[]>([
    ReportType.FIVE,
    ReportType.TWELVE,
  ]);

  // Bulk Report Definitions

  const [aggregateReportData, setAggregateReportData] = useState<AggregateReportData>({
    [ReportType.FIVE]: [],
    [ReportType.TWELVE]: [],
  });
  const [aggregateReportTotal, setAggregateReportTotal] = useState<AggregateReportTotal>({
    [ReportType.FIVE]: 0,
    [ReportType.TWELVE]: 0,
  });
  const [aggregatePageSize, setAggregatePageSize] = useState<AggregateReportPageSize>({
    [ReportType.FIVE]: 10,
    [ReportType.TWELVE]: 10,
  });
  const [aggregateCurrentPage, setAggregateCurrentPage] = useState<AggregateReportCurrentPage>({
    [ReportType.FIVE]: 1,
    [ReportType.TWELVE]: 1,
  });

  // Functions to Retrieve Tale Data

  const getTableFiveData = async () => {
    setLoading(true);
    try {
      const payload: any = {
        page: aggregateCurrentPage.tableFive,
        size: aggregatePageSize.tableFive,
      };

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

        setAggregateReportData((prevState) => ({
          ...prevState,
          [ReportType.FIVE]: tempReportFiveData,
        }));

        setAggregateReportTotal((prevState) => ({
          ...prevState,
          [ReportType.FIVE]: response.response.data.total,
        }));

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
      const payload: any = {
        page: aggregateCurrentPage.tableTwelve,
        size: aggregatePageSize.tableTwelve,
      };

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
            internationalSupportChannel:
              entry.internationalSupportChannel?.split(',').map((item: string) => item.trim()) ??
              [],
          });
        });

        setAggregateReportData((prevState) => ({
          ...prevState,
          [ReportType.TWELVE]: tempReportTwelveData,
        }));

        setAggregateReportTotal((prevState) => ({
          ...prevState,
          [ReportType.TWELVE]: response.response.data.total,
        }));

        setLoading(false);
      }
    } catch (error: any) {
      displayErrorMessage(error);
      setLoading(false);
    }
  };

  // Function to Export Report Data

  const downloadReportData = async (exportFileType: string, whichTable: ReportType) => {
    try {
      const payload: any = { fileType: exportFileType };
      const response: any = await post(`national/reports/${whichTable}/export`, payload);
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
    } catch (error: any) {
      displayErrorMessage(error);
    }
  };

  // Function to Retrieve Column Definitions

  const getReportColumns = (reportType: ReportType) => {
    switch (reportType) {
      case ReportType.FIVE:
        return getReportFiveColumns(t);
      case ReportType.TWELVE:
        return getReportTwelveColumns(t);
    }
  };

  // Function to Handle Table wise Pagination

  const handleTablePagination = (pagination: any, whichReport: ReportType) => {
    setAggregateCurrentPage((prevState) => ({
      ...prevState,
      [whichReport]: pagination.current,
    }));

    setAggregatePageSize((prevState) => ({
      ...prevState,
      [whichReport]: pagination.pageSize,
    }));
  };

  // Updating the Table Data when the Pagination changes

  useEffect(() => {
    getTableFiveData();
  }, [aggregateCurrentPage?.tableFive, aggregatePageSize?.tableFive]);

  useEffect(() => {
    getTableTwelveData();
  }, [aggregateCurrentPage?.tableTwelve, aggregatePageSize?.tableTwelve]);

  const tagRender: TagRender = (props) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        className="report-chip"
      >
        <label className="report-label">{label}</label>
      </Tag>
    );
  };

  const handleReportSelection = (value: any) => {
    setReportsToDisplay(value);
  };

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('viewTitle')}</div>
      </div>
      <div className="select-report-bar">
        <Row gutter={20}>
          <Col span={24}>
            <Select
              className="report-selector"
              mode="multiple"
              value={reportsToDisplay}
              tagRender={tagRender}
              size="large"
              showSearch={false}
              placeholder={
                <label className="placeholder-label">
                  {'Click to select the Reports to display'}
                </label>
              }
              onChange={handleReportSelection}
              suffixIcon={<CloseCircleOutlined />}
            >
              {Object.values(ReportType).map((report) => (
                <Option key={report} value={report}>
                  {t(`${report}Title`)}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>
      {reportsToDisplay.length > 0 ? (
        <div>
          {reportsToDisplay.map((report) => (
            <ReportCard
              key={`Report_card_${report}`}
              loading={loading}
              whichReport={report}
              reportTitle={t(`${report}Title`)}
              reportSubtitle={t(`${report}SubTitle`)}
              reportData={aggregateReportData[report]}
              columns={getReportColumns(report)}
              totalEntries={aggregateReportTotal[report] ?? 0}
              currentPage={aggregateCurrentPage[report]}
              pageSize={aggregatePageSize[report]}
              exportButtonNames={[t('exportAsExcel'), t('exportAsCsv')]}
              downloadReportData={downloadReportData}
              handleTablePagination={handleTablePagination}
            ></ReportCard>
          ))}
        </div>
      ) : (
        <div className="no-reports-selected">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No Reports Selected'} />
        </div>
      )}
    </div>
  );
};

export default reportList;
