import { useTranslation } from 'react-i18next';
import { Row, Col, Input, Button, Form, Select, message, Spin, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { useNavigate, useParams } from 'react-router-dom';
import UploadFileGrid from '../../../Components/Upload/uploadFiles';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import './activityForm.scss';
import { ParentType } from '../../../Enums/parentType.enum';
import TimelineTable from '../../../Components/Timeline/timeline';
import {
  ActualRows,
  ActualTimeline,
  ExpectedRows,
  ExpectedTimeline,
} from '../../../Definitions/mtgTimeline.definition';
import { ActivityStatus, ImplMeans, Measure, TechnologyType } from '../../../Enums/activity.enum';
import { GHGS, IntImplementor, KPIAction, NatImplementor } from '../../../Enums/shared.enum';
import EntityIdCard from '../../../Components/EntityIdCard/entityIdCard';
import { SupportData } from '../../../Definitions/supportDefinitions';
import { ActivityMigratedData, ParentData } from '../../../Definitions/activityDefinitions';
import { FormLoadProps } from '../../../Definitions/InterfacesAndType/formInterface';
import { getValidationRules } from '../../../Utils/validationRules';
import { delay, getFormTitle, getRounded } from '../../../Utils/utilServices';
import { Action } from '../../../Enums/action.enum';
import { ActivityEntity } from '../../../Entities/activity';
import { useAbilityContext } from '../../../Casl/Can';
import { getSupportTableColumns } from '../../../Definitions/columns/supportColumns';
import UpdatesTimeline from '../../../Components/UpdateTimeline/updates';
import { CreatedKpiData } from '../../../Definitions/kpiDefinitions';
import { ViewKpi } from '../../../Components/KPI/viewKpi';
import { EditKpi } from '../../../Components/KPI/editKpi';
import { processOptionalFields } from '../../../Utils/optionalValueHandler';
import {
  halfColumnBps,
  mtgHalfColumnBps,
  mtgSaveButtonBps,
  mtgTableHeaderBps,
  quarterColumnBps,
  shortButtonBps,
} from '../../../Definitions/breakpoints/breakpoints';
import { displayErrorMessage } from '../../../Utils/errorMessageHandler';
import { StoredData, UploadData } from '../../../Definitions/uploadDefinitions';
import { useUserContext } from '../../../Context/UserInformationContext/userInformationContext';
import ConfirmPopup from '../../../Components/Popups/Confirmation/confirmPopup';
import { DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const gutterSize = 30;
const inputFontSize = '13px';

const ActivityForm: React.FC<FormLoadProps> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['activityForm', 'formHeader', 'entityAction', 'error']);

  const isView: boolean = method === 'view' ? true : false;
  const formTitle = getFormTitle('Activity', method);

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

  const [parentType, setParentType] = useState<string>();
  const [connectedParentId, setConnectedParentId] = useState<string>();
  const [parentList, setParentList] = useState<ParentData[]>([]);

  // form state

  const [activityMigratedData, setActivityMigratedData] = useState<ActivityMigratedData>();
  const [uploadedFiles, setUploadedFiles] = useState<UploadData[]>([]);
  const [storedFiles, setStoredFiles] = useState<StoredData[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);

  // Spinner When Form Submit Occurs

  const [waitingForBE, setWaitingForBE] = useState<boolean>(false);

  // Methodology Doc state

  const [uploadedMthFiles, setUploadedMthFiles] = useState<UploadData[]>([]);
  const [storedMthFiles, setStoredMthFiles] = useState<StoredData[]>([]);
  const [mthFilesToRemove, setMthFilesToRemove] = useState<string[]>([]);

  // Results Doc state

  const [uploadedRstFiles, setUploadedRstFiles] = useState<UploadData[]>([]);
  const [storedRstFiles, setStoredRstFiles] = useState<StoredData[]>([]);
  const [rstFilesToRemove, setRstFilesToRemove] = useState<string[]>([]);

  // Support state

  const [supportData, setSupportData] = useState<SupportData[]>([]);
  const [supportCurrentPage, setCurrentPage] = useState<any>(1);
  const [supportPageSize, setPageSize] = useState<number>(10);

  // Popup Definition

  const [openDeletePopup, setOpenDeletePopup] = useState<boolean>(false);

  // Detach Entity Data

  // KPI State

  const [kpiCounter, setKpiCounter] = useState<number>(0);
  const [inheritedKpiList, setInheritedKpiList] = useState<CreatedKpiData[]>([]);
  const [shouldFetchParentKpi, setShouldFetchParentKpi] = useState<boolean>(false);

  // MTG Timeline State

  const [expectedTimeline, setExpectedTimeline] = useState<ExpectedTimeline[]>([]);
  const [actualTimeline, setActualTimeline] = useState<ActualTimeline[]>([]);
  const [isMtgButtonEnabled, setIsMtgButtonEnabled] = useState(false);
  const [mtgStartYear, setMtgStartYear] = useState<number>(0);
  const [selectedGhg, setSelectedGhg] = useState<GHGS>();
  const [gwpSettings, setGwpSettings] = useState<{ CH4: number; N2O: number }>();
  const [gwpValue, setGwpValue] = useState<number>(1);
  const [mtgUnit, setMtgUnit] = useState<GHGS>(GHGS.CO);

  // Initialization Logic

  const mtgRange = 30;

  const handleParentIdSelect = (id: string) => {
    setConnectedParentId(id);
    setShouldFetchParentKpi(true);
    if (id === undefined) {
      setMtgStartYear(0);
    }
  };

  const handleParentTypeSelect = (value: string) => {
    setParentType(value);
    setConnectedParentId(undefined);
    setMtgStartYear(0);
    form.setFieldsValue({
      parentId: '',
      parentDescription: '',
    });
  };

  // Tracking Parent selection

  useEffect(() => {
    const fetchConnectedParent = async () => {
      const tempMigratedData: ActivityMigratedData = {
        description: undefined,
        type: undefined,
        recipient: undefined,
        affSectors: undefined,
        affSubSectors: undefined,
        startYear: undefined,
        endYear: undefined,
        expectedTimeFrame: undefined,
      };

      if (
        (parentType === 'action' || parentType === 'programme' || parentType === 'project') &&
        connectedParentId
      ) {
        try {
          const response: any = await get(`national/${parentType}s/${connectedParentId}`);

          if (parentType === 'action') {
            tempMigratedData.description = response.data.description;
            tempMigratedData.affSectors = response.data.sector ?? undefined;
            tempMigratedData.startYear = response.data.startYear;
            tempMigratedData.type = response.data.type;
          } else if (parentType === 'programme') {
            tempMigratedData.description = response.data.description;
            tempMigratedData.recipient = response.data.recipientEntity;
            tempMigratedData.affSectors = response.data.sector ?? undefined;
            tempMigratedData.affSubSectors = response.data.affectedSubSector;
            tempMigratedData.startYear = response.data.startYear;
            tempMigratedData.type = response.data.type;
          } else {
            tempMigratedData.description = response.data.description;
            tempMigratedData.recipient = response.data.recipientEntities;
            tempMigratedData.affSectors = response.data.sector ?? undefined;
            tempMigratedData.affSubSectors = response.data.programme?.affectedSubSector ?? [];
            tempMigratedData.startYear = response.data.startYear;
            tempMigratedData.endYear = response.data.endYear;
            tempMigratedData.expectedTimeFrame = response.data.expectedTimeFrame;
            tempMigratedData.type = response.data.programme?.action?.type;
          }
          if (method === 'create') {
            setMtgStartYear(response.data.startYear);
          }
        } catch (error: any) {
          displayErrorMessage(error);
        }
      }
      setActivityMigratedData(tempMigratedData);
    };
    fetchConnectedParent();

    const fetchParentKPIData = async () => {
      if (typeof connectedParentId === 'undefined') {
        setInheritedKpiList([]);
      } else if (method !== 'view' && parentType && connectedParentId && shouldFetchParentKpi) {
        try {
          const response: any = await get(
            `national/kpis/entities/${parentType}/${connectedParentId}`
          );
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
                achieved: 0,
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
    fetchParentKPIData();
  }, [connectedParentId]);

  // Loading All Entities that can be parent on Parent Type select

  useEffect(() => {
    const fetchNonValidatedParents = async () => {
      if (parentType === 'action' || parentType === 'programme' || parentType === 'project') {
        try {
          const payload = {
            sort: {
              key: `${parentType}Id`,
              order: 'ASC',
            },
          };
          const response: any = await post(`national/${parentType}s/query`, payload);

          const tempParentData: ParentData[] = [];
          response.data.forEach((parent: any) => {
            tempParentData.push({
              id:
                parentType === 'action'
                  ? parent.actionId
                  : parentType === 'programme'
                  ? parent.programmeId
                  : parent.projectId,
              title: parent.title,
            });
          });
          setParentList(tempParentData);
        } catch (error: any) {
          displayErrorMessage(error);
        }
      }
    };
    fetchNonValidatedParents();
  }, [parentType]);

  // Initializing Section

  //fetch GWP settings

  const fetchGwpSettings = async () => {
    let response: any;
    try {
      response = await get(`national/settings/GWP`);

      if (response.status === 200 || response.status === 201) {
        setGwpSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching GWP values:', error);
    }
  };

  useEffect(() => {
    // Initially Loading the underlying Activity data when not in create mode

    const fetchData = async () => {
      if (method !== 'create' && entId) {
        let response: any;
        try {
          response = await get(`national/activities/${entId}`);

          if (response.status === 200 || response.status === 201) {
            const entityData: any = response.data;

            // Populating Action owned data fields
            form.setFieldsValue({
              title: entityData.title,
              description: entityData.description,
              status: entityData.status,
              measure: entityData.measure ?? undefined,
              nationalImplementingEntity: entityData.nationalImplementingEntity ?? undefined,
              internationalImplementingEntity:
                entityData.internationalImplementingEntity ?? undefined,
              anchoredInNationalStrategy: entityData.anchoredInNationalStrategy ?? undefined,
              meansOfImplementation: entityData.meansOfImplementation ?? undefined,
              technologyType: entityData.technologyType ?? undefined,
              etfDescription: entityData.etfDescription ?? undefined,
              comment: entityData.comment ?? undefined,
              ghgsAffected: entityData.ghgsAffected ?? undefined,
              achievedGHGReduction: entityData.achievedGHGReduction,
              expectedGHGReduction: entityData.expectedGHGReduction,
            });

            // Populating Mitigation data fields
            form.setFieldsValue({
              mtgMethodName: entityData.mitigationInfo?.mitigationMethodology ?? undefined,
              mtgMethodDesc:
                entityData.mitigationInfo?.mitigationMethodologyDescription ?? undefined,
              mtgCalculateEntity: entityData.mitigationInfo?.mitigationCalcEntity ?? undefined,
              mtgComments: entityData.mitigationInfo?.comments ?? undefined,
            });

            // Parent Data Update

            if (entityData.parentType) {
              form.setFieldsValue({
                parentType: entityData.parentType,
                parentId: entityData.parentId,
              });
              setParentType(entityData.parentType ?? undefined);
              setConnectedParentId(entityData.parentId ?? undefined);
            }

            // Setting validation status

            setIsValidated(entityData.validated ?? false);

            // Setting selected ghg

            setSelectedGhg(entityData.ghgsAffected ?? undefined);

            // Setting up uploaded files

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

            if (entityData.mitigationInfo?.methodologyDocuments?.length > 0) {
              const tempFiles: { key: string; title: string; url: string }[] = [];
              entityData.mitigationInfo?.methodologyDocuments.forEach((document: any) => {
                tempFiles.push({
                  key: document.createdTime,
                  title: document.title,
                  url: document.url,
                });
              });
              setStoredMthFiles(tempFiles);
            }

            if (entityData.mitigationInfo?.resultDocuments?.length > 0) {
              const tempFiles: { key: string; title: string; url: string }[] = [];
              entityData.mitigationInfo?.resultDocuments.forEach((document: any) => {
                tempFiles.push({
                  key: document.createdTime,
                  title: document.title,
                  url: document.url,
                });
              });
              setStoredRstFiles(tempFiles);
            }
          }
        } catch {
          navigate('/activities');
        }
        setIsSaveButtonDisabled(true);
      }
    };
    fetchData();

    // Initially Loading the underlying Support data when not in create mode

    const fetchSupportData = async () => {
      if (method !== 'create') {
        try {
          const tempSupportData: SupportData[] = [];

          const payload = {
            filterAnd: [
              {
                key: 'activityId',
                operation: '=',
                value: entId,
              },
            ],
            sort: {
              key: 'supportId',
              order: 'ASC',
            },
          };

          const response: any = await post('national/supports/query', payload);

          response.data.forEach((sup: any, index: number) => {
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
        } catch {
          setSupportData([]);
        }
      }
    };
    fetchSupportData();

    const fetchCreatedKPIData = async () => {
      if (method !== 'create' && entId) {
        try {
          const response: any = await get(`national/kpis/entities/activity/${entId}`);
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
                achieved: parseFloat(
                  kpi.achievements?.find((achEntity: any) => achEntity.activityId === entId)
                    ?.achieved ?? 0
                ),
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
    fetchCreatedKPIData();
    fetchGwpSettings();
  }, []);

  // Populating Form Migrated Fields, when migration data changes

  useEffect(() => {
    if (activityMigratedData) {
      form.setFieldsValue({
        parentDescription: activityMigratedData.description,
        supportType: activityMigratedData.type,
        recipient: activityMigratedData.recipient,
        sector: activityMigratedData.affSectors,
        affSubSectors: activityMigratedData.affSubSectors,
        startYear: activityMigratedData.startYear,
        endYear: activityMigratedData.endYear,
        expectedTimeFrame: activityMigratedData.expectedTimeFrame,
      });
    }
  }, [activityMigratedData]);

  // KPI Achievement Resolve

  const resolveKPIAchievements = async (activityId: string | undefined) => {
    if (inheritedKpiList.length > 0 && activityId) {
      const achievements: { kpiId: number; activityId: string; achieved: number }[] = [];
      inheritedKpiList.forEach(async (inheritedKpi) => {
        if (inheritedKpi.achieved > 0) {
          achievements.push({
            kpiId: inheritedKpi.id,
            activityId: activityId,
            achieved: inheritedKpi.achieved,
          });
        }
      });

      if (achievements.length > 0) {
        try {
          await post('national/kpis/achievements/add', { achievements: achievements });
        } catch (error: any) {
          displayErrorMessage(error);
        }
      }
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
        const response: any = await post('national/activities/validateStatus', payload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content: isValidated ? t('activityUnvalidateSuccess') : t('activityValidateSuccess'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          navigate('/activities');
        }
      }
    } catch (error: any) {
      if (error?.message) {
        if (error.message === 'Permission Denied: Unable to Validate Activity') {
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
        const response: any = await del('national/activities/delete', payload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content: t('activityDeleteSuccess'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          navigate('/activities');
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

  // Update KPI ACH Values

  const updateKPI = (
    index: number,
    property: keyof CreatedKpiData,
    value: any,
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    inWhich: 'created' | 'new'
  ): void => {
    setInheritedKpiList((prevKpiList) => {
      const updatedKpiList = prevKpiList.map((kpi) => {
        if (kpi.index === index) {
          return { ...kpi, [property]: parseFloat(value) };
        }
        return kpi;
      });
      return updatedKpiList;
    });
  };

  // Column Definition
  const supportTableColumns = getSupportTableColumns();

  // Table Behaviour

  const handleSupportTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // Save Button Enable when form value change

  const handleValuesChange = () => {
    setIsSaveButtonDisabled(false);
  };

  // MTG timeline Fields Mapping

  const mtgFieldMapping = (longName: string) => {
    switch (longName) {
      case 'Baseline Emissions (without measures)':
        return 'baselineEmissions';
      case 'Activity Emissions (with measures)':
        return 'activityEmissionsWithM';
      case 'Activity Emissions (with additional measures)':
        return 'activityEmissionsWithAM';
      case 'Expected Emission Reductions (with measures)':
        return 'expectedEmissionReductWithM';
      case 'Expected Emission Reductions (with additional measures)':
        return 'expectedEmissionReductWithAM';
      case 'Baseline Actual Emissions':
        return 'baselineActualEmissions';
      case 'Activity Actual Emissions':
        return 'activityActualEmissions';
      case 'Actual Equivalent Emission Reductions':
        return 'actualEmissionReduct';
      default:
        return '';
    }
  };

  const gwpValueMapping = () => {
    if (selectedGhg !== undefined && gwpSettings !== undefined) {
      switch (selectedGhg) {
        case GHGS.CH:
          setGwpValue(gwpSettings?.CH4 ?? 1);
          setMtgUnit(GHGS.CH);
          break;
        case GHGS.NO:
          setGwpValue(gwpSettings?.N2O ?? 1);
          setMtgUnit(GHGS.NO);
          break;
        default:
          setGwpValue(1);
          setMtgUnit(GHGS.CO);
          break;
      }
    }
  };

  //set mtg timeline data to zero values (when it is or null or create mode)

  const setDefaultTimelineValues = (startYear: number, range: number) => {
    const endYear = startYear + range;
    const tempExpectedEntries: ExpectedTimeline[] = [];
    Object.entries(ExpectedRows).forEach(([key, value]) => {
      const expectedGhgValue =
        key === 'ROW_ONE' || key === 'ROW_TWO' || key === 'ROW_THREE' ? `kt${mtgUnit}` : value[0];
      const rowData: ExpectedTimeline = {
        key: key,
        ghg: expectedGhgValue,
        topic: value[1],
        total: 0,
        values: new Array(Math.min(endYear, 2050) + 1 - startYear).fill(0),
      };
      tempExpectedEntries.push(rowData);
    });

    const tempActualEntries: ActualTimeline[] = [];
    Object.entries(ActualRows).forEach(([key, value]) => {
      const actualGhgValue = key === 'ROW_ONE' || key === 'ROW_TWO' ? `kt${mtgUnit}` : value[0];
      const rowData: ActualTimeline = {
        key: key,
        ghg: actualGhgValue,
        topic: value[1],
        total: 0,
        values: new Array(Math.min(endYear, 2050) + 1 - startYear).fill(0),
      };
      tempActualEntries.push(rowData);
    });

    setExpectedTimeline(tempExpectedEntries);
    setActualTimeline(tempActualEntries);
  };

  // Get mtg timeline data

  const fetchMtgTimelineData = async () => {
    if (method !== 'create' && entId) {
      let response: any;
      try {
        response = await get(`national/activities/mitigation/${entId}`);

        if (response.status === 200 || response.status === 201) {
          setMtgStartYear(response.data.startYear);
          const tempExpectedEntries: ExpectedTimeline[] = [];
          Object.entries(ExpectedRows).forEach(([key, value]) => {
            const expectedGhgValue =
              key === 'ROW_ONE' || key === 'ROW_TWO' || key === 'ROW_THREE'
                ? `kt${mtgUnit}`
                : value[0];
            const rowData: ExpectedTimeline = {
              key: key,
              ghg: expectedGhgValue,
              topic: value[1],
              total: response.data.expected.total[mtgFieldMapping(value[1])],
              values: response.data.expected[mtgFieldMapping(value[1])],
            };
            tempExpectedEntries.push(rowData);
          });

          const tempActualEntries: ActualTimeline[] = [];
          Object.entries(ActualRows).forEach(([key, value]) => {
            const actualGhgValue =
              key === 'ROW_ONE' || key === 'ROW_TWO' ? `kt${mtgUnit}` : value[0];
            const rowData: ActualTimeline = {
              key: key,
              ghg: actualGhgValue,
              topic: value[1],
              total: response.data.actual.total[mtgFieldMapping(value[1])],
              values: response.data.actual[mtgFieldMapping(value[1])],
            };
            tempActualEntries.push(rowData);
          });

          setExpectedTimeline(tempExpectedEntries);
          setActualTimeline(tempActualEntries);
        } else {
          setDefaultTimelineValues(mtgStartYear, mtgRange);
        }
      } catch (error) {
        console.error('Error fetching timeline data:', error);
        setDefaultTimelineValues(mtgStartYear, mtgRange);
      }
    }
  };

  //MTG timeline calculate array sum from row

  const mtgCalculateArraySum = (array: number[]) => {
    let arrSum = 0;
    for (let index = 0; index <= array.length; index++) {
      arrSum += array[index] || 0;
    }
    return arrSum;
  };

  //Values convert to ktCO2e

  const multiplyByGwpValue = (entry: any) => {
    switch (entry.topic) {
      case expectedTimeline[1].topic:
        for (let index = 0; index < expectedTimeline[1].values.length; index++) {
          expectedTimeline[3].values[index] = expectedTimeline[1].values[index] * gwpValue;
          expectedTimeline[3].total = mtgCalculateArraySum(expectedTimeline[3].values);
        }
        break;
      case expectedTimeline[2].topic:
        for (let index = 0; index < expectedTimeline[2].values.length; index++) {
          expectedTimeline[4].values[index] = expectedTimeline[2].values[index] * gwpValue;
          expectedTimeline[4].total = mtgCalculateArraySum(expectedTimeline[4].values);
        }
        break;
      case actualTimeline[1].topic:
        for (let index = 0; index < actualTimeline[1].values.length; index++) {
          actualTimeline[2].values[index] = actualTimeline[1].values[index] * gwpValue;
          actualTimeline[2].total = mtgCalculateArraySum(actualTimeline[2].values);
        }
        break;
    }
  };

  // Mtg Data Change

  const onMtgValueEnter = (
    tableType: 'expected' | 'actual',
    rowId: string,
    year: any,
    value: string
  ) => {
    const newValue = value ? parseInt(value) : 0;

    if (tableType === 'expected') {
      const updatedTimeline = expectedTimeline.map((entry) => {
        if (entry.topic === rowId) {
          entry.values[year - mtgStartYear] = newValue;
          entry.total = mtgCalculateArraySum(entry.values);
          multiplyByGwpValue(entry);
          return entry;
        }
        return entry;
      });
      setExpectedTimeline(updatedTimeline);
    } else {
      const updatedTimeline = actualTimeline.map((entry) => {
        if (entry.topic === rowId) {
          entry.values[year - mtgStartYear] = newValue;
          entry.total = mtgCalculateArraySum(entry.values);
          multiplyByGwpValue(entry);
          return entry;
        }
        return entry;
      });
      setActualTimeline(updatedTimeline);
    }
    setIsMtgButtonEnabled(true);
  };

  // MTG timeline update

  const MtgTimelineUpdate = async () => {
    try {
      if (entId) {
        const payload = {
          activityId: entId,
          mitigationTimeline: {
            expected: {
              baselineEmissions: expectedTimeline[0].values,
              activityEmissionsWithM: expectedTimeline[1].values,
              activityEmissionsWithAM: expectedTimeline[2].values,
              expectedEmissionReductWithM: expectedTimeline[3].values,
              expectedEmissionReductWithAM: expectedTimeline[4].values,
              total: {
                baselineEmissions: expectedTimeline[0].total,
                activityEmissionsWithM: expectedTimeline[1].total,
                activityEmissionsWithAM: expectedTimeline[2].total,
                expectedEmissionReductWithM: expectedTimeline[3].total,
                expectedEmissionReductWithAM: expectedTimeline[4].total,
              },
            },
            actual: {
              baselineActualEmissions: actualTimeline[0].values,
              activityActualEmissions: actualTimeline[1].values,
              actualEmissionReduct: actualTimeline[2].values,
              total: {
                baselineActualEmissions: actualTimeline[0].total,
                activityActualEmissions: actualTimeline[1].total,
                actualEmissionReduct: actualTimeline[2].total,
              },
            },
          },
        };
        const response: any = await put('national/activities/mitigation/update', payload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content: t('mtgUpdateSuccess'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          setIsMtgButtonEnabled(false);
        }
      }
    } catch (error: any) {
      displayErrorMessage(error, `${entId} Mitigation Timeline Failed to Update`);
    }
  };

  // Initializing mtg timeline data

  useEffect(() => {
    fetchMtgTimelineData();

    if (method === 'create') {
      setDefaultTimelineValues(mtgStartYear, mtgRange);
    }

    gwpValueMapping();
  }, [mtgStartYear, selectedGhg, mtgUnit]);

  // Form Submit

  const handleSubmit = async (payload: any) => {
    if (method === 'update' && isMtgButtonEnabled) {
      displayErrorMessage('', t('saveMtgFirst'));
      return;
    }
    try {
      setWaitingForBE(true);

      for (const key in payload) {
        if (key.startsWith('kpi_exp') || key.startsWith('kpi_unit')) {
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

      payload.achievedGHGReduction = parseFloat(payload.achievedGHGReduction);
      payload.expectedGHGReduction = parseFloat(payload.expectedGHGReduction);

      payload.mitigationInfo = {
        mitigationMethodology: payload.mtgMethodName,
        mitigationMethodologyDescription: payload.mtgMethodDesc,
        mitigationCalcEntity: payload.mtgCalculateEntity,
        comments: payload.mtgComments,
        methodologyDocuments: [],
        resultDocuments: [],
      };

      if (method === 'create') {
        payload.mitigationTimeline = {
          expected: {
            baselineEmissions: expectedTimeline[0].values,
            activityEmissionsWithM: expectedTimeline[1].values,
            activityEmissionsWithAM: expectedTimeline[2].values,
            expectedEmissionReductWithM: expectedTimeline[3].values,
            expectedEmissionReductWithAM: expectedTimeline[4].values,
            total: {
              baselineEmissions: expectedTimeline[0].total,
              activityEmissionsWithM: expectedTimeline[1].total,
              activityEmissionsWithAM: expectedTimeline[2].total,
              expectedEmissionReductWithM: expectedTimeline[3].total,
              expectedEmissionReductWithAM: expectedTimeline[4].total,
            },
          },
          actual: {
            baselineActualEmissions: actualTimeline[0].values,
            activityActualEmissions: actualTimeline[1].values,
            actualEmissionReduct: actualTimeline[2].values,
            total: {
              baselineActualEmissions: actualTimeline[0].total,
              activityActualEmissions: actualTimeline[1].total,
              actualEmissionReduct: actualTimeline[2].total,
            },
          },
          startYear: mtgStartYear,
        };
      }

      if (method === 'create') {
        uploadedMthFiles.forEach((file) => {
          payload.mitigationInfo.methodologyDocuments.push({ title: file.title, data: file.data });
        });

        uploadedRstFiles.forEach((file) => {
          payload.mitigationInfo.resultDocuments.push({ title: file.title, data: file.data });
        });
      } else if (method === 'update') {
        // Resolving Methodology Files

        storedMthFiles.forEach((file) => {
          if (!mthFilesToRemove.includes(file.key)) {
            payload.mitigationInfo.methodologyDocuments.push({
              createdTime: file.key,
              title: file.title,
              url: file.url,
            });
          }
        });

        uploadedMthFiles.forEach((file) => {
          payload.mitigationInfo.methodologyDocuments.push({ title: file.title, data: file.data });
        });

        // Resolving Result Files

        storedRstFiles.forEach((file) => {
          if (!rstFilesToRemove.includes(file.key)) {
            payload.mitigationInfo.resultDocuments.push({
              createdTime: file.key,
              title: file.title,
              url: file.url,
            });
          }
        });

        uploadedRstFiles.forEach((file) => {
          payload.mitigationInfo.resultDocuments.push({ title: file.title, data: file.data });
        });
      }

      let response: any;

      if (method === 'create') {
        response = await post(
          'national/activities/add',
          processOptionalFields(payload, 'activity')
        );

        resolveKPIAchievements(response.data.activityId);
      } else if (method === 'update') {
        payload.activityId = entId;
        response = await put(
          'national/activities/update',
          processOptionalFields(payload, 'activity')
        );

        resolveKPIAchievements(entId);
      }

      const successMsg =
        method === 'create' ? t('activityCreationSuccess') : t('activityUpdateSuccess');

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
        setWaitingForBE(false);
        navigate('/activities');
      }
    } catch (error: any) {
      displayErrorMessage(error);
      setWaitingForBE(false);
      navigate('/activities');
    }
  };

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
      {!waitingForBE ? (
        <div className="activity-form">
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
                  calledIn="Activity"
                  entId={entId}
                  isValidated={isValidated}
                ></EntityIdCard>
              )}
              <Row gutter={gutterSize}>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('activityTitle')}</label>}
                    name="title"
                    rules={[validation.required]}
                  >
                    <Input className="form-input-box" disabled={isView} />
                  </Form.Item>
                </Col>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('activityDescTitle')}</label>}
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
                    label={<label className="form-item-header">{t('parentTypeTitle')}</label>}
                    name="parentType"
                    rules={[validation.required]}
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                      onChange={handleParentTypeSelect}
                    >
                      {Object.values(ParentType).map((parent) => (
                        <Option key={parent} value={parent}>
                          {t(parent)}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('activityStatusTitle')}</label>}
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
                      {Object.values(ActivityStatus).map((status) => (
                        <Option key={status} value={status}>
                          {status}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              {parentType ? (
                <Row gutter={gutterSize}>
                  <Col {...halfColumnBps}>
                    <Form.Item
                      label={
                        <label className="form-item-header">
                          {`${t('selectParentTitle')} ${t(parentType)}`}
                        </label>
                      }
                      name="parentId"
                      rules={[validation.required]}
                    >
                      <Select
                        size={'large'}
                        style={{ fontSize: inputFontSize }}
                        allowClear
                        disabled={isView}
                        showSearch
                        onChange={handleParentIdSelect}
                      >
                        {parentList.map((parent) => (
                          <Option key={parent.id} value={parent.id}>
                            {parent.id}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col {...halfColumnBps}>
                    <Form.Item
                      label={
                        <label className="form-item-header">
                          {`${t('parentDescTitle')} ${t(parentType)}`}
                        </label>
                      }
                      name="parentDescription"
                    >
                      <TextArea maxLength={250} rows={3} disabled />
                    </Form.Item>
                  </Col>
                </Row>
              ) : null}
              <Row gutter={gutterSize}>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">
                        {t('formHeader:natImplementerHeader')}
                      </label>
                    }
                    name="nationalImplementingEntity"
                  >
                    <Select
                      mode="multiple"
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                    >
                      {Object.values(NatImplementor).map((implementer) => (
                        <Option key={implementer} value={implementer}>
                          {implementer}
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
                    name="internationalImplementingEntity"
                  >
                    <Select
                      mode="multiple"
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                    >
                      {Object.values(IntImplementor).map((implementer) => (
                        <Option key={implementer} value={implementer}>
                          {implementer}
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
                      <label className="form-item-header">{t('formHeader:measuresTitle')}</label>
                    }
                    name="measure"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                    >
                      {Object.values(Measure).map((measure) => (
                        <Option key={measure} value={measure}>
                          {measure}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('formHeader:supportTypeTitle')}</label>
                    }
                    name="supportType"
                  >
                    <Select size="large" style={{ fontSize: inputFontSize }} disabled></Select>
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
                {(parentType === 'programme' || parentType === 'project') && (
                  <Col {...quarterColumnBps}>
                    <Form.Item
                      label={
                        <label className="form-item-header">
                          {t('formHeader:subSectorsAffectedHeader')}
                        </label>
                      }
                      name="affSubSectors"
                    >
                      <Select
                        mode="multiple"
                        size="large"
                        style={{ fontSize: inputFontSize }}
                        disabled
                      ></Select>
                    </Form.Item>
                  </Col>
                )}
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('formHeader:startYearTitle')}</label>
                    }
                    name="startYear"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                {parentType === 'project' && (
                  <Col {...quarterColumnBps}>
                    <Form.Item
                      label={
                        <label className="form-item-header">{t('formHeader:endYearTitle')}</label>
                      }
                      name="endYear"
                    >
                      <Input className="form-input-box" disabled />
                    </Form.Item>
                  </Col>
                )}
              </Row>
              <Row gutter={gutterSize}>
                {(parentType === 'programme' || parentType === 'project') && (
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
                        mode="multiple"
                        size="large"
                        style={{ fontSize: inputFontSize }}
                        disabled
                      ></Select>
                    </Form.Item>
                  </Col>
                )}
                {parentType === 'project' && (
                  <Col {...halfColumnBps}>
                    <Form.Item
                      label={
                        <label className="form-item-header">
                          {t('formHeader:timeFrameHeader')}
                        </label>
                      }
                      name="expectedTimeFrame"
                    >
                      <Input className="form-input-box" disabled />
                    </Form.Item>
                  </Col>
                )}
              </Row>
              <Row gutter={gutterSize}>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('formHeader:natAnchorHeader')}</label>
                    }
                    name="anchoredInNationalStrategy"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                    >
                      <Option key={'yes'} value={true}>
                        {'Yes'}
                      </Option>
                      <Option key={'no'} value={false}>
                        {'No'}
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('formHeader:implMeansTitle')}</label>
                    }
                    name="meansOfImplementation"
                  >
                    <Select
                      size={'large'}
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                    >
                      {Object.values(ImplMeans).map((mean) => (
                        <Option key={mean} value={mean}>
                          {mean}
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
                      <label className="form-item-header">{t('formHeader:techTypeTitle')}</label>
                    }
                    name="technologyType"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                    >
                      {Object.values(TechnologyType).map((tech) => (
                        <Option key={tech} value={tech}>
                          {tech}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">
                        {t('formHeader:additionalInfoTitle')}
                      </label>
                    }
                    name="etfDescription"
                  >
                    <TextArea maxLength={250} rows={3} disabled={isView} />
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
                    label={<label className="form-item-header">{t('activityCommentsTitle')}</label>}
                    name="comment"
                  >
                    <TextArea rows={3} disabled={isView} />
                  </Form.Item>
                </Col>
              </Row>
              <div className="form-section-header">{t('mitigationInfoTitle')}</div>
              <div className="form-section-sub-header">{t('formHeader:emissionInfoTitle')}</div>
              <Row gutter={gutterSize}>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('formHeader:ghgAffected')}</label>
                    }
                    name="ghgsAffected"
                    rules={[validation.required]}
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={method !== 'create'}
                      showSearch
                      onChange={(value: GHGS) => setSelectedGhg(value)}
                    >
                      {Object.values(GHGS).map((ghg) => (
                        <Option key={ghg} value={ghg}>
                          {ghg}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('formHeader:achieved')}</label>}
                    name="achievedGHGReduction"
                    rules={[validation.required]}
                  >
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      className="form-input-box"
                      disabled={isView}
                    />
                  </Form.Item>
                </Col>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('formHeader:expected')}</label>}
                    name="expectedGHGReduction"
                    rules={[validation.required]}
                  >
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      className="form-input-box"
                      disabled={isView}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {inheritedKpiList.length > 0 && (
                <div className="form-section-sub-header">{t('formHeader:kpiInfoTitle')}</div>
              )}
              {method === 'view'
                ? inheritedKpiList.map((inheritedKPI: CreatedKpiData, index: number) => (
                    <ViewKpi
                      key={index}
                      index={index}
                      inherited={true}
                      headerNames={[
                        t('formHeader:kpiName'),
                        t('formHeader:kpiUnit'),
                        t('formHeader:achieved'),
                        t('formHeader:expected'),
                      ]}
                      kpi={inheritedKPI}
                      callingEntityId={entId}
                      ownerEntityId={inheritedKPI.creator}
                    ></ViewKpi>
                  ))
                : inheritedKpiList.map((inheritedKPI: CreatedKpiData) => (
                    <EditKpi
                      key={inheritedKPI.index}
                      index={inheritedKPI.index}
                      form={form}
                      rules={[validation.required]}
                      isFromActivity={true}
                      headerNames={[
                        t('formHeader:kpiName'),
                        t('formHeader:kpiUnit'),
                        t('formHeader:achieved'),
                        t('formHeader:expected'),
                      ]}
                      kpi={inheritedKPI}
                      updateKPI={updateKPI}
                    ></EditKpi>
                  ))}
            </div>
            {method !== 'create' && (
              <div className="form-section-card">
                <Row>
                  <Col span={6}>
                    <div className="form-section-header">{t('supportTableHeader')}</div>
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
                      emptyMessage={t('noSupportsMessage')}
                    />
                  </Col>
                </Row>
              </div>
            )}
            <div className="form-section-card">
              <div className="form-section-header">{t('mtgInfoTitle')}</div>
              <Row gutter={gutterSize}>
                <Col {...mtgHalfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('mtgMethodName')}</label>}
                    name="mtgMethodName"
                  >
                    <Input className="form-input-box" disabled={isView} />
                  </Form.Item>
                </Col>
                <Col {...mtgHalfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('mtgDocUploadOne')}</label>}
                  >
                    <UploadFileGrid
                      isSingleColumn={true}
                      usedIn={method}
                      buttonText={t('entityAction:upload')}
                      storedFiles={storedMthFiles}
                      uploadedFiles={uploadedMthFiles}
                      setUploadedFiles={setUploadedMthFiles}
                      removedFiles={mthFilesToRemove}
                      setRemovedFiles={setMthFilesToRemove}
                      setIsSaveButtonDisabled={setIsSaveButtonDisabled}
                    ></UploadFileGrid>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col {...mtgHalfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('mtgDescTitle')}</label>}
                    name="mtgMethodDesc"
                  >
                    <TextArea rows={3} disabled={isView} />
                  </Form.Item>
                </Col>
                <Col {...mtgHalfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('mtgDocUploadTwo')}</label>}
                  >
                    <UploadFileGrid
                      isSingleColumn={true}
                      usedIn={method}
                      buttonText={t('entityAction:upload')}
                      storedFiles={storedRstFiles}
                      uploadedFiles={uploadedRstFiles}
                      setUploadedFiles={setUploadedRstFiles}
                      removedFiles={rstFilesToRemove}
                      setRemovedFiles={setRstFilesToRemove}
                      setIsSaveButtonDisabled={setIsSaveButtonDisabled}
                    ></UploadFileGrid>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col {...mtgHalfColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('mtgCalculateEntityTitle')}</label>
                    }
                    name="mtgCalculateEntity"
                  >
                    <Input className="form-input-box" disabled={isView} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col span={24}>
                  <Form.Item
                    label={<label className="form-item-header">{t('mtgComments')}</label>}
                    name="mtgComments"
                  >
                    <TextArea rows={3} disabled={isView} />
                  </Form.Item>
                </Col>
              </Row>
            </div>
            {mtgStartYear !== 0 && mtgStartYear !== undefined && selectedGhg !== undefined && (
              <div className="form-section-card">
                <Row>
                  <Col {...mtgTableHeaderBps} style={{ paddingTop: '6px' }}>
                    <div className="form-section-header">{t('mitigationTimelineTitle')}</div>
                  </Col>
                  <Col {...mtgSaveButtonBps}>
                    {method === 'update' && (
                      <Button
                        type="primary"
                        size="large"
                        block
                        onClick={() => {
                          MtgTimelineUpdate();
                        }}
                        disabled={!isMtgButtonEnabled}
                      >
                        {t('entityAction:update')}
                      </Button>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <TimelineTable
                      expectedTimeline={expectedTimeline}
                      actualTimeline={actualTimeline}
                      loading={false}
                      method={method}
                      mtgStartYear={mtgStartYear}
                      mtgRange={mtgRange}
                      onValueEnter={onMtgValueEnter}
                    />
                  </Col>
                </Row>
              </div>
            )}
            {method !== 'create' && (
              <div className="form-section-timelineCard">
                <div className="form-section-header">{t('formHeader:updatesInfoTitle')}</div>
                <UpdatesTimeline recordType={'activity'} recordId={entId} />
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
                      navigate('/activities');
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
                      navigate('/activities');
                    }}
                  >
                    {t('entityAction:back')}
                  </Button>
                </Col>
                {ability.can(Action.Validate, ActivityEntity) && (
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
                      navigate('/activities');
                    }}
                  >
                    {t('entityAction:cancel')}
                  </Button>
                </Col>
                {ability.can(Action.Delete, ActivityEntity) && (
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

export default ActivityForm;
