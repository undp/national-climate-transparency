import { Row, Col, Button, Table, TableProps, Input } from 'antd';
import './projectionForm.scss';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getInitTimeline,
  ProjectionTimeline,
  SectionOpen,
} from '../../Definitions/projectionsDefinitions';
import { getCollapseIcon } from '../../Utils/utilServices';
import { ProjectionSections } from '../../Enums/projection.enum';

interface Props {
  index: number;
  projectionType: 'withMeasures' | 'withoutMeasures' | 'withAdditionalMeasures';
}

export const ProjectionForm: React.FC<Props> = ({ index, projectionType }) => {
  // context Usage
  const { t } = useTranslation(['projection', 'entityAction']);

  // Collapse State

  const [isSectionOpen, setIsSectionOpen] = useState<SectionOpen>({
    [ProjectionSections.ENERGY]: false,
    [ProjectionSections.INDUSTRY]: false,
    [ProjectionSections.AGR_FOR_OTH_LAND]: false,
    [ProjectionSections.WASTE]: false,
    [ProjectionSections.OTHER]: false,
  });

  // Finalized State

  const [isFinalized, setIsFinalized] = useState<boolean>();

  // Collapsing Control

  const [availableData, setAvailableData] = useState<ProjectionTimeline[]>(
    getInitTimeline(projectionType)
  );
  const [controlledData, setControlledData] = useState<ProjectionTimeline[]>([]);

  const projectionTimelineColumns: TableProps<ProjectionTimeline>['columns'] = [
    {
      dataIndex: 'topicId',
      align: 'center',
      ellipsis: true,
      fixed: 'left',
      width: 50,
      render: (colValue: string) => {
        if (colValue.length === 1) {
          const currentSection: ProjectionSections = colValue as ProjectionSections;
          return getCollapseIcon(isSectionOpen[currentSection], () => {
            setIsSectionOpen((prevState) => ({
              ...prevState,
              [currentSection]: !prevState[currentSection],
            }));
          });
        } else {
          return null;
        }
      },
    },
    {
      dataIndex: 'topicId',
      align: 'left',
      width: 550,
      fixed: 'left',
      render: (colValue: any) => {
        return (
          <div style={{ marginLeft: `${(colValue.length - 1) * 20}px` }}>
            <span>
              {colValue}
              {'\u00A0'.repeat(3)}
              {t(`${colValue}_title`)}
            </span>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    const filteredData = availableData.filter(
      (item) =>
        item.topicId.length === 1 ||
        isSectionOpen[item.topicId.slice(0, 1) as ProjectionSections] === true
    );
    setControlledData(filteredData);
  }, [isSectionOpen]);

  for (let year = 2000; year <= 2050; year++) {
    projectionTimelineColumns.push({
      title: year.toString(),
      dataIndex: year.toString(),
      width: 80,
      align: 'center',
      render: (colValue: any) => {
        return <Input value={colValue} className="input-box" />;
      },
    });
  }

  return (
    <div key={index} className="projection-form">
      <Row className="projection-timeline">
        <Col span={24}>
          <Table
            dataSource={controlledData}
            columns={projectionTimelineColumns}
            pagination={false}
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
