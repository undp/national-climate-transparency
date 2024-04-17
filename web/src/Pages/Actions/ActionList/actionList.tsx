import { useTranslation } from 'react-i18next';
import '../../../Styles/app.scss';
import LayoutTable from '../../../Components/common/Table/layout.table';
import './actionList.scss';
import { Action } from '../../../Enums/action.enum';
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
  Radio,
  Space,
  MenuProps,
} from 'antd';
import {
  EditOutlined,
  EllipsisOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAbilityContext } from '../../../Casl/Can';
import { ActionEntity } from '../../../Entities/action';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import StatusChip from '../../../Components/StatusChip/statusChip';

interface Item {
  key: number;
  actionId: number;
  activityId: string;
  title: string;
  actionType: string;
  affectedSectors: string;
  financeNeeded: number;
  financeReceived: number;
  status: string;
  validationStatus: string;
  nationalImplementingEntity: string;
}

interface Filter {
  searchBy: string;
  statusFilter: string;
  validationFilter: string;
}

const actionList = () => {
  const navigate = useNavigate();
  const { post } = useConnection();
  const ability = useAbilityContext();

  const { t } = useTranslation(['actionList']);

  // General Page State

  const [loading, setLoading] = useState<boolean>(false);

  // Table Data State

  const [tableData, setTableData] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [totalRowCount, setTotalRowRowCount] = useState<number>();

  const [sortField, setSortField] = useState<string>('actionId');
  const [sortOrder, setSortOrder] = useState<string>('DESC');

  // Filters State
  const [filterVisible, setFilterVisible] = useState<boolean>(false);

  const [appliedFilterValue, setAppliedFilterValue] = useState<Filter>({
    searchBy: 'actionId',
    statusFilter: 'All',
    validationFilter: 'All',
  });
  const [tempFilterValue, setTempFilterValue] = useState<Filter>({
    searchBy: 'actionId',
    statusFilter: 'All',
    validationFilter: 'All',
  });

  // Search Value State

  const [tempSearchValue, setTempSearchValue] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');

  // Data Read from DB

  const getAllData = async () => {
    setLoading(true);
    try {
      const payload: any = { page: currentPage, size: pageSize };

      // Adding Sort By Conditions

      payload.sort = {
        key: sortField,
        order: sortOrder,
      };

      // Adding Filter Conditions

      if (appliedFilterValue.statusFilter !== 'All') {
        payload.filterAnd = [];
        payload.filterAnd.push({
          key: 'status',
          operation: '=',
          value: appliedFilterValue.statusFilter,
        });
      }

      // if (appliedFilterValue.validationFilter !== 'All') {
      //   if (!payload.hasOwnProperty('filterAnd')) {
      //     payload.filterAnd = [];
      //   }
      //   payload.filterAnd.push({
      //     key: 'validationStatus',
      //     operation: '=',
      //     value: appliedFilterValue.validationFilter,
      //   });
      // }

      if (searchValue !== '') {
        if (!payload.hasOwnProperty('filterAnd')) {
          payload.filterAnd = [];
        }
        payload.filterAnd.push({
          key: appliedFilterValue.searchBy,
          operation: 'LIKE',
          value: [searchValue + '%'],
        });
      }

      const response: any = await post('national/actions/query', payload);
      if (response) {
        const unstructuredData: any[] = response.data;
        const structuredData: Item[] = [];
        for (let i = 0; i < unstructuredData.length; i++) {
          structuredData.push({
            key: i,
            actionId: unstructuredData[i].actionId,
            activityId: 'T001',
            title: unstructuredData[i].title,
            actionType: 'Mitigation',
            affectedSectors: unstructuredData[i].programmes?.[0]?.affectedSectors ?? '',
            financeNeeded: unstructuredData[i].financeNeeded ?? 0,
            financeReceived: unstructuredData[i].financeReceived ?? 0,
            status: unstructuredData[i].status,
            validationStatus: unstructuredData[i].validationStatus ?? '',
            nationalImplementingEntity:
              unstructuredData[i].nationalImplementingEntity ?? 'Department of Energy',
          });
        }
        setTableData(structuredData);
        setTotalRowRowCount(response.response.data.total);
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

  // Handling Table Pagination and Sorting Changes

  // eslint-disable-next-line no-unused-vars
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    // Setting Pagination
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);

    // Setting the Sort Direction
    if (sorter.order === 'ascend') {
      setSortOrder('ASC');
    } else if (sorter.order === 'descend') {
      setSortOrder('DESC');
    } else if (sorter.order === undefined) {
      setSortOrder('DESC');
    }

    // Setting the Sort By Column
    if (sorter.columnKey !== undefined) {
      setSortField(sorter.field);
    } else {
      setSortField('actionId');
    }
  };

  // Search Value Handling

  const onSearch = () => {
    setCurrentPage(1);
    setSearchValue(tempSearchValue);
  };

  // Search Value Handling

  const updatedTempFilters = (filterSection: string, newValue: string) => {
    const updatedFilters = { ...tempFilterValue };
    if (filterSection === 'validation') {
      updatedFilters.validationFilter = newValue;
      setTempFilterValue(updatedFilters);
    } else if (filterSection === 'status') {
      updatedFilters.statusFilter = newValue;
      setTempFilterValue(updatedFilters);
    } else if (filterSection === 'search') {
      updatedFilters.searchBy = newValue;
      console.log(updatedFilters);
      setTempFilterValue(updatedFilters);
    }
  };

  // State Management

  useEffect(() => {
    getAllData();
  }, [currentPage, pageSize, sortField, sortOrder, searchValue, appliedFilterValue]);

  // Popup Menu for Action List

  const actionMenu = (record: any) => {
    console.log(record);
    return (
      <List
        className="action-menu"
        size="small"
        dataSource={[
          {
            text: 'View/Validate',
            icon: <InfoCircleOutlined style={{ color: '#9155FD' }} />,
            isDisabled: false,
            click: () => {
              {
                navigate(`/actions/view/${record.actionId}`);
              }
            },
          },
          {
            text: 'Attach Programme',
            icon: <PlusOutlined style={{ color: '#9155FD' }} />,
            isDisabled: false,
            click: () => {
              {
              }
            },
          },
          {
            text: 'Edit Action',
            icon: <EditOutlined style={{ color: '#9155FD' }} />,
            isDisabled: false,
            click: () => {
              {
                navigate(`/actions/edit/${record.actionId}`);
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

  // Action List Table Columns

  const columns = [
    { title: t('actionId'), dataIndex: 'actionId', key: 'actionId', sorter: false },
    { title: t('activityId'), dataIndex: 'activityId', key: 'activityId', sorter: false },
    { title: t('titleOfAction'), dataIndex: 'title', key: 'title', sorter: true },
    { title: t('actionType'), dataIndex: 'actionType', key: 'actionType', sorter: false },
    {
      title: t('sectorAffected'),
      dataIndex: 'affectedSectors',
      key: 'affectedSectors',
      sorter: false,
    },
    {
      title: t('financeNeeded'),
      dataIndex: 'financeNeeded',
      key: 'financeNeeded',
      sorter: false,
    },
    {
      title: t('financeReceived'),
      dataIndex: 'financeReceived',
      key: 'financeReceived',
      sorter: false,
    },
    { title: t('actionStatus'), dataIndex: 'status', key: 'status', sorter: false },
    {
      title: t('validationStatus'),
      key: 'validationStatus',
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <StatusChip message={record.validationStatus} defaultMessage="pending" />;
      },
    },
    {
      title: t('nationalImplementingEntity'),
      dataIndex: 'nationalImplementingEntity',
      key: 'nationalImplementingEntity',
      sorter: false,
    },
    {
      title: '',
      key: 'activityId',
      align: 'right' as const,
      width: 6,
      // eslint-disable-next-line no-unused-vars
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
  ];

  // Items for the filter dropdown

  const items: MenuProps['items'] = [
    {
      key: '1',
      title: 'Search by',
      label: (
        <div className="filter-menu-item">
          <div className="filter-title">{t('user:searchBy')}</div>
          <Radio.Group
            onChange={(e) => {
              updatedTempFilters('search', e?.target?.value);
            }}
            value={tempFilterValue.searchBy}
          >
            <Space direction="vertical">
              <Radio value="actionId">ID</Radio>
              <Radio value="title">Title</Radio>
            </Space>
          </Radio.Group>
        </div>
      ),
    },
    {
      key: '2',
      title: 'Filter by Action Status',
      label: (
        <div className="filter-menu-item">
          <div className="filter-title">{t('filterByActionStatus')}</div>
          <Radio.Group
            onChange={(e) => {
              updatedTempFilters('status', e?.target?.value);
            }}
            value={tempFilterValue.statusFilter}
          >
            <Space direction="vertical">
              <Radio value="All">All</Radio>
              <Radio value="Planned">Planned</Radio>
              <Radio value="Adopted">Adopted</Radio>
              <Radio value="Implemented">Implemented</Radio>
            </Space>
          </Radio.Group>
        </div>
      ),
    },
    {
      key: '3',
      title: 'Filter by Validation Status',
      label: (
        <div className="filter-menu-item">
          <div className="filter-title">{t('filterByValidationStatus')}</div>
          <Radio.Group
            onChange={(e) => {
              updatedTempFilters('validation', e?.target?.value);
            }}
            value={tempFilterValue.validationFilter}
          >
            <Space direction="vertical">
              <Radio value="All">All</Radio>
              <Radio value="Pending">Pending</Radio>
              <Radio value="Validated">Validated</Radio>
            </Space>
          </Radio.Group>
        </div>
      ),
    },
    {
      key: '4',
      title: 'Action',
      label: (
        <div className="filter-menu-actions">
          <Row gutter={10}>
            <Col span={12}>
              <Button
                style={{ width: '100%' }}
                size="small"
                type="default"
                onClick={() => {
                  setFilterVisible(false);
                  setTempFilterValue({ ...appliedFilterValue });
                }}
              >
                Cancel
              </Button>
            </Col>
            <Col span={12}>
              <Button
                style={{ width: '100%' }}
                size="small"
                type="primary"
                onClick={() => {
                  setFilterVisible(false);
                  setSearchValue('');
                  setTempSearchValue('');
                  setAppliedFilterValue({ ...tempFilterValue });
                }}
              >
                Apply
              </Button>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

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
              {ability.can(Action.Create, ActionEntity) && (
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<PlusOutlined />}
                  onClick={() => {
                    navigate('/actions/add');
                  }}
                >
                  {t('Add Action')}
                </Button>
              )}
            </div>
          </Col>
          <Col md={16} xs={24}>
            <div className="filter-section">
              <div className="search-bar">
                <Input
                  addonAfter={<SearchOutlined style={{ color: '#615d67' }} onClick={onSearch} />}
                  placeholder={
                    appliedFilterValue.searchBy === 'actionId'
                      ? 'Search by Action ID'
                      : 'Search by Action Title'
                  }
                  allowClear
                  onPressEnter={onSearch}
                  onChange={(e) => setTempSearchValue(e.target.value)}
                  style={{ width: 265 }}
                  value={tempSearchValue}
                />
              </div>
              <div className="filter-bar" style={{ marginTop: '0.3rem' }}>
                <Dropdown
                  arrow={false}
                  placement="bottomRight"
                  trigger={['click']}
                  open={filterVisible}
                  menu={{ items }}
                  overlayStyle={{ width: '240px' }}
                >
                  <FilterOutlined
                    style={{
                      color: '#615d67',
                      fontSize: '20px',
                    }}
                    onClick={() => {
                      setFilterVisible(true);
                    }}
                  />
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
                total: totalRowCount,
                current: currentPage,
                pageSize: pageSize,
                showQuickJumper: true,
                pageSizeOptions: ['1', '10', '20', '30'],
                showSizeChanger: true,
                style: { textAlign: 'center' },
                locale: { page: '' },
                position: ['bottomRight'],
              }}
              handleTableChange={handleTableChange}
              emptyMessage="No Actions Available"
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default actionList;
