import { DeleteOutlined } from '@ant-design/icons';
import { Form, Input, Row, Col, Card } from 'antd';
import './kpiGrid.scss';

interface Props {
  form: any;
  rules: any;
  index: number;
  headerNames: string[];
  updateKPI?: (index: number, property: any, value: string, inWhich: 'created' | 'new') => void;
  removeKPI?: (kpiId: number, inWhich: 'created' | 'new') => void;
}

export const NewKpi: React.FC<Props> = ({ rules, index, headerNames, updateKPI, removeKPI }) => {
  return (
    <Row key={index} gutter={30} className="kpi-grid">
      <Col span={12}>
        <Row gutter={30}>
          <Col span={12}>
            <Form.Item
              label={<label className="form-item-header">{headerNames[0]}</label>}
              name={`kpi_name_${index}`}
              rules={rules}
            >
              <Input
                className="form-input-box"
                onChange={(e) => {
                  if (updateKPI) {
                    updateKPI(index, 'name', e.target.value, 'new');
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<label className="form-item-header">{headerNames[1]}</label>}
              name={`kpi_unit_${index}`}
              rules={rules}
            >
              <Input
                className="form-input-box"
                onChange={(e) => {
                  if (updateKPI) {
                    updateKPI(index, 'unit', e.target.value, 'new');
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Col>
      <Col span={12}>
        <Row gutter={15}>
          <Col span={11}>
            <Form.Item
              label={<label className="form-item-header">{headerNames[2]}</label>}
              name={`kpi_ach_${index}`}
            >
              <Input type="number" className="form-input-box" disabled={true} />
            </Form.Item>
          </Col>
          <Col span={11}>
            <Form.Item
              label={<label className="form-item-header">{headerNames[3]}</label>}
              name={`kpi_exp_${index}`}
              rules={rules}
            >
              <Input
                type="number"
                min={0}
                step={0.01}
                className="form-input-box"
                onChange={(e) => {
                  if (updateKPI) {
                    updateKPI(index, 'expected', e.target.value, 'new');
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Card className="delete-card">
              <DeleteOutlined
                style={{ cursor: 'pointer', color: '#3A3541', opacity: 0.8 }}
                onClick={() => {
                  if (removeKPI) {
                    removeKPI(index, 'new');
                  }
                }}
              />
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
