import { useTranslation } from 'react-i18next';
import { Row, Col, Input, Button, Form, Select, message, Spin, Tooltip } from 'antd';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { useNavigate, useParams } from 'react-router-dom';
import UploadFileGrid from '../../../Components/Upload/uploadFiles';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import './projectForm.scss';
import { ProjectStatus } from '../../../Enums/project.enum';
import { KPIAction, Recipient } from '../../../Enums/shared.enum';
import EntityIdCard from '../../../Components/EntityIdCard/entityIdCard';
import { CreatedKpiData, NewKpiData } from '../../../Definitions/kpiDefinitions';
import { ProgrammeSelectData } from '../../../Definitions/programmeDefinitions';
import { ActivityData } from '../../../Definitions/activityDefinitions';
import { SupportData } from '../../../Definitions/supportDefinitions';
import { FormLoadProps } from '../../../Definitions/InterfacesAndType/formInterface';
import { getValidationRules } from '../../../Utils/validationRules';
import {
  delay,
  doesUserHaveValidatePermission,
  getFormTitle,
  getRounded,
  isGasFlowCheck,
} from '../../../Utils/utilServices';
import { Action } from '../../../Enums/action.enum';
import { ProjectEntity } from '../../../Entities/project';
import { useAbilityContext } from '../../../Casl/Can';
import { getSupportTableColumns } from '../../../Definitions/columns/supportColumns';
import { getActivityTableColumns } from '../../../Definitions/columns/activityColumns';
import UpdatesTimeline from '../../../Components/UpdateTimeline/updates';
import { NewKpi } from '../../../Components/KPI/newKpi';
import { ViewKpi } from '../../../Components/KPI/viewKpi';
import { EditKpi } from '../../../Components/KPI/editKpi';
import { processOptionalFields } from '../../../Utils/optionalValueHandler';
import {
  attachTableHeaderBps,
  halfColumnBps,
  quarterColumnBps,
  shortButtonBps,
} from '../../../Definitions/breakpoints/breakpoints';
import { displayErrorMessage } from '../../../Utils/errorMessageHandler';
import { useUserContext } from '../../../Context/UserInformationContext/userInformationContext';
import ConfirmPopup from '../../../Components/Popups/Confirmation/confirmPopup';

const { Option } = Select;
const { TextArea } = Input;

const gutterSize = 30;
const inputFontSize = '13px';

