import { Table, TableProps, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { ActualTimeline, ExpectedTimeline } from '../../Definitions/mtgTimeline.definition';
import './timeline.scss';

interface Props {
  expectedTimeline: any;
  actualTimeline: any;
  loading: boolean;
  onValueEnter: (
    tableTYpe: 'expected' | 'actual',
    rowId: string,
    year: string,
    value: number
  ) => void;
}

const TimelineTable: React.FC<Props> = ({
  expectedTimeline,
  actualTimeline,
  loading,
  onValueEnter,
}) => {
  const { t } = useTranslation(['timelineTable']);

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
    },
    { title: t('total'), dataIndex: 'total', align: 'center', width: 100 },
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
    },
    { title: t('total'), dataIndex: 'total', align: 'center', width: 100 },
  ];

  for (let year = 2023; year <= 2050; year++) {
    expectedTableColumns.push({
      title: year.toString(),
      dataIndex: year.toString(),
      width: 80,
      align: 'center',
      render: (colValue: any, record: any) => {
        return (
          <Input
            value={colValue}
            onChange={(event: any) => {
              onValueEnter('expected', record.topic, year.toString(), event.target.value);
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
            onChange={(event: any) => {
              onValueEnter('actual', record.topic, year.toString(), event.target.value);
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
      />
      <Table
        dataSource={actualTimeline}
        columns={actualTableColumns}
        loading={loading}
        pagination={false}
      />
    </div>
  );
};

export default TimelineTable;
