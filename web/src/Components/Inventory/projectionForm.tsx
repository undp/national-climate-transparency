import { Row, Col, Button, Table, TableProps, Input } from 'antd';
import './projectionForm.scss';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getInitTimeline,
  nonLeafSections,
  projectionSectionOrder,
  ProjectionTimeline,
  SectionOpen,
} from '../../Definitions/projectionsDefinitions';
import { getCollapseIcon, parseNumber, parseToTwoDecimals } from '../../Utils/utilServices';
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

  const [allVisibleData, setAllVisibleData] = useState<ProjectionTimeline[]>(getInitTimeline());
  const [controlledVisibleData, setControlledVisibleData] = useState<ProjectionTimeline[]>([]);

  useEffect(() => {
    const filteredData = allVisibleData.filter(
      (item) =>
        item.topicId.length === 1 ||
        isSectionOpen[item.topicId.slice(0, 1) as ProjectionSections] === true
    );
    setControlledVisibleData(filteredData);
  }, [isSectionOpen, allVisibleData]);

  // Column Definition

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
      width: 450,
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

  // Editable Value Update

  const updateValue = (topicId: string, yearIndex: number, newValue: number) => {
    console.log(topicId, yearIndex, newValue);
  };

  for (let year = 2000; year <= 2050; year++) {
    projectionTimelineColumns.push({
      title: year.toString(),
      dataIndex: year.toString(),
      width: 80,
      align: 'center',
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        const isNonLeaf: boolean = nonLeafSections.includes(record.topicId);
        return (
          <Input
            disabled={isNonLeaf}
            className={
              isNonLeaf
                ? record.topicId.length === 1
                  ? 'root-input-box'
                  : record.topicId.length === 2
                  ? 'l1-input-box'
                  : 'l2-input-box'
                : 'leaf-input-box'
            }
            onChange={(e) => {
              updateValue(record.topicId, year - 2000, parseNumber(e.target.value) ?? 0);
            }}
          />
        );
      },
    });
  }

  return (
    <div key={index} className="projection-form">
      <Row className="projection-timeline">
        <Col span={24}>
          <Table
            dataSource={controlledVisibleData}
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
