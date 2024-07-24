import { useTranslation } from 'react-i18next';
import './actionForm.scss';
import { Row, Col, Input, Button, Form, Select, message, Spin, Tooltip } from 'antd';
import {
  AppstoreOutlined,
  DeleteOutlined,
  DisconnectOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import LayoutTable from '../../../Components/common/Table/layout.table';
import {
  InstrumentType,
  ActionStatus,
  NatAnchor,
  Action,
  ActionType,
} from '../../../Enums/action.enum';
import { useNavigate, useParams } from 'react-router-dom';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import UploadFileGrid from '../../../Components/Upload/uploadFiles';
import AttachEntity from '../../../Components/Popups/attach';
import EntityIdCard from '../../../Components/EntityIdCard/entityIdCard';
import { ActionMigratedData } from '../../../Definitions/actionDefinitions';
import { CreatedKpiData, NewKpiData } from '../../../Definitions/kpiDefinitions';
import { ProgrammeData } from '../../../Definitions/programmeDefinitions';
import { FormLoadProps } from '../../../Definitions/InterfacesAndType/formInterface';
import { delay, getFormTitle, getRounded, joinTwoArrays } from '../../../Utils/utilServices';
import { getValidationRules } from '../../../Utils/validationRules';
import { ActivityData } from '../../../Definitions/activityDefinitions';
import { SupportData } from '../../../Definitions/supportDefinitions';
import { getActivityTableColumns } from '../../../Definitions/columns/activityColumns';
import { getSupportTableColumns } from '../../../Definitions/columns/supportColumns';
import { getProgrammeTableColumns } from '../../../Definitions/columns/programmeColumns';
import { useAbilityContext } from '../../../Casl/Can';
import { ActionEntity } from '../../../Entities/action';
import UpdatesTimeline from '../../../Components/UpdateTimeline/updates';
import { useUserContext } from '../../../Context/UserInformationContext/userInformationContext';
import { Sector } from '../../../Enums/sector.enum';
import { NewKpi } from '../../../Components/KPI/newKpi';
import { ViewKpi } from '../../../Components/KPI/viewKpi';
import { EditKpi } from '../../../Components/KPI/editKpi';
import { KPIAction } from '../../../Enums/shared.enum';
import { Role } from '../../../Enums/role.enum';
import ConfirmPopup from '../../../Components/Popups/Confirmation/confirmPopup';
import {
  attachButtonBps,
  attachTableHeaderBps,
  halfColumnBps,
  quarterColumnBps,
  shortButtonBps,
} from '../../../Definitions/breakpoints/breakpoints';
import { displayErrorMessage } from '../../../Utils/errorMessageHandler';

const { Option } = Select;
const { TextArea } = Input;

const gutterSize = 30;
const inputFontSize = '13px';

const actionForm: React.FC<FormLoadProps> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation([
    'actionForm',
    'detachPopup',
    'entityAction',
    'formHeader',
    'error',
  ]);

  const isView: boolean = method === 'view' ? true : false;
  const formTitle = getFormTitle('Action', method);

  const navigate = useNavigate();
  const { get, post, put, delete: del } = useConnection();
  const ability = useAbilityContext();
  const { userInfoState, isValidationAllowed, setIsValidationAllowed } = useUserContext();
  const { entId } = useParams();

  // First Rendering Check

  const [firstRenderingCompleted, setFirstRenderingCompleted] = useState<boolean>(false);

  // Form Validation Rules

  const validation = getValidationRules(method);

  // Entity Validation Status

  const [isValidated, setIsValidated] = useState<boolean>(false);

  // Form General State

  const [actionMigratedData, setActionMigratedData] = useState<ActionMigratedData>();
  const [uploadedFiles, setUploadedFiles] = useState<
    { key: string; title: string; data: string }[]
  >([]);
  const [storedFiles, setStoredFiles] = useState<{ key: string; title: string; url: string }[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);

  // Spinner For Form Submit

  const [waitingForBE, setWaitingForBE] = useState<boolean>(false);

  // Programme Attachments state

  const [allProgramIds, setAllProgramIdList] = useState<string[]>([]);
  const [attachedProgramIds, setAttachedProgramIds] = useState<string[]>([]);
  const [tempProgramIds, setTempProgramIds] = useState<string[]>([]);

  const [programData, setProgramData] = useState<ProgrammeData[]>([]);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Activity Attachment state: Activity link functions removed keeping original state

  const [attachedActivityIds, setAttachedActivityIds] = useState<string[]>([]);

  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [activityCurrentPage, setActivityCurrentPage] = useState<any>(1);
  const [activityPageSize, setActivityPageSize] = useState<number>(10);

  const [supportData, setSupportData] = useState<SupportData[]>([]);
  const [supportCurrentPage, setSupportCurrentPage] = useState<any>(1);
  const [supportPageSize, setSupportPageSize] = useState<number>(10);

  // Popup Definition

  const [openDetachPopup, setOpenDetachPopup] = useState<boolean>(false);
  const [openDeletePopup, setOpenDeletePopup] = useState<boolean>(false);

  // Detach Entity Data

  const [detachingEntityId, setDetachingEntityId] = useState<string>();

  // KPI State

  const [kpiCounter, setKpiCounter] = useState<number>(0);
  const [createdKpiList, setCreatedKpiList] = useState<CreatedKpiData[]>([]);
  const [newKpiList, setNewKpiList] = useState<NewKpiData[]>([]);
  const [handleKPI, setHandleKPI] = useState<boolean>(false);

  // Initialization Logic

  const availableSectors: string[] = [];
  const userSectors = userInfoState?.userSectors ?? [];
  const yearsList: number[] = [];

  for (let year = 2013; year <= 2049; year++) {
    yearsList.push(year);
  }

  if (userInfoState?.userRole === Role.Root || userInfoState?.userRole === Role.Admin) {
    Object.values(Sector).map((sector) => availableSectors.push(sector));
  } else {
    userSectors.map((sector) => availableSectors.push(sector));
  }

  useEffect(() => {
    // Initially Loading Free Programmes and Activities that can be attached

    const fetchFreeChildren = async () => {
      if (method !== 'view') {
        try {
          const prgResponse: any = await get('national/programmes/link/eligible');

          const freeProgrammeIds: string[] = [];
          prgResponse.data.forEach((prg: any) => {
            freeProgrammeIds.push(prg.programmeId);
          });
          setAllProgramIdList(freeProgrammeIds);
        } catch (error: any) {
          displayErrorMessage(error);
        }
      }
    };
    fetchFreeChildren();

    // Initially Loading the underlying action data when not in create mode

    const fetchData = async () => {
      if (method !== 'create' && entId) {
        try {
          const response: any = await get(`national/actions/${entId}`);
          if (response.status === 200 || response.status === 201) {
            const entityData: any = response.data;

            // Populating Action owned data fields
            form.setFieldsValue({
              title: entityData.title,
              description: entityData.description,
              objective: entityData.objective,
              type: entityData.type,
              sector: entityData.sector,
              instrumentType: entityData.instrumentType,
              status: entityData.status,
              startYear: entityData.startYear,
              natAnchor: entityData.natAnchor,
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

            // Populating Migrated Fields (Will be overwritten when attachments change)
            setActionMigratedData({
              ghgsAffected: entityData.migratedData?.ghgsAffected,
              estimatedInvestment: entityData.migratedData?.totalInvestment,
              achievedReduction: entityData.migratedData?.achievedGHGReduction,
              expectedReduction: entityData.migratedData?.expectedGHGReduction,
              natImplementer: entityData.migratedData?.natImplementors ?? [],
            });
          }
        } catch {
          navigate('/actions');
        }
        setIsSaveButtonDisabled(true);
      }
    };
    fetchData();

    // Initially Loading the KPI data when not in create mode

    const fetchCreatedKPIData = async () => {
      if (method !== 'create' && entId) {
        try {
          const response: any = await get(`national/kpis/achieved/action/${entId}`);
          if (response.status === 200 || response.status === 201) {
            const tempKpiList: CreatedKpiData[] = [];
            let tempKpiCounter = kpiCounter;
            response.data.forEach((kpi: any) => {
              tempKpiList.push({
                index: tempKpiCounter,
                creator: entId,
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
            setCreatedKpiList(tempKpiList);

            if (tempKpiList.length > 0) {
              setHandleKPI(true);
            }
          }
        } catch (error: any) {
          console.log(error, t('kpiSearchFailed'));
        }
      }
    };
    fetchCreatedKPIData();

    // Initially Loading the attached programme data when not in create mode

    const fetchConnectedProgrammeIds = async () => {
      if (method !== 'create') {
        try {
          const payload = {
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
        } catch (error: any) {
          displayErrorMessage(error);
        }
      }
    };
    fetchConnectedProgrammeIds();

    // Initially Loading the attached activity data when not in create mode

    const fetchConnectedActivityIds = async () => {
      if (method !== 'create') {
        try {
          const connectedActivityIds: string[] = [];
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
                value: 'action',
              },
            ],
            sort: {
              key: 'activityId',
              order: 'ASC',
            },
          };
          const response: any = await post('national/activities/query', payload);
          response.data.forEach((act: any) => {
            connectedActivityIds.push(act.activityId);
          });
          setAttachedActivityIds(connectedActivityIds);
        } catch (error: any) {
          displayErrorMessage(error);
        }
      }
    };
    fetchConnectedActivityIds();
  }, []);

  // Populating Form Migrated Fields, when migration data changes

  useEffect(() => {
    if (actionMigratedData) {
      form.setFieldsValue({
        ghgsAffected: actionMigratedData.ghgsAffected,
        natImplementor: actionMigratedData.natImplementer,
        estimatedInvestment: actionMigratedData.estimatedInvestment,
        achievedReduct: actionMigratedData.achievedReduction,
        expectedReduct: actionMigratedData.expectedReduction,
      });
    }
    if (!firstRenderingCompleted) {
      setFirstRenderingCompleted(true);
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

    const fetchAttachmentData = async () => {
      if (tempProgramIds.length > 0) {
        try {
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
              type: prg.migratedData[0]?.types ?? [],
              status: prg.programmeStatus,
              subSectorsAffected: prg.affectedSubSector ?? [],
              estimatedInvestment: prg.investment,
              ghgsAffected: prg.migratedData[0]?.ghgsAffected ?? [],
              types: prg.migratedData[0]?.types ?? [],
              natImplementer: prg.natImplementor ?? [],
              achievedReduction: prg.migratedData[0]?.achievedGHGReduction ?? 0,
              estimatedReduction: prg.migratedData[0]?.expectedGHGReduction ?? 0,
            });
          });

          setProgramData(tempPRGData);
        } catch (error: any) {
          displayErrorMessage(error);
        }
      } else {
        setProgramData([]);
      }
    };
    fetchAttachmentData();

    // Setting Pagination
    setCurrentPage(1);
    setPageSize(10);
  }, [tempProgramIds]);

  // Fetching Activity data and calculating migrated fields when attachment changes

  useEffect(() => {
    const activityPayload = {
      filterOr: [] as any[],
      sort: {
        key: 'activityId',
        order: 'ASC',
      },
    };

    const supportPayload = {
      filterOr: [] as any[],
      sort: {
        key: 'supportId',
        order: 'ASC',
      },
    };

    const fetchActivityAttachmentData = async () => {
      if (attachedActivityIds.length > 0) {
        try {
          attachedActivityIds.forEach((activityId) => {
            activityPayload.filterOr.push({
              key: 'activityId',
              operation: '=',
              value: activityId,
            });
            supportPayload.filterOr.push({
              key: 'activityId',
              operation: '=',
              value: activityId,
            });
          });
          const activityResponse: any = await post('national/activities/query', activityPayload);
          const supportResponse: any = await post('national/supports/query', supportPayload);

          const tempActivityData: ActivityData[] = [];
          const tempSupportData: SupportData[] = [];

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

          setActivityData(tempActivityData);
          setSupportData(tempSupportData);
        } catch (error: any) {
          displayErrorMessage(error);
        }
      } else {
        setActivityData([]);
        setSupportData([]);
      }
    };
    fetchActivityAttachmentData();

    // Setting Pagination
    setActivityCurrentPage(1);
    setActivityPageSize(10);

    setSupportCurrentPage(1);
    setSupportPageSize(10);
  }, [attachedActivityIds]);

  // Calculating migrated fields when attachment changes

  const memoizedMigratedData = useMemo(() => {
    const tempMigratedData: ActionMigratedData = {
      natImplementer: [],
      estimatedInvestment: 0,
      achievedReduction: 0,
      expectedReduction: 0,
      ghgsAffected: [],
    };

    programData.forEach((prg: ProgrammeData) => {
      tempMigratedData.ghgsAffected = joinTwoArrays(
        tempMigratedData.ghgsAffected,
        prg.ghgsAffected ?? []
      );

      tempMigratedData.natImplementer = joinTwoArrays(
        tempMigratedData.natImplementer,
        prg.natImplementer ?? []
      );

      tempMigratedData.estimatedInvestment =
        tempMigratedData.estimatedInvestment + prg.estimatedInvestment ?? 0;

      const prgGHGAchievement = prg.achievedReduction ?? 0;
      const prgGHGExpected = prg.estimatedReduction ?? 0;

      tempMigratedData.achievedReduction = tempMigratedData.achievedReduction + prgGHGAchievement;
      tempMigratedData.expectedReduction = tempMigratedData.expectedReduction + prgGHGExpected;
    });

    activityData.forEach((act: ActivityData) => {
      if (act.ghgsAffected && !tempMigratedData.ghgsAffected.includes(act.ghgsAffected)) {
        tempMigratedData.ghgsAffected.push(act.ghgsAffected);
      }

      const actGHGAchievement = act.achievedReduction ?? 0;
      const actGHGExpected = act.estimatedReduction ?? 0;

      tempMigratedData.achievedReduction = tempMigratedData.achievedReduction + actGHGAchievement;
      tempMigratedData.expectedReduction = tempMigratedData.expectedReduction + actGHGExpected;
    });

    return tempMigratedData;
  }, [programData, activityData]);

  useEffect(() => {
    setActionMigratedData(memoizedMigratedData);
  }, [memoizedMigratedData]);

  // Attachment resolve before updating an already created action

  const resolveProgrammeAttachments = async () => {
    const toAttach = tempProgramIds.filter((prg) => !attachedProgramIds.includes(prg));
    const toDetach = attachedProgramIds.filter((prg) => !tempProgramIds.includes(prg));

    try {
      if (toDetach.length > 0) {
        toDetach.forEach(async (prg) => {
          await post('national/programmes/unlink', { programme: prg });
        });
      }

      if (toAttach.length > 0) {
        await post('national/programmes/link', { actionId: entId, programmes: toAttach });
      }
    } catch (error: any) {
      displayErrorMessage(error);
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
            creatorType: 'action',
            expected: kpi.expected,
          });
        });
      } else if (method === 'update' && handleKPI) {
        payload.kpis = [];
        newKpiList.forEach((kpi) => {
          payload.kpis.push({
            name: kpi.name,
            kpiUnit: kpi.unit,
            creatorType: 'action',
            expected: kpi.expected,
            kpiAction: KPIAction.CREATED,
          });
        });
        createdKpiList.forEach((kpi) => {
          payload.kpis.push({
            kpiId: kpi.id,
            kpiUnit: kpi.unit,
            name: kpi.name,
            creatorType: 'action',
            expected: kpi.expected,
            kpiAction: kpi.kpiAction,
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
      } else if (entId && method === 'update') {
        payload.actionId = entId;
        response = await put('national/actions/update', payload);
      }

      const successMsg =
        method === 'create' ? t('actionCreationSuccess') : t('actionUpdateSuccess');

      if (response.status === 200 || response.status === 201) {
        if (entId && method === 'update') {
          resolveProgrammeAttachments();
        }

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
        navigate('/actions');
      }
    } catch (error: any) {
      displayErrorMessage(error);

      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });

      setWaitingForBE(false);
      navigate('/actions');
    }
  };

  // Entity Validate

  const validateEntity = async () => {
    try {
      if (entId) {
        const payload = {
          entityId: entId,
          validateStatus: !isValidated,
        };
        const response: any = await post('national/actions/validateStatus', payload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content: isValidated ? t('actionUnvalidateSuccess') : t('actionValidateSuccess'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          navigate('/actions');
        }
      }
    } catch (error: any) {
      if (error?.status) {
        if (error.status === 403) {
          setIsValidationAllowed(false);
        }
        displayErrorMessage(error);
      } else {
        displayErrorMessage(error, `${entId} Validation Failed`);
      }
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
        const response: any = await del('national/actions/delete', payload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content: t('actionDeleteSuccess'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          navigate('/actions');
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

  // Detach Programme

  const detachProgramme = async (prgId: string) => {
    setDetachingEntityId(prgId);
    setOpenDetachPopup(true);
  };

  // Handle Detachment

  const detachEntity = async (entityId: string) => {
    const filteredIds = tempProgramIds.filter((id) => id !== entityId);
    setTempProgramIds(filteredIds);
    setIsSaveButtonDisabled(false);
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

  // Programme Column Definition

  const progTableColumns = getProgrammeTableColumns(isView, detachProgramme);

  // Activity Column Definition

  const activityTableColumns = getActivityTableColumns();

  // Support Column Definition

  const supportTableColumns = getSupportTableColumns();

  // Programme Table Behaviour

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
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

  return (
    <div className="content-container">
      <ConfirmPopup
        key={'detach_popup'}
        icon={<DisconnectOutlined style={{ color: '#ff4d4f', fontSize: '120px' }} />}
        isDanger={true}
        content={{
          primaryMsg: `${t('detachPopup:primaryMsg')} Programme ${detachingEntityId}`,
          secondaryMsg: t('detachPopup:secondaryMsg'),
          cancelTitle: t('detachPopup:cancelTitle'),
          actionTitle: t('detachPopup:actionTitle'),
        }}
        actionRef={detachingEntityId}
        doAction={detachEntity}
        open={openDetachPopup}
        setOpen={setOpenDetachPopup}
      />
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
      {!waitingForBE && firstRenderingCompleted ? (
        <div className="action-form">
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            onValuesChange={handleValuesChange}
          >
            <div className="form-section-card">
              <div className="form-section-header">{t('generalInfoTitle')}</div>
              {method !== 'create' && entId && (
                <EntityIdCard
                  calledIn="Action"
                  entId={entId}
                  isValidated={isValidated}
                ></EntityIdCard>
              )}
              <Row gutter={gutterSize}>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('formHeader:typeHeader')}</label>}
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
                      {Object.values(ActionType).map((aType) => (
                        <Option key={aType} value={aType}>
                          {aType}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col {...halfColumnBps}>
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
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('actionDescTitle')}</label>}
                    name="description"
                    rules={[validation.required]}
                  >
                    <TextArea rows={3} disabled={isView} />
                  </Form.Item>
                </Col>
                <Col {...halfColumnBps}>
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
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">
                        {t('formHeader:instrumentTypeHeader')}
                      </label>
                    }
                    name="instrumentType"
                    rules={[validation.required]}
                  >
                    <Select
                      size="large"
                      mode="multiple"
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
                <Col {...halfColumnBps}>
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
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">
                        {t('formHeader:natImplementerHeader')}
                      </label>
                    }
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
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">
                        {t('formHeader:sectorsAffectedHeader')}
                      </label>
                    }
                    name="sector"
                    rules={[validation.required]}
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                    >
                      {availableSectors.map((sector) => (
                        <Option key={sector} value={sector}>
                          {sector}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
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
              </Row>
              <Row gutter={gutterSize}>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">
                        {t('formHeader:investmentNeedsHeader')}
                      </label>
                    }
                    name="estimatedInvestment"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('formHeader:natAnchorTitle')}</label>
                    }
                    name="natAnchor"
                    rules={[validation.required]}
                  >
                    <Select
                      size="large"
                      mode="multiple"
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
                {t('formHeader:documentsHeader')}
              </div>
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
            </div>
            <div className="form-section-card">
              <Row>
                <Col {...attachTableHeaderBps} style={{ paddingTop: '6px' }}>
                  <div className="form-section-header">{t('programInfoTitle')}</div>
                </Col>
                <Col {...attachButtonBps}>
                  <AttachEntity
                    isDisabled={isView}
                    content={{
                      buttonName: t('attachProgramme'),
                      attach: t('entityAction:attach'),
                      contentTitle: t('attachProgramme'),
                      listTitle: t('programmeList'),
                      cancel: t('entityAction:cancel'),
                    }}
                    options={allProgramIds}
                    alreadyAttached={attachedProgramIds}
                    currentAttachments={tempProgramIds}
                    setCurrentAttachments={setTempProgramIds}
                    setIsSaveButtonDisabled={setIsSaveButtonDisabled}
                    icon={<AppstoreOutlined style={{ fontSize: '120px' }} />}
                  ></AttachEntity>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <LayoutTable
                    tableData={programData.slice(
                      (currentPage - 1) * pageSize,
                      (currentPage - 1) * pageSize + pageSize
                    )}
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
            {method !== 'create' && (
              <div className="form-section-card">
                <Row>
                  <Col {...attachTableHeaderBps} style={{ paddingTop: '6px' }}>
                    <div className="form-section-header">{t('formHeader:activityInfoTitle')}</div>
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
                    <div className="form-section-header">{t('formHeader:supportInfoTitle')}</div>
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
              <div className="form-section-header">{t('formHeader:mitigationInfoTitle')}</div>
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
                    label={<label className="form-item-header">{t('formHeader:achieved')}</label>}
                    name="achievedReduct"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('formHeader:expected')}</label>}
                    name="expectedReduct"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
              </Row>
              {(method === 'create' ||
                method === 'update' ||
                (method === 'view' && createdKpiList.length > 0)) && (
                <div className="form-section-sub-header">{t('formHeader:kpiInfoTitle')}</div>
              )}
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
                    ownerEntityId={entId}
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
                <UpdatesTimeline recordType={'action'} recordId={entId} />
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
                      navigate('/actions');
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
                      navigate('/actions');
                    }}
                  >
                    {t('entityAction:back')}
                  </Button>
                </Col>
                {ability.can(Action.Validate, ActionEntity) && (
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
                      navigate('/actions');
                    }}
                  >
                    {t('entityAction:cancel')}
                  </Button>
                </Col>
                {ability.can(Action.Delete, ActionEntity) && (
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
          </Form>
        </div>
      ) : (
        <Spin className="loading-center" size="large" />
      )}
    </div>
  );
};

export default actionForm;
