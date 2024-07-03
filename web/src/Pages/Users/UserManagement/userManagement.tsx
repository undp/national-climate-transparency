import {
  BankOutlined,
  EditOutlined,
  EllipsisOutlined,
  ExperimentOutlined,
  FilterOutlined,
  PlusOutlined,
  KeyOutlined,
  StarOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Dropdown,
  Input,
  List,
  MenuProps,
  message,
  Popover,
  Radio,
  Row,
  Space,
  Typography,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAbilityContext } from '../../../Casl/Can';
import { RoleIcon } from '../../../Components/common/RoleIcon/role.icon';
import { CompanyRole } from '../../../Enums/company.role.enum';

import {
  GovBGColor,
  ObsBGColor,
  AdminBGColor,
  RootBGColor,
  AdminColor,
  RootColor,
  GovColor,
  ObsColor,
} from '../../../Styles/role.color.constants';

import { useUserContext } from '../../../Context/UserInformationContext/userInformationContext';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { useTranslation } from 'react-i18next';
import UserActionConfirmationModel from '../../../Components/Models/userActionConfirmationModel';
import { useEffect, useState } from 'react';
import { UserData } from '../../../Definitions/userManagement.definitions';
import { plainToClass } from 'class-transformer';
import { Action } from '../../../Enums/action.enum';
import { User } from '../../../Entities/user';
import { PersonDash, PersonCheck } from 'react-bootstrap-icons';
import { UserManagementColumns } from '../../../Enums/user.management.columns.enum';
import './userManagementComponent.scss';
import '../../../Styles/common.table.scss';
import { UserState } from '../../../Enums/user.state.enum';
import { Role } from '../../../Enums/role.enum';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { displayErrorMessage } from '../../../Utils/errorMessageHandler';
import {
  addActionBps,
  filterDropdownBps,
  listSearchBarBps,
  searchBoxBps,
} from '../../../Definitions/breakpoints/breakpoints';

interface Filter {
  searchBy: string;
  roleFilter: string;
}

