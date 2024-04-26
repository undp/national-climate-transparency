import { useTranslation } from 'react-i18next';
import { Row, Col, Input, Button, Form, Select, message, Popover, List, Typography } from 'antd';
import { CloseCircleOutlined, EllipsisOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { useNavigate, useParams } from 'react-router-dom';
import UploadFileGrid from '../../../Components/Upload/uploadFiles';
import AttachEntity from '../../../Components/Popups/attach';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { Sector } from '../../../Enums/sector.enum';
import { SubSector, NatImplementor } from '../../../Enums/shared.enum';
import { ProgrammeStatus } from '../../../Enums/programme.enum';
import { Layers } from 'react-bootstrap-icons';
import './programmeForm.scss';
import { KpiGrid } from '../../../Components/KPI/kpiGrid';
import UpdatesTimeline from '../../../Components/UpdateTimeline/updates';

const { Option } = Select;
const { TextArea } = Input;

const gutterSize = 30;
const inputFontSize = '13px';

const validation = {
  required: { required: true, message: 'Required Field' },
  number: { pattern: /^[0-9]+$/, message: 'Please enter a valid number' },
};

interface Props {
  method: 'create' | 'view' | 'update';
}

type ActionData = {
  id: string;
  title: string;
};

type NewKpiData = {
  index: number;
  name: string;
  unit: string;
  creatorType: string;
  expected: number;
};

type ProjectData = {
  key: string;
  projectId: string;
  projectName: string;
};

const ProgrammeForm: React.FC<Props> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['programmeForm']);
  const isView: boolean = method === 'view' ? true : false;

  const navigate = useNavigate();
  const { get, post } = useConnection();
  const { entId } = useParams();

  // form state

  const [programmeData, setProgrammeData] = useState<any>();
  const [actionList, setActionList] = useState<ActionData[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; title: string; data: string }[]>(
    []
  );
  const [storedFiles, setStoredFiles] = useState<{ id: number; title: string; url: string }[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<number[]>([]);

  // Popover state

  const [detachOpen, setDetachOpen] = useState<boolean[]>([]);

  // projects state

  const [allProjectIds, setAllProjectIdList] = useState<string[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [projectData, setProjectData] = useState<ProjectData[]>([]);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // KPI State

  const [newKpiList, setNewKpiList] = useState<NewKpiData[]>([]);
  const [migratedKpiList, setMigratedKpiList] = useState<number[]>([]);

  // TODO : Connect to the BE Endpoints for data fetching
  // Initialization Logic

  const yearsList: number[] = [];

  for (let year = 2013; year <= 2050; year++) {
    yearsList.push(year);
  }

  useEffect(() => {
    // Initially Loading Free Actions that can be parent

    const fetchFreeActions = async () => {
      if (method !== 'view') {
        const payload = {
          page: 1,
          size: 100,
          sort: {
            key: 'actionId',
            order: 'ASC',
          },
        };
        const response: any = await post('national/actions/query', payload);

        const tempActionData: ActionData[] = [];
        response.data.forEach((action: any) => {
          tempActionData.push({
            id: action.actionId,
            title: action.title,
          });
        });
        setActionList(tempActionData);
      }
    };

    fetchFreeActions();

    // Initially Loading Free Projects that can be attached

    // const fetchFreeProjects = async () => {
    //   if (method !== 'view') {
    //     const payload = {
    //       page: 1,
    //       size: 100,
    //       // Add the Filtering here
    //       sort: {
    //         key: 'projectId',
    //         order: 'ASC',
    //       },
    //     };
    //     const response: any = await post('national/projects/query', payload);

    //     const freeProjectIds: string[] = [];
    //     response.data.forEach((prg: any) => {
    //       freeProjectIds.push(prg.programmeId);
    //     });
    //     setAllProjectIdList(freeProjectIds);
    //   }
    // };
    // fetchFreeProjects();

    const projIds: string[] = [];
    for (let i = 0; i < 15; i++) {
      projIds.push(`J00${i}`);
    }
    setAllProjectIdList(projIds);

    // Initially Loading the underlying programme data when not in create mode

    const fetchData = async () => {
      if (method !== 'create' && entId) {
        const response: any = await get(`national/programmes/${entId}`);
        setProgrammeData(response.data);
      }
    };
    fetchData();

    // Initially Loading the attached programme data when not in create mode

    // const fetchConnectedProjectIds = async () => {
    //   if (method !== 'create') {
    //     const payload = {
    //       page: 1,
    //       size: 100,
    //       filterAnd: [
    //         {
    //           key: 'programmeId',
    //           operation: '=',
    //           value: entId,
    //         },
    //       ],
    //       sort: {
    //         key: 'projectId',
    //         order: 'ASC',
    //       },
    //     };
    //     const response: any = await post('national/project/query', payload);

    //     const connectedProjectIds: string[] = [];
    //     response.data.forEach((prj: any) => {
    //       connectedProjectIds.push(prj.projectId);
    //     });
    //     setSelectedProjectIds(connectedProjectIds);
    //   }
    // };
    // fetchConnectedProjectIds();
  }, []);

  // Populating data fields based on the loaded action data when not in create

  useEffect(() => {
    if (programmeData) {
      form.setFieldsValue({
        // Entity Data
        title: programmeData.title,
        description: programmeData.description,
        objective: programmeData.objectives,
        programmeStatus: programmeData.programmeStatus,
        startYear: programmeData.startYear,
        natAnchor: programmeData.natAnchor,
        affectedSectors: programmeData.affectedSectors,
        affectedSubSector: programmeData.affectedSubSector,
        natImplementor: programmeData.nationalImplementor,
        investment: programmeData.investment,
        comments: programmeData.comments,
        // Migrated Data
        type: programmeData.types,
        instrumentType: programmeData.instrumentType,
        intImplementor: programmeData.interNationalImplementor,
        recipientEntity: programmeData.recipientEntity,
        // ghgsAffected: programmeData.migratedData.totalInvestment,
        // achievedReduct: programmeData.migratedData.achievedReduct,
        // expectedReduct: programmeData.migratedData.expectedReduct,
      });

      const tempFiles: { id: number; title: string; url: string }[] = [];
      programmeData.documents.forEach((document: any) => {
        tempFiles.push({ id: document.createdTime, title: document.title, url: document.url });
      });
      setStoredFiles(tempFiles);
    }
  }, [programmeData]);

  // Loading project data when attachment changes

  useEffect(() => {
    const payload = {
      page: 1,
      size: selectedProjectIds.length,
      filterOr: [] as any[],
      sort: {
        key: 'projectId',
        order: 'ASC',
      },
    };

    const fetchData = async () => {
      if (selectedProjectIds.length > 0) {
        selectedProjectIds.forEach((projId) => {
          payload.filterOr.push({
            key: 'projectId',
            operation: '=',
            value: projId,
          });
        });
        const response: any = await post('national/projects/query', payload);
        setProjectData(response.data);
      } else {
        setProjectData([]);
      }
    };
    fetchData();

    setDetachOpen(Array(selectedProjectIds.length).fill(false));
  }, [selectedProjectIds]);

  useEffect(() => {
    console.log('Running KPI Migration Update');

    const migratedKpis = [];
    for (let i = 0; i < 2; i++) {
      const updatedValues = {
        [`kpi_name_${i}`]: `Name_${i}`,
        [`kpi_unit_${i}`]: `Unit_${i}`,
        [`kpi_ach_${i}`]: 35,
        [`kpi_exp_${i}`]: 55,
      };

      form.setFieldsValue(updatedValues);
      migratedKpis.push(i);
    }

    setMigratedKpiList(migratedKpis);
  }, [projectData]);

  // Form Submit

  const handleSubmit = async (payload: any) => {
    try {
      for (const key in payload) {
        if (key.startsWith('kpi_')) {
          delete payload[key];
        }
      }

      if (uploadedFiles.length > 0) {
        payload.documents = [];
        uploadedFiles.forEach((file) => {
          payload.documents.push({ title: file.title, data: file.data });
        });
      }

      if (newKpiList.length > 0) {
        payload.kpis = [];
        newKpiList.forEach((kpi) => {
          payload.kpis.push({
            name: kpi.name,
            creatorType: kpi.creatorType,
            expected: kpi.expected,
          });
        });
      }

      if (selectedProjectIds.length > 0) {
        payload.linkedProjects = selectedProjectIds;
      }

      payload.investment = parseFloat(payload.investment);

      const response = await post('national/programmes/add', payload);
      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: t('programmeCreationSuccess'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        navigate('/programmes');
      }
    } catch (error: any) {
      console.log('Error in action creation', error);
      message.open({
        type: 'error',
        content: `${error.message}`,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    }
  };

  // Add New KPI

  const createKPI = () => {
    const kpiIndex = Math.floor(Date.now() / 1000);
    const newItem: NewKpiData = {
      index: kpiIndex,
      name: '',
      unit: '',
      creatorType: 'programme',
      expected: 0,
    };
    const updatedValues = {
      [`kpi_ach_${kpiIndex}`]: 0,
    };

    form.setFieldsValue(updatedValues);
    setNewKpiList((prevList) => [...prevList, newItem]);
  };

  const removeKPI = (kpiIndex: number) => {
    setNewKpiList(newKpiList.filter((obj) => obj.index !== kpiIndex));

    const updatedValues = {
      [`kpi_name_${kpiIndex}`]: '',
      [`kpi_unit_${kpiIndex}`]: '',
      [`kpi_exp_${kpiIndex}`]: '',
    };

    form.setFieldsValue(updatedValues);
  };

  const updateKPI = (id: number, property: keyof NewKpiData, value: any): void => {
    setNewKpiList((prevKpiList) => {
      const updatedKpiList = prevKpiList.map((kpi) => {
        if (kpi.index === id) {
          return { ...kpi, [property]: value };
        }
        return kpi;
      });
      return updatedKpiList;
    });
  };

  // Dettach Project

  const handleDetachOpen = (record: ProjectData) => {
    const newOpenList = Array(selectedProjectIds.length).fill(false);
    newOpenList[selectedProjectIds.indexOf(record.projectId)] = true;
    setDetachOpen(newOpenList);
  };

  const detachProject = (prjId: string) => {
    const filteredData = projectData.filter((prj) => prj.projectId !== prjId);
    const filteredIds = selectedProjectIds.filter((id) => id !== prjId);
    setProjectData(filteredData);
    setSelectedProjectIds(filteredIds);
  };

  // Action Menu definition

  const actionMenu = (record: ProjectData) => {
    return (
      <List
        className="action-menu"
        size="small"
        dataSource={[
          {
            text: t('detach'),
            icon: <CloseCircleOutlined style={{ color: 'red' }} />,
            click: () => {
              {
                detachProject(record.projectId);
              }
            },
          },
        ]}
        renderItem={(item) => (
          <List.Item onClick={item.click}>
            <Typography.Text className="action-icon">{item.icon}</Typography.Text>
            <span>{item.text}</span>
          </List.Item>
        )}
      />
    );
  };

  // Column Definition
  const projTableColumns = [
    { title: t('projectId'), dataIndex: 'projectId', key: 'projectId' },
    { title: t('projectName'), dataIndex: 'projectName', key: 'projectName' },
    {
      title: '',
      key: 'projectAction',
      align: 'right' as const,
      width: 6,
      render: (record: any) => {
        return (
          <Popover
            placement="bottomRight"
            content={actionMenu(record)}
            trigger="click"
            open={detachOpen[selectedProjectIds.indexOf(record.projectId)]}
          >
            <EllipsisOutlined
              rotate={90}
              style={{ fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
              onClick={() => handleDetachOpen(record)}
            />
          </Popover>
        );
      },
    },
  ];

  // Table Behaviour

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('addProgTitle')}</div>
        <div className="body-sub-title">{t('addProgDesc')}</div>
      </div>
      <div className="programme-form">
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <div className="form-section-card">
            <div className="form-section-header">{t('generalInfoTitle')}</div>
            <Row gutter={gutterSize}>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('selectActionHeader')}</label>}
                  name="actionId"
                >
                  <Select
                    size={'large'}
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {actionList.map((action) => (
                      <Option key={action.id} value={action.id}>
                        {action.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('typesHeader')}</label>}
                  name="type"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('progTitleHeader')}</label>}
                  name="title"
                  rules={[validation.required]}
                >
                  <Input className="form-input-box" disabled={isView} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('progDescTitle')}</label>}
                  name="description"
                  rules={[validation.required]}
                >
                  <TextArea maxLength={250} rows={3} disabled={isView} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('progObjectivesTitle')}</label>}
                  name="objective"
                  rules={[validation.required]}
                >
                  <TextArea maxLength={250} rows={3} disabled={isView} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('instrTypeTitle')}</label>}
                  name="instrumentType"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('progStatusTitle')}</label>}
                  name="status"
                  rules={[validation.required]}
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {Object.values(ProgrammeStatus).map((instrument) => (
                      <Option key={instrument} value={instrument}>
                        {instrument}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('sectorsAffTitle')}</label>}
                  name="affectedSectors"
                  rules={[validation.required]}
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    mode="multiple"
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {Object.values(Sector).map((instrument) => (
                      <Option key={instrument} value={instrument}>
                        {instrument}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('subSectorsAffTitle')}</label>}
                  name="affectedSubSector"
                  rules={[validation.required]}
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    mode="multiple"
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {Object.values(SubSector).map((instrument) => (
                      <Option key={instrument} value={instrument}>
                        {instrument}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('startYearTitle')}</label>}
                  name="startYear"
                  rules={[validation.required]}
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {yearsList.map((year) => (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('intImplementorTitle')}</label>}
                  name="intImplementor"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('recipientEntityTitle')}</label>}
                  name="recipientEntity"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('natImplementorTitle')}</label>}
                  name="natImplementor"
                  rules={[validation.required]}
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    mode="multiple"
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {Object.values(NatImplementor).map((instrument) => (
                      <Option key={instrument} value={instrument}>
                        {instrument}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<number>
                  label={<label className="form-item-header">{t('investmentNeedsTitle')}</label>}
                  name="investment"
                  rules={[validation.required]}
                >
                  <Input className="form-input-box" type="number" disabled={isView} />
                </Form.Item>
              </Col>
            </Row>
            <div className="form-section-sub-header">{t('documentsHeader')}</div>
            <UploadFileGrid
              isSingleColumn={false}
              usedIn={method}
              buttonText={t('upload')}
              acceptedFiles=".xlsx,.xls,.ppt,.pptx,.docx,.csv,.png,.jpg"
              storedFiles={storedFiles}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              removedFiles={filesToRemove}
              setRemovedFiles={setFilesToRemove}
            ></UploadFileGrid>
            <Row gutter={gutterSize}>
              <Col span={24}>
                <Form.Item
                  label={<label className="form-item-header">{t('programmeCommentsTitle')}</label>}
                  name="comments"
                  rules={[validation.required]}
                >
                  <TextArea rows={3} disabled={isView} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                  {t('projectListTitle')}
                </div>
                <LayoutTable
                  tableData={projectData}
                  columns={projTableColumns}
                  loading={false}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: projectData.length,
                    showQuickJumper: true,
                    pageSizeOptions: ['10', '20', '30'],
                    showSizeChanger: true,
                    style: { textAlign: 'center' },
                    locale: { page: '' },
                    position: ['bottomRight'],
                  }}
                  handleTableChange={handleTableChange}
                  emptyMessage={t('noProjectsMessage')}
                />
              </Col>
              <Col
                span={5}
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
              >
                <AttachEntity
                  isDisabled={isView}
                  options={allProjectIds}
                  content={{
                    buttonName: t('attachProjects'),
                    attach: t('attach'),
                    contentTitle: t('attachProjects'),
                    listTitle: t('projectList'),
                    cancel: t('cancel'),
                  }}
                  attachedUnits={selectedProjectIds}
                  setAttachedUnits={setSelectedProjectIds}
                  icon={<Layers style={{ fontSize: '120px' }} />}
                ></AttachEntity>
              </Col>
            </Row>
          </div>
          <div className="form-section-card">
            <div className="form-section-header">{t('mitigationInfoTitle')}</div>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('ghgAffected')}</label>}
                  name="ghgsAffected"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
            </Row>
            <div className="form-section-sub-header">{t('emmissionInfoTitle')}</div>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('achieved')}</label>}
                  name="achievedReduct"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('expected')}</label>}
                  name="expectedReduct"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
            </Row>
            <div className="form-section-sub-header">{t('kpiInfoTitle')}</div>
            {migratedKpiList.map((index: number) => (
              <KpiGrid
                key={index}
                form={form}
                rules={[]}
                index={index}
                calledTo={'view'}
                gutterSize={gutterSize}
                headerNames={[t('kpiName'), t('kpiUnit'), t('achieved'), t('expected')]}
              ></KpiGrid>
            ))}
            {newKpiList.map((kpi: any) => (
              <KpiGrid
                key={kpi.index}
                form={form}
                rules={[validation.required]}
                index={kpi.index}
                calledTo={'create'}
                gutterSize={gutterSize}
                headerNames={[t('kpiName'), t('kpiUnit'), t('achieved'), t('expected')]}
                updateKPI={updateKPI}
                removeKPI={removeKPI}
              ></KpiGrid>
            ))}
            <Row justify={'start'}>
              <Col span={2}>
                {!isView && (
                  <Button
                    icon={<PlusCircleOutlined />}
                    className="create-kpi-button"
                    onClick={createKPI}
                  >
                    {t('addKPI')}
                  </Button>
                )}
              </Col>
            </Row>
          </div>
          {isView && (
            <div className="form-section-timelinecard">
              <div className="form-section-header">{t('updatesInfoTitle')}</div>
              <UpdatesTimeline recordType={'programme'} recordId={entId} />
            </div>
          )}
          {!isView && (
            <Row gutter={20} justify={'end'}>
              <Col span={2}>
                <Button
                  type="default"
                  size="large"
                  block
                  onClick={() => {
                    navigate('/programmes');
                  }}
                >
                  {t('cancel')}
                </Button>
              </Col>
              <Col span={2}>
                <Form.Item>
                  <Button type="primary" size="large" block htmlType="submit">
                    {t('add')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
      </div>
    </div>
  );
};

export default ProgrammeForm;
