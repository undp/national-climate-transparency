import { useEffect, useState } from 'react';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import './reportList.scss';
import { useTranslation } from 'react-i18next';
import {
  ReportElevenRecord,
  ReportFiveRecord,
  ReportSevenRecord,
  ReportSixRecord,
  ReportTenRecord,
  ReportThirteenRecord,
  ReportTwelveRecord,
} from '../../Definitions/reportIndividualDefinitions';
import {
  getReportFiveColumns,
  getReportSixColumns,
  getReportSevenColumns,
  getReportTenColumns,
  getReportElevenColumns,
  getReportTwelveColumns,
  getReportThirteenColumns,
} from '../../Definitions/columns/reportColumns';
import { displayErrorMessage } from '../../Utils/errorMessageHandler';
import ReportCard from '../../Components/reportCard/reportCard';
import {
  AggregateReportData,
  AggregateReportTotal,
  AggregateReportCurrentPage,
  AggregateReportPageSize,
  initialAggData,
  initialAggTotal,
  initialAggPageSize,
  initialAggCurrentPage,
} from '../../Definitions/reportBulkDefinitions';
import { ReportType } from '../../Enums/report.enum';
import { Col, Empty, Row, Select, SelectProps, Tag } from 'antd';

const { Option } = Select;
type TagRender = SelectProps['tagRender'];

