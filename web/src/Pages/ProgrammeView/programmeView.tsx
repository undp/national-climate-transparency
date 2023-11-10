import { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Progress, Tag, Steps, message, Skeleton, Button, Tooltip } from 'antd';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { useTranslation } from 'react-i18next';
import * as Icon from 'react-bootstrap-icons';
import './programmeView.scss';
import {
  BlockOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import Geocoding from '@mapbox/mapbox-sdk/services/geocoding';
import { useUserContext } from '../../Context/UserInformationContext/userInformationContext';
import {
  CarbonSystemType,
  CompanyRole,
  CompanyState,
  DevBGColor,
  DevColor,
  DocType,
  DocumentStatus,
  InfoView,
  InvestmentBody,
  Loading,
  MapComponent,
  MapTypes,
  MarkerData,
  NdcActionBody,
  OrganisationStatus,
  ProgrammeDocuments,
  ProgrammeStageMRV,
  ProgrammeT,
  Role,
  RoleIcon,
  TooltipColor,
  TypeOfMitigation,
  UnitField,
  addCommSep,
  addCommSepRound,
  addSpaces,
  getFinancialFields,
  getGeneralFields,
  getStageEnumVal,
  getStageTagTypeMRV,
  isBase64,
} from '@undp/carbon-library';

const ProgrammeView = () => {
  const { get, put, post } = useConnection();

  const { userInfoState } = useUserContext();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<ProgrammeT>();
  const [historyData, setHistoryData] = useState<any>([]);
  const [ndcActionHistoryData, setNdcActionHistoryData] = useState<any>([]);
  const [ndcActionHistoryDataGrouped, setNdcActionHistoryDataGrouped] = useState<any>();
  const [ndcActionData, setNdcActionData] = useState<any>([]);
  const { i18n, t } = useTranslation(['view']);
  const { t: companyProfileTranslations } = useTranslation(['companyProfile']);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [loadingAll, setLoadingAll] = useState<boolean>(true);
  const [loadingNDC, setLoadingNDC] = useState<boolean>(true);
  const [loadingInvestment, setLoadingInvestment] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState(false);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [centerPoint, setCenterPoint] = useState<number[]>([]);
  const mapType = process.env.REACT_APP_MAP_TYPE ? process.env.REACT_APP_MAP_TYPE : 'None';
  const [isAllOwnersDeactivated, setIsAllOwnersDeactivated] = useState(true);
  const [emissionsReductionExpected, setEmissionsReductionExpected] = useState(0);
  const [emissionsReductionAchieved, setEmissionsReductionAchieved] = useState(0);
  const [documentsData, setDocumentsData] = useState<any[]>([]);
  const [curentProgrammeStatus, setCurrentProgrammeStatus] = useState<any>('');
  const [uploadMonitoringReport, setUploadMonitoringReport] = useState<boolean>(false);
  const [programmeOwnerId, setProgrammeOwnerId] = useState<any[]>([]);
  const [ministrySectoralScope, setMinistrySectoralScope] = useState<any[]>([]);
  const accessToken =
    mapType === MapTypes.Mapbox && process.env.REACT_APP_MAPBOXGL_ACCESS_TOKEN
      ? process.env.REACT_APP_MAPBOXGL_ACCESS_TOKEN
      : '';
  const { id } = useParams();

  const showModal = () => {
    setOpenModal(true);
  };

  const locationColors = ['#6ACDFF', '#FF923D', '#CDCDCD', '#FF8183', '#B7A4FE'];

  const getCenter = (list: any[]) => {
    let count = 0;
    let lat = 0;
    let long = 0;
    for (const l of list) {
      if (l === null || l === 'null') {
        continue;
      }
      count += 1;
      lat += l[0];
      long += l[1];
    }
    return [lat / count, long / count];
  };

  const drawMap = () => {
    setTimeout(async () => {
      if (data?.geographicalLocationCordintes && data?.geographicalLocationCordintes.length > 0) {
        setCenterPoint(getCenter(data?.geographicalLocationCordintes));
        const markerList = [];
        for (const iloc in data?.geographicalLocationCordintes) {
          if (data?.geographicalLocationCordintes[iloc] !== null) {
            const markerData: MarkerData = {
              color: locationColors[(Number(iloc) + 1) % locationColors.length],
              location: data?.geographicalLocationCordintes[iloc],
            };

            markerList.push(markerData);
          }
        }

        setMarkers(markerList);
      } else {
        if (!accessToken || !data!.programmeProperties.geographicalLocation) return;
        const locMarkers: MarkerData[] = [];
        for (const address in data!.programmeProperties.geographicalLocation) {
          const response = await Geocoding({ accessToken: accessToken })
            .forwardGeocode({
              query: data!.programmeProperties.geographicalLocation[address],
              autocomplete: false,
              limit: 1,
              types: ['region', 'district'],
              countries: [process.env.COUNTRY_CODE || 'NG'],
            })
            .send();

          if (
            !response ||
            !response.body ||
            !response.body.features ||
            !response.body.features.length
          ) {
            console.error('Invalid response:');
            console.error(response);
            return;
          }
          const feature = response.body.features[0];
          setCenterPoint(feature.center);
          const marker: MarkerData = {
            color: locationColors[(Number(address) + 1) % locationColors.length],
            location: feature.center,
          };
          locMarkers.push(marker);
        }
        setMarkers(locMarkers);
      }
    }, 1000);
  };

  const getProgrammeById = async (programmeId: string) => {
    try {
      const response: any = await post('national/programme/query', {
        page: 1,
        size: 2,
        filterAnd: [
          {
            key: 'programmeId',
            operation: '=',
            value: programmeId,
          },
        ],
      });
      if (response.data && response.data.length > 0) {
        const d = response.data[0];
        setData(d);
        navigate('.', { state: { record: d } });
      }
    } catch (error: any) {
      console.log('Error in getting programme', error);
      message.open({
        type: 'error',
        content: error.message,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    }
    setLoadingAll(false);
  };

  const addElement = (e: any, time: number, hist: any) => {
    time = Number(time);
    if (!hist[time]) {
      hist[time] = [];
    }
    hist[time].push(e);
  };

  const formatString = (langTag: string, vargs: any[]) => {
    const str = t(langTag);
    const parts = str.split('{}');
    let insertAt = 1;
    for (const arg of vargs) {
      parts.splice(insertAt, 0, arg);
      insertAt += 2;
    }
    return parts.join('');
  };

  const getDocuments = async (programmeId: string) => {
    setLoadingHistory(true);
    setLoadingNDC(true);
    try {
      const response: any = await post('national/programme/queryDocs', {
        page: 1,
        size: 100,
        filterAnd: [
          {
            key: 'programmeId',
            operation: '=',
            value: programmeId,
          },
        ],
      });
      if (response?.data?.length > 0) {
        const objectsWithoutNullActionId = response?.data.filter(
          (obj: any) => obj.actionId !== null
        );
        const objectsWithNullActionId = response?.data.filter((obj: any) => obj.actionId === null);
        const hasAcceptedMethReport = objectsWithNullActionId?.some(
          (item: any) =>
            item?.type === DocType.METHODOLOGY_DOCUMENT && item?.status === DocumentStatus.ACCEPTED
        );
        if (hasAcceptedMethReport && data?.currentStage === ProgrammeStageMRV.Authorised) {
          setUploadMonitoringReport(true);
        }
        setNdcActionData(objectsWithoutNullActionId);
        setDocumentsData(response?.data);
      }
    } catch (err: any) {
      console.log('Error in getting documents - ', err);
    } finally {
      setLoadingHistory(false);
      setLoadingNDC(false);
    }
  };

  const getInvestmentHistory = async (programmeId: string) => {
    setLoadingHistory(true);
    setLoadingInvestment(true);
    try {
      const response: any = await post('national/programme/investmentQuery', {
        page: 1,
        size: 100,
        filterAnd: [
          {
            key: 'programmeId',
            operation: '=',
            value: programmeId,
          },
        ],
      });
      const investmentHisData = response?.data?.map((item: any) => {
        const investmentData: any = {
          invester: item?.receiver[0]?.name,
          amount: item?.amount,
          createdAt: item?.createdTime,
          type: item?.type,
          level: item?.level,
          stream: item?.stream,
          status: item?.status,
          requestId: item?.requestId,
          sender: item?.sender,
        };
        return investmentData;
      });
      const elArr = investmentHisData?.map((investmentData: any, index: any) => {
        const element = {
          status: 'process',
          title: t('view:investment') + ' - ' + String(investmentData?.requestId), // Extracting the last 3 characters from actionNo
          subTitle: '',
          description: <InvestmentBody data={investmentData} translator={i18n} />,
          icon: (
            <span className="step-icon freeze-step">
              <Icon.Circle />
            </span>
          ),
        };
        return element;
      });
      setHistoryData(elArr);
    } catch (error: any) {
      console.log('Error in getting programme', error);
      message.open({
        type: 'error',
        content: error.message,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } finally {
      setLoadingHistory(false);
      setLoadingInvestment(false);
    }
  };

  const methodologyDocumentApproved = () => {
    if (data) {
      getProgrammeById(data?.programmeId);
    }
  };

  const getNdcActionHistory = async (programmeId: string, ndcActionDocs: any) => {
    setLoadingHistory(true);
    setLoadingNDC(true);
    try {
      const response: any = await post('national/programme/queryNdcActions', {
        page: 1,
        size: 100,
        filterAnd: [
          {
            key: 'programmeId',
            operation: '=',
            value: programmeId,
          },
        ],
      });
      const groupedByActionId = response.data.reduce((result: any, obj: any) => {
        const actionId = obj.id;
        if (!result[actionId]) {
          result[actionId] = [];
        }
        result[actionId].push(obj);
        return result;
      }, {});

      ndcActionData?.map((ndcData: any) => {
        if (Object.keys(groupedByActionId)?.includes(ndcData?.actionId)) {
          if (ndcData?.type === DocType.MONITORING_REPORT) {
            groupedByActionId[ndcData?.actionId][0].monitoringReport = ndcData;
          } else if (ndcData?.type === DocType.VERIFICATION_REPORT) {
            groupedByActionId[ndcData?.actionId][0].verificationReport = ndcData;
          }
        }
      });
      setNdcActionHistoryDataGrouped(groupedByActionId);
      const mappedElements = Object.keys(groupedByActionId).map((actionId) => ({
        status: 'process',
        title: actionId,
        subTitle: '',
        description: (
          <NdcActionBody
            data={groupedByActionId[actionId]}
            programmeId={data?.programmeId}
            programmeOwnerId={programmeOwnerId}
            canUploadMonitorReport={uploadMonitoringReport}
            getProgrammeDocs={() => getDocuments(String(data?.programmeId))}
            ministryLevelPermission={
              data &&
              userInfoState?.companyRole === CompanyRole.MINISTRY &&
              ministrySectoralScope.includes(data.sectoralScope) &&
              userInfoState?.userRole !== Role.ViewOnly
            }
            translator={i18n}
            useConnection={useConnection}
            useUserContext={useUserContext}
          />
        ),
        icon: (
          <span className="step-icon freeze-step">
            <Icon.Circle />
          </span>
        ),
      }));
      setNdcActionHistoryData(mappedElements);
    } catch (error: any) {
      console.log('Error in getting programme', error);
      message.open({
        type: 'error',
        content: error.message,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } finally {
      setLoadingHistory(false);
      setLoadingNDC(false);
    }
  };

  const mapArrayToi18n = (map: any) => {
    if (!map) {
      return {};
    }

    const info: any = {};
    Object.entries(map).forEach(([k, v]) => {
      const text = t('view:' + k);
      if (v instanceof UnitField) {
        const unitField = v as UnitField;
        info[text + ` (${unitField.unit})`] = unitField.value;
      } else {
        info[text] = v;
      }
    });
    return info;
  };

  const onClickedAddAction = () => {
    navigate('/programmeManagement/addNdcAction', { state: { record: data } });
  };

  const getUserDetails = async () => {
    setLoadingAll(true);
    try {
      const response: any = await post('national/user/query', {
        page: 1,
        size: 10,
        filterAnd: [
          {
            key: 'id',
            operation: '=',
            value: userInfoState?.id,
          },
        ],
      });
      if (response && response.data) {
        if (
          response?.data[0]?.companyRole === CompanyRole.MINISTRY &&
          response?.data[0]?.company &&
          response?.data[0]?.company?.sectoralScope
        ) {
          setMinistrySectoralScope(response?.data[0]?.company?.sectoralScope);
        }
      }
      setLoadingAll(false);
    } catch (error: any) {
      console.log('Error in getting users', error);
      message.open({
        type: 'error',
        content: error.message,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      setLoadingAll(false);
    }
  };

  useEffect(() => {
    if (userInfoState?.companyRole === CompanyRole.MINISTRY) {
      getUserDetails();
    }

    if (state && state.record) {
      setLoadingAll(false);
      setData(state.record);
    } else {
      if (id) {
        getProgrammeById(id);
      } else {
        navigate('/programmeManagement/viewAll', { replace: true });
      }
    }
  }, []);

  useEffect(() => {
    if (data) {
      getInvestmentHistory(data?.programmeId);
      getDocuments(data?.programmeId);
      setEmissionsReductionExpected(
        data?.emissionReductionExpected !== null || data?.emissionReductionExpected !== undefined
          ? Number(data?.emissionReductionExpected)
          : 0
      );
      setEmissionsReductionAchieved(
        data?.emissionReductionAchieved !== null || data?.emissionReductionAchieved !== undefined
          ? Number(data?.emissionReductionAchieved)
          : 0
      );
      drawMap();
      for (const company of data.company) {
        if (
          parseInt(company.state) === CompanyState.ACTIVE.valueOf() &&
          company.companyId !== userInfoState?.companyId
        ) {
          setIsAllOwnersDeactivated(false);
          break;
        }
      }
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      setProgrammeOwnerId(data?.companyId);
      setCurrentProgrammeStatus(data?.currentStage);
      getNdcActionHistory(data?.programmeId, ndcActionData);
    }
  }, [data, ndcActionData]);

  if (!data) {
    return <Loading />;
  }

  const percentages: any[] = [];

  const companies: any = {};
  for (const c of data.company) {
    companies[c.companyId] = c;
  }
  data.companyId.forEach((obj: any, index: number) => {
    percentages.push({
      company: companies[obj],
      percentage: data.proponentPercentage ? data.proponentPercentage[index] : 100,
    });
  });
  percentages.sort((a: any, b: any) => b.percentage - a.percentage);

  const elements = percentages.map((ele: any, index: number) => {
    return (
      <div className="">
        <div className="company-info">
          {isBase64(ele.company.logo) ? (
            <img alt="company logo" src={'data:image/jpeg;base64,' + ele.company.logo} />
          ) : ele.company.logo ? (
            <img alt="company logo" src={ele.company.logo} />
          ) : ele.company.name ? (
            <div className="programme-logo">{ele.company.name.charAt(0).toUpperCase()}</div>
          ) : (
            <div className="programme-logo">{'A'}</div>
          )}
          <div className="text-center programme-name">{ele.company.name}</div>
          <div className="progress-bar">
            <div>
              <div className="float-left">{t('view:ownership')}</div>
              <div className="float-right">{ele.percentage}%</div>
            </div>
            <Progress percent={ele.percentage} strokeWidth={7} status="active" showInfo={false} />
          </div>
          <OrganisationStatus
            organisationStatus={parseInt(ele.company.state)}
            t={companyProfileTranslations}
          ></OrganisationStatus>
        </div>
      </div>
    );
  });
  // genCerts(data);
  const actionBtns = [];

  if (userInfoState && data.currentStage !== ProgrammeStageMRV.Rejected) {
    if (
      userInfoState?.companyRole === CompanyRole.GOVERNMENT ||
      (userInfoState?.companyRole === CompanyRole.PROGRAMME_DEVELOPER &&
        data.companyId.map((e) => Number(e)).includes(userInfoState?.companyId)) ||
      (userInfoState?.companyRole === CompanyRole.MINISTRY &&
        ministrySectoralScope.includes(data.sectoralScope) &&
        userInfoState?.userRole !== Role.ViewOnly)
    ) {
      actionBtns.push(
        <Button
          type="primary"
          onClick={() => {
            navigate('/investmentManagement/addInvestment', { state: { record: data } });
          }}
        >
          {t('view:addInvestment')}
        </Button>
      );
      actionBtns.push(
        <Tooltip
          title={'Cannot submit until methodology document is approved.'}
          color={TooltipColor}
          key={TooltipColor}
        >
          <Button disabled>{t('view:addAction')}</Button>
        </Tooltip>
      );
      if ((data.currentStage as any) !== 'AwaitingAuthorization') {
        actionBtns.pop();
        actionBtns.push(
          <Button type="primary" onClick={onClickedAddAction}>
            {t('view:addAction')}
          </Button>
        );
      }
    }
  }

  const generalInfo: any = {};
  Object.entries(getGeneralFields(data, CarbonSystemType.MRV)).forEach(([k, v]) => {
    const text = t('view:' + k);
    if (k === 'currentStatus') {
      generalInfo[text] = (
        <Tag color={getStageTagTypeMRV(v as ProgrammeStageMRV)}>{getStageEnumVal(v as string)}</Tag>
      );
    } else if (k === 'sector') {
      generalInfo[text] = (
        <Tag color={v === 'Agriculture' ? 'success' : 'processing'}>{v as string}</Tag>
      );
    } else if (k === 'applicationType') {
      generalInfo[text] = (
        <span>
          <RoleIcon icon={<ExperimentOutlined />} bg={DevBGColor} color={DevColor} />
          <span>{v as string}</span>
        </span>
      );
    } else if (k === 'emissionsReductionExpected' || k === 'emissionsReductionAchieved') {
      generalInfo[text] = addCommSep(v);
    } else {
      generalInfo[text] = v;
    }
  });

  let calculations: any = {};
  if (data.typeOfMitigation === TypeOfMitigation.AGRICULTURE) {
    if (data.agricultureProperties) {
      calculations = data.agricultureProperties;
      if (calculations.landAreaUnit) {
        calculations.landArea = new UnitField(
          data.agricultureProperties.landAreaUnit,
          addCommSep(data.agricultureProperties.landArea)
        );
      }
      delete calculations.landAreaUnit;
    }
  } else if (data.typeOfMitigation === TypeOfMitigation.SOLAR) {
    if (data.solarProperties) {
      calculations = data.solarProperties;
      if (calculations.energyGenerationUnit) {
        calculations.energyGeneration = new UnitField(
          data.solarProperties.energyGenerationUnit,
          addCommSep(data.solarProperties.energyGeneration)
        );
      } else if (calculations.consumerGroup && typeof calculations.consumerGroup === 'string') {
        calculations.consumerGroup = (
          <Tag color={'processing'}>{addSpaces(calculations.consumerGroup)}</Tag>
        );
      }
      delete calculations.energyGenerationUnit;
    }
  }
  if (calculations) {
    calculations.constantVersion = data.constantVersion;
  }

  const getFileName = (filepath: string) => {
    const index = filepath.indexOf('?');
    if (index > 0) {
      filepath = filepath.substring(0, index);
    }
    const lastCharcter = filepath.charAt(filepath.length - 1);
    if (lastCharcter === '/') {
      filepath = filepath.slice(0, -1);
    }
    return filepath.substring(filepath.lastIndexOf('/') + 1);
  };

  const fileItemContent = (filePath: any) => {
    return (
      <Row className="field" key={filePath}>
        <Col span={12} className="field-key">
          <a target="_blank" href={filePath} rel="noopener noreferrer" className="file-name">
            {getFileName(filePath)}
          </a>
        </Col>
        <Col span={12} className="field-value">
          <a target="_blank" href={filePath} rel="noopener noreferrer" className="file-name">
            <Icon.Link45deg style={{ verticalAlign: 'middle' }} />
          </a>
        </Col>
      </Row>
    );
  };

  const getFileContent = (files: any) => {
    if (Array.isArray(files)) {
      return files.map((filePath: any) => {
        return fileItemContent(filePath);
      });
    } else {
      return fileItemContent(files);
    }
  };

  return loadingAll ? (
    <Loading />
  ) : (
    <div className="content-container programme-view custom-tooltip">
      <div className="title-bar">
        <div>
          <div className="body-title">{t('view:details')}</div>
          <div className="body-sub-title">{t('view:desc')}</div>
        </div>
        <div className="flex-display action-btns margin-left-1">{actionBtns}</div>
      </div>
      <div className="content-body">
        <Row gutter={16}>
          <Col md={24} lg={10}>
            <Card className="card-container">
              <div className="info-view">
                <div className="title">
                  <span className="title-icon">
                    {
                      <span className="b-icon">
                        <Icon.Building />
                      </span>
                    }
                  </span>
                  <span className="title-text">{t('view:programmeOwner')}</span>
                </div>
                <div className="centered-card">{elements}</div>
              </div>
            </Card>
            {(emissionsReductionExpected !== 0 || emissionsReductionAchieved !== 0) && (
              <Card className="card-container">
                <div className="info-view">
                  <div className="title">
                    <span className="title-icon">{<BlockOutlined />}</span>
                    <span className="title-text">
                      {formatString('view:emissionsReductions', [])}
                    </span>
                  </div>
                  <div className="map-content">
                    <Chart
                      id={'creditChart'}
                      options={{
                        labels: ['Achieved', 'Pending'],
                        legend: {
                          position: 'bottom',
                        },
                        colors: ['#b3b3ff', '#e0e0eb'],
                        tooltip: {
                          fillSeriesColor: false,
                          enabled: true,
                          y: {
                            formatter: function (value: any) {
                              return addCommSepRound(value);
                            },
                          },
                        },
                        states: {
                          normal: {
                            filter: {
                              type: 'none',
                              value: 0,
                            },
                          },
                          hover: {
                            filter: {
                              type: 'none',
                              value: 0,
                            },
                          },
                          active: {
                            allowMultipleDataPointsSelection: true,
                            filter: {
                              type: 'darken',
                              value: 0.7,
                            },
                          },
                        },
                        stroke: {
                          colors: ['#00'],
                        },
                        plotOptions: {
                          pie: {
                            expandOnClick: false,
                            donut: {
                              labels: {
                                show: true,
                                total: {
                                  showAlways: true,
                                  show: true,
                                  label: 'Expected',
                                  formatter: () => '' + addCommSep(data?.emissionReductionExpected),
                                },
                              },
                            },
                          },
                        },
                        dataLabels: {
                          enabled: false,
                        },
                        responsive: [
                          {
                            breakpoint: 480,
                            options: {
                              chart: {
                                width: '15vw',
                              },
                              legend: {
                                position: 'bottom',
                              },
                            },
                          },
                        ],
                      }}
                      series={[
                        emissionsReductionAchieved,
                        emissionsReductionExpected - emissionsReductionAchieved,
                      ]}
                      type="donut"
                      width="100%"
                      fontFamily="inter"
                    />
                  </div>
                </div>
              </Card>
            )}
            <Card className="card-container">
              <div>
                <ProgrammeDocuments
                  data={documentsData}
                  title={t('view:programmeDocs')}
                  icon={<QrcodeOutlined />}
                  programmeId={data?.programmeId}
                  programmeOwnerId={programmeOwnerId}
                  getDocumentDetails={() => {
                    getDocuments(data?.programmeId);
                  }}
                  getProgrammeById={() => {
                    getProgrammeById(data?.programmeId);
                  }}
                  ministryLevelPermission={
                    data &&
                    userInfoState?.companyRole === CompanyRole.MINISTRY &&
                    ministrySectoralScope.includes(data.sectoralScope) &&
                    userInfoState?.userRole !== Role.ViewOnly
                  }
                  useConnection={useConnection}
                  useUserContext={useUserContext}
                  translator={i18n}
                  methodologyDocumentUpdated={methodologyDocumentApproved}
                  programmeStatus={data?.currentStage}
                />
              </div>
            </Card>
            {mapType !== MapTypes.None ? (
              <Card className="card-container">
                <div className="info-view">
                  <div className="title">
                    <span className="title-icon">{<Icon.PinMap />}</span>
                    <span className="title-text">{t('view:location')}</span>
                  </div>
                  <div className="map-content">
                    <MapComponent
                      mapType={mapType}
                      center={centerPoint}
                      zoom={4}
                      markers={markers}
                      height={250}
                      style="mapbox://styles/mapbox/streets-v11"
                      accessToken={accessToken}
                    ></MapComponent>
                    <Row className="region-list">
                      {data.programmeProperties.geographicalLocation &&
                        data.programmeProperties.geographicalLocation.map((e: any, idx: number) => (
                          <Col className="loc-tag">
                            {data.geographicalLocationCordintes &&
                              data.geographicalLocationCordintes[idx] !== null &&
                              data.geographicalLocationCordintes[idx] !== undefined && (
                                <span
                                  style={{
                                    color: locationColors[(idx + 1) % locationColors.length],
                                  }}
                                  className="loc-icon"
                                >
                                  {<Icon.GeoAltFill />}
                                </span>
                              )}
                            <span className="loc-text">{e}</span>
                          </Col>
                        ))}
                    </Row>
                  </div>
                </div>
              </Card>
            ) : (
              ''
            )}
          </Col>
          <Col md={24} lg={14}>
            <Card className="card-container">
              <div>
                <InfoView data={generalInfo} title={t('view:general')} icon={<BulbOutlined />} />
              </div>
            </Card>
            <Card className="card-container">
              <div>
                <InfoView
                  data={mapArrayToi18n(getFinancialFields(data))}
                  title={t('view:financial')}
                  icon={
                    <span className="b-icon">
                      <Icon.Cash />
                    </span>
                  }
                />
              </div>
            </Card>
            {historyData?.length > 0 && (
              <Card className="card-container">
                <div className="info-view">
                  <div className="title">
                    <span className="title-icon">{<ClockCircleOutlined />}</span>
                    <span className="title-text">{t('view:investment')}</span>
                  </div>
                  <div className="content">
                    {loadingInvestment ? (
                      <Skeleton />
                    ) : (
                      <Steps current={0} direction="vertical" items={historyData} />
                    )}
                  </div>
                </div>
              </Card>
            )}
            {ndcActionHistoryData?.length > 0 && (
              <Card className="card-container">
                <div className="info-view">
                  <div className="title">
                    <span className="title-icon">{<ExperimentOutlined />}</span>
                    <span className="title-text">{t('view:ndcActions')}</span>
                  </div>
                  <div className="content">
                    {loadingNDC ? (
                      <Skeleton />
                    ) : (
                      <Steps current={0} direction="vertical" items={ndcActionHistoryData} />
                    )}
                  </div>
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProgrammeView;
