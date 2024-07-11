import { Row, Col, Button } from 'antd';
import './emissionForm.scss';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  index: number;
  projectionType: 'withMeasures' | 'withoutMeasures' | 'withAdditionalMeasures';
}

export const ProjectionForm: React.FC<Props> = ({ index, projectionType }) => {
  // context Usage
  const { t } = useTranslation(['projection', 'entityAction']);

  // Finalized State

  const [isFinalized, setIsFinalized] = useState<boolean>();

  return (
    <div key={index} className="emission-form">
      <Row gutter={20} className="action-row" justify={'end'}>
        <Col>
          <Button disabled={isFinalized} type="primary" size="large" block onClick={console.log}>
            {t('entityAction:submit')}
          </Button>
        </Col>
        <Col>
          <Button
            disabled={isFinalized}
            type="primary"
            size="large"
            block
            htmlType="submit"
            onClick={console.log}
          >
            {t('entityAction:validate')}
          </Button>
        </Col>
      </Row>
    </div>
  );
};
