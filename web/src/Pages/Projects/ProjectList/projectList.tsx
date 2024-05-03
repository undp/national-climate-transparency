import { useTranslation } from 'react-i18next';
import '../../../Styles/app.scss';
import LayoutTable from '../../../Components/common/Table/layout.table';
import './projectList.scss';
import { Action } from '../../../Enums/action.enum';
import { Button, Col, Row, Input, Dropdown, Popover, message, Radio, Space, MenuProps } from 'antd';
import { EllipsisOutlined, FilterOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAbilityContext } from '../../../Casl/Can';
import { ActionEntity } from '../../../Entities/action';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import StatusChip from '../../../Components/StatusChip/statusChip';
import SimpleAttachEntity from '../../../Components/Popups/simpleAttach';
import ScrollableList from '../../../Components/ScrollableList/scrollableList';
import { GraphUpArrow } from 'react-bootstrap-icons';
import { actionMenuWithAttaching } from '../../../Components/Popups/tableAction';
import { ProjectEntity } from '../../../Entities/project';

interface Item {
  key: number;
  projectId: string;
  programmeId: string;
  title: string;
  projectStatus: string;
  recipientEntity: string[];
  intImplementingEntity: string[];
  validationStatus: string;
  natImplementingEntity: string[];
  estimatedInvestment: number;
}

interface Filter {
  searchBy: string;
  statusFilter: string;
  validationFilter: string;
}

