import { useTranslation } from 'react-i18next';
import { Row, Col, Input, Button, Form, Select, message, Spin } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { useNavigate, useParams } from 'react-router-dom';
import UploadFileGrid from '../../../Components/Upload/uploadFiles';
import AttachEntity from '../../../Components/Popups/attach';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { SubSector, NatImplementor } from '../../../Enums/shared.enum';
import { ProgrammeStatus } from '../../../Enums/programme.enum';
import { Layers } from 'react-bootstrap-icons';
import './programmeForm.scss';
import EntityIdCard from '../../../Components/EntityIdCard/entityIdCard';
import { CreatedKpiData, NewKpiData } from '../../../Definitions/kpiDefinitions';
import { ActionSelectData } from '../../../Definitions/actionDefinitions';
import { ProjectData } from '../../../Definitions/projectDefinitions';
import { FormLoadProps } from '../../../Definitions/InterfacesAndType/formInterface';
import { getValidationRules } from '../../../Utils/validationRules';
import { getFormTitle, joinTwoArrays } from '../../../Utils/utilServices';
import { ProgrammeMigratedData } from '../../../Definitions/programmeDefinitions';
import { Action } from '../../../Enums/action.enum';
import { ProgrammeEntity } from '../../../Entities/programme';
import { useAbilityContext } from '../../../Casl/Can';
import { getProjectTableColumns } from '../../../Definitions/columns/projectColumns';
import UpdatesTimeline from '../../../Components/UpdateTimeline/updates';
import { ViewKpi } from '../../../Components/KPI/viewKpi';
import { NewKpi } from '../../../Components/KPI/newKpi';
import { EditKpi } from '../../../Components/KPI/editKpi';
import { processOptionalFields } from '../../../Utils/optionalValueHandler';

const { Option } = Select;
const { TextArea } = Input;

const gutterSize = 30;
const inputFontSize = '13px';

