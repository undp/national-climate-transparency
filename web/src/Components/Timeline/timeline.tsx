import { Table, TableProps, Input, Grid } from 'antd';
import { useTranslation } from 'react-i18next';
import { ActualTimeline, ExpectedTimeline } from '../../Definitions/mtgTimeline.definition';
import './timeline.scss';
import { useEffect, useState } from 'react';

interface Props {
  expectedTimeline: any;
  actualTimeline: any;
  loading: boolean;
  method: 'create' | 'view' | 'update';
  onValueEnter: (
    tableTYpe: 'expected' | 'actual',
    rowId: string,
    year: string,
    value: string
  ) => void;
}

const { useBreakpoint } = Grid;

const TimelineTable: React.FC<Props> = ({
  expectedTimeline,
  actualTimeline,
  loading,
  method,
  onValueEnter,
}) => {
  const { t } = useTranslation(['timelineTable']);
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
      title: t('ghg'),
      dataIndex: 'ghg',
      align: 'center',
      ellipsis: true,
      width: 100,
    },
    {
      title: t('catExpectedEmissionReduct'),
      dataIndex: 'topic',
      align: 'left',
      width: 350,
      fixed: allowFixedLegend ? 'left' : undefined,
    },
    {
      title: t('total'),
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
      title: t('ghg'),
      dataIndex: 'ghg',
      align: 'center',
      ellipsis: true,
      width: 100,
    },
    {
      title: t('catActualEmissionReduct'),
      dataIndex: 'topic',
      align: 'left',
      width: 350,
      fixed: allowFixedLegend ? 'left' : undefined,
    },
    {
      title: t('total'),
      dataIndex: 'total',
      align: 'center',
      width: 100,
      render: (colValue: any) => {
        return colValue;
      },
    },
  ];

  for (let year = 2015; year <= 2050; year++) {
    expectedTableColumns.push({
      title: year.toString(),
      dataIndex: year.toString(),
      width: 80,
      align: 'center',
      render: (colValue: any, record: any) => {
        return (
          <Input
            value={colValue}
            disabled={isView}
            onChange={(event: any) => {
              const inputValue = event.target.value;
              const regex = /^\d*$/;
              if (regex.test(inputValue) || inputValue === '') {
                onValueEnter('expected', record.topic, year.toString(), inputValue);
              }
            }}
            className="input-box"
          />
        );
      },
    });

    actualTableColumns.push({
      title: year.toString(),
      dataIndex: year.toString(),
      width: 80,
      align: 'center',
      render: (colValue: any, record: any) => {
        return (
          <Input
            value={colValue}
            disabled={isView}
            onChange={(event: any) => {
              const inputValue = event.target.value;
              const regex = /^\d*$/;
              if (regex.test(inputValue) || inputValue === '') {
                onValueEnter('actual', record.topic, year.toString(), event.target.value);
              }
            }}
            className="input-box"
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
