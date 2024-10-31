import { useTranslation } from 'react-i18next';
import { Row, Col, Input, Button, Form, Select, message, Spin, Tooltip } from 'antd';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { useNavigate, useParams } from 'react-router-dom';
import UploadFileGrid from '../../../Components/Upload/uploadFiles';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { SubSector, NatImplementor, KPIAction } from '../../../Enums/shared.enum';
import { ProgrammeStatus } from '../../../Enums/programme.enum';
import './programmeForm.scss';
import EntityIdCard from '../../../Components/EntityIdCard/entityIdCard';
import { CreatedKpiData, NewKpiData } from '../../../Definitions/kpiDefinitions';
import { ActionSelectData } from '../../../Definitions/actionDefinitions';
import { ProjectData } from '../../../Definitions/projectDefinitions';
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
import { ProgrammeEntity } from '../../../Entities/programme';
import { useAbilityContext } from '../../../Casl/Can';
import { getProjectTableColumns } from '../../../Definitions/columns/projectColumns';
import UpdatesTimeline from '../../../Components/UpdateTimeline/updates';
import { ViewKpi } from '../../../Components/KPI/viewKpi';
import { NewKpi } from '../../../Components/KPI/newKpi';
import { EditKpi } from '../../../Components/KPI/editKpi';
import { processOptionalFields } from '../../../Utils/optionalValueHandler';
import { ActivityData } from '../../../Definitions/activityDefinitions';
import { SupportData } from '../../../Definitions/supportDefinitions';
import { getActivityTableColumns } from '../../../Definitions/columns/activityColumns';
import { getSupportTableColumns } from '../../../Definitions/columns/supportColumns';
import ConfirmPopup from '../../../Components/Popups/Confirmation/confirmPopup';
import {
  attachTableHeaderBps,
  halfColumnBps,
  quarterColumnBps,
  shortButtonBps,
} from '../../../Definitions/breakpoints/breakpoints';
import { displayErrorMessage } from '../../../Utils/errorMessageHandler';
import { useUserContext } from '../../../Context/UserInformationContext/userInformationContext';

const { Option } = Select;
const { TextArea } = Input;

const gutterSize = 30;
const inputFontSize = '13px';

