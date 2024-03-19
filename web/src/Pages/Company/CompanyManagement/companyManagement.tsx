import { BankOutlined, ExperimentOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Dropdown,
  Empty,
  Input,
  MenuProps,
  message,
  PaginationProps,
  Radio,
  Row,
  Space,
  Table,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAbilityContext } from '../../../Casl/Can';
import {
  useConnection,
  GovBGColor,
  CertBGColor,
  DevBGColor,
  CompanyRole,
  Action,
  DevColor,
  GovColor,
  ProfileIcon,
  RoleIcon,
  addCommSep,
} from '@undp/carbon-library';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { CompanyTableDataType } from '../../../Definitions/companyManagement.definitions';
import { Organisation } from '../../../Entities/organisation';
import { OrganisationManagementColumns } from '../../../Enums/organisation.management.columns.enum';

const { Search } = Input;

const CompanyManagement = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['company', 'companyProfile']);

  const visibleColumns = [
    OrganisationManagementColumns.logo,
    OrganisationManagementColumns.name,
    OrganisationManagementColumns.organisationType,
    OrganisationManagementColumns.userCount,
  ];

  const navigateToCompanyProfile = (record: any) => {
    navigate('/companyProfile/view', { state: { record } });
  };

  const navigateToAddNewCompany = () => {
    navigate('/companyManagement/addCompany');
  };

  const [totalCompany, setTotalCompany] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<CompanyTableDataType[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchByTermOrganisation] = useState<any>('name');
  const [searchValueOrganisations, setSearchValueOrganisations] = useState<string>('');
  const [networksearchOrganisations, setNetworkSearchOrganisations] = useState<string>('');
  const [filterVisible, setFilterVisible] = useState<boolean>(false);
  const [filterByOrganisationType, setFilterByOrganisationType] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<string>('');
  const [sortField, setSortField] = useState<string>('');
  const [dataQuery, setDataQuery] = useState<any>();
  const ability = useAbilityContext();
  const { post } = useConnection();

  document.addEventListener('mousedown', (event: any) => {
    const organisationFilterArea1 = document.querySelector('.filter-bar');
    const organisationFilterArea2 = document.querySelector('.filter-dropdown');

    if (organisationFilterArea1 !== null && organisationFilterArea2 !== null) {
      if (
        organisationFilterArea1.contains(event.target) ||
        organisationFilterArea2.contains(event.target)
      ) {
        setFilterVisible(true);
      } else {
        setFilterVisible(false);
      }
    }
  });

  const getCompanyBgColor = (item: string) => {
    if (item === 'Government') {
      return GovBGColor;
    } else if (item === 'Certifier') {
      return CertBGColor;
    }
    return DevBGColor;
  };

  const getCompanyRoleComponent = (item: string) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {item === CompanyRole.GOVERNMENT ? (
          <RoleIcon icon={<BankOutlined />} bg={GovBGColor} color={GovColor} />
        ) : (
          <RoleIcon icon={<ExperimentOutlined />} bg={DevBGColor} color={DevColor} />
        )}
        {item === CompanyRole.PROGRAMME_DEVELOPER ? (
          <div>{t('company:developer')}</div>
        ) : (
          <div>{item}</div>
        )}
      </div>
    );
  };

  const handleFilterVisibleChange = () => {
    setFilterVisible(true);
  };

  const columns = [
    {
      title: '',
      dataIndex: 'logo',
      key: OrganisationManagementColumns.logo,
      width: '20px',
      align: 'left' as const,
      render: (item: any, itemObj: any) => {
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ProfileIcon
              icon={itemObj.logo}
              bg={getCompanyBgColor(itemObj.companyRole)}
              name={itemObj.name}
            />
          </div>
        );
      },
    },
    {
      title: t('company:name'),
      dataIndex: 'name',
      key: OrganisationManagementColumns.name,
      sorter: true,
      align: 'left' as const,
      render: (item: any, itemObj: any) => {
        return (
          <div style={{ display: 'flex', alignItems: 'center' }} className="clickable">
            <div style={{ fontWeight: 600 }}>{item}</div>
          </div>
        );
      },
      onCell: (record: any, rowIndex: any) => {
        return {
          onClick: (ev: any) => {
            navigateToCompanyProfile(record);
          },
        };
      },
    },
    {
      title: t('company:organisationType'),
      dataIndex: 'organisationType',
      key: OrganisationManagementColumns.organisationType,
      sorter: true,
      align: 'left' as const,
      render: (item: any) => {
        return getCompanyRoleComponent(item);
      },
    },
    {
      title: t('company:numberOfUsers'),
      dataIndex: 'userCount',
      key: OrganisationManagementColumns.userCount,
      sorter: true,
      align: 'left' as const,
      render: (item: any) => {
        return item ? addCommSep(item) : '-';
      },
    },
  ].filter((column) => visibleColumns.includes(column.key));

  const filterOr = () => {
    if (
      searchByTermOrganisation !== null &&
      searchByTermOrganisation !== '' &&
      networksearchOrganisations !== null &&
      networksearchOrganisations !== '' &&
      filterByOrganisationType === 'All'
    ) {
      return [
        {
          key: searchByTermOrganisation,
          operation: 'like',
          value: '%' + networksearchOrganisations + '%',
        },
      ];
    } else return undefined;
  };

  const filterAnd = () => {
    if (
      searchByTermOrganisation !== null &&
      searchByTermOrganisation !== '' &&
      networksearchOrganisations !== null &&
      networksearchOrganisations !== '' &&
      filterByOrganisationType !== 'All'
    ) {
      return [
        {
          key: searchByTermOrganisation,
          operation: 'like',
          value: '%' + networksearchOrganisations + '%',
        },
        {
          key: 'organisationType',
          operation: '=',
          value: filterByOrganisationType,
        },
      ];
    } else if (filterByOrganisationType !== 'All') {
      return [
        {
          key: 'organisationType',
          operation: '=',
          value: filterByOrganisationType,
        },
      ];
    } else return undefined;
  };

  const sort = () => {
    if (sortOrder !== '' && sortField !== '') {
      return {
        key: sortField,
        order: sortOrder,
        nullFirst: false,
      };
    } else
      return {
        key: 'organisationId',
        order: 'DESC',
      };
  };

  const getAllOrganisationParams = () => {
    return {
      page: currentPage,
      size: pageSize,
      filterOr: filterOr(),
      filterAnd: filterAnd(),
      sort: sort(),
    };
  };

  const getAllOrganisations = async () => {
    setLoading(true);
    try {
      const response: any = await post('national/organisation/query', getAllOrganisationParams());
      if (response && response.data) {
        const availableOrganisations = response.data.filter(
          (organisation: any) => organisation.organisationType !== CompanyRole.API
        );
        setTableData(availableOrganisations);
        setTotalCompany(response?.response?.data?.total);
      }
      setDataQuery({
        filterAnd: filterAnd(),
        filterOr: filterOr(),
        sort: sort(),
      });
      setLoading(false);
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

  useEffect(() => {
    getAllOrganisations();
  }, [
    currentPage,
    pageSize,
    searchByTermOrganisation,
    networksearchOrganisations,
    filterByOrganisationType,
    sortField,
    sortOrder,
  ]);

  const onChange: PaginationProps['onChange'] = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const onFilterOrganisationType = (checkedValue: any) => {
    setCurrentPage(1);
    setFilterByOrganisationType(checkedValue?.target?.value);
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
      title: 'Filter by',
      label: (
        <div className="filter-menu-item">
          <div className="filter-title">{t('company:filterByOrgType')}</div>
          <Radio.Group onChange={onFilterOrganisationType} value={filterByOrganisationType}>
            <Space direction="vertical">
              <Radio value="All">{t('company:all')}</Radio>
              <Radio value="Government">{t('company:gov')}</Radio>
              <Radio value="Department">{t('company:dep')}</Radio>
            </Space>
          </Radio.Group>
        </div>
      ),
    },
  ];

  const onSearch = () => {
    setCurrentPage(1);
    setNetworkSearchOrganisations(searchValueOrganisations);
  };

  const handleTableChange = (val: any, sorter: any) => {
    if (sorter.order === 'ascend') {
      setSortOrder('ASC');
    } else if (sorter.order === 'descend') {
      setSortOrder('DESC');
    } else if (sorter.order === undefined) {
      setSortOrder('');
    }
    if (sorter.columnKey !== undefined) {
      if (sorter.columnKey === 'name') {
        setSortField('name');
      } else {
        setSortField(sorter.field);
      }
    } else {
      setSortField('organisationId');
      setSortOrder('DESC');
    }
  };

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('company:viewCompanies')}</div>
        <div className="body-sub-title">{t('company:viewDesc')}</div>
      </div>
      <div className="content-card">
        <Row className="table-actions-section">
          <Col md={8} xs={24}>
            <div className="action-bar">
              {ability.can(Action.Create, Organisation) && (
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<PlusOutlined />}
                  onClick={navigateToAddNewCompany}
                >
                  {t('company:addCompany')}
                </Button>
              )}
            </div>
          </Col>
          <Col md={16} xs={24}>
            <div className="filter-section">
              <div className="search-bar">
                <Search
                  onPressEnter={onSearch}
                  placeholder={
                    searchByTermOrganisation === 'email'
                      ? `${t('company:searchMail')}`
                      : `${t('company:searchName')}`
                  }
                  allowClear
                  onChange={(e) =>
                    e.target.value === ''
                      ? setNetworkSearchOrganisations(e.target.value)
                      : setSearchValueOrganisations(e.target.value)
                  }
                  onSearch={onSearch}
                  style={{ width: 265 }}
                />
              </div>
              <div className="filter-bar">
                <Dropdown
                  arrow={false}
                  menu={{ items }}
                  placement="bottomRight"
                  open={filterVisible}
                  onOpenChange={handleFilterVisibleChange}
                  overlayClassName="filter-dropdown"
                  trigger={['click']}
                >
                  <a
                    className="ant-dropdown-link"
                    onClick={(e) => setFilterVisible(!filterVisible)}
                  >
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
            <div className="userManagement-table-container">
              <Table
                dataSource={tableData}
                columns={columns}
                className="common-table-class"
                loading={loading}
                rowClassName={(record) =>
                  parseInt(record.state as string) === 0 ? 'table-row-gray' : ''
                }
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: totalCompany,
                  showQuickJumper: true,
                  showSizeChanger: true,
                  onChange: onChange,
                }}
                onChange={(val: any, filter: any, sorter: any) => handleTableChange(val, sorter)}
                // scroll={{ x: 1500 }}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={tableData.length === 0 ? 'No data' : null}
                    />
                  ),
                }}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CompanyManagement;