const reportList = () => {
  const { post } = useConnection();
  const { t } = useTranslation(['report']);

  // General Page State

  const [loading, setLoading] = useState<boolean>(false);

  // Reports to Display

  const [reportsToDisplay, setReportsToDisplay] = useState<ReportType[]>([
    ReportType.SIX,
    ReportType.SEVEN,
  ]);

  // Bulk Report Definitions

  const [aggregateReportData, setAggregateReportData] =
    useState<AggregateReportData>(initialAggData);
  const [aggregateReportTotal, setAggregateReportTotal] =
    useState<AggregateReportTotal>(initialAggTotal);
  const [aggregatePageSize, setAggregatePageSize] =
    useState<AggregateReportPageSize>(initialAggPageSize);
  const [aggregateCurrentPage, setAggregateCurrentPage] =
    useState<AggregateReportCurrentPage>(initialAggCurrentPage);

  // Functions to Retrieve Tale Data

  const getTableFiveData = async () => {
    setLoading(true);
    try {
      const payload: any = {
        page: aggregateCurrentPage[5],
        size: aggregatePageSize[5],
      };

      const response: any = await post('national/reports/5/query', payload);
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

  const getTableSixData = async () => {
    setLoading(true);
    try {
      const payload: any = {
        page: aggregateCurrentPage[6],
        size: aggregatePageSize[6],
      };

      const response: any = await post('national/reports/6/query', payload);
      if (response) {
        const tempReportSixData: ReportSixRecord[] = [];

        response.data.forEach((entry: any, index: number) => {
          tempReportSixData.push({
            key: index,
            title: entry.title,
            description: entry.description,
            objective: entry.objective,
            sector: entry.sector,
            subSectors: entry.subSectors ?? [],
            type: entry.type,
            natAnchor: entry.anchoredInNationalStrategy,
            techDevelopment: entry.techDevelopment,
            capacityBuilding: entry.capacityBuilding,
            startYear: entry.startYear,
            endYear: entry.endYear,
            internationalSupportChannel: entry.internationalSupportChannel ?? [],
            supportDirection: entry.supportReceivedOrNeeded,
            receivedAmount: entry.receivedAmount,
            receivedAmountDomestic: entry.receivedAmountDomestic,
            financialInstrument: entry.financialInstrument,
          });
        });

        setAggregateReportData((prevState) => ({
          ...prevState,
          [ReportType.SIX]: tempReportSixData,
        }));

        setAggregateReportTotal((prevState) => ({
          ...prevState,
          [ReportType.SIX]: response.response.data.total,
        }));

        setLoading(false);
      }
    } catch (error: any) {
      displayErrorMessage(error);
      setLoading(false);
    }
  };

  const getTableSevenData = async () => {
    setLoading(true);
    try {
      const payload: any = {
        page: aggregateCurrentPage[7],
        size: aggregatePageSize[7],
      };

      const response: any = await post('national/reports/7/query', payload);

      if (response) {
        const tempReportSevenData: ReportSevenRecord[] = [];

        response.data.forEach((entry: any, index: number) => {
          tempReportSevenData.push({
            key: index,
            title: entry.title,
            description: entry.description,
            objective: entry.objective,
            sector: entry.sector,
            subSectors: entry.subSectors ?? [],
            type: entry.type,
            recipientEntities: entry.recipientEntities ?? [],
            natImplementers: entry.nationalImplementingEntities ?? [],
            intImplementers: entry.internationalImplementingEntities ?? [],
            supportDirection: entry.supportReceivedOrNeeded,
            techDevelopment: entry.techDevelopment,
            capacityBuilding: entry.capacityBuilding,
            startYear: entry.startYear,
            endYear: entry.endYear,
            receivedAmount: entry.receivedAmount,
            receivedAmountDomestic: entry.receivedAmountDomestic,
            internationalSupportChannel: entry.internationalSupportChannel ?? [],
            financialInstrument: entry.financialInstrument,
            financingStatus: entry.financingStatus,
          });
        });

        setAggregateReportData((prevState) => ({
          ...prevState,
          [ReportType.SEVEN]: tempReportSevenData,
        }));

        setAggregateReportTotal((prevState) => ({
          ...prevState,
          [ReportType.SEVEN]: response.response.data.total,
        }));

        setLoading(false);
      }
    } catch (error: any) {
      displayErrorMessage(error);
      setLoading(false);
    }
  };

  const getTableTenData = async () => {
    setLoading(true);
    try {
      const payload: any = {
        page: aggregateCurrentPage[10],
        size: aggregatePageSize[10],
      };

      const response: any = await post('national/reports/10/query', payload);

      if (response) {
        const tempReportTenData: ReportTenRecord[] = [];

        response.data.forEach((entry: any, index: number) => {
          tempReportTenData.push({
            key: index,
            title: entry.title,
            description: entry.description,
            objective: entry.objective,
            sector: entry.sector,
            subSectors: entry.subSectors ?? [],
            type: entry.type,
            startYear: entry.startYear,
            endYear: entry.endYear,
            supportDirection: entry.supportReceivedOrNeeded,
          });
        });

        setAggregateReportData((prevState) => ({
          ...prevState,
          [ReportType.TEN]: tempReportTenData,
        }));

        setAggregateReportTotal((prevState) => ({
          ...prevState,
          [ReportType.TEN]: response.response.data.total,
        }));

        setLoading(false);
      }
    } catch (error: any) {
      displayErrorMessage(error);
      setLoading(false);
    }
  };

  const getTableElevenData = async () => {
    setLoading(true);
    try {
      const payload: any = {
        page: aggregateCurrentPage[11],
        size: aggregatePageSize[11],
      };

      const response: any = await post('national/reports/11/query', payload);

      if (response) {
        const tempReportElevenData: ReportElevenRecord[] = [];

        response.data.forEach((entry: any, index: number) => {
          tempReportElevenData.push({
            key: index,
            title: entry.title,
            description: entry.description,
            objective: entry.objective,
            sector: entry.sector,
            subSectors: entry.subSectors ?? [],
            type: entry.type,
            projectStatus: entry.projectStatus,
            recipientEntities: entry.recipientEntities ?? [],
            natImplementers: entry.nationalImplementingEntities ?? [],
            intImplementers: entry.internationalImplementingEntities ?? [],
            supportDirection: entry.supportReceivedOrNeeded,
            startYear: entry.startYear,
            endYear: entry.endYear,
          });
        });

        setAggregateReportData((prevState) => ({
          ...prevState,
          [ReportType.ELEVEN]: tempReportElevenData,
        }));

        setAggregateReportTotal((prevState) => ({
          ...prevState,
          [ReportType.ELEVEN]: response.response.data.total,
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
        page: aggregateCurrentPage[12],
        size: aggregatePageSize[12],
      };

      const response: any = await post('national/reports/12/query', payload);

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

  const getTableThirteenData = async () => {
    setLoading(true);
    try {
      const payload: any = {
        page: aggregateCurrentPage[13],
        size: aggregatePageSize[13],
      };

      const response: any = await post('national/reports/13/query', payload);

      if (response) {
        const tempReportThirteenData: ReportThirteenRecord[] = [];

        response.data.forEach((entry: any, index: number) => {
          tempReportThirteenData.push({
            key: index,
            title: entry.title,
            description: entry.description,
            recipientEntities: entry.recipientEntities ?? [],
            projectStatus: entry.projectStatus,
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
          [ReportType.THIRTEEN]: tempReportThirteenData,
        }));

        setAggregateReportTotal((prevState) => ({
          ...prevState,
          [ReportType.THIRTEEN]: response.response.data.total,
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
      case ReportType.SIX:
        return getReportSixColumns(t);
      case ReportType.SEVEN:
        return getReportSevenColumns(t);
      case ReportType.TEN:
        return getReportTenColumns(t);
      case ReportType.ELEVEN:
        return getReportElevenColumns(t);
      case ReportType.TWELVE:
        return getReportTwelveColumns(t);
      case ReportType.THIRTEEN:
        return getReportThirteenColumns(t);
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
  }, [aggregateCurrentPage?.[5], aggregatePageSize?.[5]]);

  useEffect(() => {
    getTableSixData();
  }, [aggregateCurrentPage?.[6], aggregatePageSize?.[6]]);

  useEffect(() => {
    getTableSevenData();
  }, [aggregateCurrentPage?.[7], aggregatePageSize?.[7]]);

  useEffect(() => {
    getTableTenData();
  }, [aggregateCurrentPage?.[10], aggregatePageSize?.[10]]);

  useEffect(() => {
    getTableElevenData();
  }, [aggregateCurrentPage?.[11], aggregatePageSize?.[11]]);

  useEffect(() => {
    getTableTwelveData();
  }, [aggregateCurrentPage?.[12], aggregatePageSize?.[12]]);

  useEffect(() => {
    getTableThirteenData();
  }, [aggregateCurrentPage?.[13], aggregatePageSize?.[13]]);

  // Selected Reports Custom Rendering Function

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
