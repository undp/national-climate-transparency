import { Table, TableProps, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { ActualTimeline, ExpectedTimeline } from '../../Definitions/mtgTimeline.definition';

interface Props {
  expectedTimeline: any;
  actualTimeline: any;
  loading: boolean;
  onValueEnter: (rowId: number, year: string, value: number) => void;
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
    { title: t('total'), align: 'center', dataIndex: 'total', width: 100 },
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
    { title: t('total'), align: 'center', dataIndex: 'total', width: 100 },
  ];

  for (let year = 2023; year <= 2050; year++) {
    expectedTableColumns.push({
      title: year.toString(),
      dataIndex: year.toString(),
      width: 70,
      align: 'center',
      render: (record: any) => {
        return (
          <Input
            value={record}
            onChange={(event: any) => {
              onValueEnter(5, year.toString(), event.target.value);
            }}
          />
        );
      },
    });

    actualTableColumns.push({
      title: year.toString(),
      dataIndex: year.toString(),
      width: 70,
      align: 'center',
      render: (record: any) => {
        return (
          <Input
            value={record}
            onChange={(event: any) => {
              onValueEnter(5, year.toString(), event.target.value);
            }}
          />
        );
      },
    });
  }

  return (
    <div style={{ overflowX: 'auto' }}>
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
