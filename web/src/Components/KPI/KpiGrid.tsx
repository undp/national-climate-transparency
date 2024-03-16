import { DeleteOutlined } from '@ant-design/icons';
import { Row, Col, Input, Card } from 'antd';

interface Props {
  kpiData: { name: string; unit: string; ach: number; exp: number };
  gutterSize: number;
  rowHeight: string;
  rowBottomMargin: string;
  fieldHeight: string;
  shownAt: 'creator' | 'forwarder' | 'achiever';
}

const KpiGrid: React.FC<Props> = ({
  kpiData,
  gutterSize,
  rowHeight,
  rowBottomMargin,
  fieldHeight,
  shownAt,
}) => {
  return (
    <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
      <Col span={12} style={{ height: rowHeight }}>
        <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
          <Col span={12} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{'KPI Name'}</div>
            <Input
              style={{ height: fieldHeight }}
              value={kpiData.name}
              disabled={shownAt !== 'creator'}
            />
          </Col>
          <Col span={12} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{'KPI Unit'}</div>
            <Input
              style={{ height: fieldHeight }}
              value={kpiData.unit}
              disabled={shownAt !== 'creator'}
            />
          </Col>
        </Row>
      </Col>
      <Col span={12} style={{ height: rowHeight }}>
        <Row gutter={15} style={{ marginBottom: rowBottomMargin }}>
          <Col span={11} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{'Achieved'}</div>
            <Input
              style={{ height: fieldHeight }}
              value={kpiData.ach}
              disabled={shownAt !== 'achiever'}
            />
          </Col>
          <Col span={11} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{'Expected'}</div>
            <Input
              style={{ height: fieldHeight }}
              value={kpiData.exp}
              disabled={shownAt !== 'creator'}
            />
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