const ProjectForm: React.FC<FormLoadProps> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation([
    'projectForm',
    'tableAction',
    'detachPopup',
    'formHeader',
    'entityAction',
    'error',
  ]);

  const isView: boolean = method === 'view' ? true : false;
  const formTitle = getFormTitle('Project', method);

  const navigate = useNavigate();
  const { get, post, put, delete: del } = useConnection();
  const ability = useAbilityContext();
  const { isValidationAllowed, setIsValidationAllowed } = useUserContext();
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

  const [uploadedFiles, setUploadedFiles] = useState<
    { key: string; title: string; data: string }[]
  >([]);
  const [storedFiles, setStoredFiles] = useState<{ key: string; title: string; url: string }[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);

  const [isGasFlow, setIsGasFlow] = useState<boolean>(false);

  // First Render Check

  const [isFirstRenderDone, setIsFirstRenderDone] = useState<boolean>(false);

  // Spinner When Form Submit Occurs

  const [waitingForBE, setWaitingForBE] = useState<boolean>(false);
  const [waitingForValidation, setWaitingForValidation] = useState<boolean>(false);

  // Activity State

  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [activityCurrentPage, setActivityCurrentPage] = useState<any>(1);
  const [activityPageSize, setActivityPageSize] = useState<number>(10);

  // Supports state

  const [supportData, setSupportData] = useState<SupportData[]>([]);
  const [supportCurrentPage, setSupportCurrentPage] = useState<any>(1);
  const [supportPageSize, setSupportPageSize] = useState<number>(10);

  // Popup Definition

  const [openDeletePopup, setOpenDeletePopup] = useState<boolean>(false);

  // KPI State

  const [kpiCounter, setKpiCounter] = useState<number>(0);
  const [createdKpiList, setCreatedKpiList] = useState<CreatedKpiData[]>([]);
  const [inheritedKpiList, setInheritedKpiList] = useState<CreatedKpiData[]>([]);
  const [newKpiList, setNewKpiList] = useState<NewKpiData[]>([]);
  const [handleKPI, setHandleKPI] = useState<boolean>(false);

  // Expected Time Frame

  const [startYear, setStartYear] = useState<number>();
  const [endYear, setEndYear] = useState<number>();

  // Initialization Logic

  const yearsList: number[] = [];

  for (let year = 2013; year <= 2050; year++) {
    yearsList.push(year);
  }

  // Activity Column Definition

  const activityTableColumns = getActivityTableColumns();

  // Support Column Definition

  const supportTableColumns = getSupportTableColumns();

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
            creatorType: 'project',
            expected: kpi.expected,
          });
        });
      } else if (method === 'update' && handleKPI) {
        payload.kpis = [];
        newKpiList.forEach((kpi) => {
          payload.kpis.push({
            name: kpi.name,
            kpiUnit: kpi.unit,
            creatorType: 'project',
            expected: kpi.expected,
            kpiAction: KPIAction.CREATED,
          });
        });
        createdKpiList.forEach((kpi) => {
          payload.kpis.push({
            kpiId: kpi.id,
            kpiUnit: kpi.unit,
            name: kpi.name,
            creatorType: 'project',
            expected: kpi.expected,
            kpiAction: kpi.kpiAction,
          });
        });
      }

      if (activityData.length > 0 && method === 'create') {
        payload.linkedActivities = [];
        activityData.forEach((activity) => {
          payload.linkedActivities.push(activity.activityId);
        });
      }

      payload.startYear = parseInt(payload.startYear);
      payload.endYear = parseInt(payload.endYear);

      let response: any;

      if (method === 'create') {
        response = await post('national/projects/add', processOptionalFields(payload, 'project'));
      } else if (method === 'update') {
        payload.projectId = entId;
        response = await put('national/projects/update', processOptionalFields(payload, 'project'));
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
      }
    } catch (error: any) {
      displayErrorMessage(error);

      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
    } finally {
      setWaitingForBE(false);
      navigate('/projects');
    }
  };

  // Entity Validate

  const validateEntity = async () => {
    try {
      setWaitingForValidation(true);

      if (entId) {
        const payload = {
          entityId: entId,
          validateStatus: !isValidated,
        };
        const response: any = await post('national/projects/validateStatus', payload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content: isValidated ? t('projectUnvalidateSuccess') : t('projectValidateSuccess'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          navigate('/projects');
        }
      }
    } catch (error: any) {
      if (error?.status) {
        if (error.status === 403) {
          setIsValidationAllowed(await doesUserHaveValidatePermission(get));
        }
        displayErrorMessage(error);
      } else {
        displayErrorMessage(error, `${entId} Validation Failed`);
      }
    } finally {
      setWaitingForValidation(false);
    }
  };

  // Entity Delete

  const deleteClicked = () => {
    setOpenDeletePopup(true);
  };

  const deleteEntity = async () => {
    try {
      setWaitingForBE(true);
      await delay(1000);

      if (entId) {
        const payload = {
          entityId: entId,
        };
        const response: any = await del('national/projects/delete', payload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content: t('projectDeleteSuccess'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          navigate('/projects');
        }
      }
    } catch (error: any) {
      if (error?.message) {
        displayErrorMessage(error);
      } else {
        displayErrorMessage(error, `${entId} Delete Failed`);
      }
    } finally {
      setWaitingForBE(false);
    }
  };

  // KPI Handler Functions

  const createKPI = () => {
    const newItem: NewKpiData = {
      index: kpiCounter,
      name: '',
      unit: '',
      achieved: undefined,
      expected: 0,
    };
    setKpiCounter((prevCount) => prevCount + 1);
    setNewKpiList((prevList) => [...prevList, newItem]);
    setHandleKPI(true);
    setIsSaveButtonDisabled(false);
  };

  const removeKPI = (kpiIndex: number, inWhich: 'created' | 'new') => {
    if (inWhich === 'new') {
      setNewKpiList(newKpiList.filter((obj) => obj.index !== kpiIndex));
      if (method === 'update') {
        setIsSaveButtonDisabled(false);
      }
    } else {
      setCreatedKpiList(createdKpiList.filter((obj) => obj.index !== kpiIndex));
      setIsSaveButtonDisabled(false);
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
            return { ...kpi, [property]: property === 'expected' ? parseFloat(value) : value };
          }
          return kpi;
        });
        return updatedKpiList;
      });
    } else {
      setCreatedKpiList((prevKpiList) => {
        const updatedKpiList = prevKpiList.map((kpi) => {
          if (kpi.index === index) {
            kpi.kpiAction = KPIAction.UPDATED;
            return {
              ...kpi,
              [property]: property === 'expected' ? parseFloat(value) : value,
            };
          }
          return kpi;
        });
        return updatedKpiList;
      });
    }
  };

  const fetchParentKPIData = async (parentId: string) => {
    if (typeof parentId === 'undefined') {
      setInheritedKpiList([]);
    } else if (method !== 'view') {
      try {
        const response: any = await get(`national/kpis/achieved/programme/${parentId}`);
        if (response.status === 200 || response.status === 201) {
          const tempInheritedKpiList: CreatedKpiData[] = [];
          let tempKpiCounter = kpiCounter;
          response.data.forEach((kpi: any) => {
            tempInheritedKpiList.push({
              index: tempKpiCounter,
              creator: kpi.creatorId,
              id: kpi.kpiId,
              name: kpi.name,
              unit: kpi.kpiUnit,
              achieved: parseFloat(kpi.achieved ?? 0),
              expected: parseFloat(kpi.expected ?? 0),
              kpiAction: KPIAction.NONE,
            });

            tempKpiCounter = tempKpiCounter + 1;
          });
          setKpiCounter(tempKpiCounter);
          setInheritedKpiList(tempInheritedKpiList);
        }
      } catch (error: any) {
        console.log(error, t('kpiSearchFailed'));
      }
    }
  };

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

  // Save Button Enable when form value change

  const handleValuesChange = () => {
    setIsSaveButtonDisabled(false);
  };

  // DB Queries

  const fetchNonValidatedProgrammes = async () => {
    try {
      const payload = {
        sort: {
          key: 'programmeId',
          order: 'ASC',
        },
      };
      const response: any = await post('national/programmes/query', payload);

      const tempProgrammeData: ProgrammeSelectData[] = [];
      response.data.forEach((prg: any) => {
        tempProgrammeData.push({
          id: prg.programmeId,
          title: prg.title,
        });
      });
      setProgrammeList(tempProgrammeData);
    } catch (error: any) {
      displayErrorMessage(error);
    }
  };

  const fetchProjectData = async () => {
    if (method !== 'create' && entId) {
      let response: any;
      try {
        response = await get(`national/projects/${entId}`);

        if (response.status === 200 || response.status === 201) {
          const entityData: any = response.data;

          // Populating Project owned data fields
          form.setFieldsValue({
            title: entityData.title,
            description: entityData.description,
            additionalProjectNumber: entityData.additionalProjectNumber ?? undefined,
            projectStatus: entityData.projectStatus,
            startYear: entityData.startYear,
            endYear: entityData.endYear,
            expectedTimeFrame: entityData.expectedTimeFrame,
            recipientEntities: entityData.recipientEntities,
            internationalImplementingEntities:
              entityData.migratedData?.internationalImplementingEntities ?? [],
            comment: entityData.comment ?? undefined,
          });

          // Setting Year Fields

          setStartYear(entityData.startYear);
          setEndYear(entityData.endYear);

          // Setting validation status

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

          // Populating Migrated Fields

          const meansOfImplementation = entityData.migratedData?.meansOfImplementation ?? [];

          form.setFieldsValue({
            techDevContribution: meansOfImplementation.includes('Technology Development & Transfer')
              ? 'Yes'
              : 'No',
            capBuildObjectives: meansOfImplementation.includes('Capacity Building') ? 'Yes' : 'No',
            techType: entityData.migratedData?.technologyTypes ?? [],
            neededUSD: getRounded(entityData.migratedData?.estimatedAmount ?? 0),
            neededLCL: getRounded(entityData.migratedData?.estimatedAmountDomestic ?? 0),
            receivedUSD: getRounded(entityData.migratedData?.receivedAmount ?? 0),
            receivedLCL: getRounded(entityData.migratedData?.receivedAmountDomestic ?? 0),
            achievedGHGReduction: entityData.migratedData?.achievedGHGReduction ?? 0,
            expectedGHGReduction: entityData.migratedData?.expectedGHGReduction ?? 0,
            recipient: entityData.migratedData?.recipientEntities ?? [],
          });
        }
      } catch {
        navigate('/projects');
      }
      setIsSaveButtonDisabled(true);
    }
  };

  const fetchCreatedKPIData = async () => {
    if (method !== 'create' && entId) {
      try {
        const response: any = await get(`national/kpis/achieved/project/${entId}`);
        if (response.status === 200 || response.status === 201) {
          const tempCreatedKpiList: CreatedKpiData[] = [];
          const tempInheritedKpiList: CreatedKpiData[] = [];
          let tempKpiCounter = kpiCounter;
          response.data.forEach((kpi: any) => {
            if (kpi.creatorId === entId) {
              tempCreatedKpiList.push({
                index: tempKpiCounter,
                creator: entId,
                id: kpi.kpiId,
                name: kpi.name,
                unit: kpi.kpiUnit,
                achieved: parseFloat(kpi.achieved ?? 0),
                expected: parseFloat(kpi.expected ?? 0),
                kpiAction: KPIAction.NONE,
              });
            } else {
              tempInheritedKpiList.push({
                index: tempKpiCounter,
                creator: kpi.creatorId,
                id: kpi.kpiId,
                name: kpi.name,
                unit: kpi.kpiUnit,
                achieved: parseFloat(kpi.achieved ?? 0),
                expected: parseFloat(kpi.expected ?? 0),
                kpiAction: KPIAction.NONE,
              });
            }
            tempKpiCounter = tempKpiCounter + 1;
          });
          setKpiCounter(tempKpiCounter);
          setCreatedKpiList(tempCreatedKpiList);
          setInheritedKpiList(tempInheritedKpiList);

          if (tempCreatedKpiList.length > 0 || tempInheritedKpiList.length > 0) {
            setHandleKPI(true);
          }
        }
      } catch (error: any) {
        console.log(error, t('kpiSearchFailed'));
      }
    }
  };

  const fetchConnectedActivityData = async () => {
    if (method !== 'create') {
      try {
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
        const activityResponse: any = await post('national/activities/query', payload);

        const tempActivityData: ActivityData[] = [];

        activityResponse.data.forEach((act: any, index: number) => {
          tempActivityData.push({
            key: index.toString(),
            activityId: act.activityId,
            title: act.title,
            reductionMeasures: act.measure,
            status: act.status,
            natImplementor: act.nationalImplementingEntity ?? [],
            ghgsAffected: act.ghgsAffected,
            achievedReduction: act.achievedGHGReduction ?? 0,
            estimatedReduction: act.expectedGHGReduction ?? 0,
            technologyType: act.technologyType,
            meansOfImplementation: act.meansOfImplementation,
          });
        });
        setActivityData(tempActivityData);
      } catch (error: any) {
        displayErrorMessage(error);
      }
    }
  };

  const fetchConnectedAction = async () => {
    if (programmeConnectedAction) {
      try {
        const response = await get(`national/actions/${programmeConnectedAction}`);

        if (response.status === 200 || response.status === 201) {
          const actionData: any = response.data;
          form.setFieldsValue({
            type: actionData.type,
            actionTitle: actionData.title,
            natAnchor: actionData.natAnchor,
          });

          // Setting Gas Flow

          setIsGasFlow(isGasFlowCheck(actionData.type));
        }
      } catch (error: any) {
        navigate('/projects');
        displayErrorMessage(error, t('actionNotFound'));
      }
    } else {
      form.setFieldsValue({
        actionTitle: undefined,
        natAnchor: undefined,
      });
    }
  };

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
            sector: programmeData.sector,
            subSectorsAffected: programmeData.affectedSubSector,
            nationalImplementor: programmeData.nationalImplementor,
          });
          setProgrammeConnectedAction(programmeData.actionId);
        }
      } catch (error: any) {
        navigate('/projects');
        displayErrorMessage(error, t('programmeNotFound'));
      }
    } else {
      form.setFieldsValue({
        programmeId: undefined,
        programmeTitle: undefined,
        instrTypes: undefined,
        sector: undefined,
        subSectorsAffected: undefined,
        nationalImplementor: undefined,
      });

      setProgrammeConnectedAction(undefined);
    }
  };

  const fetchSupportData = async () => {
    const supportPayload = {
      filterOr: [] as any[],
      sort: {
        key: 'supportId',
        order: 'ASC',
      },
    };

    if (activityData.length > 0) {
      try {
        activityData.forEach((activity) => {
          supportPayload.filterOr.push({
            key: 'activityId',
            operation: '=',
            value: activity.activityId,
          });
        });

        const supportResponse: any = await post('national/supports/query', supportPayload);

        const tempSupportData: SupportData[] = [];

        supportResponse.data.forEach((sup: any, index: number) => {
          tempSupportData.push({
            key: index.toString(),
            supportId: sup.supportId,
            financeNature: sup.financeNature,
            direction: sup.direction,
            finInstrument:
              sup.financeNature === 'International'
                ? sup.internationalFinancialInstrument
                : sup.nationalFinancialInstrument,
            estimatedUSD: sup.requiredAmount ?? 0,
            estimatedLC: sup.requiredAmountDomestic ?? 0,
            recievedUSD: sup.receivedAmount ?? 0,
            recievedLC: sup.receivedAmountDomestic ?? 0,
          });
        });

        setSupportData(tempSupportData);
      } catch (error: any) {
        displayErrorMessage(error);
      }
    } else {
      setSupportData([]);
    }
  };

  // Fetching Action data for parent change

  useEffect(() => {
    fetchConnectedAction();
  }, [programmeConnectedAction]);

  // Fetching Programme data for parent change

  useEffect(() => {
    fetchConnectedProgramme();
  }, [projectConnectedProgramme]);

  // Fetching Support Data after Activity Loads

  useEffect(() => {
    fetchSupportData();
  }, [activityData]);

  // Expected Time Frame Calculation

  useEffect(() => {
    if (startYear && endYear && endYear >= startYear) {
      form.setFieldsValue({
        expectedTimeFrame: endYear - startYear,
      });
    } else {
      form.setFieldsValue({
        expectedTimeFrame: undefined,
      });
    }
  }, [startYear, endYear]);

  // Init Job

  useEffect(() => {
    Promise.all([
      fetchNonValidatedProgrammes(),
      fetchProjectData(),
      fetchCreatedKPIData(),
      fetchConnectedActivityData(),
    ]).then(() => {
      setIsFirstRenderDone(true);
    });
  }, []);

  return (
    <div className="content-container">
      <ConfirmPopup
        key={'delete_popup'}
        icon={<DeleteOutlined style={{ color: '#ff4d4f', fontSize: '120px' }} />}
        isDanger={true}
        content={{
          primaryMsg: `${t('deletePrimaryMsg')} ${entId}`,
          secondaryMsg: t('deleteSecondaryMsg'),
          cancelTitle: t('entityAction:cancel'),
          actionTitle: t('entityAction:delete'),
        }}
        actionRef={entId}
        doAction={deleteEntity}
        open={openDeletePopup}
        setOpen={setOpenDeletePopup}
      />
      <div className="title-bar">
        <div className="body-title">{t(formTitle)}</div>
      </div>
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        onValuesChange={handleValuesChange}
      >
        {!waitingForBE && isFirstRenderDone ? (
          <div className="project-form">
            <div className="form-section-card">
              <div className="form-section-header">{t('generalInfoTitle')}</div>
              {method !== 'create' && entId && (
                <EntityIdCard
                  calledIn="Project"
                  entId={entId}
                  isValidated={isValidated}
                ></EntityIdCard>
              )}
              <Row gutter={gutterSize}>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('selectProgrammeHeader')}</label>}
                    name="programmeId"
                    rules={method !== 'create' ? undefined : [validation.required]}
                  >
                    <Select
                      size={'large'}
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={method !== 'create'}
                      showSearch
                      onChange={(value: any) => {
                        setProjectConnectedProgramme(value);
                        fetchParentKPIData(value);
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
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('formHeader:typesTitle')}</label>}
                    name="type"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      disabled={true}
                    ></Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('projTitleHeader')}</label>}
                    name="title"
                    rules={[validation.required]}
                  >
                    <Input className="form-input-box" disabled={isView} />
                  </Form.Item>
                </Col>
                <Col {...halfColumnBps}>
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
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('projectNumberHeader')}</label>}
                    name="additionalProjectNumber"
                  >
                    <Input className="form-input-box" disabled={isView} />
                  </Form.Item>
                </Col>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('actionTitleHeader')}</label>}
                    name="actionTitle"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('programmeTitleHeader')}</label>}
                    name="programmeTitle"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('formHeader:natAnchorHeader')}</label>
                    }
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
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">
                        {t('formHeader:instrumentTypeHeader')}
                      </label>
                    }
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
                <Col {...halfColumnBps}>
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
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">
                        {t('formHeader:sectorsAffectedHeader')}
                      </label>
                    }
                    name="sector"
                  >
                    <Select size="large" style={{ fontSize: inputFontSize }} disabled></Select>
                  </Form.Item>
                </Col>
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">
                        {t('formHeader:subSectorsAffectedHeader')}
                      </label>
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
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('formHeader:startYearTitle')}</label>
                    }
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
                      onChange={(value) => {
                        setStartYear(value);
                      }}
                    >
                      {yearsList.slice(0, -1).map((year) => (
                        <Option key={year} value={year}>
                          {year}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('formHeader:endYearTitle')}</label>
                    }
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
                      onChange={(value) => {
                        setEndYear(value);
                      }}
                    >
                      {yearsList.slice(1).map((year) => (
                        <Option key={year} value={year}>
                          {year}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('formHeader:timeFrameHeader')}</label>
                    }
                    name="expectedTimeFrame"
                  >
                    <Input type="number" className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">
                        {t('formHeader:natImplementerHeader')}
                      </label>
                    }
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
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('formHeader:techTypeHeader')}</label>
                    }
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
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">
                        {t('formHeader:recipientEntityHeader')}
                      </label>
                    }
                    name="recipient"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      mode="multiple"
                      allowClear
                      disabled
                    >
                      {Object.values(Recipient).map((recipient) => (
                        <Option key={recipient} value={recipient}>
                          {recipient}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">
                        {t('formHeader:intImplementerHeader')}
                      </label>
                    }
                    name="internationalImplementingEntities"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      mode="multiple"
                      allowClear
                      disabled={true}
                    ></Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('formHeader:techDevHeader')}</label>
                    }
                    name="techDevContribution"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('formHeader:capBuildHeader')}</label>
                    }
                    name="capBuildObjectives"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
              </Row>
              <div className="form-section-sub-header">{t('formHeader:documentsHeader')}</div>
              <UploadFileGrid
                isSingleColumn={false}
                usedIn={method}
                buttonText={t('entityAction:upload')}
                storedFiles={storedFiles}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                removedFiles={filesToRemove}
                setRemovedFiles={setFilesToRemove}
                setIsSaveButtonDisabled={setIsSaveButtonDisabled}
              ></UploadFileGrid>
              {isGasFlow && (
                <>
                  <div className="form-section-header">
                    {t('formHeader:projectResultsInfoTitle')}
                  </div>
                  <div className="form-section-sub-header">{t('formHeader:emissionInfoTitle')}</div>
                  <Row gutter={gutterSize}>
                    <Col {...halfColumnBps}>
                      <Form.Item
                        label={
                          <label className="form-item-header">{t('formHeader:achieved')}</label>
                        }
                        name="achievedGHGReduction"
                      >
                        <Input type="number" className="form-input-box" disabled />
                      </Form.Item>
                    </Col>
                    <Col {...halfColumnBps}>
                      <Form.Item
                        label={
                          <label className="form-item-header">{t('formHeader:expected')}</label>
                        }
                        name="expectedGHGReduction"
                      >
                        <Input type="number" className="form-input-box" disabled />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}
              {(method === 'create' ||
                method === 'update' ||
                (method === 'view' &&
                  (inheritedKpiList.length > 0 || createdKpiList.length > 0))) && (
                <div className="form-section-sub-header">{t('formHeader:kpiInfoTitle')}</div>
              )}
              {inheritedKpiList.length > 0 &&
                inheritedKpiList.map((createdKPI: CreatedKpiData) => (
                  <ViewKpi
                    key={createdKPI.index}
                    index={createdKPI.index}
                    inherited={true}
                    headerNames={[
                      t('formHeader:kpiName'),
                      t('formHeader:kpiUnit'),
                      t('formHeader:achieved'),
                      t('formHeader:expected'),
                    ]}
                    kpi={createdKPI}
                    callingEntityId={entId}
                    ownerEntityId={createdKPI.creator}
                  ></ViewKpi>
                ))}
              {method === 'view' &&
                createdKpiList.map((createdKPI: CreatedKpiData) => (
                  <ViewKpi
                    key={createdKPI.index}
                    index={createdKPI.index}
                    inherited={false}
                    headerNames={[
                      t('formHeader:kpiName'),
                      t('formHeader:kpiUnit'),
                      t('formHeader:achieved'),
                      t('formHeader:expected'),
                    ]}
                    kpi={createdKPI}
                    callingEntityId={entId}
                    ownerEntityId={createdKPI.creator}
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
                    headerNames={[
                      t('formHeader:kpiName'),
                      t('formHeader:kpiUnit'),
                      t('formHeader:achieved'),
                      t('formHeader:expected'),
                    ]}
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
                  headerNames={[
                    t('formHeader:kpiName'),
                    t('formHeader:kpiUnit'),
                    t('formHeader:achieved'),
                    t('formHeader:expected'),
                  ]}
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
                      <span className="kpi-add-text">{t('entityAction:addKPI')}</span>
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
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('neededUSDHeader')}</label>}
                    name="neededUSD"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('neededLCLHeader')}</label>}
                    name="neededLCL"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('recievedUSDHeader')}</label>}
                    name="receivedUSD"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('recievedLCLHeader')}</label>}
                    name="receivedLCL"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
              </Row>
            </div>
            {method !== 'create' && (
              <div className="form-section-card">
                <Row>
                  <Col {...attachTableHeaderBps} style={{ paddingTop: '6px' }}>
                    <div className="form-section-header">{t('activityInfoTitle')}</div>
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
                        emptyMessage={t('formHeader:noActivityMessage')}
                      />{' '}
                    </div>
                  </Col>
                </Row>
              </div>
            )}
            {method !== 'create' && (
              <div className="form-section-card">
                <Row>
                  <Col span={6}>
                    <div className="form-section-header">{t('supportInfoTitle')}</div>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <LayoutTable
                      tableData={supportData.slice(
                        (supportCurrentPage - 1) * supportPageSize,
                        (supportCurrentPage - 1) * supportPageSize + supportPageSize
                      )}
                      columns={supportTableColumns}
                      loading={false}
                      pagination={{
                        current: supportCurrentPage,
                        pageSize: supportPageSize,
                        total: supportData.length,
                        showQuickJumper: true,
                        pageSizeOptions: ['1', '10', '20', '30'],
                        showSizeChanger: true,
                        style: { textAlign: 'center' },
                        locale: { page: '' },
                        position: ['bottomRight'],
                      }}
                      handleTableChange={handleSupportTableChange}
                      emptyMessage={t('formHeader:noSupportMessage')}
                    />
                  </Col>
                </Row>
              </div>
            )}
            {method !== 'create' && (
              <div className="form-section-timelineCard">
                <div className="form-section-header">{t('formHeader:updatesInfoTitle')}</div>
                <UpdatesTimeline recordType={'project'} recordId={entId} />
              </div>
            )}
            {method === 'create' && (
              <Row className="sticky-footer" gutter={20} justify={'end'}>
                <Col>
                  <Button
                    type="default"
                    size="large"
                    block
                    onClick={() => {
                      navigate('/projects');
                    }}
                  >
                    {t('entityAction:cancel')}
                  </Button>
                </Col>
                <Col {...shortButtonBps}>
                  <Form.Item>
                    <Button type="primary" size="large" block htmlType="submit">
                      {t('entityAction:add')}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            )}
            {method === 'view' && (
              <Row className="sticky-footer" gutter={20} justify={'end'}>
                <Col>
                  <Button
                    type="default"
                    size="large"
                    block
                    onClick={() => {
                      navigate('/projects');
                    }}
                  >
                    {t('entityAction:back')}
                  </Button>
                </Col>
                {ability.can(Action.Validate, ProjectEntity) && (
                  <Col>
                    <Form.Item>
                      <Tooltip
                        placement="topRight"
                        title={
                          !isValidationAllowed ? t('error:validationPermissionRequired') : undefined
                        }
                        showArrow={false}
                      >
                        <Button
                          type="primary"
                          size="large"
                          block
                          onClick={() => {
                            validateEntity();
                          }}
                          loading={waitingForValidation}
                          disabled={!isValidationAllowed}
                        >
                          {isValidated ? t('entityAction:unvalidate') : t('entityAction:validate')}
                        </Button>
                      </Tooltip>
                    </Form.Item>
                  </Col>
                )}
              </Row>
            )}
            {method === 'update' && (
              <Row className="sticky-footer" gutter={20} justify={'end'}>
                <Col>
                  <Button
                    type="default"
                    size="large"
                    block
                    onClick={() => {
                      navigate('/projects');
                    }}
                  >
                    {t('entityAction:cancel')}
                  </Button>
                </Col>
                {ability.can(Action.Delete, ProjectEntity) && (
                  <Col>
                    <Button
                      type="default"
                      size="large"
                      block
                      onClick={() => {
                        deleteClicked();
                      }}
                      style={{ color: 'red', borderColor: 'red' }}
                    >
                      {t('entityAction:delete')}
                    </Button>
                  </Col>
                )}
                <Col {...shortButtonBps}>
                  <Form.Item>
                    <Button
                      type="primary"
                      size="large"
                      block
                      htmlType="submit"
                      disabled={isSaveButtonDisabled}
                    >
                      {t('entityAction:update')}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            )}
          </div>
        ) : (
          <Spin className="loading-center" size="large" />
        )}
      </Form>
    </div>
  );
};

export default ProjectForm;
