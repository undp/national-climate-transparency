import { DeleteOutlined } from '@ant-design/icons';
import { Row, Col, Input, Button } from 'antd';

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
        <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
          <Col span={10} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{'Achieved'}</div>
            <Input style={{ height: fieldHeight }} />
          </Col>
          <Col span={10} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{'Expected'}</div>
            <Input style={{ height: fieldHeight }} />
          </Col>
          <Col span={4} style={{ height: rowHeight }}>
            <Button
              block
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0px',
                width: '10px',
                height: fieldHeight,
                marginTop: '38px',
              }}
            >
              <DeleteOutlined style={{ cursor: 'pointer', color: '#3A3541', opacity: 0.8 }} />
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default KpiGrid;
