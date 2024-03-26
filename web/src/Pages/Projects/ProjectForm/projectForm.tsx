import { useTranslation } from 'react-i18next';
import {
  Row,
  Col,
  Input,
  Button,
  Form,
  Select,
  Card,
  message,
  Popover,
  List,
  Typography,
} from 'antd';
import {
  CloseCircleOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { useNavigate } from 'react-router-dom';
import UploadFileGrid from '../../../Components/Upload/uploadFiles';
import AttachEntity from '../../../Components/Popups/attach';
import { useConnection } from '@undp/carbon-library';
import { GraphUpArrow } from 'react-bootstrap-icons';
import './projectForm.scss';

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

type ProgrammeData = {
  id: string;
  title: string;
};

type KpiData = {
  index: number;
  name: string;
  unit: string;
  creatorType: string;
  achieved: number;
  expected: number;
};

type ActivityData = {
  key: string;
  activityId: string;
  title: string;
  reductionMeasures: string;
  status: string;
  startYear: number;
  endYear: number;
  natImplementor: string;
};

type SupportData = {
  key: string;
  supportId: string;
  financeNature: string;
  direction: string;
  finInstrument: string;
  estimatedUSD: number;
  estimatedLC: number;
  recievedUSD: number;
  recievedLC: number;
};

const ProjectForm: React.FC<Props> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['projectForm']);
  const isView: boolean = method === 'view' ? true : false;

  const navigate = useNavigate();
  const { post } = useConnection();

  // form state

  const [programmeList, setProgrammeList] = useState<ProgrammeData[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; title: string; data: string }[]>(
    []
  );

  // Popover state

  const [detachOpen, setDetachOpen] = useState<boolean[]>([]);

  // Activities state

  const [allActivityIds, setAllActivityList] = useState<string[]>([]);
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [activityCurrentPage, setActivityCurrentPage] = useState<any>(1);
  const [activityPageSize, setActivityPageSize] = useState<number>(10);

  // Supports state

  const [supportData, setSupportData] = useState<SupportData[]>([]);
  const [supportCurrentPage, setSupportCurrentPage] = useState<any>(1);
  const [supportPageSize, setSupportPageSize] = useState<number>(10);

  // KPI State

  const [kpiList, setKpiList] = useState<KpiData[]>([]);

  // TODO : Connect to the BE Endpoints for data fetching
  // Initialization Logic

  const yearsList: number[] = [];

  for (let year = 2013; year <= 2050; year++) {
    yearsList.push(year);
  }

  useEffect(() => {
    const programmeData: ProgrammeData[] = [];
    for (let i = 0; i < 5; i++) {
      programmeData.push({
        id: 'P001',
        title: `Xep Energy 00${i}`,
      });
    }
    setProgrammeList(programmeData);

    const activityIds: string[] = [];
    for (let i = 0; i < 15; i++) {
      activityIds.push(`T00${i}`);
    }
    setAllActivityList(activityIds);
  }, []);

  useEffect(() => {
    const tempActivityData: ActivityData[] = [];
    selectedActivityIds.forEach((actId) => {
      tempActivityData.push({
        key: actId,
        activityId: actId,
        title: 'Title',
        reductionMeasures: 'With Measures',
        status: 'Planned',
        startYear: 2014,
        endYear: 2016,
        natImplementor: 'Department of Energy',
      });
    });
    setActivityData(tempActivityData);

    // Get the Support Data for each attached Activity
    setSupportData([]);
    setDetachOpen(Array(selectedActivityIds.length).fill(false));
  }, [selectedActivityIds]);

  useEffect(() => {
    if (method !== 'create') {
      console.log('Get the Action Information and load them');
    }

    form.setFieldsValue({
      actionTitle: 'Increase Renewable Electricity Generation',
      programmeTitle: 'Increase Grid Connected generation',
      natAnchor: 'NDC',
      instrTypes: 'Policy',
      sectorsAffected: 'Energy',
      subSectorsAffected: 'Grid-Connected Generation',
      natImplementor: 'Department of Energy',
      techDevContribution: 'Yes',
      capBuildObjectives: 'Yes',
      techType: 'Renewable Energy',
      neededUSD: 1000000,
      neededSCR: 2500000,
      recievedUSD: 50000,
      recievedSCR: 86520,
    });
  }, [selectedActivityIds, kpiList]);

  // Form Submit

  const handleSubmit = async (payload: any) => {
    try {
      for (const key in payload) {
        if (key.startsWith('kpi_')) {
          delete payload[key];
        }
      }
      payload.documents = [];
      uploadedFiles.forEach((file) => {
        payload.documents.push({ title: file.title, data: file.data });
      });

      payload.kpis = [];
      kpiList.forEach((kpi) => {
        payload.kpis.push({ name: kpi.name, creatorType: kpi.creatorType, expected: kpi.expected });
      });

      payload.linkedActivities = selectedActivityIds;

      payload.achieved = parseFloat(payload.achieved);
      payload.expected = parseFloat(payload.expected);

      const response = await post('national/project/add', payload);
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
    const newItem: KpiData = {
      index: kpiList.length,
      name: '',
      unit: '',
      creatorType: 'programme',
      expected: 0,
      achieved: 0,
    };
    setKpiList((prevList) => [...prevList, newItem]);
  };

  const removeKPI = (kpiIndex: number) => {
    setKpiList(kpiList.filter((obj) => obj.index !== kpiIndex));

    const updatedValues = {
      [`kpi_name_${kpiIndex}`]: '',
      [`kpi_unit_${kpiIndex}`]: '',
      [`kpi_exp_${kpiIndex}`]: '',
    };

    form.setFieldsValue(updatedValues);
  };

  const updateKPI = (id: number, property: keyof KpiData, value: any): void => {
    setKpiList((prevKpiList) => {
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

  const handleDetachOpen = (record: any) => {
    const newOpenList = Array(selectedActivityIds.length).fill(false);
    newOpenList[selectedActivityIds.indexOf(record.projectId)] = true;
    setDetachOpen(newOpenList);
  };

  const detachActivity = (actId: string) => {
    const filteredData = activityData.filter((act) => act.activityId !== actId);
    const filteredIds = selectedActivityIds.filter((id) => id !== actId);
    setActivityData(filteredData);
    setSelectedActivityIds(filteredIds);
  };

  // Action Menu definition

  const actionMenu = (record: any) => {
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
                detachActivity(record.projectId);
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

  // Activity Column Definition

  const activityTableColumns = [
    { title: t('activityIdTitle'), dataIndex: 'activityId', key: 'activityId' },
    { title: t('titleTitle'), dataIndex: 'title', key: 'title' },
    { title: t('redMeasuresTitle'), dataIndex: 'reductionMeasures', key: 'reductionMeasures' },
    { title: t('statusTitle'), dataIndex: 'status', key: 'status' },
    { title: t('startYearTitle'), dataIndex: 'startYear', key: 'startYear' },
    { title: t('endYearTitle'), dataIndex: 'endYear', key: 'endYear' },
    { title: t('natImplementorTitle'), dataIndex: 'natImplementor', key: 'natImplementor' },
    {
      title: '',
      key: 'activityAction',
      align: 'right' as const,
      width: 6,
      render: (record: any) => {
        return (
          <Popover
            placement="bottomRight"
            content={actionMenu(record)}
            trigger="click"
            open={detachOpen[selectedActivityIds.indexOf(record.activityId)]}
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

  // Activity Column Definition

  const supportTableColumns = [
    { title: t('supportIdTitle'), dataIndex: 'supportId', key: 'activityId' },
    { title: t('financeNatureTitle'), dataIndex: 'financeNature', key: 'financeNature' },
    { title: t('directionTitle'), dataIndex: 'direction', key: 'direction' },
    { title: t('finInstrumentTitle'), dataIndex: 'finInstrument', key: 'finInstrument' },
    { title: t('estimatedUSDTitle'), dataIndex: 'estimatedUSD', key: 'estimatedUSD' },
    { title: t('estimatedLCTitle'), dataIndex: 'estimatedLC', key: 'estimatedLC' },
    { title: t('recievedUSDTitle'), dataIndex: 'recievedUSD', key: 'recievedUSD' },
    { title: t('recievedLCTitle'), dataIndex: 'recievedLC', key: 'recievedLC' },
  ];

  // Activity Table Behaviour

  const handleActivityTableChange = (pagination: any) => {
    setActivityCurrentPage(pagination.current);
    setActivityPageSize(pagination.pageSize);
  };

  // Activity Table Behaviour

  const handleSupportTableChange = (pagination: any) => {
    setSupportCurrentPage(pagination.current);
    setSupportPageSize(pagination.pageSize);
  };

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('addProgTitle')}</div>
        <div className="body-sub-title">{t('addProgDesc')}</div>
      </div>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <div className="form-card">
          <div style={{ color: '#3A3541', opacity: 0.8, marginBottom: '25px', fontWeight: 'bold' }}>
            {t('generalInfoTitle')}
          </div>
          <Row gutter={gutterSize}>
            <Col span={12}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('selectProgrammeHeader')}
                  </label>
                }
                name="programmeId"
                rules={[validation.required]}
              >
                <Select
                  size={'large'}
                  style={{ fontSize: inputFontSize }}
                  allowClear
                  disabled={isView}
                  showSearch
                >
                  {programmeList.map((program) => (
                    <Option key={program.id} value={program.id}>
                      {program.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<label style={{ color: '#3A3541', opacity: 0.8 }}>{t('typeHeader')}</label>}
                name="type"
                rules={[validation.required]}
              >
                <Select
                  size={'large'}
                  style={{ fontSize: inputFontSize }}
                  allowClear
                  disabled={isView}
                  showSearch
                >
                  {programmeList.map((program) => (
                    <Option key={program.id} value={program.id}>
                      {program.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutterSize}>
            <Col span={12}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('projTitleHeader')}</label>
                }
                name="title"
                rules={[validation.required]}
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('projDescHeader')}</label>
                }
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
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('projectNumberHeader')}
                  </label>
                }
                name="addProjectNumber"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('actionTitleHeader')}</label>
                }
                name="actionTitle"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutterSize}>
            <Col span={12}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('programmeTitleHeader')}
                  </label>
                }
                name="programmeTitle"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('natAnchorHeader')}</label>
                }
                name="natAnchor"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutterSize}>
            <Col span={12}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('instrTypesHeader')}</label>
                }
                name="instrTypes"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('projectStatusHeader')}
                  </label>
                }
                name="status"
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
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('sectorsAffectedHeader')}
                  </label>
                }
                name="sectorsAffected"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('subSectorsAffectedHeader')}
                  </label>
                }
                name="subSectorsAffected"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('startYearHeader')}</label>
                }
                name="startYear"
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
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('endYearHeader')}</label>
                }
                name="endYear"
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
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('timeFrameHeader')}</label>
                }
                name="timeFrame"
                rules={[validation.required, validation.number]}
              >
                <Input type="number" style={{ fontSize: inputFontSize, height: '40px' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item<number>
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('natImplementorHeader')}
                  </label>
                }
                name="natImplementor"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<number>
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('techTypeHeader')}</label>
                }
                name="techType"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutterSize}>
            <Col span={12}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('recipientHeader')}</label>
                }
                name="recipient"
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
            <Col span={12}>
              <Form.Item<number>
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('intImplementorHeader')}
                  </label>
                }
                name="intImplementor"
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
              <Form.Item<number>
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('techDevHeader')}</label>
                }
                name="techDevContribution"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<number>
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('capBuildHeader')}</label>
                }
                name="capBuildObjectives"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
          </Row>
          <UploadFileGrid
            uploadedFiles={uploadedFiles}
            horizontalGutter={gutterSize}
            verticalGutter={10}
            buttonText={t('upload')}
            height={'40px'}
            acceptedFiles=".xlsx,.xls,.ppt,.pptx,.docx,.csv,.png,.jpg"
            style={{ marginBottom: '25px' }}
            setUploadedFiles={setUploadedFiles}
            isView={isView}
          ></UploadFileGrid>
          <div style={{ color: '#3A3541', opacity: 0.8, marginBottom: '25px', fontWeight: 'bold' }}>
            {t('mitigationInfoTitle')}
          </div>
          <Row gutter={gutterSize}>
            <Col span={12}>
              <Form.Item
                label={<label style={{ color: '#3A3541', opacity: 0.8 }}>{t('ghgAffected')}</label>}
                name="ghgsAffected"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ color: '#3A3541', opacity: 0.8, marginTop: '10px', marginBottom: '10px' }}>
            {t('emmissionInfoTitle')}
          </div>
          <Row gutter={gutterSize}>
            <Col span={12}>
              <Form.Item
                label={<label style={{ color: '#3A3541', opacity: 0.8 }}>{t('achieved')}</label>}
                name="achievedReduct"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<label style={{ color: '#3A3541', opacity: 0.8 }}>{t('expected')}</label>}
                name="expectedReduct"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ color: '#3A3541', opacity: 0.8, marginTop: '10px', marginBottom: '10px' }}>
            {t('kpiInfoTitle')}
          </div>
          {kpiList.map((kpi: any) => (
            <Row key={kpi.index} gutter={gutterSize} style={{ height: '80px' }}>
              <Col span={12}>
                <Row gutter={gutterSize}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('kpiName')}</label>
                      }
                      name={`kpi_name_${kpi.index}`}
                      rules={[validation.required]}
                    >
                      <Input
                        style={{ fontSize: inputFontSize, height: '40px' }}
                        disabled={isView}
                        onChange={(e) => {
                          updateKPI(kpi.index, 'name', e.target.value);
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('kpiUnit')}</label>
                      }
                      name={`kpi_unit_${kpi.index}`}
                      rules={[validation.required]}
                    >
                      <Input
                        style={{ fontSize: inputFontSize, height: '40px' }}
                        disabled={isView}
                        onChange={(e) => {
                          updateKPI(kpi.index, 'unit', e.target.value);
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={12}>
                <Row gutter={15}>
                  <Col span={11}>
                    <Form.Item
                      label={
                        <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('achieved')}</label>
                      }
                    >
                      <Input
                        style={{ fontSize: inputFontSize, height: '40px' }}
                        value={kpi.achieved}
                        disabled={true}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={11}>
                    <Form.Item
                      label={
                        <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('expected')}</label>
                      }
                      name={`kpi_exp_${kpi.index}`}
                      rules={[validation.required, validation.number]}
                    >
                      <Input
                        type="number"
                        style={{ fontSize: inputFontSize, height: '40px' }}
                        disabled={isView}
                        onChange={(e) => {
                          updateKPI(kpi.index, 'expected', e.target.value);
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Card
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '0px',
                        width: '30px',
                        height: '30px',
                        marginTop: '36px',
                        borderWidth: '1px',
                        borderRadius: '4px',
                        borderColor: '#d9d9d9',
                      }}
                    >
                      <DeleteOutlined
                        style={{ cursor: 'pointer', color: '#3A3541', opacity: 0.8 }}
                        onClick={() => {
                          removeKPI(kpi.index);
                        }}
                      />
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          ))}
          <Row justify={'start'}>
            <Col span={2}>
              {!isView && (
                <Button
                  icon={<PlusCircleOutlined />}
                  style={{
                    marginTop: '5px',
                    marginBottom: '15px',
                    border: 'none',
                    color: '#3A3541',
                    opacity: 0.8,
                    padding: 0,
                  }}
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
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('programmeCommentsTitle')}
                  </label>
                }
                name="comments"
                rules={[validation.required]}
              >
                <TextArea rows={3} disabled={isView} />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ color: '#3A3541', opacity: 0.8, marginBottom: '25px', fontWeight: 'bold' }}>
            {t('financeInfoTitle')}
          </div>
          <Row gutter={gutterSize}>
            <Col span={6}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('neededUSDHeader')}</label>
                }
                name="neededUSD"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('neededSCRHeader')}</label>
                }
                name="neededSCR"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('recievedUSDHeader')}</label>
                }
                name="recievedUSD"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('recievedSCRHeader')}</label>
                }
                name="recievedSCR"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
          </Row>
        </div>
        <div className="form-card">
          <Row>
            <Col span={6}>
              <div
                style={{ color: '#3A3541', opacity: 0.8, marginBottom: '25px', fontWeight: 'bold' }}
              >
                {t('activityInfoTitle')}
              </div>
            </Col>
            <Col span={4}>
              <AttachEntity
                isDisabled={isView}
                options={allActivityIds}
                content={{
                  buttonName: t('attachActivity'),
                  attach: t('attach'),
                  contentTitle: t('attachActivity'),
                  listTitle: t('activityList'),
                  cancel: t('cancel'),
                }}
                attachedUnits={selectedActivityIds}
                setAttachedUnits={setSelectedActivityIds}
                icon={<GraphUpArrow style={{ fontSize: '120px' }} />}
              ></AttachEntity>
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
                  emptyMessage={t('noActivityMessage')}
                />{' '}
              </div>
            </Col>
          </Row>
        </div>
        <div className="form-card">
          <Row>
            <Col span={6}>
              <div
                style={{ color: '#3A3541', opacity: 0.8, marginBottom: '25px', fontWeight: 'bold' }}
              >
                {t('supportInfoTitle')}
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <div style={{ overflowX: 'auto' }}>
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
              </div>
            </Col>
          </Row>
        </div>
        {isView && (
          <div className="form-card">
            <div
              style={{ color: '#3A3541', opacity: 0.8, marginBottom: '25px', fontWeight: 'bold' }}
            >
              {t('updatesInfoTitle')}
            </div>
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
      </Form>
    </div>
  );
};

export default ProjectForm;
