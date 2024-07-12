import { Row, Col, Button, Table, TableProps, Input } from 'antd';
import './projectionForm.scss';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getInitTimeline,
  nonLeafSections,
  projectionSectionOrder,
  ProjectionTimeline,
  SectionOpen,
} from '../../Definitions/projectionsDefinitions';
import { arraySumAggregate, getCollapseIcon, parseNumber } from '../../Utils/utilServices';
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

  // Editable Leaf rows (38)

  const [allEditableData, setAllEditableData] = useState<ProjectionTimeline[]>(getInitTimeline());

  // All available rows (49)

  const [allVisibleData, setAllVisibleData] = useState<ProjectionTimeline[]>([]);

  // Memo to Cache the visible data

  const controlledVisibleData = useMemo(() => {
    return allVisibleData.filter(
      (item) =>
        item.topicId.length === 1 ||
        isSectionOpen[item.topicId.slice(0, 1) as ProjectionSections] === true
    );
  }, [isSectionOpen, allVisibleData]);

  // Industry Section Sum

  const industrySectionSum = useMemo(() => {
    const sectionSum: number[][] = allEditableData
      .filter((entry) => entry.topicId.startsWith('2'))
      .map((entry) => entry.values);
    return arraySumAggregate(sectionSum, 51);
  }, [
    allEditableData.filter((entry) => entry.topicId.startsWith('2')).map((entry) => entry.values),
  ]);

  // Waste Section Sum

  const wasteSectionSum = useMemo(() => {
    const sectionSum: number[][] = allEditableData
      .filter((entry) => entry.topicId.startsWith('4'))
      .map((entry) => entry.values);
    return arraySumAggregate(sectionSum, 51);
  }, [
    allEditableData.filter((entry) => entry.topicId.startsWith('4')).map((entry) => entry.values),
  ]);

  // Other Section Sum

  const otherSectionSum = useMemo(() => {
    const sectionSum: number[][] = allEditableData
      .filter((entry) => entry.topicId.startsWith('5'))
      .map((entry) => entry.values);
    return arraySumAggregate(sectionSum, 51);
  }, [
    allEditableData.filter((entry) => entry.topicId.startsWith('5')).map((entry) => entry.values),
  ]);

  // Sum Getter Function

  const getSectionSum = (topicId: string) => {
    switch (topicId) {
      case '2':
        return industrySectionSum;
      case '4':
        return wasteSectionSum;
      case '5':
        return otherSectionSum;
      default:
        return new Array(51).fill(0);
    }
  };

  // Memo to Cache All Visible Data with totals

  const tempVisibleTimeline = useMemo(() => {
    const timeline: ProjectionTimeline[] = [];

    for (const section of Object.values(projectionSectionOrder)) {
      section.forEach((topicId) => {
        timeline.push({
          key: `${topicId}_visible_init`,
          topicId: topicId,
          values: nonLeafSections.includes(topicId)
            ? getSectionSum(topicId)
            : allEditableData.find((entry) => entry.topicId === topicId)?.values ??
              new Array(51).fill(0),
        });
      });
    }

    return timeline;
  }, [allEditableData]);

  // Updating All Visible Data when the temp visible data changes

  useEffect(() => {
    setAllVisibleData(tempVisibleTimeline);
  }, [tempVisibleTimeline]);

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
    setAllEditableData((prevData) => {
      const entryIndex = prevData.findIndex((entry) => entry.topicId === topicId);

      if (entryIndex === -1) return prevData;

      const updatedData = [...prevData];

      const updatedValues = [...updatedData[entryIndex].values];
      updatedValues[yearIndex] = newValue;

      updatedData[entryIndex] = {
        ...updatedData[entryIndex],
        values: updatedValues,
      };

      return updatedData;
    });
  };

  for (let year = 2000; year <= 2050; year++) {
    projectionTimelineColumns.push({
      title: year.toString(),
      dataIndex: 'values',
      width: 80,
      align: 'center',
      render: (sectionValueArray: number[], record: any) => {
        const isNonLeaf: boolean = nonLeafSections.includes(record.topicId);
        return (
          <Input
            value={sectionValueArray[year - 2000] ?? undefined}
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

  const submitProjection = (action: 'validate' | 'save') => {
    console.log(allEditableData, allVisibleData);
  };

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
          <Button
            disabled={isFinalized}
            type="primary"
            size="large"
            block
            onClick={() => submitProjection('validate')}
          >
            {t('entityAction:submit')}
          </Button>
        </Col>
        <Col>
          <Button
            disabled={isFinalized}
            type="primary"
            size="large"
            block
            onClick={() => submitProjection('validate')}
          >
            {t('entityAction:validate')}
          </Button>
        </Col>
      </Row>
    </div>
  );
};
