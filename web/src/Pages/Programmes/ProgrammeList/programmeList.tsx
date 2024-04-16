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
import { EditOutlined, EllipsisOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
const { Search } = Input;
import data from '../../../Testing/programmeList.json';
import { useNavigate } from 'react-router-dom';
import { Action } from '../../../Enums/action.enum';
import { ProgrammeEntity } from '../../../Entities/programme';
import { useAbilityContext } from '../../../Casl/Can';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';

interface Item {
  key: string;
  programmeId: string;
  actionId: string;
  activityId: string;
  titleOfProgramme: string;
  type: string;
  programmeStatus: string;
  subSectorAffected: string;
  estimatedInvestment: string;
}

const programmeList = () => {
  const navigate = useNavigate();
  const { post } = useConnection();
  const ability = useAbilityContext();

  const { t } = useTranslation(['programmeList']);

  // General Page State

  const [loading, setLoading] = useState<boolean>(false);

  // Table Data State

  const [tableData, setTableData] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<any>(1);

  // Filters State

  const [searchValue, setSearchValue] = useState<string>('');
  const [sortField, setSortField] = useState<string>('');
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
            text: 'Attach Project',
            icon: <PlusOutlined />,
            isDisabled: false,
            click: () => {
              {
              }
            },
          },
          {
            text: 'Edit Programme',
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
    {
      title: t('programmeId'),
      dataIndex: 'programmeId',
      key: 'programmeId',
      align: 'right' as const,
    },
    { title: t('actionId'), dataIndex: 'actionId', key: 'actionId', align: 'right' as const },
    {
      title: t('actionId'),
      dataIndex: 'activityId',
      key: 'activityId',
      align: 'right' as const,
    },
    {
      title: t('titleOfProgramme'),
      dataIndex: 'titleOfProgramme',
      key: 'titleOfProgramme',
      align: 'right' as const,
    },
    { title: t('type'), dataIndex: 'type', key: 'type' },
    {
      title: t('programmeStatus'),
      dataIndex: 'programmeStatus',
      key: 'programmeStatus',
      align: 'right' as const,
    },
    {
      title: t('subSectorAffected'),
      dataIndex: 'subSectorAffected',
      key: 'subSectorAffected',
      align: 'right' as const,
    },
    {
      title: t('estimatedInvestment'),
      dataIndex: 'estimatedInvestment',
      key: 'estimatedInvestment',
      align: 'right' as const,
    },
    {
      title: '',
      key: 'programmeId',
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

  const getAllData = async () => {
    setLoading(true);
    try {
      const payload: any = { page: 1, size: 10 };
      const response: any = await post('national/programmes/query', payload);

      if (response) {
        setTableData(response.data);
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

  const customItemRender = (page: any, type: any, element: any) => {
    return element;
  };

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
              {ability.can(Action.Create, ProgrammeEntity) && (
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<PlusOutlined />}
                  onClick={() => {
                    navigate('/programmes/add');
                  }}
                >
                  {t('addButtonType')}
                </Button>
              )}
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
              loading={loading}
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
              emptyMessage="No Programmes Available"
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default programmeList;
