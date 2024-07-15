import { Row, Col, Button, Table, TableProps, message, InputNumber } from 'antd';
import './projectionForm.scss';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getInitTimeline,
  nonLeafSections,
  projectionSectionOrder,
  ProjectionTimeline,
  projectionToBaseline,
  SectionOpen,
} from '../../Definitions/projectionsDefinitions';
import { arraySumAggregate, getCollapseIcon, parseToTwoDecimals } from '../../Utils/utilServices';
import { ProjectionSections, ProjectionType } from '../../Enums/projection.enum';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { displayErrorMessage } from '../../Utils/errorMessageHandler';
import { getProjectionCreatePayload } from '../../Utils/payloadCreators';
import { GHGRecordState } from '../../Enums/shared.enum';

interface Props {
  index: number;
  projectionType: ProjectionType;
}

export const ProjectionForm: React.FC<Props> = ({ index, projectionType }) => {
  // context Usage
  const { t } = useTranslation(['projection', 'entityAction']);
  const { get, post } = useConnection();

  // Collapse State

  const [isSectionOpen, setIsSectionOpen] = useState<SectionOpen>({
    [ProjectionSections.ENERGY]: false,
    [ProjectionSections.INDUSTRY]: false,
    [ProjectionSections.AGR_FOR_OTH_LAND]: false,
    [ProjectionSections.WASTE]: false,
    [ProjectionSections.OTHER]: false,
  });

  // General State

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Finalized State

  const [isFinalized, setIsFinalized] = useState<boolean>();

  // Editable Leaf rows (38)

  const [allEditableData, setAllEditableData] = useState<ProjectionTimeline[]>([]);

  // All available rows (49)

  const [allVisibleData, setAllVisibleData] = useState<ProjectionTimeline[]>([]);

  // Init Loading

  const getProjection = async () => {
    try {
      const response = await get(`national/projections/actual/${projectionType}`);

      if (response.status === 200 || response.status === 201) {
        setAllEditableData(getInitTimeline(response.data.projectionData));
        if (response.data.state === GHGRecordState.FINALIZED) {
          setIsFinalized(true);
        }
      }
    } catch (error) {
      setAllEditableData(getInitTimeline());
    }
  };

  const getBaselineProjection = async () => {
    try {
      const response = await get(
        `national/projections/calculated/${projectionToBaseline[projectionType]}`
      );

      if (response.status === 200 || response.status === 201) {
        setAllEditableData(getInitTimeline(response.data.projectionData));
        if (response.data.state === GHGRecordState.FINALIZED) {
          setIsFinalized(true);
        }
      }
    } catch (error) {
      setAllEditableData(getInitTimeline());
    }
  };

  useEffect(() => {
    setIsLoading(true);

    setIsFinalized(false);
    getProjection();

    setIsLoading(false);
  }, []);

  // Memo to Cache the visible data

  const controlledVisibleData = useMemo(() => {
    return allVisibleData.filter(
      (item) =>
        item.topicId.length === 1 ||
        isSectionOpen[item.topicId.slice(0, 1) as ProjectionSections] === true
    );
  }, [isSectionOpen, allVisibleData]);

  // Fuel Section Sum

  const fuelSectionSum = useMemo(() => {
    const sectionSum: number[][] = allEditableData
      .filter((entry) => entry.topicId.startsWith('1A'))
      .map((entry) => entry.values);
    return arraySumAggregate(sectionSum, 51);
  }, [
    allEditableData.filter((entry) => entry.topicId.startsWith('1A')).map((entry) => entry.values),
  ]);

  // Fuel:Transport Section Sum

  const transportSectionSum = useMemo(() => {
    const sectionSum: number[][] = allEditableData
      .filter((entry) => entry.topicId.startsWith('1A3'))
      .map((entry) => entry.values);
    return arraySumAggregate(sectionSum, 51);
  }, [
    allEditableData.filter((entry) => entry.topicId.startsWith('1A3')).map((entry) => entry.values),
  ]);

  // Fugitive Section Sum

  const fugitiveSectionSum = useMemo(() => {
    const sectionSum: number[][] = allEditableData
      .filter((entry) => entry.topicId.startsWith('1B'))
      .map((entry) => entry.values);
    return arraySumAggregate(sectionSum, 51);
  }, [
    allEditableData.filter((entry) => entry.topicId.startsWith('1B')).map((entry) => entry.values),
  ]);

  // Carbon Section Sum

  const carbonSectionSum = useMemo(() => {
    const sectionSum: number[][] = allEditableData
      .filter((entry) => entry.topicId.startsWith('1C'))
      .map((entry) => entry.values);
    return arraySumAggregate(sectionSum, 51);
  }, [
    allEditableData.filter((entry) => entry.topicId.startsWith('1C')).map((entry) => entry.values),
  ]);

  // Industry Section Sum

  const industrySectionSum = useMemo(() => {
    const sectionSum: number[][] = allEditableData
      .filter((entry) => entry.topicId.startsWith('2'))
      .map((entry) => entry.values);
    return arraySumAggregate(sectionSum, 51);
  }, [
    allEditableData.filter((entry) => entry.topicId.startsWith('2')).map((entry) => entry.values),
  ]);

  // Livestock Section Sum

  const livestockSectionSum = useMemo(() => {
    const sectionSum: number[][] = allEditableData
      .filter((entry) => entry.topicId.startsWith('3A'))
      .map((entry) => entry.values);
    return arraySumAggregate(sectionSum, 51);
  }, [
    allEditableData.filter((entry) => entry.topicId.startsWith('3A')).map((entry) => entry.values),
  ]);

  // Land Section Sum

  const landSectionSum = useMemo(() => {
    const sectionSum: number[][] = allEditableData
      .filter((entry) => entry.topicId.startsWith('3B'))
      .map((entry) => entry.values);
    return arraySumAggregate(sectionSum, 51);
  }, [
    allEditableData.filter((entry) => entry.topicId.startsWith('3B')).map((entry) => entry.values),
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
      case '1':
        return arraySumAggregate([fuelSectionSum, fugitiveSectionSum, carbonSectionSum], 51);
      case '1A':
        return fuelSectionSum;
      case '1A3':
        return transportSectionSum;
      case '1B':
        return fugitiveSectionSum;
      case '1C':
        return carbonSectionSum;
      case '2':
        return industrySectionSum;
      case '3':
        return arraySumAggregate([livestockSectionSum, landSectionSum], 51);
      case '3A':
        return livestockSectionSum;
      case '3B':
        return landSectionSum;
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
      width: 150,
      align: 'center',
      render: (sectionValueArray: number[], record: any) => {
        const isNonLeaf: boolean = nonLeafSections.includes(record.topicId);
        return (
          <InputNumber
            value={parseToTwoDecimals(sectionValueArray[year - 2000] ?? 0)}
            disabled={isNonLeaf || isFinalized}
            onChange={(enteredValue) => {
              updateValue(
                record.topicId,
                year - 2000,
                enteredValue ? parseToTwoDecimals(enteredValue) : 0
              );
            }}
            min={0}
            decimalSeparator="."
            controls={false}
            className={
              isNonLeaf
                ? record.topicId.length === 1
                  ? 'root-input-box'
                  : record.topicId.length === 2
                  ? 'l1-input-box'
                  : 'l2-input-box'
                : 'leaf-input-box'
            }
          />
        );
      },
    });
  }

  // Handle Projection Save

  const submitProjection = async () => {
    try {
      const projectionCreatePayload = getProjectionCreatePayload(allEditableData, projectionType);

      const response: any = await post('national/projections/add', projectionCreatePayload);

      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: t('projectionUpdateSuccess'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
      }
    } catch (error: any) {
      displayErrorMessage(error);
    }
  };

  // Handle Projection Validation

  const handleValidateAction = async (state: GHGRecordState) => {
    try {
      const projectionValidatePayload = {
        projectionType: projectionType,
        state: state,
      };

      const response: any = await post('national/projections/validate', projectionValidatePayload);

      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content:
            state === GHGRecordState.FINALIZED
              ? t('projectionValidateSuccess')
              : t('projectionUnvalidateSuccess'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });

        setIsFinalized(state === GHGRecordState.FINALIZED);
      }
    } catch (error: any) {
      displayErrorMessage(error);
    }
  };

  return (
    <div key={index} className="projection-form">
      <Row className="projection-timeline">
        <Col span={24}>
          <Table
            loading={isLoading}
            dataSource={controlledVisibleData}
            columns={projectionTimelineColumns}
            pagination={false}
          />
        </Col>
      </Row>
      <Row gutter={20} className="action-row" justify={'end'}>
        {!isFinalized && (
          <Col>
            <Button
              disabled={isFinalized}
              type="primary"
              size="large"
              block
              onClick={() => getBaselineProjection()}
            >
              {t('entityAction:revert')}
            </Button>
          </Col>
        )}
        {!isFinalized && (
          <Col>
            <Button
              disabled={isFinalized}
              type="primary"
              size="large"
              block
              onClick={() => submitProjection()}
            >
              {t('entityAction:update')}
            </Button>
          </Col>
        )}
        <Col>
          <Button
            type="primary"
            size="large"
            block
            onClick={() =>
              handleValidateAction(isFinalized ? GHGRecordState.SAVED : GHGRecordState.FINALIZED)
            }
          >
            {isFinalized ? t('entityAction:unvalidate') : t('entityAction:validate')}
          </Button>
        </Col>
      </Row>
    </div>
  );
};
