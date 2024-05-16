import { useTranslation } from 'react-i18next';
import { Row, Col, Input, Button, Form, Select, message, Spin } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { useNavigate, useParams } from 'react-router-dom';
import UploadFileGrid from '../../../Components/Upload/uploadFiles';
import AttachEntity from '../../../Components/Popups/attach';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { GraphUpArrow } from 'react-bootstrap-icons';
import './projectForm.scss';
import { ProjectStatus, ProjectType } from '../../../Enums/project.enum';
import { IntImplementor, Recipient } from '../../../Enums/shared.enum';
import { KpiGrid } from '../../../Components/KPI/kpiGrid';
import EntityIdCard from '../../../Components/EntityIdCard/entityIdCard';
import { NewKpiData } from '../../../Definitions/kpiDefinitions';
import { ProgrammeSelectData } from '../../../Definitions/programmeDefinitions';
import { ActivityData } from '../../../Definitions/activityDefinitions';
import { SupportData } from '../../../Definitions/supportDefinitions';
import { FormLoadProps } from '../../../Definitions/InterfacesAndType/formInterface';
import { getValidationRules } from '../../../Utils/validationRules';
import { getFormTitle } from '../../../Utils/utilServices';
import { Action } from '../../../Enums/action.enum';
import { ProjectEntity } from '../../../Entities/project';
import { useAbilityContext } from '../../../Casl/Can';
import { getSupportTableColumns } from '../../../Definitions/columns/supportColumns';
import { getActivityTableColumns } from '../../../Definitions/columns/activityColumns';
import UpdatesTimeline from '../../../Components/UpdateTimeline/updates';
import { ProjectMigratedData } from '../../../Definitions/projectDefinitions';

const { Option } = Select;
const { TextArea } = Input;

const gutterSize = 30;
const inputFontSize = '13px';

