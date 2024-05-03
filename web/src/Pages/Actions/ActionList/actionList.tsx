import { useTranslation } from 'react-i18next';
import '../../../Styles/app.scss';
import LayoutTable from '../../../Components/common/Table/layout.table';
import './actionList.scss';
import { Action } from '../../../Enums/action.enum';
import { Button, Col, Row, Input, Dropdown, Popover, message, Radio, Space, MenuProps } from 'antd';
import {
  AppstoreOutlined,
  EllipsisOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAbilityContext } from '../../../Casl/Can';
import { ActionEntity } from '../../../Entities/action';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import StatusChip from '../../../Components/StatusChip/statusChip';
import SimpleAttachEntity from '../../../Components/Popups/simpleAttach';
import ScrollableList from '../../../Components/ScrollableList/scrollableList';
import { actionMenu } from '../../../Components/Popups/tableAction';

interface Item {
  key: number;
  actionId: number;
  title: string;
  actionType: string;
  affectedSectors: string[];
  financeNeeded: number;
  financeReceived: number;
  status: string;
  validationStatus: string;
  nationalImplementingEntity: string[];
}

interface Filter {
  searchBy: string;
  statusFilter: string;
  validationFilter: string;
}

const actionList = () => {
  const navigate = useNavigate();
  const { get, post } = useConnection();
  const ability = useAbilityContext();

  const { t } = useTranslation(['actionList', 'tableAction']);

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

  // Programme Attachment State

  const [openAttaching, setOpenAttaching] = useState<boolean>(false);
  const [allFreeProgrammeIds, setAllFreeProgrammeIds] = useState<string[]>([]);

  const [selectedActionId, setSelectedActionId] = useState<string>();
  const [attachedProgrammeIds, setAttachedProgrammeIds] = useState<string[]>([]);
  const [toBeAttached, setToBeAttached] = useState<string[]>([]);

  // Free Prg Read from DB

  const getFreeProgrammeIds = async () => {
    const response: any = await get('national/programmes/link/eligible');

    const freeProgrammeIds: string[] = [];
    response.data.forEach((prg: any) => {
      freeProgrammeIds.push(prg.programmeId);
    });
    setAllFreeProgrammeIds(freeProgrammeIds);
  };

  // Get Attached Programmes

  const getAttachedProgrammeIds = async (actionId: string) => {
    const payload = {
      page: 1,
      size: 100,
      filterAnd: [
        {
          key: 'actionId',
          operation: '=',
          value: actionId,
        },
      ],
      sort: {
        key: 'programmeId',
        order: 'ASC',
      },
    };
    const response: any = await post('national/programmes/query', payload);

    const freeProgrammeIds: string[] = [];
    response.data.forEach((prg: any) => {
      freeProgrammeIds.push(prg.programmeId);
    });
    setAttachedProgrammeIds(freeProgrammeIds);
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
            title: unstructuredData[i].title,
            status: unstructuredData[i].status,
            validationStatus: unstructuredData[i].validationStatus ?? '',
            actionType: unstructuredData[i].migratedData[0]?.types ?? [],
            affectedSectors: unstructuredData[i].migratedData[0]?.sectorsAffected ?? [],
            nationalImplementingEntity: unstructuredData[i].migratedData[0]?.natImplementors ?? [],
            financeNeeded: unstructuredData[i].migratedData[0]?.financeNeeded ?? 0,
            financeReceived: unstructuredData[i].migratedData[0]?.financeReceived ?? 0,
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

  // Attach Multiple Programmes for an Action

  const attachProgrammes = async () => {
    const payload = {
      actionId: selectedActionId,
      programmes: toBeAttached,
    };
    const response: any = await post('national/programmes/link', payload);
    if (response.status === 200 || response.status === 201) {
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });

      message.open({
        type: 'success',
        content: t('programmeLinkSuccess'),
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });

      getAllData();
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
    getFreeProgrammeIds();
    if (!openAttaching) {
      setAttachedProgrammeIds([]);
    }
  }, [openAttaching]);

  useEffect(() => {
    getAllData();
  }, [currentPage, pageSize, sortField, sortOrder, searchValue, appliedFilterValue]);

  // Children Attachment Functionality

  useEffect(() => {
    if (toBeAttached.length > 0) {
      attachProgrammes();
      setToBeAttached([]);
      setSelectedActionId(undefined);
    }
  }, [toBeAttached]);

  // Action List Table Columns

  const columns = [
    { title: t('actionId'), width: 100, dataIndex: 'actionId', key: 'actionId', sorter: false },
    { title: t('titleOfAction'), width: 120, dataIndex: 'title', key: 'title', sorter: false },
    {
      title: t('actionType'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.actionType}></ScrollableList>;
      },
    },
    {
      title: t('sectorAffected'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.affectedSectors}></ScrollableList>;
      },
    },
    {
      title: t('financeNeeded'),
      width: 120,
      dataIndex: 'financeNeeded',
      key: 'financeNeeded',
      sorter: false,
    },
    {
      title: t('financeReceived'),
      width: 130,
      dataIndex: 'financeReceived',
      key: 'financeReceived',
      sorter: false,
    },
    { title: t('actionStatus'), width: 120, dataIndex: 'status', key: 'status', sorter: false },
    {
      title: t('validationStatus'),
      key: 'validationStatus',
      width: 140,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <StatusChip message={record.validationStatus} defaultMessage="pending" />;
      },
    },
    {
      title: t('nationalImplementingEntity'),
      width: 180,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.nationalImplementingEntity}></ScrollableList>;
      },
    },
    {
      title: '',
      key: 'actionId',
      align: 'right' as const,
      width: 6,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return (
          <Popover
            showArrow={false}
            trigger={'click'}
            placement="bottomRight"
            content={actionMenu(
              'action',
              ability,
              ActionEntity,
              record.actionId,
              getAttachedProgrammeIds,
              setOpenAttaching,
              setSelectedActionId,
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
        <SimpleAttachEntity
          open={openAttaching}
          setOpen={setOpenAttaching}
          options={allFreeProgrammeIds}
          content={{
            buttonName: t('attachProgramme'),
            attach: t('attach'),
            contentTitle: t('attachProgramme'),
            listTitle: t('programmeList'),
            cancel: t('cancel'),
          }}
          attachedUnits={attachedProgrammeIds}
          setToBeAttached={setToBeAttached}
          icon={<AppstoreOutlined style={{ fontSize: '120px' }} />}
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
                    navigate('/actions/add');
                  }}
                >
                  {t('addAction')}
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
                pageSizeOptions: ['10', '20', '30'],
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
