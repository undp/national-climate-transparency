import { useTranslation } from 'react-i18next';
import '../../../Styles/app.scss';
import LayoutTable from '../../../Components/common/Table/layout.table';
import './programmeList.scss';
import { Action } from '../../../Enums/action.enum';
import { Button, Col, Row, Input, Dropdown, Popover, message, Radio, Space, MenuProps } from 'antd';
import { EllipsisOutlined, FilterOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAbilityContext } from '../../../Casl/Can';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import StatusChip from '../../../Components/StatusChip/statusChip';
import SimpleAttachEntity from '../../../Components/Popups/simpleAttach';
import { ProgrammeEntity } from '../../../Entities/programme';
import { Layers } from 'react-bootstrap-icons';
import ScrollableList from '../../../Components/ScrollableList/scrollableList';
import ActionMenu from '../../../Components/Popups/tableAction';

interface Item {
  key: number;
  programmeId: string;
  actionId: string;
  title: string;
  type: string[];
  status: string;
  validationStatus: string;
  subSectorsAffected: string[];
  investment: number;
}

interface Filter {
  searchBy: string;
  statusFilter: string;
  validationFilter: string;
}

const programmeList = () => {
  const navigate = useNavigate();
  const { get, post } = useConnection();
  const ability = useAbilityContext();

  const { t } = useTranslation(['programmeList']);

  // General Page State

  const [loading, setLoading] = useState<boolean>(false);
  const [openPopoverKey, setOpenPopoverKey] = useState<number>();

  // Table Data State

  const [tableData, setTableData] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [totalRowCount, setTotalRowRowCount] = useState<number>();

  const [sortField, setSortField] = useState<string>('programmeId');
  const [sortOrder, setSortOrder] = useState<string>('DESC');

  // Filters State
  const [filterVisible, setFilterVisible] = useState<boolean>(false);

  const [appliedFilterValue, setAppliedFilterValue] = useState<Filter>({
    searchBy: 'programmeId',
    statusFilter: 'All',
    validationFilter: 'All',
  });
  const [tempFilterValue, setTempFilterValue] = useState<Filter>({
    searchBy: 'programmeId',
    statusFilter: 'All',
    validationFilter: 'All',
  });

  // Search Value State

  const [tempSearchValue, setTempSearchValue] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');

  // Project Attachment State

  const [openAttaching, setOpenAttaching] = useState<boolean>(false);
  const [allFreeProjectIds, setAllFreeProjectIds] = useState<string[]>([]);

  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>();
  const [attachedProjectIds, setAttachedProjectIds] = useState<string[]>([]);
  const [toBeAttached, setToBeAttached] = useState<string[]>([]);

  // Attach Multiple Projects for a Project

  const attachProjects = async () => {
    const payload = {
      programmeId: selectedProgrammeId,
      projectIds: toBeAttached,
    };
    const response: any = await post('national/projects/link', payload);
    if (response.status === 200 || response.status === 201) {
      message.open({
        type: 'success',
        content: t('projectLinkSuccess'),
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      navigate('/programmes');
    }
  };

  // Free Prg Read from DB

  const getFreeProjectIds = async () => {
    const response: any = await get('national/projects/link/eligible');

    const freeProjectIds: string[] = [];
    response.data.forEach((prj: any) => {
      freeProjectIds.push(prj.projectId);
    });
    setAllFreeProjectIds(freeProjectIds);
  };

  // Get Attached Projects

  const getAttachedProjectIds = async (programmeId: string) => {
    const payload = {
      page: 1,
      size: 100,
      filterAnd: [
        {
          key: 'programmeId',
          operation: '=',
          value: programmeId,
        },
      ],
      sort: {
        key: 'projectId',
        order: 'ASC',
      },
    };
    const response: any = await post('national/projects/query', payload);

    const freeProjectIds: string[] = [];
    response.data.forEach((prj: any) => {
      freeProjectIds.push(prj.projectId);
    });
    setAttachedProjectIds(freeProjectIds);
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
          key: 'programmeStatus',
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

      const response: any = await post('national/programmes/query', payload);
      if (response) {
        const unstructuredData: any[] = response.data;
        const structuredData: Item[] = [];
        for (let i = 0; i < unstructuredData.length; i++) {
          structuredData.push({
            key: i,
            programmeId: unstructuredData[i].programmeId,
            actionId: unstructuredData[i].action?.actionId,
            title: unstructuredData[i].title,
            status: unstructuredData[i].programmeStatus,
            validationStatus: unstructuredData[i].validationStatus ?? '',
            subSectorsAffected: unstructuredData[i].affectedSubSector,
            investment: unstructuredData[i].investment,
            type: unstructuredData[i].migratedData[0]?.types ?? [],
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
      setSortField('programmeId');
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
    getFreeProjectIds();
    if (!openAttaching) {
      setAttachedProjectIds([]);
    }
  }, [openAttaching]);

  useEffect(() => {
    getAllData();
  }, [currentPage, pageSize, sortField, sortOrder, searchValue, appliedFilterValue]);

  // Children Attachment Functionality

  useEffect(() => {
    if (toBeAttached.length > 0) {
      attachProjects();
      setToBeAttached([]);
      setSelectedProgrammeId(undefined);
    }
  }, [toBeAttached]);

  // Controlling Popover visibility

  const shouldPopoverOpen = (key: number) => {
    if (key === openPopoverKey) {
      return true;
    } else {
      return false;
    }
  };

  // Action List Table Columns

  const columns = [
    {
      title: t('programmeId'),
      dataIndex: 'programmeId',
      key: 'programmeId',
      sorter: false,
      width: 120,
    },
    { title: t('actionId'), dataIndex: 'actionId', key: 'actionId', sorter: false, width: 90 },
    { title: t('titleOfProgramme'), dataIndex: 'title', key: 'title', sorter: false, width: 130 },
    {
      title: t('type'),
      width: 80, // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.type}></ScrollableList>;
      },
    },
    { title: t('programmeStatus'), dataIndex: 'status', key: 'status', sorter: false, width: 130 },
    {
      title: t('validationStatus'),
      key: 'validationStatus',
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <StatusChip message={record.validationStatus} defaultMessage="pending" />;
      },
    },
    {
      title: t('subSectorAffected'),
      sorter: false,
      align: 'center' as const,
      width: 150,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.subSectorsAffected}></ScrollableList>;
      },
    },
    {
      title: t('estimatedInvestment'),
      dataIndex: 'investment',
      key: 'investment',
      sorter: false,
      align: 'center' as const,
      width: 150,
    },
    {
      title: '',
      key: 'programmeId',
      align: 'right' as const,
      width: 6,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return (
          <Popover
            popupVisible={shouldPopoverOpen(record.key)}
            placement="bottomRight"
            content={
              <ActionMenu
                key={record.key}
                calledIn="programme"
                ability={ability}
                entity={ProgrammeEntity}
                recordId={record.programmeId}
                setOpenAttaching={setOpenAttaching}
                setSelectedEntityId={setSelectedProgrammeId}
                getAttachedEntityIds={getAttachedProjectIds}
                setOpenPopoverKey={setOpenPopoverKey}
              />
            }
            onOpenChange={() => {
              setOpenPopoverKey(undefined);
            }}
          >
            <EllipsisOutlined
              rotate={90}
              style={{ fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
              onClick={() => {
                setOpenPopoverKey(record.key);
              }}
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
              <Radio value="programmeId">ID</Radio>
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
          <div className="filter-title">{t('filterByProgrammeStatus')}</div>
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
          options={allFreeProjectIds}
          content={{
            buttonName: t('attachProject'),
            attach: t('attach'),
            contentTitle: t('attachProject'),
            listTitle: t('projectList'),
            cancel: t('cancel'),
          }}
          attachedUnits={attachedProjectIds}
          setToBeAttached={setToBeAttached}
          icon={<Layers style={{ fontSize: '120px' }} />}
        ></SimpleAttachEntity>
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
                  {t('addProgramme')}
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
                    appliedFilterValue.searchBy === 'programmeId'
                      ? 'Search by Programme ID'
                      : 'Search by Programme Title'
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
                  overlayStyle={{ width: '250px' }}
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
              emptyMessage="No Programmes Available"
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default programmeList;