const ProjectForm: React.FC<FormLoadProps> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['projectForm', 'tableAction']);

  const isView: boolean = method === 'view' ? true : false;
  const formTitle = getFormTitle('Project', method);

  const navigate = useNavigate();
  const { get, post, put } = useConnection();
  const ability = useAbilityContext();
  const { entId } = useParams();

  // Form Validation Rules

  const validation = getValidationRules(method);
  // Entity Validation Status

  const [isValidated, setIsValidated] = useState<boolean>(false);

  // Parent Selection State

  const [programmeList, setProgrammeList] = useState<ProgrammeSelectData[]>([]);
  const [projectConnectedProgramme, setProjectConnectedProgramme] = useState<string>();
  const [programmeConnectedAction, setProgrammeConnectedAction] = useState<string>();

  // Form General State

  const [projectMigratedData, setProjectMigratedData] = useState<ProjectMigratedData>();
  const [uploadedFiles, setUploadedFiles] = useState<
    { key: string; title: string; data: string }[]
  >([]);
  const [storedFiles, setStoredFiles] = useState<{ key: string; title: string; url: string }[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

  // Spinner When Form Submit Occurs

  const [waitingForBE, setWaitingForBE] = useState<boolean>(false);

  // Activity Attachment State

  const [allActivityIds, setAllActivityList] = useState<string[]>([]);
  const [attachedActivityIds, setAttachedActivityIds] = useState<string[]>([]);
  const [tempActivityIds, setTempActivityIds] = useState<string[]>([]);

  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [activityCurrentPage, setActivityCurrentPage] = useState<any>(1);
  const [activityPageSize, setActivityPageSize] = useState<number>(10);

  // Supports state

  const [supportData, setSupportData] = useState<SupportData[]>([]);
  const [supportCurrentPage, setSupportCurrentPage] = useState<any>(1);
  const [supportPageSize, setSupportPageSize] = useState<number>(10);

  // KPI State

  const [newKpiList, setNewKpiList] = useState<NewKpiData[]>([]);
  const [migratedKpiList, setMigratedKpiList] = useState<number[]>([]);

  // Initialization Logic

  const yearsList: number[] = [];

  for (let year = 2013; year <= 2050; year++) {
    yearsList.push(year);
  }

  useEffect(() => {
    // Initially Loading Free Actions that can be parent

    const fetchAllProgrammes = async () => {
      const response: any = await post('national/programmes/query', {});

      const tempProgrammeData: ProgrammeSelectData[] = [];
      response.data.forEach((prg: any) => {
        tempProgrammeData.push({
          id: prg.programmeId,
          title: prg.title,
        });
      });
      setProgrammeList(tempProgrammeData);
    };
    fetchAllProgrammes();

    // Initially Loading Free Activities that can be attached

    const fetchFreeActivities = async () => {
      if (method !== 'view') {
        const response: any = await get('national/activities/link/eligible');

        const freeActivityIds: string[] = [];
        response.data.forEach((act: any) => {
          freeActivityIds.push(act.activityId);
        });
        setAllActivityList(freeActivityIds);
      }
    };
    fetchFreeActivities();

    // Initially Loading the underlying project data when not in create mode

    const fetchData = async () => {
      if (method !== 'create' && entId) {
        let response: any;
        try {
          response = await get(`national/projects/${entId}`);

          if (response.status === 200 || response.status === 201) {
            const entityData: any = response.data;

            // Populating Project owned data fields
            form.setFieldsValue({
              type: entityData.type,
              title: entityData.title,
              description: entityData.description,
              additionalProjectNumber: entityData.additionalProjectNumber,
              projectStatus: entityData.projectStatus,
              startYear: entityData.startYear,
              endYear: entityData.endYear,
              expectedTimeFrame: entityData.expectedTimeFrame,
              recipientEntities: entityData.recipientEntities,
              internationalImplementingEntities: entityData.internationalImplementingEntities,
              comment: entityData.comment,
            });

            setIsValidated(entityData.validated ?? false);

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

            // Setting the Programme Information
            if (entityData.programme) {
              setProjectConnectedProgramme(entityData.programme.programmeId);

              // Setting the Programme Connected Action Information
              if (entityData.programme?.path) {
                setProgrammeConnectedAction(entityData.programme.path);
              }
            }

            // Populating Migrated Fields (Will be overwritten when attachments change)
            setProjectMigratedData({
              techDevContribution: 'No',
              capBuildObjectives: 'No',
              techType: entityData.migratedData?.technologyTypes ?? [],
              neededUSD: entityData.migratedData?.estimatedAmount ?? 0,
              neededLCL: entityData.migratedData?.estimatedAmountDomestic ?? 0,
              receivedUSD: entityData.migratedData?.receivedAmount ?? 0,
              receivedLCL: entityData.migratedData?.receivedAmountDomestic ?? 0,
              achievedGHGReduction: entityData.migratedData?.achievedGHGReduction ?? 0,
              expectedGHGReduction: entityData.migratedData?.expectedGHGReduction ?? 0,
            });
          }
        } catch {
          navigate('/projects');
          message.open({
            type: 'error',
            content: t('noSuchEntity'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });
        }
      }
    };
    fetchData();

    // Initially Loading the attached project data when not in create mode

    const fetchConnectedActivityIds = async () => {
      if (method !== 'create') {
        const payload = {
          filterAnd: [
            {
              key: 'parentId',
              operation: '=',
              value: entId,
            },
          ],
          sort: {
            key: 'activityId',
            order: 'ASC',
          },
        };
        const response: any = await post('national/activities/query', payload);

        const connectedActivityIds: string[] = [];
        response.data.forEach((act: any) => {
          connectedActivityIds.push(act.activityId);
        });
        setAttachedActivityIds(connectedActivityIds);
        setTempActivityIds(connectedActivityIds);

        // Resolve Support Loading
        setSupportData([]);
      }
    };
    fetchConnectedActivityIds();
  }, []);

  // Populating Form Migrated Fields, when migration data changes

  useEffect(() => {
    if (projectMigratedData) {
      form.setFieldsValue({
        techDevContribution: projectMigratedData.techDevContribution,
        capBuildObjectives: projectMigratedData.capBuildObjectives,
        techType: projectMigratedData.techType,
        neededUSD: projectMigratedData.neededUSD,
        neededLCL: projectMigratedData.neededLCL,
        receivedUSD: projectMigratedData.receivedUSD,
        receivedLCL: projectMigratedData.receivedLCL,
        achievedGHGReduction: projectMigratedData.achievedGHGReduction,
        expectedGHGReduction: projectMigratedData.expectedGHGReduction,
      });
    }
  }, [projectMigratedData]);

  useEffect(() => {
    const fetchConnectedAction = async () => {
      if (programmeConnectedAction) {
        try {
          const response = await get(`national/actions/${programmeConnectedAction}`);

          if (response.status === 200 || response.status === 201) {
            const actionData: any = response.data;
            form.setFieldsValue({
              actionTitle: actionData.title,
              natAnchor: actionData.natAnchor,
            });
          }
        } catch {
          navigate('/projects');
          message.open({
            type: 'error',
            content: t('actionNotFound'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });
        }
      }
    };
    fetchConnectedAction();
  }, [programmeConnectedAction]);

  useEffect(() => {
    const fetchConnectedProgramme = async () => {
      if (projectConnectedProgramme) {
        try {
          const response = await get(`national/programmes/${projectConnectedProgramme}`);

          if (response.status === 200 || response.status === 201) {
            const programmeData: any = response.data;
            form.setFieldsValue({
              programmeId: programmeData.programmeId,
              programmeTitle: programmeData.title,
              instrTypes: programmeData.instrumentType,
              sectorsAffected: programmeData.affectedSectors,
              subSectorsAffected: programmeData.affectedSubSector,
              nationalImplementor: programmeData.nationalImplementor,
            });

            setProgrammeConnectedAction(programmeData.actionId);
          }
        } catch {
          navigate('/projects');
          message.open({
            type: 'error',
            content: t('programmeNotFound'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });
        }
      }
    };
    fetchConnectedProgramme();
  }, [projectConnectedProgramme]);

  // Fetching Project data and calculating migrated fields when attachment changes

  useEffect(() => {
    const payload = {
      page: 1,
      size: tempActivityIds.length,
      filterOr: [] as any[],
    };

    const tempMigratedData: ProjectMigratedData = {
      techDevContribution: 'No',
      capBuildObjectives: 'No',
      techType: [],
      neededUSD: 0,
      neededLCL: 0,
      receivedUSD: 0,
      receivedLCL: 0,
      achievedGHGReduction: 0,
      expectedGHGReduction: 0,
    };

    const meansOfImplementation: string[] = [];

    const fetchData = async () => {
      if (tempActivityIds.length > 0) {
        tempActivityIds.forEach((actId) => {
          payload.filterOr.push({
            key: 'activityId',
            operation: '=',
            value: actId,
          });
        });
        const response: any = await post('national/activities/query', payload);

        const tempActivityData: ActivityData[] = [];

        response.data.forEach((act: any, index: number) => {
          tempActivityData.push({
            key: index.toString(),
            activityId: act.activityId,
            title: act.title,
            reductionMeasures: act.measure,
            status: act.status,
            startYear: act.migratedData?.startYear,
            endYear: act.migratedData?.endYear,
            natImplementor: act.nationalImplementingEntity ?? [],
          });

          if (act.technologyType && !tempMigratedData.techType.includes(act.technologyType)) {
            tempMigratedData.techType.push(act.technologyType);
          }

          if (
            act.meansOfImplementation &&
            !meansOfImplementation.includes(act.meansOfImplementation)
          ) {
            meansOfImplementation.push(act.meansOfImplementation);
          }

          const activityGHGAchievement =
            act.achievedGHGReduction !== null ? act.achievedGHGReduction : 0;
          const activityGHGExpected =
            act.expectedGHGReduction !== null ? act.expectedGHGReduction : 0;

          tempMigratedData.achievedGHGReduction =
            tempMigratedData.achievedGHGReduction + activityGHGAchievement;

          tempMigratedData.expectedGHGReduction =
            tempMigratedData.expectedGHGReduction + activityGHGExpected;
        });

        console.log(meansOfImplementation);

        if (meansOfImplementation.includes('Technology Development & Transfer')) {
          tempMigratedData.techDevContribution = 'Yes';
        }

        if (meansOfImplementation.includes('Capacity Building')) {
          tempMigratedData.capBuildObjectives = 'Yes';
        }

        setActivityData(tempActivityData);
        setProjectMigratedData(tempMigratedData);
      } else {
        setActivityData([]);
        setProjectMigratedData(tempMigratedData);
      }
    };
    fetchData();

    // Setting Pagination
    setActivityCurrentPage(1);
    setActivityPageSize(10);
  }, [tempActivityIds]);

  useEffect(() => {
    console.log('Running Migration Update');

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
  }, [activityData]);

  // Attachment resolve before updating an already created programme

  const resolveAttachments = async () => {
    const toAttach = tempActivityIds.filter((act) => !attachedActivityIds.includes(act));
    const toDetach = attachedActivityIds.filter((act) => !tempActivityIds.includes(act));

    if (toDetach.length > 0) {
      await post('national/activities/unlink', { activityIds: toDetach });
    }

    if (toAttach.length > 0) {
      await post('national/activities/link', {
        parentId: entId,
        parentType: 'project',
        activityIds: toAttach,
      });
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

      if (activityData.length > 0 && method === 'create') {
        payload.linkedActivities = [];
        activityData.forEach((activity) => {
          payload.linkedActivities.push(activity.activityId);
        });
      }

      payload.expectedTimeFrame = parseFloat(payload.expectedTimeFrame);
      payload.startYear = parseInt(payload.startYear);
      payload.endYear = parseInt(payload.endYear);

      let response: any;

      if (method === 'create') {
        response = await post('national/projects/add', payload);
      } else if (method === 'update') {
        payload.projectId = entId;
        response = await put('national/projects/update', payload);

        resolveAttachments();
      }

      const successMsg =
        method === 'create' ? t('projectCreationSuccess') : t('projectUpdateSuccess');

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
        navigate('/projects');
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
      navigate('/projects');
    }
  };

  // Entity Validate

  const validateEntity = async () => {
    try {
      if (entId) {
        const payload = {
          entityId: entId,
        };
        const response: any = await post('national/projects/validate', payload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content: 'Successfully Validated !',
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          navigate('/projects');
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
    const kpiIndex = Math.floor(Date.now() / 1000);
    const newItem: NewKpiData = {
      index: kpiIndex,
      name: '',
      unit: '',
      creatorType: 'project',
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

  // Detach Activity

  const detachActivity = async (actId: string) => {
    const filteredIds = tempActivityIds.filter((id) => id !== actId);
    setTempActivityIds(filteredIds);
  };

  // Activity Column Definition

  const activityTableColumns = getActivityTableColumns(isView, detachActivity);

  // Support Column Definition

  const supportTableColumns = getSupportTableColumns();

  // Activity Table Behaviour

  const handleActivityTableChange = (pagination: any) => {
    setActivityCurrentPage(pagination.current);
    setActivityPageSize(pagination.pageSize);
  };

  // Support Table Behaviour

  const handleSupportTableChange = (pagination: any) => {
    setSupportCurrentPage(pagination.current);
    setSupportPageSize(pagination.pageSize);
  };

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t(formTitle)}</div>
      </div>
      {!waitingForBE ? (
        <div className="project-form">
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <div className="form-section-card">
              <div className="form-section-header">{t('generalInfoTitle')}</div>
              {method !== 'create' && entId && (
                <EntityIdCard calledIn="Project" entId={entId}></EntityIdCard>
              )}
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('selectProgrammeHeader')}</label>}
                    name="programmeId"
                  >
                    <Select
                      size={'large'}
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                      onChange={(value: any) => {
                        setProjectConnectedProgramme(value);
                      }}
                    >
                      {programmeList.map((program) => (
                        <Option key={program.id} value={program.id}>
                          {program.id}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('typeHeader')}</label>}
                    name="type"
                    rules={[validation.required]}
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                    >
                      {Object.values(ProjectType).map((pType) => (
                        <Option key={pType} value={pType}>
                          {pType}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('projTitleHeader')}</label>}
                    name="title"
                    rules={[validation.required]}
                  >
                    <Input className="form-input-box" disabled={isView} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('projDescHeader')}</label>}
                    name="description"
                    rules={[validation.required]}
                  >
                    <TextArea maxLength={250} rows={3} disabled={isView} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('projectNumberHeader')}</label>}
                    name="additionalProjectNumber"
                  >
                    <Input className="form-input-box" disabled={isView} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('actionTitleHeader')}</label>}
                    name="actionTitle"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('programmeTitleHeader')}</label>}
                    name="programmeTitle"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('natAnchorHeader')}</label>}
                    name="natAnchor"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      mode="multiple"
                      allowClear
                      disabled
                    ></Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('instrTypesHeader')}</label>}
                    name="instrTypes"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      mode="multiple"
                      allowClear
                      disabled
                    ></Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('projectStatusHeader')}</label>}
                    name="projectStatus"
                    rules={[validation.required]}
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                    >
                      {Object.values(ProjectStatus).map((pStatus) => (
                        <Option key={pStatus} value={pStatus}>
                          {pStatus}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col span={6}>
                  <Form.Item
                    label={<label className="form-item-header">{t('sectorsAffectedHeader')}</label>}
                    name="sectorsAffected"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      mode="multiple"
                      allowClear
                      disabled
                    ></Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('subSectorsAffectedHeader')}</label>
                    }
                    name="subSectorsAffected"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      mode="multiple"
                      allowClear
                      disabled
                    ></Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={<label className="form-item-header">{t('startYearHeader')}</label>}
                    name="startYear"
                    rules={[
                      validation.required,
                      ({ getFieldValue }) => ({
                        // eslint-disable-next-line no-unused-vars
                        validator(_, value) {
                          if (!value || getFieldValue('endYear') >= value) {
                            return Promise.resolve();
                          }
                          return Promise.reject('Cannot be greater than End Year!');
                        },
                      }),
                    ]}
                    dependencies={['endYear']}
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
                    label={<label className="form-item-header">{t('endYearHeader')}</label>}
                    name="endYear"
                    rules={[
                      validation.required,
                      ({ getFieldValue }) => ({
                        // eslint-disable-next-line no-unused-vars
                        validator(_, value) {
                          if (!value || getFieldValue('startYear') <= value) {
                            return Promise.resolve();
                          }
                          return Promise.reject('Cannot be lower than Start Year!');
                        },
                      }),
                    ]}
                    dependencies={['startYear']}
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
                <Col span={6}>
                  <Form.Item
                    label={<label className="form-item-header">{t('timeFrameHeader')}</label>}
                    name="expectedTimeFrame"
                    rules={[validation.required]}
                  >
                    <Input type="number" className="form-input-box" disabled={isView} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item<number>
                    label={<label className="form-item-header">{t('natImplementorHeader')}</label>}
                    name="nationalImplementor"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      mode="multiple"
                      allowClear
                      disabled
                    ></Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<number>
                    label={<label className="form-item-header">{t('techTypeHeader')}</label>}
                    name="techType"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      mode="multiple"
                      allowClear
                      disabled
                    ></Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('recipientHeader')}</label>}
                    name="recipientEntities"
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
                      {Object.values(Recipient).map((recipient) => (
                        <Option key={recipient} value={recipient}>
                          {recipient}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<number>
                    label={<label className="form-item-header">{t('intImplementorHeader')}</label>}
                    name="internationalImplementingEntities"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      mode="multiple"
                      allowClear
                      disabled={isView}
                      showSearch
                    >
                      {Object.values(IntImplementor).map((instrument) => (
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
                  <Form.Item<number>
                    label={<label className="form-item-header">{t('techDevHeader')}</label>}
                    name="techDevContribution"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<number>
                    label={<label className="form-item-header">{t('capBuildHeader')}</label>}
                    name="capBuildObjectives"
                  >
                    <Input className="form-input-box" disabled />
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
              <div className="form-section-header">{t('mitigationInfoTitle')}</div>
              <div className="form-section-sub-header">{t('emmissionInfoTitle')}</div>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('achieved')}</label>}
                    name="achievedGHGReduction"
                  >
                    <Input type="number" className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('expected')}</label>}
                    name="expectedGHGReduction"
                  >
                    <Input type="number" className="form-input-box" disabled />
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
              <Row gutter={gutterSize}>
                <Col span={24}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('programmeCommentsTitle')}</label>
                    }
                    name="comment"
                  >
                    <TextArea rows={3} disabled={isView} />
                  </Form.Item>
                </Col>
              </Row>
              <div className="form-section-header">{t('financeInfoTitle')}</div>
              <Row gutter={gutterSize}>
                <Col span={6}>
                  <Form.Item
                    label={<label className="form-item-header">{t('neededUSDHeader')}</label>}
                    name="neededUSD"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={<label className="form-item-header">{t('neededLCLHeader')}</label>}
                    name="neededLCL"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={<label className="form-item-header">{t('recievedUSDHeader')}</label>}
                    name="receivedUSD"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={<label className="form-item-header">{t('recievedLCLHeader')}</label>}
                    name="receivedLCL"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div className="form-section-card">
              <Row>
                <Col span={6} style={{ paddingTop: '6px' }}>
                  <div className="form-section-header">{t('activityInfoTitle')}</div>
                </Col>
                <Col span={4}>
                  <AttachEntity
                    isDisabled={isView}
                    content={{
                      buttonName: t('attachActivity'),
                      attach: t('attach'),
                      contentTitle: t('attachActivity'),
                      listTitle: t('activityList'),
                      cancel: t('cancel'),
                    }}
                    options={allActivityIds}
                    alreadyAttached={attachedActivityIds}
                    currentAttachments={tempActivityIds}
                    setCurrentAttachments={setTempActivityIds}
                    icon={<GraphUpArrow style={{ fontSize: '120px' }} />}
                  ></AttachEntity>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <div style={{ overflowX: 'auto' }}>
                    <LayoutTable
                      tableData={activityData.slice(
                        (activityCurrentPage - 1) * activityPageSize,
                        (activityCurrentPage - 1) * activityPageSize + activityPageSize
                      )}
                      columns={activityTableColumns}
                      loading={false}
                      pagination={{
                        current: activityCurrentPage,
                        pageSize: activityPageSize,
                        total: activityData.length,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '30'],
                        showSizeChanger: true,
                        style: { textAlign: 'center' },
                        locale: { page: '' },
                        position: ['bottomRight'],
                      }}
                      handleTableChange={handleActivityTableChange}
                      emptyMessage={t('noActivityMessage')}
                    />{' '}
                  </div>
                </Col>
              </Row>
            </div>
            <div className="form-section-card">
              <Row>
                <Col span={6}>
                  <div className="form-section-header">{t('supportInfoTitle')}</div>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <LayoutTable
                    tableData={supportData}
                    columns={supportTableColumns}
                    loading={false}
                    pagination={{
                      current: supportCurrentPage,
                      pageSize: supportPageSize,
                      total: supportData.length,
                      showQuickJumper: true,
                      pageSizeOptions: ['10', '20', '30'],
                      showSizeChanger: true,
                      style: { textAlign: 'center' },
                      locale: { page: '' },
                      position: ['bottomRight'],
                    }}
                    handleTableChange={handleSupportTableChange}
                    emptyMessage={t('noSupportMessage')}
                  />
                </Col>
              </Row>
            </div>
            {isView && (
              <div className="form-section-timelinecard">
                <div className="form-section-header">{t('updatesInfoTitle')}</div>
                <UpdatesTimeline recordType={'project'} recordId={entId} />
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
                      navigate('/projects');
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
                      navigate('/projects');
                    }}
                  >
                    {t('back')}
                  </Button>
                </Col>
                {ability.can(Action.Validate, ProjectEntity) && (
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
                      navigate('/projects');
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
      ) : (
        <Spin className="loading-center" size="large" />
      )}
    </div>
  );
};

export default ProjectForm;
