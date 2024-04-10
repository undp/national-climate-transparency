import { DeleteOutlined } from '@ant-design/icons';
import { Form, Input, Row, Col, Card } from 'antd';
import './kpiGrid.scss';

interface Props {
  form: any;
  rules: any;
  index: number;
  calledTo: 'view' | 'create' | 'add_ach';
  gutterSize: number;
  headerNames: string[];
  updateKPI?: (id: number, property: any, value: string) => void;
  removeKPI?: (kpiId: number) => void;
}

const disabilityMapping = {
  view: [true, true, true, true, true],
  create: [false, false, true, false, false],
  add_ach: [true, true, false, true, true],
};

export const KpiGrid: React.FC<Props> = ({
  rules,
  index,
  calledTo,
  gutterSize,
  headerNames,
  updateKPI,
  removeKPI,
}) => {
  const currDisabilityMapping = disabilityMapping[calledTo];
  return (
    <Row key={index} gutter={gutterSize} className="kpi-grid">
      <Col span={12}>
        <Row gutter={gutterSize}>
          <Col span={12}>
            <Form.Item
              label={<label className="form-item-header">{headerNames[0]}</label>}
              name={`kpi_name_${index}`}
              rules={currDisabilityMapping[0] ? null : rules}
            >
              <Input
                className="form-input-box"
                disabled={currDisabilityMapping[0]}
                onChange={(e) => {
                  if (updateKPI) {
                    updateKPI(index, 'name', e.target.value);
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<label className="form-item-header">{headerNames[1]}</label>}
              name={`kpi_unit_${index}`}
              rules={currDisabilityMapping[1] ? null : rules}
            >
              <Input
                className="form-input-box"
                disabled={currDisabilityMapping[1]}
                onChange={(e) => {
                  if (updateKPI) {
                    updateKPI(index, 'unit', e.target.value);
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
              rules={currDisabilityMapping[2] ? null : rules}
            >
              <Input type="number" className="form-input-box" disabled={currDisabilityMapping[2]} />
            </Form.Item>
          </Col>
          <Col span={11}>
            <Form.Item
              label={<label className="form-item-header">{headerNames[3]}</label>}
              name={`kpi_exp_${index}`}
              rules={currDisabilityMapping[3] ? null : rules}
            >
              <Input
                type="number"
                className="form-input-box"
                disabled={currDisabilityMapping[3]}
                onChange={(e) => {
                  if (updateKPI) {
                    updateKPI(index, 'expected', e.target.value);
                  }
                }}
              />
            </Form.Item>
          </Col>
          {!currDisabilityMapping[4] ? (
            <Col span={2}>
              <Card className="delete-card">
                <DeleteOutlined
                  style={{ cursor: 'pointer', color: '#3A3541', opacity: 0.8 }}
                  onClick={() => {
                    if (removeKPI) {
                      removeKPI(index);
                    }
                  }}
                />
              </Card>
            </Col>
          ) : null}
        </Row>
      </Col>
    </Row>
  );
};