const UserManagement = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['company', 'userProfile', 'entityAction']);

  const visibleColumns = [
    UserManagementColumns.logo,
    UserManagementColumns.name,
    UserManagementColumns.email,
    UserManagementColumns.phoneNo,
    UserManagementColumns.organisation,
    UserManagementColumns.status,
    UserManagementColumns.role,
    UserManagementColumns.actions,
  ];

  const navigateToUpdateUser = (record: any) => {
    navigate('/userManagement/updateUser', { state: { record } });
  };

  const navigateToAddNewUser = () => {
    navigate('/userManagement/addUSer');
  };

  const ability = useAbilityContext();
  const { userInfoState } = useUserContext();
  const { post, put } = useConnection();

  if (
    userInfoState?.userRole === Role.GovernmentUser ||
    userInfoState?.userRole === Role.Observer
  ) {
    navigate('/dashboard');
  }

  // Users List Page State

  const [loading, setLoading] = useState<boolean>(false);

  const [userStatusChangeModalRecord, setUserStatusChangeModalRecord] = useState<any>();
  const [actionInfo, setActionInfo] = useState<any>({});
  const [errorMsg, setErrorMsg] = useState<any>('');
  const [openDeactivationConfirmationModal, setOpenDeactivationConfirmationModal] = useState(false);
  const [openActivationConfirmationModal, setOpenActivationConfirmationModal] = useState(false);

  // Table Data State

  const [tableData, setTableData] = useState<UserData[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [totalRowCount, setTotalRowRowCount] = useState<number>();

  const [sortField, setSortField] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<string>('DESC');

  // Filters State
  const [filterVisible, setFilterVisible] = useState<boolean>(false);

  const [appliedFilterValue, setAppliedFilterValue] = useState<Filter>({
    searchBy: 'name',
    roleFilter: 'All',
  });
  const [tempFilterValue, setTempFilterValue] = useState<Filter>({
    searchBy: 'name',
    roleFilter: 'All',
  });

  // Search Value State

  const [tempSearchValue, setTempSearchValue] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');

  // Page Functions

  document.addEventListener('mousedown', (event: any) => {
    const userFilterArea1 = document.querySelector('.filter-bar');
    const userFilterArea2 = document.querySelector('.filter-dropdown');

    if (userFilterArea1 !== null && userFilterArea2 !== null) {
      if (userFilterArea1.contains(event.target) || userFilterArea2.contains(event.target)) {
        setFilterVisible(true);
      } else {
        setFilterVisible(false);
      }
    }
  });

  const getRoleComponent = (item: UserData) => {
    const role = item?.role;
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
        {role === 'Root' ? (
          <RoleIcon icon={<KeyOutlined />} bg={RootBGColor} color={RootColor} />
        ) : role === 'Admin' ? (
          <RoleIcon icon={<StarOutlined />} bg={AdminBGColor} color={AdminColor} />
        ) : role === 'GovernmentUser' ? (
          <RoleIcon icon={<BankOutlined />} bg={GovBGColor} color={GovColor} />
        ) : (
          <RoleIcon icon={<ExperimentOutlined />} bg={ObsBGColor} color={ObsColor} />
        )}
        <div>
          {role === 'Admin'
            ? 'Administrator'
            : role === 'Root'
            ? 'Super Admin'
            : role === 'GovernmentUser'
            ? 'Government User'
            : role === 'Observer'
            ? 'Observer'
            : role}
        </div>
      </div>
    );
  };

  const changeUserStatus = async (updatedUserRecord: UserData, remarks: string) => {
    setLoading(true);
    try {
      const response = await put('national/users/update', {
        id: updatedUserRecord.id,
        state: updatedUserRecord.status,
        remarks,
      });
      if (response.status === 200) {
        message.open({
          type: 'success',
          content:
            updatedUserRecord.status === '1'
              ? ` ${updatedUserRecord.name} ${t('user:activateSuccessMsg')}`
              : ` ${updatedUserRecord.name} ${t('user:deactivateSuccessMsg')}`,
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        // eslint-disable-next-line no-use-before-define, @typescript-eslint/no-use-before-define
        getAllUsers();
        setLoading(false);
        setOpenDeactivationConfirmationModal(false);
        setOpenActivationConfirmationModal(false);
      }
    } catch (error: any) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  const deactivateUser = (remarks: string) => {
    userStatusChangeModalRecord.status = UserState.SUSPENDED;
    changeUserStatus(userStatusChangeModalRecord, remarks);
  };

  const activateUser = (remarks: string) => {
    userStatusChangeModalRecord.status = UserState.ACTIVE;
    changeUserStatus(userStatusChangeModalRecord, remarks);
  };

  const handleCancel = () => {
    setOpenDeactivationConfirmationModal(false);
    setOpenActivationConfirmationModal(false);
  };

  const actionMenu = (record: UserData) => {
    const data = [
      {
        text: 'Edit',
        icon: <EditOutlined />,
        isDisabled: !ability.can(Action.Update, plainToClass(User, record)),
        click: () => {
          navigateToUpdateUser(record);
        },
      },
    ];

    if (
      // eslint-disable-next-line eqeqeq
      record.status == UserState.ACTIVE &&
      ((userInfoState?.userRole === Role.Root && record.role === Role.Admin) ||
        record.role === Role.GovernmentUser ||
        record.role === Role.Observer)
    ) {
      data.push({
        text: 'Deactivate',
        icon: <PersonDash className="deactivate-user-icon" />,
        isDisabled: !ability.can(Action.Delete, plainToClass(User, record)),
        click: () => {
          setUserStatusChangeModalRecord(record);
          setActionInfo({
            action: 'Deactivate',
            headerText: `${t('user:deactivateConfirmHeaderText')}`,
            text: `${t('user:deactivateConfirmText')}`,
            type: 'danger',
            icon: <PersonDash />,
          });
          setErrorMsg('');
          setOpenDeactivationConfirmationModal(true);
        },
      });
    } else if (
      // eslint-disable-next-line eqeqeq
      record.status == UserState.SUSPENDED &&
      ((userInfoState?.userRole === Role.Root && record.role === Role.Admin) ||
        record.role === Role.GovernmentUser ||
        record.role === Role.Observer)
    ) {
      data.push({
        text: 'Activate',
        icon: <PersonCheck className="activate-user-icon" />,
        isDisabled: !ability.can(Action.Delete, plainToClass(User, record)),
        click: () => {
          setUserStatusChangeModalRecord(record);
          setActionInfo({
            action: 'Reactivate',
            headerText: `${t('user:activateConfirmHeaderText')}`,
            text: `${t('user:activateConfirmText')}`,
            type: 'primary',
            icon: <PersonCheck />,
          });
          setErrorMsg('');
          setOpenActivationConfirmationModal(true);
        },
      });
    }

    return (
      <List
        className="action-menu"
        size="small"
        dataSource={data}
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

  const columns = [
    {
      title: t('user:name'),
      dataIndex: 'name',
      key: UserManagementColumns.name,
      sorter: true,
      align: 'left' as const,
      render: (item: any) => {
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontWeight: 600 }}>{item}</div>
          </div>
        );
      },
    },
    {
      title: t('user:email'),
      dataIndex: 'email',
      key: UserManagementColumns.email,
      sorter: true,
      align: 'left' as const,
    },
    {
      title: t('user:phone'),
      dataIndex: 'phoneNo',
      key: UserManagementColumns.phoneNo,
      align: 'left' as const,
      render: (item: any) => {
        return item ? item : '-';
      },
    },
    {
      title: t('user:company'),
      dataIndex: 'organisation',
      key: UserManagementColumns.organisation,
      render: (item: any, itemObj: UserData) => {
        if (itemObj.role === 'Admin' || itemObj.role === 'Root') {
          return `Government of ${process.env.REACT_APP_COUNTRY_NAME || 'CountryX'}`;
        } else {
          return item ? item : '-';
        }
      },
      align: 'left' as const,
    },
    {
      title: t('user:status'),
      dataIndex: 'status',
      key: UserManagementColumns.status,
      align: 'left' as const,
      render: (item: any) => {
        return item === '1' ? 'Activated' : 'Deactivated';
      },
    },
    {
      title: t('user:role'),
      dataIndex: 'role',
      key: UserManagementColumns.role,
      sorter: true,
      align: 'left' as const,
      // eslint-disable-next-line no-unused-vars
      render: (item: any, itemObj: UserData) => {
        return getRoleComponent(itemObj);
      },
    },
    {
      title: '',
      key: UserManagementColumns.actions,
      width: 6,
      align: 'right' as const,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: UserData) => {
        return (
          ability.can(Action.Update, plainToClass(User, record)) &&
          // eslint-disable-next-line eqeqeq
          record.id.toString() != userInfoState?.id && (
            <Popover placement="bottomRight" content={actionMenu(record)} trigger="click">
              <EllipsisOutlined
                rotate={90}
                style={{ fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
              />
            </Popover>
          )
        );
      },
    },
  ].filter((column: any) => visibleColumns.includes(column.key));

  // Users Query with BE handled Pagination

  const getAllUsers = async () => {
    setLoading(true);
    try {
      const payload: any = { page: currentPage, size: pageSize };

      // Adding Sort By Conditions

      payload.sort = {
        key: sortField,
        order: sortOrder,
      };

      // Adding Filter Conditions

      if (appliedFilterValue.roleFilter !== 'All') {
        payload.filterAnd = [];
        payload.filterAnd.push({
          key: 'role',
          operation: '=',
          value: appliedFilterValue.roleFilter,
        });
      }

      if (searchValue !== '') {
        if (!payload.hasOwnProperty('filterAnd')) {
          payload.filterAnd = [];
        }
        payload.filterAnd.push({
          key: appliedFilterValue.searchBy,
          operation: 'LIKE',
          value: `%${searchValue}%`,
        });
      }

      const response: any = await post('national/users/query', payload);
      if (response && response.data) {
        const availableUsers = response.data.filter(
          (user: any) => user.companyRole !== CompanyRole.API
        );

        const tempUsers: UserData[] = [];
        for (let i = 0; i < availableUsers.length; i++) {
          tempUsers.push({
            key: i,
            id: availableUsers[i].id,
            name: availableUsers[i].name,
            email: availableUsers[i].email,
            phoneNo: availableUsers[i].phoneNo,
            organisation: availableUsers[i].organisation,
            status: availableUsers[i].state,
            role: availableUsers[i].role,
            subRole: availableUsers[i].subRole,
            sector: availableUsers[i].sector,
          });
        }
        setTableData(tempUsers);
        setTotalRowRowCount(response.response.data.total);
      }
      setLoading(false);
    } catch (error: any) {
      displayErrorMessage(error);
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
      setSortField('id');
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
    if (filterSection === 'roleFilter') {
      updatedFilters.roleFilter = newValue;
      setTempFilterValue(updatedFilters);
    } else if (filterSection === 'search') {
      updatedFilters.searchBy = newValue;
      setTempFilterValue(updatedFilters);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, [currentPage, pageSize, sortField, sortOrder, searchValue, appliedFilterValue]);

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
              <Radio value="name">Name</Radio>
              <Radio value="email">Email</Radio>
            </Space>
          </Radio.Group>
        </div>
      ),
    },
    {
      key: '2',
      title: 'Filter by User Role',
      label: (
        <div className="filter-menu-item">
          <div className="filter-title">{t('user:filterByRole')}</div>
          <Radio.Group
            onChange={(e) => {
              updatedTempFilters('roleFilter', e?.target?.value);
            }}
            value={tempFilterValue.roleFilter}
          >
            <Space direction="vertical">
              <Radio value="All">All</Radio>
              <Radio value="Admin">Administrator</Radio>
              <Radio value="GovernmentUser">Government User</Radio>
              <Radio value="Observer">Observer</Radio>
            </Space>
          </Radio.Group>
        </div>
      ),
    },
    {
      key: '3',
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
                {t('entityAction:cancel')}
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
                {t('entityAction:apply')}
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
        <div className="body-title">{t('user:viewUsers')}</div>
      </div>
      <div className="content-card">
        <Row className="table-actions-section">
          <Col {...addActionBps}>
            <div className="action-bar">
              {ability.can(Action.Create, User) && (
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<PlusOutlined />}
                  onClick={navigateToAddNewUser}
                >
                  {t('user:addUser')}
                </Button>
              )}
            </div>
          </Col>
          <Col {...listSearchBarBps}>
            <Row gutter={10}>
              <Col {...searchBoxBps} className="search-bar">
                <Input
                  addonAfter={<SearchOutlined style={{ color: '#615d67' }} onClick={onSearch} />}
                  placeholder={
                    appliedFilterValue.searchBy === 'name' ? 'Search by Name' : 'Search by Email'
                  }
                  allowClear
                  onPressEnter={onSearch}
                  onChange={(e) => setTempSearchValue(e.target.value)}
                  style={{ width: 265 }}
                  value={tempSearchValue}
                />
              </Col>
              <Col {...filterDropdownBps} className="filter-bar">
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
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <div className="userManagement-table-container">
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
                  locale: { page: '' },
                  position: ['bottomRight'],
                }}
                handleTableChange={handleTableChange}
                emptyMessage="No Users Available"
              />
            </div>
          </Col>
        </Row>
      </div>
      <UserActionConfirmationModel
        t={t}
        actionInfo={actionInfo}
        onActionConfirmed={deactivateUser}
        onActionCanceled={handleCancel}
        openModal={openDeactivationConfirmationModal}
        errorMsg={errorMsg}
        loading={loading}
      />
      <UserActionConfirmationModel
        t={t}
        actionInfo={actionInfo}
        onActionConfirmed={activateUser}
        onActionCanceled={handleCancel}
        openModal={openActivationConfirmationModal}
        errorMsg={errorMsg}
        loading={loading}
      />
    </div>
  );
};

export default UserManagement;
