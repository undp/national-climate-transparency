import { CheckCircleOutlined } from '@ant-design/icons';
import './entityIdCard.scss';
import { Col, Row, Tag, Tooltip } from 'antd';

interface Props {
  calledIn: 'Action' | 'Programme' | 'Project' | 'Activity' | 'Support';
  entId: string;
  isValidated?: boolean;
}

const EntityIdCard: React.FC<Props> = ({ calledIn, entId, isValidated }) => {
  return (
    <Row>
      <Col>
        <Tooltip
          title={isValidated ? `Validated ${calledIn}` : undefined}
          showArrow={false}
          placement="right"
        >
          <Tag
            icon={isValidated ? <CheckCircleOutlined style={{ color: '#9155FD' }} /> : undefined}
            className="entity-id-card"
          >{`${calledIn} ID: ${entId}`}</Tag>
        </Tooltip>
      </Col>
    </Row>
  );
};

export default EntityIdCard;
