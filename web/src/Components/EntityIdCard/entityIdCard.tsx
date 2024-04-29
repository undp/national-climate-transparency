import './entityIdCard.scss';
import { Col, Row, Tag } from 'antd';

interface Props {
  calledIn: 'Action' | 'Programme' | 'Project' | 'Activity' | 'Support';
  entId: string;
}

const EntityIdCard: React.FC<Props> = ({ calledIn, entId }) => {
  return (
    <Row>
      <Col span={12}>
        <Tag className="entity-id-card">{`${calledIn} ID: ${entId}`}</Tag>
      </Col>
    </Row>
  );
};

export default EntityIdCard;
