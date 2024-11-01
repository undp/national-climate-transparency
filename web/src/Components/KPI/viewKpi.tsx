import { Form, Input, Row, Col, Tooltip } from 'antd';
import './kpiGrid.scss';
import { CreatedKpiData } from '../../Definitions/kpiDefinitions';
import { UserOutlined, UserSwitchOutlined } from '@ant-design/icons';

interface Props {
  index: number;
  inherited: boolean;
  headerNames: string[];
  kpi: CreatedKpiData;
  callingEntityId: string | undefined;
  ownerEntityId: string | undefined;
}

export const ViewKpi: React.FC<Props> = ({
  index,
  inherited,
  headerNames,
  kpi,
  callingEntityId,
  ownerEntityId,
}) => {
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
              <Input className="form-input-box" disabled={true} />
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
              initialValue={kpi?.achieved}
            >
              <Input type="number" className="form-input-box" disabled={true} />
            </Form.Item>
          </Col>
          <Col span={11}>
            <Form.Item
              label={<label className="form-item-header">{headerNames[3]}</label>}
              name={`kpi_exp_${index}`}
              initialValue={kpi?.expected}
            >
              <Input type="number" className="form-input-box" disabled={true} />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Tooltip
              placement="topLeft"
              title={inherited ? `Inherited from ${ownerEntityId}` : `Owned by ${callingEntityId}`}
              showArrow={false}
            >
              {inherited ? (
                <UserSwitchOutlined className="inherited-kpi" />
              ) : (
                <UserOutlined className="self-owned-kpi" />
              )}
            </Tooltip>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
