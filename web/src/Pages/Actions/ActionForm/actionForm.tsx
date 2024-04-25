import { useTranslation } from 'react-i18next';
import './actionForm.scss';
import { Row, Col, Input, Button, Popover, List, Typography, Form, Select, message } from 'antd';
import {
  AppstoreOutlined,
  CloseCircleOutlined,
  EllipsisOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { InstrumentType, ActionStatus, NatAnchor } from '../../../Enums/action.enum';
import { useNavigate, useParams } from 'react-router-dom';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import UploadFileGrid from '../../../Components/Upload/uploadFiles';
import AttachEntity from '../../../Components/Popups/attach';
import { KpiGrid } from '../../../Components/KPI/kpiGrid';
import EntityIdCard from '../../../Components/EntityIdCard/entityIdCard';
import { ActionMigratedData } from '../../../Definitions/actionDefinitions';
import { NewKpiData } from '../../../Definitions/kpiDefinitions';
import { ProgrammeData } from '../../../Definitions/programmeDefinitions';
import { FormLoadProps } from '../../../Definitions/InterfacesAndType/formInterface';
import { getFormTitle, joinTwoArrays } from '../../../Utils/utilServices';
import { getValidationRules } from '../../../Utils/validationRules';

const { Option } = Select;
const { TextArea } = Input;

const gutterSize = 30;
const inputFontSize = '13px';

const actionForm: React.FC<FormLoadProps> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['actionForm']);

  const isView: boolean = method === 'view' ? true : false;
  const formTitle = getFormTitle('Action', method)[0];
  const formDesc = getFormTitle('Action', method)[1];

  const navigate = useNavigate();
  const { get, post, put } = useConnection();
  const { entId } = useParams();

  // Form Validation Rules

  const validation = getValidationRules(method);

  // form state

  const [actionMigratedData, setActionMigratedData] = useState<ActionMigratedData>();
  const [uploadedFiles, setUploadedFiles] = useState<
    { key: string; title: string; data: string }[]
  >([]);
  const [storedFiles, setStoredFiles] = useState<{ key: string; title: string; url: string }[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

  // Popover state

  const [detachOpen, setDetachOpen] = useState<boolean[]>([]);

  // Attachments state

  const [allProgramIds, setAllProgramIdList] = useState<string[]>([]);
  const [attachedProgramIds, setAttachedProgramIds] = useState<string[]>([]);
  const [tempProgramIds, setTempProgramIds] = useState<string[]>([]);

  const [programData, setProgramData] = useState<ProgrammeData[]>([]);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // KPI State

  const [newKpiList, setNewKpiList] = useState<NewKpiData[]>([]);
  const [migratedKpiList, setMigratedKpiList] = useState<number[]>([]);

  // Initialization Logic

  const yearsList: number[] = [];

  for (let year = 2013; year <= 2050; year++) {
    yearsList.push(year);
  }

  useEffect(() => {
    // Initially Loading Free Programmes that can be attached

    const fetchFreeProgrammes = async () => {
      if (method !== 'view') {
        const response: any = await get('national/programmes/link/eligible');

        const freeProgrammeIds: string[] = [];
        response.data.forEach((prg: any) => {
          freeProgrammeIds.push(prg.programmeId);
        });
        setAllProgramIdList(freeProgrammeIds);
      }
    };
    fetchFreeProgrammes();

    // Initially Loading the underlying action data when not in create mode

    const fetchData = async () => {
      if (method !== 'create' && entId) {
        const response: any = await get(`national/actions/${entId}`);
        if (response.status === 200 || response.status === 201) {
          const entityData: any = response.data;

          // Populating Action owned data fields
          form.setFieldsValue({
            title: entityData.title,
            description: entityData.description,
            objective: entityData.objective,
            instrumentType: entityData.instrumentType,
            status: entityData.status,
            startYear: entityData.startYear,
            natAnchor: entityData.natAnchor,
          });

          if (entityData.documents?.length > 0) {
            const tempFiles: { key: string; title: string; url: string }[] = [];
            entityData.documents.forEach((document: any) => {
              tempFiles.push({
                key: document.createdTime,
                title: document.title,
                url: document.url,
              });
            });
            setStoredFiles(tempFiles);
          }

          // Populating Migrated Fields (Will be overwritten when attachments change)
          setActionMigratedData({
            type: entityData.migratedData?.types ?? [],
            ghgsAffected: entityData.migratedData?.ghgsAffected,
            estimatedInvestment: entityData.migratedData?.totalInvestment,
            achievedReduction: entityData.migratedData?.achievedGHGReduction,
            expectedReduction: entityData.migratedData?.expectedGHGReduction,
            natImplementer: entityData.migratedData?.natImplementors ?? [],
            sectorsAffected: entityData.migratedData?.sectorsAffected ?? [],
          });
        }
      }
    };
    fetchData();

    // Initially Loading the attached programme data when not in create mode

    const fetchConnectedProgrammeIds = async () => {
      if (method !== 'create') {
        const payload = {
          page: 1,
          size: 100,
          filterAnd: [
            {
              key: 'actionId',
              operation: '=',
              value: entId,
            },
          ],
          sort: {
            key: 'programmeId',
            order: 'ASC',
          },
        };
        const response: any = await post('national/programmes/query', payload);

        const connectedProgrammeIds: string[] = [];
        response.data.forEach((prg: any) => {
          connectedProgrammeIds.push(prg.programmeId);
        });
        setAttachedProgramIds(connectedProgrammeIds);
        setTempProgramIds(connectedProgrammeIds);
      }
    };
    fetchConnectedProgrammeIds();
  }, []);

  // Populating Form Migrated Fields, when migration data changes

  useEffect(() => {
    if (actionMigratedData) {
      console.log(actionMigratedData);
      form.setFieldsValue({
        type: actionMigratedData.type,
        ghgsAffected: actionMigratedData.ghgsAffected,
        natImplementor: actionMigratedData.natImplementer,
        sectorsAffected: actionMigratedData.sectorsAffected,
        estimatedInvestment: actionMigratedData.estimatedInvestment,
        achievedReduct: actionMigratedData.achievedReduction,
        expectedReduct: actionMigratedData.expectedReduction,
      });
    }
  }, [actionMigratedData]);

  // Fetching Programme data and calculating migrated fields when attachment changes

  useEffect(() => {
    const payload = {
      page: 1,
      size: tempProgramIds.length,
      filterOr: [] as any[],
      sort: {
        key: 'programmeId',
        order: 'ASC',
      },
    };

    const tempMigratedData: ActionMigratedData = {
      natImplementer: [],
      sectorsAffected: [],
      estimatedInvestment: 0,
      type: [],
      achievedReduction: 0,
      expectedReduction: 0,
      ghgsAffected: '',
    };

    const fetchData = async () => {
      if (tempProgramIds.length > 0) {
        tempProgramIds.forEach((progId) => {
          payload.filterOr.push({
            key: 'programmeId',
            operation: '=',
            value: progId,
          });
        });
        const response: any = await post('national/programmes/query', payload);

        const tempPRGData: ProgrammeData[] = [];

        response.data.forEach((prg: any, index: number) => {
          tempPRGData.push({
            key: index.toString(),
            programmeId: prg.programmeId,
            actionId: prg.action?.actionId,
            title: prg.title,
            type: prg.migratedData[0]?.types,
            status: prg.programmeStatus,
            subSectorsAffected: prg.affectedSubSector,
            estimatedInvestment: prg.investment,
          });

          tempMigratedData.type = joinTwoArrays(
            tempMigratedData.type,
            prg.migratedData[0]?.types ?? []
          );

          tempMigratedData.natImplementer = joinTwoArrays(
            tempMigratedData.natImplementer,
            prg.natImplementor ?? []
          );
          tempMigratedData.sectorsAffected = joinTwoArrays(
            tempMigratedData.sectorsAffected,
            prg.affectedSectors ?? []
          );

          tempMigratedData.estimatedInvestment =
            tempMigratedData.estimatedInvestment + prg.investment ?? 0;

          const prgGHGAchievement = prg.migratedData[0]?.achievedGHGReduction;
          const prgGHGExpected = prg.migratedData[0]?.expectedGHGReduction;

          tempMigratedData.achievedReduction =
            tempMigratedData.achievedReduction + prgGHGAchievement !== null ? prgGHGAchievement : 0;

          tempMigratedData.expectedReduction =
            tempMigratedData.expectedReduction + prgGHGExpected !== null ? prgGHGExpected : 0;
        });
        setProgramData(tempPRGData);
        setActionMigratedData(tempMigratedData);
      } else {
        setProgramData([]);
        setActionMigratedData(tempMigratedData);
      }
    };
    fetchData();

    setDetachOpen(Array(tempProgramIds.length).fill(false));
  }, [tempProgramIds]);

  // To Do :
  // Populating the KPI UI Update when the attachments change

  useEffect(() => {
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
  }, [tempProgramIds]);

  // Attachment resolve before updating an already created action

  const resolveAttachments = async () => {
    const toAttach = tempProgramIds.filter((prg) => !attachedProgramIds.includes(prg));
    const toDetach = attachedProgramIds.filter((prg) => !tempProgramIds.includes(prg));

    if (toDetach.length > 0) {
      await post('national/programmes/unlink', { programmes: toDetach });
    }

    if (toAttach.length > 0) {
      await post('national/programmes/link', { actionId: entId, programmes: toAttach });
    }
  };

  // Form Submit

  const handleSubmit = async (payload: any) => {
    try {
      for (const key in payload) {
        if (key.startsWith('kpi_')) {
          delete payload[key];
        }
      }

      if (uploadedFiles.length > 0) {
        if (method === 'create') {
          payload.documents = [];
          uploadedFiles.forEach((file) => {
            payload.documents.push({ title: file.title, data: file.data });
          });
        } else if (method === 'update') {
          payload.newDocuments = [];
          uploadedFiles.forEach((file) => {
            payload.newDocuments.push({ title: file.title, data: file.data });
          });
        }
      }

      if (filesToRemove.length > 0) {
        payload.removedDocuments = [];
        filesToRemove.forEach((removedFileKey) => {
          payload.removedDocuments.push(
            storedFiles.find((file) => file.key === removedFileKey)?.url
          );
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

      if (programData.length > 0 && method === 'create') {
        payload.linkedProgrammes = [];
        programData.forEach((program) => {
          payload.linkedProgrammes.push(program.programmeId);
        });
      }

      let response: any;

      if (method === 'create') {
        response = await post('national/actions/add', payload);
      } else if (method === 'update') {
        payload.actionId = entId;
        response = await put('national/actions/update', payload);

        resolveAttachments();
      }

      const successMsg =
        method === 'create' ? t('actionCreationSuccess') : t('actionUpdateSuccess');

      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: successMsg,
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });

        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });

        navigate('/actions');
      }
    } catch (error: any) {
      message.open({
        type: 'error',
        content: `${error.message}`,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    }
  };

  // Entity Validate

  const validateEntity = () => {
    console.log('Validate Clicked');
  };

  // Entity Delete

  const deleteEntity = () => {
    console.log('Delete Clicked');
  };

  // Detach Programme

  const handleDetachOpen = (record: ProgrammeData) => {
    const newOpenList = Array(tempProgramIds.length).fill(false);
    newOpenList[tempProgramIds.indexOf(record.programmeId)] = true;
    setDetachOpen(newOpenList);
  };

  const detachProgramme = async (prgId: string) => {
    const filteredIds = tempProgramIds.filter((id) => id !== prgId);
    setTempProgramIds(filteredIds);
  };

  // Add New KPI

  const createKPI = () => {
    const kpiIndex = Math.floor(Date.now() / 1000);
    const newItem: NewKpiData = {
      index: kpiIndex,
      name: '',
      unit: '',
      creatorType: 'action',
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

  // Action Menu definition

  const actionMenu = (record: ProgrammeData) => {
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
                detachProgramme(record.programmeId);
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
  const progTableColumns = [
    { title: t('programmeId'), dataIndex: 'programmeId', key: 'programmeId' },
    { title: t('actionId'), dataIndex: 'actionId', key: 'actionId' },
    { title: t('programmeTitle'), dataIndex: 'title', key: 'title' },
    { title: t('programmeType'), dataIndex: 'type', key: 'type' },
    { title: t('programmeStatus'), dataIndex: 'status', key: 'status' },
    {
      title: t('subSectorAffected'),
      dataIndex: 'subSectorsAffected',
      key: 'subSectorsAffected',
    },
    {
      title: t('investmentNeeds'),
      dataIndex: 'estimatedInvestment',
      key: 'estimatedInvestment',
    },
    {
      title: '',
      key: 'programmeAcion',
      align: 'right' as const,
      width: 6,
      render: (record: any) => {
        return (
          <Popover
            placement="bottomRight"
            trigger="click"
            content={actionMenu(record)}
            open={detachOpen[tempProgramIds.indexOf(record.programmeId)]}
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
        <div className="body-title">{t(formTitle)}</div>
        <div className="body-sub-title">{t(formDesc)}</div>
      </div>
      <div className="action-form">
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <div className="form-section-card">
            <div className="form-section-header">{t('generalInfoTitle')}</div>
            {method !== 'create' && entId && (
              <EntityIdCard calledIn="Action" entId={entId}></EntityIdCard>
            )}
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('typesTitle')}</label>}
                  name="type"
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    mode="multiple"
                    disabled={true}
                  ></Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('actionTitle')}</label>}
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
                  label={<label className="form-item-header">{t('actionDescTitle')}</label>}
                  name="description"
                  rules={[validation.required]}
                >
                  <TextArea rows={3} disabled={isView} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('actionObjectivesTitle')}</label>}
                  name="objective"
                  rules={[validation.required]}
                >
                  <TextArea rows={3} disabled={isView} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('ghgAffected')}</label>}
                  name="ghgsAffected"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('instrTypeTitle')}</label>}
                  name="instrumentType"
                  rules={[validation.required]}
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {Object.values(InstrumentType).map((instrument) => (
                      <Option key={instrument} value={instrument}>
                        {instrument}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('actionStatusTitle')}</label>}
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
                    {Object.values(ActionStatus).map((instrument) => (
                      <Option key={instrument} value={instrument}>
                        {instrument}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('natImplementorTitle')}</label>}
                  name="natImplementor"
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    mode="multiple"
                    disabled={true}
                  ></Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('sectorsAffectedTitle')}</label>}
                  name="sectorsAffected"
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    mode="multiple"
                    disabled={true}
                  ></Select>
                </Form.Item>
              </Col>
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
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('investmentNeeds')}</label>}
                  name="estimatedInvestment"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('natAnchorTitle')}</label>}
                  name="natAnchor"
                  rules={[validation.required]}
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {Object.values(NatAnchor).map((instrument) => (
                      <Option key={instrument} value={instrument}>
                        {instrument}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <div
              style={{ color: '#3A3541', opacity: 0.8, marginTop: '10px', marginBottom: '10px' }}
            >
              {t('documentsHeader')}
            </div>
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
          </div>
          <div className="form-section-card">
            <Row>
              <Col span={6} style={{ paddingTop: '6px' }}>
                <div className="form-section-header">{t('programInfoTitle')}</div>
              </Col>
              <Col span={4}>
                <AttachEntity
                  isDisabled={isView}
                  content={{
                    buttonName: t('attachProgramme'),
                    attach: t('attach'),
                    contentTitle: t('attachProgramme'),
                    listTitle: t('programmeList'),
                    cancel: t('cancel'),
                  }}
                  options={allProgramIds}
                  alreadyAttached={attachedProgramIds}
                  currentAttachments={tempProgramIds}
                  setCurrentAttachments={setTempProgramIds}
                  icon={<AppstoreOutlined style={{ fontSize: '120px' }} />}
                ></AttachEntity>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <LayoutTable
                  tableData={programData}
                  columns={progTableColumns}
                  loading={false}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: programData.length,
                    showQuickJumper: true,
                    pageSizeOptions: ['10', '20', '30'],
                    showSizeChanger: true,
                    style: { textAlign: 'center' },
                    locale: { page: '' },
                    position: ['bottomRight'],
                  }}
                  handleTableChange={handleTableChange}
                  emptyMessage={t('noProgramsMessage')}
                />
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
            <div className="form-section-card">
              <div className="form-section-header">{t('updatesInfoTitle')}</div>
            </div>
          )}
          {method === 'create' && (
            <Row gutter={20} justify={'end'}>
              <Col span={2}>
                <Button
                  type="default"
                  size="large"
                  block
                  onClick={() => {
                    navigate('/actions');
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
          {method === 'view' && (
            <Row gutter={20} justify={'end'}>
              <Col span={2}>
                <Button
                  type="default"
                  size="large"
                  block
                  onClick={() => {
                    navigate('/actions');
                  }}
                >
                  {t('back')}
                </Button>
              </Col>
              <Col span={2.5}>
                <Form.Item>
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={() => {
                      validateEntity();
                    }}
                  >
                    {t('validate')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          )}
          {method === 'update' && (
            <Row gutter={20} justify={'end'}>
              <Col span={2}>
                <Button
                  type="default"
                  size="large"
                  block
                  onClick={() => {
                    navigate('/actions');
                  }}
                >
                  {t('cancel')}
                </Button>
              </Col>
              <Col span={2}>
                <Button
                  type="default"
                  size="large"
                  block
                  onClick={() => {
                    deleteEntity();
                  }}
                  style={{ color: 'red', borderColor: 'red' }}
                >
                  {t('delete')}
                </Button>
              </Col>
              <Col span={2.5}>
                <Form.Item>
                  <Button type="primary" size="large" block htmlType="submit">
                    {t('update')}
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

export default actionForm;