const ProgrammeForm: React.FC<FormLoadProps> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation([
    'programmeForm',
    'detachPopup',
    'formHeader',
    'entityAction',
    'error',
  ]);

  const isView: boolean = method === 'view' ? true : false;
  const formTitle = getFormTitle('Programme', method);

  const navigate = useNavigate();
  const { get, post, put, delete: del } = useConnection();
  const ability = useAbilityContext();
  const { isValidationAllowed, setIsValidationAllowed } = useUserContext();
  const { entId } = useParams();

  // Form Validation Rules

  const validation = getValidationRules(method);

  // Entity Validation Status

  const [isValidated, setIsValidated] = useState<boolean>(false);

  // Parent Select state

  const [actionList, setActionList] = useState<ActionSelectData[]>([]);

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

  // Project Attachment state

  const [projectData, setProjectData] = useState<ProjectData[]>([]);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Activity Attachment State

  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [activityCurrentPage, setActivityCurrentPage] = useState<any>(1);
  const [activityPageSize, setActivityPageSize] = useState<number>(10);

  // Support Attachment State

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

  // Initialization Logic

  const yearsList: number[] = [];

  for (let year = 2013; year <= 2049; year++) {
    yearsList.push(year);
  }

  // Column Definition

  const projTableColumns = getProjectTableColumns();

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
            creatorType: 'programme',
            expected: kpi.expected,
          });
        });
      } else if (method === 'update' && handleKPI) {
        payload.kpis = [];
        newKpiList.forEach((kpi) => {
          payload.kpis.push({
            name: kpi.name,
            kpiUnit: kpi.unit,
            creatorType: 'programme',
            expected: kpi.expected,
            kpiAction: KPIAction.CREATED,
          });
        });
        createdKpiList.forEach((kpi) => {
          payload.kpis.push({
            kpiId: kpi.id,
            kpiUnit: kpi.unit,
            name: kpi.name,
            creatorType: 'programme',
            expected: kpi.expected,
            kpiAction: kpi.kpiAction,
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
        response = await post(
          'national/programmes/add',
          processOptionalFields(payload, 'programme')
        );
      } else if (entId && method === 'update') {
        payload.programmeId = entId;
        response = await put(
          'national/programmes/update',
          processOptionalFields(payload, 'programme')
        );
      }

      const successMsg =
        method === 'create' ? t('programmeCreationSuccess') : t('programmeUpdateSuccess');

      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: successMsg,
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
      }
    } catch (error: any) {
      displayErrorMessage(error);

      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
    } finally {
      setWaitingForBE(false);
      navigate('/programmes');
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
        const response: any = await post('national/programmes/validateStatus', payload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content: isValidated ? t('programmeUnvalidateSuccess') : t('programmeValidateSuccess'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          navigate('/programmes');
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
    if (activityData.length > 0 || projectData.length > 0) {
      message.open({
        type: 'error',
        content: t('error:programmeDeletePrevented'),
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } else {
      setOpenDeletePopup(true);
    }
  };

  const deleteEntity = async () => {
    try {
      setWaitingForBE(true);
      await delay(1000);

      if (entId) {
        const payload = {
          entityId: entId,
        };
        const response: any = await del('national/programmes/delete', payload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content: t('programmeDeleteSuccess'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          navigate('/programmes');
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
        const response: any = await get(`national/kpis/achieved/action/${parentId}`);
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

  // Table Behaviour

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleActivityTableChange = (pagination: any) => {
    setActivityCurrentPage(pagination.current);
    setActivityPageSize(pagination.pageSize);
  };

  const handleSupportTableChange = (pagination: any) => {
    setSupportCurrentPage(pagination.current);
    setSupportPageSize(pagination.pageSize);
  };

  // Save Button Enable when form value change

  const handleValuesChange = () => {
    setIsSaveButtonDisabled(false);
  };

  // DB Queries

  const fetchNonValidatedActions = async () => {
    try {
      const response: any = await get('national/actions/attach/query');

      const tempActionData: ActionSelectData[] = [];
      response.data.forEach((action: any) => {
        tempActionData.push({
          id: action.actionId,
          title: action.title,
          instrumentType: action.instrumentType,
          sector: action.sector,
          type: action.type,
          hasChildActivities: action.hasChildActivities,
        });
      });
      setActionList(tempActionData);
    } catch (error: any) {
      displayErrorMessage(error);
    }
  };

  const fetchProgramData = async () => {
    if (method !== 'create' && entId) {
      let response: any;
      try {
        response = await get(`national/programmes/${entId}`);

        if (response.status === 200 || response.status === 201) {
          const entityData: any = response.data;

          // Populating Action owned data fields
          form.setFieldsValue({
            actionId: entityData.actionId,
            type: entityData.type,
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
            investment: entityData.estimatedAmount ?? 0,
            comments: entityData.comments ?? undefined,
          });

          // Setting validation status

          setIsValidated(entityData.validated ?? false);

          // Setting Gas Flow Type

          setIsGasFlow(isGasFlowCheck(entityData.type));

          // Document Handling

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

          // Populating Migrated Fields

          form.setFieldsValue({
            intImplementor: entityData.interNationalImplementor ?? [],
            recipientEntity: entityData.recipientEntity ?? [],
            ghgsAffected: entityData.ghgsAffected ?? [],
            achievedReduct: entityData.achievedGHGReduction,
            expectedReduct: entityData.expectedGHGReduction,
          });
        }
      } catch {
        navigate('/programmes');
      }
      setIsSaveButtonDisabled(true);
    }
  };

  const fetchAttachedKPIData = async () => {
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

  const fetchConnectedProjectData = async () => {
    if (method !== 'create') {
      try {
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

        const tempPRJData: ProjectData[] = [];

        response.data.forEach((prj: any, index: number) => {
          tempPRJData.push({
            key: index.toString(),
            projectId: prj.projectId,
            projectName: prj.title,
            internationalImplementingEntities: prj.internationalImplementingEntities ?? [],
            recipientEntities: prj.recipientEntities ?? [],
            ghgsAffected: prj.migratedData[0]?.ghgsAffected ?? [],
            achievedReduction: prj.migratedData[0]?.achievedGHGReduction ?? 0,
            estimatedReduction: prj.migratedData[0]?.expectedGHGReduction ?? 0,
          });
        });

        setProjectData(tempPRJData);
      } catch (error: any) {
        displayErrorMessage(error);
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
            {
              key: 'parentType',
              operation: '=',
              value: 'programme',
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
          });
        });

        setActivityData(tempActivityData);
      } catch (error: any) {
        displayErrorMessage(error);
      }
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
            estimatedUSD: getRounded(sup.requiredAmount ?? 0),
            estimatedLC: getRounded(sup.requiredAmountDomestic ?? 0),
            recievedUSD: getRounded(sup.receivedAmount ?? 0),
            recievedLC: getRounded(sup.receivedAmountDomestic ?? 0),
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

  // Fetching Support data, After Activity Data Loads

  useEffect(() => {
    fetchSupportData();
  }, [activityData]);

  // Init Job

  useEffect(() => {
    Promise.all([
      fetchNonValidatedActions(),
      fetchProgramData(),
      fetchAttachedKPIData(),
      fetchConnectedProjectData(),
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
          <div className="programme-form">
            <div className="form-section-card">
              <div className="form-section-header">{t('generalInfoTitle')}</div>
              {method !== 'create' && entId && (
                <EntityIdCard
                  calledIn="Programme"
                  entId={entId}
                  isValidated={isValidated}
                ></EntityIdCard>
              )}
              <Row gutter={gutterSize}>
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('selectActionHeader')}</label>}
                    name="actionId"
                    rules={method !== 'create' ? undefined : [validation.required]}
                  >
                    <Select
                      size={'large'}
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={method !== 'create'}
                      showSearch
                      onChange={(value: any) => {
                        const selectedAction = actionList.find((action) => action.id === value);
                        form.setFieldsValue({
                          instrumentType: selectedAction?.instrumentType,
                          sector: selectedAction?.sector,
                          type: selectedAction?.type,
                        });
                        fetchParentKPIData(value);
                        setIsGasFlow(isGasFlowCheck(selectedAction?.type));
                      }}
                    >
                      {actionList.map((action) => (
                        <Option
                          key={action.id}
                          value={action.id}
                          disabled={action.hasChildActivities}
                        >
                          <span
                            style={{ color: action.hasChildActivities ? '#ff4d4f' : 'inherit' }}
                          >
                            {action.hasChildActivities
                              ? `${action.id} : Attached to Activities`
                              : action.id}
                          </span>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col {...quarterColumnBps}>
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
                <Col {...halfColumnBps}>
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
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('progDescTitle')}</label>}
                    name="description"
                    rules={[validation.required]}
                  >
                    <TextArea maxLength={250} rows={3} disabled={isView} />
                  </Form.Item>
                </Col>
                <Col {...halfColumnBps}>
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
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">
                        {t('formHeader:instrumentTypeHeader')}
                      </label>
                    }
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
                <Col {...quarterColumnBps}>
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
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">
                        {t('formHeader:sectorsAffectedHeader')}
                      </label>
                    }
                    name="sector"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      disabled={true}
                    ></Select>
                  </Form.Item>
                </Col>
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">
                        {t('formHeader:subSectorsAffectedHeader')}
                      </label>
                    }
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
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('formHeader:startYearTitle')}</label>
                    }
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
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">
                        {t('formHeader:intImplementerHeader')}
                      </label>
                    }
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
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">
                        {t('formHeader:recipientEntityHeader')}
                      </label>
                    }
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
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">
                        {t('formHeader:natImplementerHeader')}
                      </label>
                    }
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
                <Col {...halfColumnBps}>
                  <Form.Item<number>
                    label={
                      <label className="form-item-header">
                        {t('formHeader:investmentNeedsHeader')}
                      </label>
                    }
                    name="investment"
                  >
                    <Input className="form-input-box" disabled={true} />
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
              {method !== 'create' && (
                <Row>
                  <Col span={12}>
                    <div className="form-section-header">{t('projectListTitle')}</div>
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
                </Row>
              )}
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
                        tableData={activityData}
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
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            )}
            {method !== 'create' && (
              <div className="form-section-card">
                <Row>
                  <Col span={20}>
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
                      emptyMessage={t('formHeader:noSupportMessage')}
                    />
                  </Col>
                </Row>
              </div>
            )}
            <div className="form-section-card">
              <div className="form-section-header">
                {isGasFlow
                  ? t('formHeader:programmeResultsInfoTitle')
                  : t('formHeader:kpiInfoTitle')}
              </div>
              {isGasFlow && (
                <>
                  <Row gutter={gutterSize}>
                    <Col {...halfColumnBps}>
                      <Form.Item
                        label={
                          <label className="form-item-header">{t('formHeader:ghgAffected')}</label>
                        }
                        name="ghgsAffected"
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
                  <div className="form-section-sub-header">{t('formHeader:emissionInfoTitle')}</div>
                  <Row gutter={gutterSize}>
                    <Col {...halfColumnBps}>
                      <Form.Item
                        label={
                          <label className="form-item-header">{t('formHeader:achieved')}</label>
                        }
                        name="achievedReduct"
                      >
                        <Input className="form-input-box" disabled />
                      </Form.Item>
                    </Col>
                    <Col {...halfColumnBps}>
                      <Form.Item
                        label={
                          <label className="form-item-header">{t('formHeader:expected')}</label>
                        }
                        name="expectedReduct"
                      >
                        <Input className="form-input-box" disabled />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}
              {(method === 'create' ||
                method === 'update' ||
                (method === 'view' &&
                  (inheritedKpiList.length > 0 || createdKpiList.length > 0))) &&
                isGasFlow && (
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
            </div>
            {method !== 'create' && (
              <div className="form-section-timelineCard">
                <div className="form-section-header">{t('formHeader:updatesInfoTitle')}</div>
                <UpdatesTimeline recordType={'programme'} recordId={entId} />
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
                      navigate('/programmes');
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
                      navigate('/programmes');
                    }}
                  >
                    {t('entityAction:back')}
                  </Button>
                </Col>
                {ability.can(Action.Validate, ProgrammeEntity) && (
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
                      navigate('/programmes');
                    }}
                  >
                    {t('entityAction:cancel')}
                  </Button>
                </Col>
                {ability.can(Action.Delete, ProgrammeEntity) && (
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

export default ProgrammeForm;
