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
  PaginationProps,
} from 'antd';
import { EditOutlined, EllipsisOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
const { Search } = Input;
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

  // Filters State

  const [searchValue, setSearchValue] = useState<string>('');
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('');

  const [valueOnSearch, setValueOnSearch] = useState<string>('');
  const [filterVisible, setFilterVisible] = useState<boolean>(false);

  // Data Read from DB

  const getAllData = async () => {
    setLoading(true);
    try {
      const payload: any = { page: 1, size: 10 };
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
    setCurrentPage(1);
    setValueOnSearch(searchValue);
  };

  const handleFilterVisibleChange = () => {
    setFilterVisible(false);
  };

  // State Management

  useEffect(() => {
    getAllData();
  }, [currentPage, pageSize, valueOnSearch, sortField, sortOrder]);

  // Popup Menu for Action List

  const actionMenu = (record: any) => {
    console.log(record);
    return (
      <List
        className="action-menu"
        size="small"
        dataSource={[
          {
            text: 'Attach Programme',
            icon: <PlusOutlined />,
            isDisabled: false,
            click: () => {
              {
              }
            },
          },
          {
            text: 'Edit Action',
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

  // Action List Table Columns

  const columns = [
    { title: t('actionId'), dataIndex: 'actionId', key: 'actionId', sorter: false },
    { title: t('activityId'), dataIndex: 'activityId', key: 'activityId', sorter: true },
    { title: t('titleOfAction'), dataIndex: 'title', key: 'title', sorter: false },
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
                  <a className="ant-dropdown-link" onClick={() => {}}>
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
                showQuickJumper: true,
                pageSizeOptions: ['10', '20', '30'],
                showSizeChanger: true,
                style: { textAlign: 'center' },
                locale: { page: '' },
                position: ['bottomRight'],
                onChange: onChange,
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
