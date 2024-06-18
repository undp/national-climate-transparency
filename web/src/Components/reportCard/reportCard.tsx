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

interface Props {
  loading: boolean;
  reportTitle: string;
  reportSubtitle: string;
  reportData: any;
  columns: any;
  totalEntries: number;
  currentPage: number;
  pageSize: number;
  exportButtonNames: string[];
  downloadReportData: (data: any) => void;
  handleTableChange: (pagination: any) => void;
}

const ReportCard: React.FC<Props> = ({
  loading,
  reportTitle,
  reportSubtitle,
  reportData,
  columns,
  totalEntries,
  currentPage,
  pageSize,
  exportButtonNames,
  downloadReportData,
  handleTableChange,
}) => {
  return (
    <div className="report-card">
      <Row className="title-bar">
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
                  downloadReportData(ExportFileType.XLSX);
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
                  downloadReportData(ExportFileType.CSV);
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
      <Row>
        <Col span={24}>
          <LayoutTable
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
