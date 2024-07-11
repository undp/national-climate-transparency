import { Row, Col, Button, Table, TableProps, Input } from 'antd';
import './projectionForm.scss';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectionTimeline } from '../../Definitions/projectionsDefinitions';

interface Props {
  index: number;
  projectionType: 'withMeasures' | 'withoutMeasures' | 'withAdditionalMeasures';
}

export const ProjectionForm: React.FC<Props> = ({ index, projectionType }) => {
  // context Usage
  const { t } = useTranslation(['projection', 'entityAction']);

  // Finalized State

  const [isFinalized, setIsFinalized] = useState<boolean>();

  const projectionTimelineColumns: TableProps<ProjectionTimeline>['columns'] = [
    {
      title: 'Level',
      dataIndex: 'topicLevel',
      align: 'center',
      ellipsis: true,
      width: 100,
    },
    {
      title: 'Topic',
      dataIndex: 'topic',
      align: 'left',
      width: 350,
      fixed: 'left',
    },
  ];

  for (let year = 2000; year <= 2050; year++) {
    projectionTimelineColumns.push({
      title: year.toString(),
      dataIndex: year.toString(),
      width: 80,
      align: 'center',
      render: (colValue: any, record: any) => {
        return <Input value={colValue} className="input-box" />;
      },
    });
  }

  const expectedTimeline: ProjectionTimeline[] = [
    { key: '0', topicLevel: 0, topic: 'Gfcgf' },
    { key: '0', topicLevel: 0, topic: 'Gfcgf' },
  ];

  return (
    <div key={index} className="projection-form">
      <Row className="projection-timeline">
        <Col span={24}>
          <Table
            dataSource={expectedTimeline}
            columns={projectionTimelineColumns}
            pagination={false}
            className="custom-scroll-table"
          />
        </Col>
      </Row>
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
