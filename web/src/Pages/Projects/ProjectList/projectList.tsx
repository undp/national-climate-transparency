import { useTranslation } from 'react-i18next';
import '../../../Styles/app.scss';
import LayoutTable from '../../../Components/common/Table/layout.table';
import {
  Button,
  Col,
  Row,
  Input,
  Dropdown,
  Popover,
  List,
  Typography,
  message,
  PaginationProps,
} from 'antd';
import {
  EditOutlined,
  EllipsisOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
const { Search } = Input;

import data from '../../../Testing/projectList.json';

interface Item {
  key: string;
  projectId: string;
  programmeId: string;
  titleOfProject: string;
  titleOfSupport: string;
  projectStatus: string;
  recipientEntity: string;
  internationalImplementingEntity: string;
  nationalImplementingEntity: string;
}
const projectList = () => {
  const { t } = useTranslation(['projectList']);
  const [tableData, setTableData] = useState<Item[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortField, setSortField] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortOrder, setSortOrder] = useState<string>('');
  const [searchByTermUser, setSearchByTermUser] = useState<any>('name');
  const [valueOnSearch, setValueOnSearch] = useState<string>('');
  const [totalUser, setTotalUser] = useState<number>();
  const [filterVisible, setFilterVisible] = useState<boolean>(false);

  const actionMenu = (record: any) => {
    return (
      <List
        className="action-menu"
        size="small"
        dataSource={[
          {
            text: 'Attach Activity',
            icon: <PlusOutlined />,
            isDisabled: false,
            click: () => {
              {
              }
            },
          },
          {
            text: 'Edit Project',
            icon: <EditOutlined />,
            isDisabled: false,
            click: () => {
              {
              }
            },
          },
        ]}
        renderItem={(item) =>
          !item.isDisabled && (
            <List.Item onClick={item.click}>
              <Typography.Text className="action-icon">{item.icon}</Typography.Text>
              <span>{item.text}</span>
            </List.Item>
          )
        }
      />
    );
  };
  // Define columns for your table (example)
  const columns = [
    { title: t('projectId'), dataIndex: 'projectId', key: 'projectId', sorter: false },
    { title: t('programmeId'), dataIndex: 'programmeId', key: 'programmeId', sorter: true },
    {
      title: t('titleOfProject'),
      dataIndex: 'titleOfProject',
      key: 'titleOfProject',
      sorter: false,
    },
    { title: t('projectStatus'), dataIndex: 'projectStatus', key: 'projectStatus', sorter: false },
    {
      title: t('recipientEntity'),
      dataIndex: 'recipientEntity',
      key: 'recipientEntity',
      sorter: false,
    },
    {
      title: t('internationalImplementingEntity'),
      dataIndex: 'internationalImplementingEntity',
      key: 'internationalImplementingEntity',
      sorter: false,
    },
    {
      title: t('nationalImplementingEntity'),
      dataIndex: 'nationalImplementingEntity',
      key: 'nationalImplementingEntity',
      sorter: false,
    },
    {
      title: t('estimatedInvestment'),
      dataIndex: 'estimatedInvestment',
      key: 'estimatedInvestment',
      sorter: false,
    },
    {
      title: '',
      key: 'projectId',
      align: 'right' as const,
      width: 6,
      render: (_: any, record: any) => {
        return (
          <Popover placement="bottomRight" trigger="click" content={actionMenu(record)}>
            <EllipsisOutlined
              rotate={90}
              style={{ fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
            />
          </Popover>
        );
      },
    },
    // Add more columns as needed
  ];

  const onChange: PaginationProps['onChange'] = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    // Handle table change event (e.g., sorting, pagination)
    console.log('Pagination:', pagination);
    console.log('Filters:', filters);
    console.log('Sorter:', sorter);
    if (sorter.order === 'ascend') {
      setSortOrder('ASC');
    } else if (sorter.order === 'descend') {
      setSortOrder('DESC');
    } else if (sorter.order === undefined) {
      setSortOrder('ASC');
    }
    if (sorter.columnKey !== undefined) {
      setSortField(sorter.field);
    } else {
      setSortField('id');
      setSortOrder('DESC');
    }
  };

  const customItemRender = (page: any, type: any, element: any) => {
    return element;
  };

  const onSearch = () => {
    console.log('onSearch', searchValue);
    setCurrentPage(1);
    setValueOnSearch(searchValue);
  };

  const sort = () => {
    if (sortOrder !== '' && sortField !== '') {
      return {
        key: sortField,
        order: sortOrder,
      };
    } else
      return {
        key: 'id',
        order: 'DESC',
      };
  };

  // get All Data Params
  const getAllDataParams = () => {
    return {
      page: currentPage,
      size: pageSize,
      // filterOr: filterOr(),
      // filterAnd: filterAnd(),
      sort: sort(),
    };
  };
  const dummyDataQuery = () => {
    console.log('dummyDataQuery', currentPage, pageSize, sortField, sortOrder, valueOnSearch);
    if (sortField) {
      data.sort((a: any, b: any) => {
        const valueA = a[sortField];
        const valueB = b[sortField];
        if (sortOrder === 'ASC') {
          if (valueA < valueB) return -1;
          if (valueA > valueB) return 1;
        } else if (sortOrder === 'DESC') {
          if (valueA > valueB) return -1;
          if (valueA < valueB) return 1;
        }
        return 0;
      });
    } else if (valueOnSearch) {
      const searchData = data.filter((item) =>
        item.titleOfProject.toLowerCase().includes(searchValue.toLowerCase())
      );
      return searchData;
    }
    return data;
  };

  const getAllData = async () => {
    setLoading(true);
    try {
      // set value for backend response
      // const response: any = await post('national/user/query', getAllUserParams());
      const response: any = dummyDataQuery();
      if (response) {
        console.log('dummyDataQuer-response', response);
        setTableData(response);
        setLoading(false);
      }
    } catch (error: any) {
      message.open({
        type: 'error',
        content: error.message,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      setLoading(false);
    }
  };

  const handleFilterVisibleChange = () => {
    setFilterVisible(false);
  };

  useEffect(() => {
    getAllData();
  }, [currentPage, pageSize, searchByTermUser, valueOnSearch, sortField, sortOrder]);

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('viewTitle')}</div>
        <div className="body-sub-title">{t('viewDesc')}</div>
      </div>
      <div className="content-card">
        <Row className="table-actions-section">
          <Col md={8} xs={24}>
            <div className="action-bar">
              <Button type="primary" size="large" block icon={<PlusOutlined />} onClick={() => {}}>
                {t('addButtonType')}
              </Button>
            </div>
          </Col>
          <Col md={16} xs={24}>
            <div className="filter-section">
              <div className="search-bar">
                <Search
                  onPressEnter={onSearch}
                  placeholder="Search by Action Title"
                  allowClear
                  onChange={(e) => setSearchValue(e.target.value)}
                  onSearch={onSearch}
                  style={{ width: 265 }}
                />
              </div>
              <div className="filter-bar" style={{ marginTop: '0.3rem' }}>
                <Dropdown
                  arrow={false}
                  menu={{}} // Assuming 'items' is defined elsewhere
                  placement="bottomRight"
                  overlayClassName="filter-dropdown"
                  trigger={['click']}
                  open={filterVisible}
                  onOpenChange={handleFilterVisibleChange}
                >
                  <a className="ant-dropdown-link" onClick={(e) => {}}>
                    <FilterOutlined
                      style={{
                        color: 'rgba(58, 53, 65, 0.3)',
                        fontSize: '20px',
                      }}
                    />
                  </a>
                </Dropdown>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <LayoutTable
              tableData={tableData}
              columns={columns}
              loading={false} // Set loading state as needed
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: totalUser,
                showQuickJumper: true, // Enable jump page functionality,
                pageSizeOptions: ['10', '20', '30'],
                showSizeChanger: true,
                style: { textAlign: 'center' },
                locale: { page: '' },
                itemRender: customItemRender,
                position: ['bottomRight'],
                onChange: onChange,
              }} // Set pagination configuration
              handleTableChange={handleTableChange}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default projectList;
