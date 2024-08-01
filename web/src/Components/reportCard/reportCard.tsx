import './reportCard.scss';
import { Button, Col, Row } from 'antd';
import {
  exportBarBps,
  exportButtonBps,
  reportTitleBps,
} from '../../Definitions/breakpoints/breakpoints';
import { DownloadOutlined } from '@ant-design/icons';
import LayoutTable from '../common/Table/layout.table';
import { ExportFileType } from '../../Enums/shared.enum';
import { ReportType } from '../../Enums/report.enum';

interface Props {
  loading: boolean;
  whichReport: ReportType;
  reportTitle: string;
  reportSubtitle: string;
  reportData: any;
  columns: any;
  totalEntries: number;
  currentPage: number;
  pageSize: number;
  exportButtonNames: string[];
  downloadReportData: (dataType: ExportFileType, whichReport: ReportType) => void;
  handleTablePagination: (pagination: any, whichReport: ReportType) => void;
}

const ReportCard: React.FC<Props> = ({
  loading,
  whichReport,
  reportTitle,
  reportSubtitle,
  reportData,
  columns,
  totalEntries,
  currentPage,
  pageSize,
  exportButtonNames,
  downloadReportData,
  handleTablePagination,
}) => {
  const handleTableChange = (pagination: any) => {
    handleTablePagination(pagination, whichReport);
  };

  return (
    <div className="report-card">
      <Row className="report-title-bar">
        <Col {...reportTitleBps}>
          <div className="title-row">
            <div className="title">{reportTitle}</div>
          </div>
        </Col>
        <Col {...exportBarBps}>
          <Row gutter={20} className="export-row">
            <Col {...exportButtonBps}>
              <Button
                className="export-button"
                type="primary"
                size="large"
                block
                icon={<DownloadOutlined />}
                onClick={() => {
                  downloadReportData(ExportFileType.XLSX, whichReport);
                }}
              >
                {exportButtonNames[0]}
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
                  downloadReportData(ExportFileType.CSV, whichReport);
                }}
              >
                {exportButtonNames[1]}
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <div className="subtitle-bar">
            <div className="subTitle">{reportSubtitle}</div>
          </div>
        </Col>
      </Row>
      <Row className="table-bar">
        <Col span={24}>
          <LayoutTable
            addBorders={true}
            tableData={reportData}
            columns={columns}
            loading={loading}
            pagination={{
              total: totalEntries,
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
  );
};

export default ReportCard;
