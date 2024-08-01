import { Table, Empty, TablePaginationConfig } from 'antd';

interface Props {
  tableData: any;
  columns: any; // Define the type of columns
  loading: boolean;
  pagination: TablePaginationConfig; // Define the type of pagination
  handleTableChange: (pagination: TablePaginationConfig, filters: any, sorter: any) => void;
  emptyMessage: string;
  handleHorizontalOverflow?: boolean;
  addBorders?: boolean;
}

const LayoutTable: React.FC<Props> = ({
  tableData,
  columns,
  loading,
  pagination,
  handleTableChange,
  emptyMessage,
  handleHorizontalOverflow,
  addBorders,
}) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <Table
        bordered={addBorders ?? false}
        dataSource={tableData}
        columns={columns}
        className="common-table-class"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={handleHorizontalOverflow ? { x: 1500 } : undefined}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={tableData.length === 0 ? emptyMessage : null}
            />
          ),
        }}
      />
    </div>
  );
};

export default LayoutTable;
