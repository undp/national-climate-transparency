import { Table, TableProps, Grid, InputNumber } from 'antd';
import {
  ActualRows,
  ActualTimeline,
  ExpectedRows,
  ExpectedTimeline,
} from '../../Definitions/mtgTimeline.definition';
import './timeline.scss';
import { useEffect, useState } from 'react';

interface Props {
  expectedTimeline: any;
  actualTimeline: any;
  loading: boolean;
  method: 'create' | 'view' | 'update';
  mtgStartYear: number;
  mtgRange: number;
  onValueEnter: (
    tableTYpe: 'expected' | 'actual',
    rowId: string,
    year: string,
    value: string
  ) => void;
  t: any;
}

const { useBreakpoint } = Grid;

const TimelineTable: React.FC<Props> = ({
  expectedTimeline,
  actualTimeline,
  loading,
  method,
  mtgStartYear,
  mtgRange,
  onValueEnter,
  t,
}) => {
  const screens = useBreakpoint();

  const isView: boolean = method === 'view' ? true : false;

  const [allowFixedLegend, setAllowFixedLegend] = useState<boolean>(false);

  useEffect(() => {
    if (screens.xxl) {
      setAllowFixedLegend(true);
    } else if (screens.xl) {
      setAllowFixedLegend(true);
    } else {
      setAllowFixedLegend(false);
    }
  }, [screens]);

  const expectedTableColumns: TableProps<ExpectedTimeline>['columns'] = [
    {
      title: t('timelineTable:ghg'),
      dataIndex: 'ghg',
      align: 'center',
      ellipsis: true,
      width: 100,
    },
    {
      title: t('timelineTable:catExpectedEmissionReduct'),
      dataIndex: 'topic',
      align: 'left',
      width: 350,
      fixed: allowFixedLegend ? 'left' : undefined,
    },
    {
      title: t('timelineTable:total'),
      dataIndex: 'total',
      align: 'center',
      width: 100,
      render: (colValue: any) => {
        return colValue;
      },
    },
  ];

  const actualTableColumns: TableProps<ActualTimeline>['columns'] = [
    {
      title: t('timelineTable:ghg'),
      dataIndex: 'ghg',
      align: 'center',
      ellipsis: true,
      width: 100,
    },
    {
      title: t('timelineTable:catActualEmissionReduct'),
      dataIndex: 'topic',
      align: 'left',
      width: 350,
      fixed: allowFixedLegend ? 'left' : undefined,
    },
    {
      title: t('timelineTable:total'),
      dataIndex: 'total',
      align: 'center',
      width: 100,
      render: (colValue: any) => {
        return colValue;
      },
    },
  ];

  for (let year = mtgStartYear; year <= Math.min(mtgStartYear + mtgRange, 2050); year++) {
    expectedTableColumns.push({
      title: year.toString(),
      dataIndex: 'values',
      width: 120,
      align: 'center',
      render: (colValue: any, record: any) => {
        const isDisabled =
          record.topic === ExpectedRows.ROW_FOUR[1] ||
          record.topic === ExpectedRows.ROW_FIVE[1] ||
          isView;
        return (
          <InputNumber
            disabled={isDisabled}
            value={colValue[year - mtgStartYear]}
            decimalSeparator="."
            controls={false}
            style={{ width: '100%', height: '30px' }}
            onChange={(value: any) => {
              onValueEnter('expected', record.topic, year.toString(), value);
            }}
          />
        );
      },
    });

    actualTableColumns.push({
      title: year.toString(),
      dataIndex: 'values',
      width: 120,
      align: 'center',
      render: (colValue: any, record: any) => {
        const isDisabled = record.topic === ActualRows.ROW_THREE[1] || isView;
        return (
          <InputNumber
            disabled={isDisabled}
            value={colValue[year - mtgStartYear]}
            decimalSeparator="."
            controls={false}
            style={{ width: '100%', height: '30px' }}
            onChange={(value: any) => {
              onValueEnter('actual', record.topic, year.toString(), value);
            }}
          />
        );
      },
    });
  }

  return (
    <div className="mtg-timeline">
      <Table
        dataSource={expectedTimeline}
        columns={expectedTableColumns}
        loading={loading}
        pagination={false}
        className="custom-scroll-table"
      />
      <Table
        dataSource={actualTimeline}
        columns={actualTableColumns}
        loading={loading}
        pagination={false}
        className="custom-scroll-table"
      />
    </div>
  );
};

export default TimelineTable;
