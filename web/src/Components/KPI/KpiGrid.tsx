import { DeleteOutlined } from '@ant-design/icons';
import { Row, Col, Input, Card } from 'antd';

interface Props {
  gutterSize: number;
  rowHeight: string;
  rowBottomMargin: string;
  fieldHeight: string;
}

const KpiGrid: React.FC<Props> = ({ gutterSize, rowHeight, rowBottomMargin, fieldHeight }) => {
  return (
    <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
      <Col span={12} style={{ height: rowHeight }}>
        <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
          <Col span={12} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{'KPI Name'}</div>
            <Input style={{ height: fieldHeight }} />
          </Col>
          <Col span={12} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{'KPI Unit'}</div>
            <Input style={{ height: fieldHeight }} />
          </Col>
        </Row>
      </Col>
      <Col span={12} style={{ height: rowHeight }}>
        <Row gutter={15} style={{ marginBottom: rowBottomMargin }}>
          <Col span={11} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{'Achieved'}</div>
            <Input style={{ height: fieldHeight }} />
          </Col>
          <Col span={11} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{'Expected'}</div>
            <Input style={{ height: fieldHeight }} />
          </Col>
          <Col span={2} style={{ height: rowHeight }}>
            <Card
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0px',
                width: '31px',
                height: '31px',
                marginTop: '43px',
                borderWidth: '1px',
                borderRadius: '4px',
                borderColor: '#d9d9d9',
              }}
            >
              <DeleteOutlined style={{ cursor: 'pointer', color: '#3A3541', opacity: 0.8 }} />
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default KpiGrid;