const ProgrammeForm: React.FC<FormLoadProps> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['programmeForm']);

  const isView: boolean = method === 'view' ? true : false;
  const formTitle = getFormTitle('Programme', method);

  const navigate = useNavigate();
  const { get, post, put } = useConnection();
  const ability = useAbilityContext();
  const { entId } = useParams();

  // Form Validation Rules

  const validation = getValidationRules(method);

  // Entity Validation Status

  const [isValidated, setIsValidated] = useState<boolean>(false);

  // Parent Select state

  const [actionList, setActionList] = useState<ActionSelectData[]>([]);

  // Form General State

  const [programmeMigratedData, setProgrammeMigratedData] = useState<ProgrammeMigratedData>();
  const [uploadedFiles, setUploadedFiles] = useState<
    { key: string; title: string; data: string }[]
  >([]);
  const [storedFiles, setStoredFiles] = useState<{ key: string; title: string; url: string }[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

  //MARK: TO DO
  // const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);

  // Spinner When Form Submit Occurs

  const [waitingForBE, setWaitingForBE] = useState<boolean>(false);

  // Project Attachment state

  const [allProjectIds, setAllProjectIdList] = useState<string[]>([]);
  const [attachedProjectIds, setAttachedProjectIds] = useState<string[]>([]);
  const [tempProjectIds, setTempProjectIds] = useState<string[]>([]);

  const [projectData, setProjectData] = useState<ProjectData[]>([]);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Activity Attachment state

  // const [allActivityIds, setAllActivityIdList] = useState<string[]>([]);
  // const [attachedActivityIds, setAttachedActivityIds] = useState<string[]>([]);
  // const [tempActivityIds, setTempActivityIds] = useState<string[]>([]);

  // const [activityData, setActivityData] = useState<ActivityData[]>([]);
  // const [activityCurrentPage, setActivityCurrentPage] = useState<any>(1);
  // const [activityPageSize, setActivityPageSize] = useState<number>(10);

  // const [supportData, setSupportData] = useState<SupportData[]>([]);
  // const [supportCurrentPage, setSupportCurrentPage] = useState<any>(1);
  // const [supportPageSize, setSupportPageSize] = useState<number>(10);

  // KPI State

  const [kpiCounter, setKpiCounter] = useState<number>(0);
  const [createdKpiList, setCreatedKpiList] = useState<CreatedKpiData[]>([]);
  const [inheritedKpiList, setInheritedKpiList] = useState<CreatedKpiData[]>([]);
  const [newKpiList, setNewKpiList] = useState<NewKpiData[]>([]);

  // Initialization Logic

  const yearsList: number[] = [];

  for (let year = 2013; year <= 2050; year++) {
    yearsList.push(year);
  }

  useEffect(() => {
    // Initially Loading Free Actions that can be parent

    const fetchFreeActions = async () => {
      const response: any = await post('national/actions/query', {});

      const tempActionData: ActionSelectData[] = [];
      response.data.forEach((action: any) => {
        tempActionData.push({
          id: action.actionId,
          title: action.title,
          instrumentType: action.instrumentType,
          sector: action.sector,
        });
      });
      setActionList(tempActionData);
    };

    fetchFreeActions();

    // Initially Loading Free Projects that can be attached

    const fetchFreeProjects = async () => {
      if (method !== 'view') {
        const response: any = await get('national/projects/link/eligible');

        const freeProjectIds: string[] = [];
        response.data.forEach((prj: any) => {
          freeProjectIds.push(prj.projectId);
        });
        setAllProjectIdList(freeProjectIds);
      }
    };
    fetchFreeProjects();

    // Initially Loading the underlying programme data when not in create mode

    const fetchData = async () => {
      if (method !== 'create' && entId) {
        let response: any;
        try {
          response = await get(`national/programmes/${entId}`);

          if (response.status === 200 || response.status === 201) {
            const entityData: any = response.data;

            // Populating Action owned data fields
            form.setFieldsValue({
              actionId: entityData.actionId,
              instrumentType: entityData.instrumentType,
              title: entityData.title,
              description: entityData.description,
              objective: entityData.objectives,
              programmeStatus: entityData.programmeStatus,
              startYear: entityData.startYear,
              natAnchor: entityData.natAnchor,
              sector: entityData.sector,
              affectedSubSector: entityData.affectedSubSector,
              natImplementor: entityData.nationalImplementor,
              investment: entityData.investment,
              comments: entityData.comments ?? undefined,
            });

            // Setting validation status

            setIsValidated(entityData.validated ?? false);

            if (entityData.validated && method === 'update') {
              navigate(`/programmes/view/${entId}`);
            }

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
            setProgrammeMigratedData({
              type: entityData.types ?? [],
              intImplementor: entityData.interNationalImplementor ?? [],
              recipientEntity: entityData.recipientEntity ?? [],
              ghgsAffected: entityData.ghgsAffected,
              achievedReduct: entityData.achievedGHGReduction,
              expectedReduct: entityData.expectedGHGReduction,
            });
          }
        } catch {
          navigate('/programmes');
          message.open({
            type: 'error',
            content: t('noSuchEntity'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });
        }
        // setIsSaveButtonDisabled(true);
      }
    };
    fetchData();

    // Initially Loading the KPI data when not in create mode

    const fetchCreatedKPIData = async () => {
      if (method !== 'create' && entId) {
        try {
          const response: any = await get(`national/kpis/achieved/programme/${entId}`);
          if (response.status === 200 || response.status === 201) {
            const tempCreatedKpiList: CreatedKpiData[] = [];
            const tempInheritedKpiList: CreatedKpiData[] = [];
            let tempKpiCounter = kpiCounter;
            response.data.forEach((kpi: any) => {
              if (kpi.creatorId === entId) {
                tempCreatedKpiList.push({
                  index: tempKpiCounter,
                  id: kpi.kpiId,
                  name: kpi.name,
                  unit: kpi.kpiUnit,
                  achieved: kpi.achieved ?? 0,
                  expected: kpi.expected,
                });
              } else {
                tempInheritedKpiList.push({
                  index: tempKpiCounter,
                  id: kpi.kpiId,
                  name: kpi.name,
                  unit: kpi.kpiUnit,
                  achieved: kpi.achieved ?? 0,
                  expected: kpi.expected,
                });
              }
              tempKpiCounter = tempKpiCounter + 1;
            });
            setKpiCounter(tempKpiCounter);
            setCreatedKpiList(tempCreatedKpiList);
            setInheritedKpiList(tempInheritedKpiList);
          }
        } catch {
          message.open({
            type: 'error',
            content: t('kpiSearchFailed'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });
        }
      }
    };
    fetchCreatedKPIData();

    // Initially Loading the attached project data when not in create mode

    const fetchConnectedProjectIds = async () => {
      if (method !== 'create') {
        const payload = {
          filterAnd: [
            {
              key: 'programmeId',
              operation: '=',
              value: entId,
            },
          ],
          sort: {
            key: 'projectId',
            order: 'ASC',
          },
        };
        const response: any = await post('national/projects/query', payload);

        const connectedProjectIds: string[] = [];
        response.data.forEach((prj: any) => {
          connectedProjectIds.push(prj.projectId);
        });
        setAttachedProjectIds(connectedProjectIds);
        setTempProjectIds(connectedProjectIds);
      }
    };
    fetchConnectedProjectIds();

    // const fetchConnectedActivityIds = async () => {
    //   if (method !== 'create') {
    //     const connectedActivityIds: string[] = [];
    //     const payload = {
    //       filterAnd: [
    //         {
    //           key: 'actionId',
    //           operation: '=',
    //           value: entId,
    //         },
    //       ],
    //       sort: {
    //         key: 'activityId',
    //         order: 'ASC',
    //       },
    //     };
    //     const response: any = await post('national/activities/query', payload);
    //     response.data.forEach((act: any) => {
    //       connectedActivityIds.push(act.activityId);
    //     });
    //     setAttachedActivityIds(connectedActivityIds);
    //     setTempActivityIds(connectedActivityIds);
    //   }
    // };
    // fetchConnectedActivityIds();
  }, []);

  // Populating Form Migrated Fields, when migration data changes

  useEffect(() => {
    if (programmeMigratedData) {
      form.setFieldsValue({
        type: programmeMigratedData.type,
        intImplementor: programmeMigratedData.intImplementor,
        recipientEntity: programmeMigratedData.recipientEntity,
        ghgsAffected: programmeMigratedData.ghgsAffected,
        achievedReduct: programmeMigratedData.achievedReduct,
        expectedReduct: programmeMigratedData.expectedReduct,
      });
    }
  }, [programmeMigratedData]);

  // Fetching Project data and calculating migrated fields when attachment changes

  useEffect(() => {
    const payload = {
      page: 1,
      size: tempProjectIds.length,
      filterOr: [] as any[],
    };

    const tempMigratedData: ProgrammeMigratedData = {
      type: [],
      intImplementor: [],
      recipientEntity: [],
      ghgsAffected: '',
      achievedReduct: 0,
      expectedReduct: 0,
    };

    const fetchData = async () => {
      if (tempProjectIds.length > 0) {
        tempProjectIds.forEach((projId) => {
          payload.filterOr.push({
            key: 'projectId',
            operation: '=',
            value: projId,
          });
        });
        const response: any = await post('national/projects/query', payload);

        const tempPRJData: ProjectData[] = [];

        response.data.forEach((prj: any, index: number) => {
          tempPRJData.push({
            key: index.toString(),
            projectId: prj.projectId,
            projectName: prj.title,
          });

          if (!tempMigratedData.type.includes(prj.type)) {
            tempMigratedData.type.push(prj.type);
          }

          tempMigratedData.intImplementor = joinTwoArrays(
            tempMigratedData.intImplementor,
            prj.internationalImplementingEntities ?? []
          );

          tempMigratedData.recipientEntity = joinTwoArrays(
            tempMigratedData.recipientEntity,
            prj.recipientEntities ?? []
          );

          const prgGHGAchievement = prj.migratedData[0]?.achievedGHGReduction ?? 0;
          const prgGHGExpected = prj.migratedData[0]?.expectedGHGReduction ?? 0;

          tempMigratedData.achievedReduct = tempMigratedData.achievedReduct + prgGHGAchievement;

          tempMigratedData.expectedReduct = tempMigratedData.expectedReduct + prgGHGExpected;
        });
        setProjectData(tempPRJData);
        setProgrammeMigratedData(tempMigratedData);
      } else {
        setProjectData([]);
        setProgrammeMigratedData(tempMigratedData);
      }
    };
    fetchData();

    // Setting Pagination
    setCurrentPage(1);
    setPageSize(10);
  }, [tempProjectIds]);

  // Attachment resolve before updating an already created programme

  const resolveAttachments = async () => {
    const toAttach = tempProjectIds.filter((prj) => !attachedProjectIds.includes(prj));
    const toDetach = attachedProjectIds.filter((prj) => !tempProjectIds.includes(prj));

    if (toDetach.length > 0) {
      await post('national/projects/unlink', { projects: toDetach });
    }

    if (toAttach.length > 0) {
      await post('national/projects/link', { programmeId: entId, projectIds: toAttach });
    }
  };

  // Form Submit

  const handleSubmit = async (payload: any) => {
    try {
      setWaitingForBE(true);

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

      if (method === 'create' && newKpiList.length > 0) {
        payload.kpis = [];
        newKpiList.forEach((kpi) => {
          payload.kpis.push({
            name: kpi.name,
            kpiUnit: kpi.unit,
            creatorType: 'programme',
            expected: kpi.expected,
          });
        });
      } else if (method === 'update' && (newKpiList.length > 0 || createdKpiList.length > 0)) {
        payload.kpis = [];
        newKpiList.forEach((kpi) => {
          payload.kpis.push({
            name: kpi.name,
            kpiUnit: kpi.unit,
            creatorType: 'programme',
            expected: kpi.expected,
          });
        });
        createdKpiList.forEach((kpi) => {
          payload.kpis.push({
            kpiId: kpi.id,
            kpiUnit: kpi.unit,
            name: kpi.name,
            creatorType: 'programme',
            expected: kpi.expected,
          });
        });
      }

      if (projectData.length > 0 && method === 'create') {
        payload.linkedProjects = [];
        projectData.forEach((project) => {
          payload.linkedProjects.push(project.projectId);
        });
      }

      payload.investment = parseFloat(payload.investment);

      let response: any;

      if (method === 'create') {
        response = await post('national/programmes/add', payload);
      } else if (method === 'update') {
        payload.programmeId = entId;
        response = await put(
          'national/programmes/update',
          processOptionalFields(payload, 'programme')
        );

        resolveAttachments();
      }

      const successMsg =
        method === 'create' ? t('programmeCreationSuccess') : t('programmeUpdateSuccess');

      if (response.status === 200 || response.status === 201) {
        await new Promise((resolve) => {
          setTimeout(resolve, 500);
        });

        message.open({
          type: 'success',
          content: successMsg,
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });

        await new Promise((resolve) => {
          setTimeout(resolve, 500);
        });

        setWaitingForBE(false);
        navigate('/programmes');
      }
    } catch (error: any) {
      message.open({
        type: 'error',
        content: `${error.message}`,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });

      setWaitingForBE(false);
      navigate('/programmes');
    }
  };

  // Entity Validate

  const validateEntity = async () => {
    try {
      if (entId) {
        const payload = {
          entityId: entId,
        };
        const response: any = await post('national/programmes/validate', payload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content: 'Successfully Validated !',
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          navigate('/programmes');
        }
      }
    } catch {
      message.open({
        type: 'error',
        content: `${entId} Validation Failed`,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    }
  };

  // Entity Delete

  const deleteEntity = () => {
    console.log('Delete Clicked');
  };

  // Add New KPI

  const createKPI = () => {
    const newItem: NewKpiData = {
      index: kpiCounter + 1,
      name: '',
      unit: '',
      achieved: undefined,
      expected: 0,
    };
    setKpiCounter(kpiCounter + 1);
    setNewKpiList((prevList) => [...prevList, newItem]);
  };

  const removeKPI = (kpiIndex: number, inWhich: 'created' | 'new') => {
    if (inWhich === 'new') {
      setNewKpiList(newKpiList.filter((obj) => obj.index !== kpiIndex));
    } else {
      setCreatedKpiList(createdKpiList.filter((obj) => obj.index !== kpiIndex));
    }
    const updatedValues = {
      [`kpi_name_${kpiIndex}`]: undefined,
      [`kpi_unit_${kpiIndex}`]: undefined,
      [`kpi_exp_${kpiIndex}`]: undefined,
    };
    form.setFieldsValue(updatedValues);
  };

  const updateKPI = (
    index: number,
    property: keyof NewKpiData,
    value: any,
    inWhich: 'created' | 'new'
  ): void => {
    if (inWhich === 'new') {
      setNewKpiList((prevKpiList) => {
        const updatedKpiList = prevKpiList.map((kpi) => {
          if (kpi.index === index) {
            return { ...kpi, [property]: value };
          }
          return kpi;
        });
        return updatedKpiList;
      });
    } else {
      setCreatedKpiList((prevKpiList) => {
        const updatedKpiList = prevKpiList.map((kpi) => {
          if (kpi.index === index) {
            return { ...kpi, [property]: value };
          }
          return kpi;
        });
        return updatedKpiList;
      });
    }
  };

  // Fetch Parent KPI

  const fetchParentKPIData = async (parentId: string) => {
    if (method === 'create') {
      try {
        const response: any = await get(`national/kpis/achieved/action/${parentId}`);
        if (response.status === 200 || response.status === 201) {
          const tempInheritedKpiList: CreatedKpiData[] = [];
          let tempKpiCounter = kpiCounter;
          response.data.forEach((kpi: any) => {
            tempInheritedKpiList.push({
              index: tempKpiCounter,
              id: kpi.kpiId,
              name: kpi.name,
              unit: kpi.kpiUnit,
              achieved: kpi.achieved ?? 0,
              expected: kpi.expected,
            });

            tempKpiCounter = tempKpiCounter + 1;
          });
          setKpiCounter(tempKpiCounter);
          setInheritedKpiList(tempInheritedKpiList);
        }
      } catch {
        message.open({
          type: 'error',
          content: t('kpiSearchFailed'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
      }
    }
  };

  // Detach Programme

  const detachProject = async (prjId: string) => {
    const filteredIds = tempProjectIds.filter((id) => id !== prjId);
    setTempProjectIds(filteredIds);
  };

  // Column Definition

  const projTableColumns = getProjectTableColumns(isView, detachProject);

  // Table Behaviour

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // Save Button Enable when form value change

  // const handleValuesChange = () => {
  //   setIsSaveButtonDisabled(false);
  // };

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t(formTitle)}</div>
      </div>
      {!waitingForBE ? (
        <div className="programme-form">
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            // onValuesChange={handleValuesChange}
          >
            <div className="form-section-card">
              <div className="form-section-header">{t('generalInfoTitle')}</div>
              {method !== 'create' && entId && (
                <EntityIdCard calledIn="Programme" entId={entId}></EntityIdCard>
              )}
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
                      onChange={(value: any) => {
                        form.setFieldsValue({
                          instrumentType: actionList.find((action) => action.id === value)
                            ?.instrumentType,
                          sector: actionList.find((action) => action.id === value)?.sector,
                        });
                        fetchParentKPIData(value);
                      }}
                    >
                      {actionList.map((action) => (
                        <Option key={action.id} value={action.id}>
                          {action.id}
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
                    label={<label className="form-item-header">{t('progStatusTitle')}</label>}
                    name="programmeStatus"
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
                    name="sector"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      disabled={true}
                    ></Select>
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
                    label={<label className="form-item-header">{t('recipientEntityTitle')}</label>}
                    name="recipientEntity"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      mode="multiple"
                      disabled={true}
                    ></Select>
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
                    <Input className="form-input-box" min={0} type="number" disabled={isView} />
                  </Form.Item>
                </Col>
              </Row>
              <div className="form-section-sub-header">{t('documentsHeader')}</div>
              <UploadFileGrid
                isSingleColumn={false}
                usedIn={method}
                buttonText={t('upload')}
                storedFiles={storedFiles}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                removedFiles={filesToRemove}
                setRemovedFiles={setFilesToRemove}
              ></UploadFileGrid>
              <Row gutter={gutterSize}>
                <Col span={24}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('programmeCommentsTitle')}</label>
                    }
                    name="comments"
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
                    tableData={projectData.slice(
                      (currentPage - 1) * pageSize,
                      (currentPage - 1) * pageSize + pageSize
                    )}
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
                    content={{
                      buttonName: t('attachProjects'),
                      attach: t('attach'),
                      contentTitle: t('attachProjects'),
                      listTitle: t('projectList'),
                      cancel: t('cancel'),
                    }}
                    options={allProjectIds}
                    alreadyAttached={attachedProjectIds}
                    currentAttachments={tempProjectIds}
                    setCurrentAttachments={setTempProjectIds}
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
              {inheritedKpiList.length > 0 &&
                inheritedKpiList.map((createdKPI: CreatedKpiData) => (
                  <ViewKpi
                    key={createdKPI.index}
                    index={createdKPI.index}
                    inherited={true}
                    headerNames={[t('kpiName'), t('kpiUnit'), t('achieved'), t('expected')]}
                    kpi={createdKPI}
                    callingEntityId={entId}
                  ></ViewKpi>
                ))}
              {method === 'view' &&
                createdKpiList.map((createdKPI: CreatedKpiData) => (
                  <ViewKpi
                    key={createdKPI.index}
                    index={createdKPI.index}
                    inherited={false}
                    headerNames={[t('kpiName'), t('kpiUnit'), t('achieved'), t('expected')]}
                    kpi={createdKPI}
                    callingEntityId={entId}
                  ></ViewKpi>
                ))}
              {method === 'update' &&
                createdKpiList.map((createdKPI: CreatedKpiData) => (
                  <EditKpi
                    key={createdKPI.index}
                    index={createdKPI.index}
                    form={form}
                    rules={[validation.required]}
                    isFromActivity={false}
                    headerNames={[t('kpiName'), t('kpiUnit'), t('achieved'), t('expected')]}
                    kpi={createdKPI}
                    updateKPI={updateKPI}
                    removeKPI={removeKPI}
                  ></EditKpi>
                ))}
              {newKpiList.map((newKPI: NewKpiData) => (
                <NewKpi
                  key={newKPI.index}
                  form={form}
                  rules={[validation.required]}
                  index={newKPI.index}
                  headerNames={[t('kpiName'), t('kpiUnit'), t('achieved'), t('expected')]}
                  updateKPI={updateKPI}
                  removeKPI={removeKPI}
                ></NewKpi>
              ))}
              <Row justify={'start'}>
                <Col span={2}>
                  {!isView && (
                    <Button
                      icon={<PlusCircleOutlined style={{ color: '#3A3541' }} />}
                      className="create-kpi-button"
                      onClick={createKPI}
                    >
                      <span className="kpi-add-text">{t('addKPI')}</span>
                    </Button>
                  )}
                </Col>
              </Row>
            </div>
            {method !== 'create' && (
              <div className="form-section-card">
                <div className="form-section-header">{t('updatesInfoTitle')}</div>
                <UpdatesTimeline recordType={'programme'} recordId={entId} />
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
            {method === 'view' && (
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
                    {t('back')}
                  </Button>
                </Col>
                {ability.can(Action.Validate, ProgrammeEntity) && (
                  <Col span={2.5}>
                    <Form.Item>
                      <Button
                        disabled={isValidated}
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
                )}
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
                      navigate('/programmes');
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
                    <Button
                      type="primary"
                      size="large"
                      block
                      htmlType="submit"
                      // disabled={isSaveButtonDisabled}
                    >
                      {t('update')}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            )}
          </Form>
        </div>
      ) : (
        <Spin className="loading-center" size="large" />
      )}
    </div>
  );
};

export default ProgrammeForm;
