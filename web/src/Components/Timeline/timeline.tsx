import { Table, TablePaginationConfig, TableProps } from 'antd';
import { useTranslation } from 'react-i18next';

interface Props {
  tableData: any;
  loading: boolean;
  handleTableChange: (pagination: TablePaginationConfig, filters: any, sorter: any) => void;
}

interface DataType {
  key: string;
  name: string;
  money: string;
  address: string;
}

const TimelineTable: React.FC<Props> = ({ tableData, loading, handleTableChange }) => {
  const { t } = useTranslation(['timelineTable']);

  const expectedTableColumns: TableProps<DataType>['columns'] = [
    {
      title: t('ghg'),
      dataIndex: 'supportId',
      key: 'activityId',
      align: 'center',
      ellipsis: true,
      width: 100,
    },
    {
      title: t('catExpectedEmissionReduct'),
      dataIndex: 'financeNature',
      key: 'financeNature',
      align: 'left',
      width: 350,
    },
    { title: t('total'), dataIndex: 'direction', key: 'direction', width: 100 },
  ];

  const actualTableColumns: TableProps<DataType>['columns'] = [
    {
      title: t('ghg'),
      dataIndex: 'supportId',
      key: 'activityId',
      align: 'center',
      ellipsis: true,
      width: 100,
    },
    {
      title: t('catActualEmissionReduct'),
      dataIndex: 'financeNature',
      key: 'financeNature',
      align: 'left',
      width: 350,
    },
    { title: t('total'), dataIndex: 'direction', key: 'direction', width: 100 },
  ];

  for (let year = 2023; year <= 2050; year++) {
    expectedTableColumns.push({
      title: t(year.toString()),
      dataIndex: 'direction',
      key: 'direction',
      width: 100,
    });

    actualTableColumns.push({
      title: t(year.toString()),
      dataIndex: 'direction',
      key: 'direction',
      width: 100,
    });
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <Table
        dataSource={tableData}
        columns={expectedTableColumns}
        loading={loading}
        onChange={handleTableChange}
      />
      <Table
        dataSource={tableData}
        columns={actualTableColumns}
        loading={loading}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default TimelineTable;
