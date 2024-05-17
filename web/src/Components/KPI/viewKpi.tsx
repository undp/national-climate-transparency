import { Form, Input, Row, Col, Select } from 'antd';
import './kpiGrid.scss';
import { KpiUnits } from '../../Enums/kpi.enum';
import { CreatedKpiData } from '../../Definitions/kpiDefinitions';

interface Props {
  index: number;
  headerNames: string[];
  kpi: CreatedKpiData;
}

const { Option } = Select;

export const ViewKpi: React.FC<Props> = ({ index, headerNames, kpi }) => {
  return (
    <Row key={index} gutter={30} className="kpi-grid">
      <Col span={12}>
        <Row gutter={30}>
          <Col span={12}>
            <Form.Item
              label={<label className="form-item-header">{headerNames[0]}</label>}
              name={`kpi_name_${index}`}
              initialValue={kpi?.name}
            >
              <Input className="form-input-box" disabled={true} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<label className="form-item-header">{headerNames[1]}</label>}
              name={`kpi_unit_${index}`}
              initialValue={kpi?.unit}
            >
              <Select size="large" className="form-unit-select" disabled={true}>
                {Object.values(KpiUnits).map((unit) => (
                  <Option key={unit} value={unit}>
                    {unit}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Col>
      <Col span={12}>
        <Row gutter={30}>
          <Col span={12}>
            <Form.Item
              label={<label className="form-item-header">{headerNames[2]}</label>}
              name={`kpi_ach_${index}`}
              initialValue={kpi?.achieved}
            >
              <Input type="number" className="form-input-box" disabled={true} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<label className="form-item-header">{headerNames[3]}</label>}
              name={`kpi_exp_${index}`}
              initialValue={kpi?.expected}
            >
              <Input type="number" className="form-input-box" disabled={true} />
            </Form.Item>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