const projectList = () => {
  const navigate = useNavigate();
  const { get, post } = useConnection();
  const ability = useAbilityContext();

  const { t } = useTranslation(['projectList', 'tableAction']);

  // General Page State

  const [loading, setLoading] = useState<boolean>(false);

  // Table Data State

  const [tableData, setTableData] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [totalRowCount, setTotalRowRowCount] = useState<number>();

  const [sortField, setSortField] = useState<string>('projectId');
  const [sortOrder, setSortOrder] = useState<string>('DESC');

  // Filters State
  const [filterVisible, setFilterVisible] = useState<boolean>(false);

  const [appliedFilterValue, setAppliedFilterValue] = useState<Filter>({
    searchBy: 'projectId',
    statusFilter: 'All',
    validationFilter: 'All',
  });
  const [tempFilterValue, setTempFilterValue] = useState<Filter>({
    searchBy: 'projectId',
    statusFilter: 'All',
    validationFilter: 'All',
  });

  // Search Value State

  const [tempSearchValue, setTempSearchValue] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');

  // Programme Attachment State

  const [openAttaching, setOpenAttaching] = useState<boolean>(false);
  const [allFreeActivityIds, setAllFreeActivityIds] = useState<string[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [attachedActivityIds, setAttachedActivityIds] = useState<string[]>([]);
  const [toBeAttached, setToBeAttached] = useState<string[]>([]);

  // Attach Multiple Activities for a Project

  const attachActivities = async () => {
    if (toBeAttached.length > 0) {
      const payload = {
        projectId: selectedProjectId,
        activityIds: toBeAttached,
      };
      const response: any = await post('national/activities/link', payload);
      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: t('activityLinkSuccess'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        navigate('/projects');
      }
    }
  };

  // Free Act Read from DB

  const getFreeActivityIds = async () => {
    const response: any = await get('national/activities/link/eligible');

    const freeActivityIds: string[] = [];
    response.data.forEach((act: any) => {
      freeActivityIds.push(act.activityId);
    });
    setAllFreeActivityIds(freeActivityIds);
  };

  // Get Attached Programmes

  const getAttachedActivityIds = async (projectId: string) => {
    const payload = {
      page: 1,
      size: 100,
      filterAnd: [
        {
          key: 'projectId',
          operation: '=',
          value: projectId,
        },
      ],
      sort: {
        key: 'projectId',
        order: 'ASC',
      },
    };
    const response: any = await post('national/activities/query', payload);

    const attachedActIds: string[] = [];
    response.data.forEach((act: any) => {
      attachedActIds.push(act.activityId);
    });
    setAttachedActivityIds(attachedActIds);
  };

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
          key: 'projectStatus',
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
          value: ['%' + searchValue + '%'],
        });
      }

      const response: any = await post('national/projects/query', payload);
      if (response) {
        const unstructuredData: any[] = response.data;
        const structuredData: Item[] = [];
        for (let i = 0; i < unstructuredData.length; i++) {
          structuredData.push({
            key: i,
            projectId: unstructuredData[i].projectId,
            programmeId: unstructuredData[i].programme?.programmeId ?? '',
            title: unstructuredData[i].title,
            projectStatus: unstructuredData[i].projectStatus,
            recipientEntity: unstructuredData[i].recipientEntities,
            intImplementingEntity: unstructuredData[i].internationalImplementingEntities,
            validationStatus: unstructuredData[i].validationStatus ?? '',
            natImplementingEntity: unstructuredData[i].programme?.natImplementor ?? [],
            estimatedInvestment: unstructuredData[i].programme?.investment,
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
      setSortField('projectId');
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
      setTempFilterValue(updatedFilters);
    }
  };

  // State Management

  useEffect(() => {
    getFreeActivityIds();
    if (!openAttaching) {
      setAttachedActivityIds([]);
    }
  }, [openAttaching]);

  useEffect(() => {
    getAllData();
  }, [currentPage, pageSize, sortField, sortOrder, searchValue, appliedFilterValue]);

  // Children Attachment Functionality

  useEffect(() => {
    if (toBeAttached.length > 0) {
      attachActivities();
      setToBeAttached([]);
      setSelectedProjectId(undefined);
    }
  }, [toBeAttached]);

  // Action List Table Columns

  const columns = [
    { title: t('projectId'), width: 85, dataIndex: 'projectId', key: 'projectId', sorter: false },
    {
      title: t('programmeId'),
      width: 112,
      dataIndex: 'programmeId',
      key: 'programmeId',
      sorter: false,
    },
    { title: t('titleOfProject'), width: 125, dataIndex: 'title', key: 'title', sorter: false },
    {
      title: t('projectStatus'),
      width: 112,
      dataIndex: 'projectStatus',
      key: 'projectStatus',
      sorter: false,
    },
    {
      title: t('recipientEntity'),
      sorter: false,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.recipientEntity}></ScrollableList>;
      },
    },
    {
      title: t('internationalImplementingEntity'),
      sorter: false,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.intImplementingEntity}></ScrollableList>;
      },
    },
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
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.natImplementingEntity}></ScrollableList>;
      },
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
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return (
          <Popover
            showArrow={false}
            trigger={'click'}
            placement="bottomRight"
            content={actionMenuWithAttaching(
              'project',
              ability,
              ProjectEntity,
              record.projectId,
              getAttachedActivityIds,
              setOpenAttaching,
              setSelectedProjectId,
              navigate,
              t
            )}
          >
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
              <Radio value="projectId">ID</Radio>
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
          <div className="filter-title">{t('filterByProjectStatus')}</div>
          <Radio.Group
            onChange={(e) => {
              updatedTempFilters('status', e?.target?.value);
            }}
            value={tempFilterValue.statusFilter}
          >
            <Space direction="vertical">
              <Radio value="All">All</Radio>
              <Radio value="Planned">Planned</Radio>
              <Radio value="Ongoing">Ongoing</Radio>
              <Radio value="Completed">Completed</Radio>
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
        <SimpleAttachEntity
          open={openAttaching}
          setOpen={setOpenAttaching}
          options={allFreeActivityIds}
          content={{
            buttonName: t('attachActivity'),
            attach: t('attach'),
            contentTitle: t('attachActivity'),
            listTitle: t('activityList'),
            cancel: t('cancel'),
          }}
          attachedUnits={attachedActivityIds}
          setToBeAttached={setToBeAttached}
          icon={<GraphUpArrow style={{ fontSize: '120px' }} />}
        ></SimpleAttachEntity>
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
                    navigate('/projects/add');
                  }}
                >
                  {t('addProject')}
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
                    appliedFilterValue.searchBy === 'projectId'
                      ? 'Search by Project ID'
                      : 'Search by Project Title'
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
                pageSizeOptions: ['10', '20', '30'],
                showSizeChanger: true,
                style: { textAlign: 'center' },
                locale: { page: '' },
                position: ['bottomRight'],
              }}
              handleTableChange={handleTableChange}
              emptyMessage="No Projects Available"
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default projectList;
