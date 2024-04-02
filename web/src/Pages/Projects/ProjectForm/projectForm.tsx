import { useTranslation } from 'react-i18next';
import { Row, Col, Input, Button, Form, Select, message, Popover, List, Typography } from 'antd';
import { CloseCircleOutlined, EllipsisOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { useNavigate } from 'react-router-dom';
import UploadFileGrid from '../../../Components/Upload/uploadFiles';
import AttachEntity from '../../../Components/Popups/attach';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { GraphUpArrow } from 'react-bootstrap-icons';
import './projectForm.scss';
import { ProjectStatus, ProjectType } from '../../../Enums/project.enum';
import { IntImplementor, Recipient } from '../../../Enums/shared.enum';
import { KpiGrid } from '../../../Components/KPI/kpiGrid';

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

type NewKpiData = {
  index: number;
  name: string;
  unit: string;
  creatorType: string;
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

  const [newKpiList, setNewKpiList] = useState<NewKpiData[]>([]);
  const [migratedKpiList, setMigratedKpiList] = useState<number[]>([]);

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
        id: `P00${i}`,
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
    console.log('Running Migration Update');

    if (method !== 'create') {
      console.log('Get the Action Information and load them');
    }

    // Get Migrated Data for the Activities
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
      neededLCL: 2500000,
      recievedUSD: 50000,
      recievedLCL: 86520,
    });

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
      newKpiList.forEach((kpi) => {
        payload.kpis.push({ name: kpi.name, creatorType: kpi.creatorType, expected: kpi.expected });
      });

      payload.linkedActivities = selectedActivityIds;

      payload.timeFrame = parseFloat(payload.timeFrame);
      payload.startYear = parseInt(payload.startYear);
      payload.endYear = parseInt(payload.endYear);
      payload.achievedReduct = parseFloat(payload.achievedReduct);
      payload.expectedReduct = parseFloat(payload.expectedReduct);

      console.log(payload);

      const response = await post('national/project/add', payload);
      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: t('projectCreationSuccess'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        navigate('/projects');
      }
    } catch (error: any) {
      console.log('Error in project creation', error);
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

  // Dettach Project

  const handleDetachOpen = (record: ActivityData) => {
    console.log(record);
    const newOpenList = Array(selectedActivityIds.length).fill(false);
    newOpenList[selectedActivityIds.indexOf(record.activityId)] = true;
    setDetachOpen(newOpenList);
  };

  const detachActivity = (actId: string) => {
    console.log(actId);
    const filteredData = activityData.filter((act) => act.activityId !== actId);
    const filteredIds = selectedActivityIds.filter((id) => id !== actId);
    setActivityData(filteredData);
    setSelectedActivityIds(filteredIds);
  };

  // Action Menu definition

  const actionMenu = (record: ActivityData) => {
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
                detachActivity(record.activityId);
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
    { title: t('startYearHeader'), dataIndex: 'startYear', key: 'startYear' },
    { title: t('endYearHeader'), dataIndex: 'endYear', key: 'endYear' },
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
    { title: t('neededUSDHeader'), dataIndex: 'estimatedUSD', key: 'estimatedUSD' },
    { title: t('neededLCLHeader'), dataIndex: 'estimatedLC', key: 'estimatedLC' },
    { title: t('recievedUSDHeader'), dataIndex: 'recievedUSD', key: 'recievedUSD' },
    { title: t('recievedLCLHeader'), dataIndex: 'recievedLC', key: 'recievedLC' },
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
        <div className="body-title">{t('addProjTitle')}</div>
        <div className="body-sub-title">{t('addProjDesc')}</div>
      </div>
      <div className="project-form">
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <div className="form-section-card">
            <div className="form-section-header">{t('generalInfoTitle')}</div>
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
                  label={<label className="form-item-header">{t('typeHeader')}</label>}
                  name="type"
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {Object.values(ProjectType).map((instrument) => (
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
                  label={<label className="form-item-header">{t('projTitleHeader')}</label>}
                  name="title"
                  rules={[validation.required]}
                >
                  <Input className="form-input-box" />
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
                  name="addProjectNumber"
                >
                  <Input className="form-input-box" />
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
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('instrTypesHeader')}</label>}
                  name="instrTypes"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('projectStatusHeader')}</label>}
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
                    {Object.values(ProjectStatus).map((instrument) => (
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
                  label={<label className="form-item-header">{t('sectorsAffectedHeader')}</label>}
                  name="sectorsAffected"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={
                    <label className="form-item-header">{t('subSectorsAffectedHeader')}</label>
                  }
                  name="subSectorsAffected"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('startYearHeader')}</label>}
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
                  label={<label className="form-item-header">{t('endYearHeader')}</label>}
                  name="endYear"
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
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('timeFrameHeader')}</label>}
                  name="timeFrame"
                  rules={[validation.required]}
                >
                  <Input type="number" className="form-input-box" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item<number>
                  label={<label className="form-item-header">{t('natImplementorHeader')}</label>}
                  name="natImplementor"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<number>
                  label={<label className="form-item-header">{t('techTypeHeader')}</label>}
                  name="techType"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('recipientHeader')}</label>}
                  name="recipient"
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
                    {Object.values(Recipient).map((instrument) => (
                      <Option key={instrument} value={instrument}>
                        {instrument}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<number>
                  label={<label className="form-item-header">{t('intImplementorHeader')}</label>}
                  name="intImplementor"
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
            <div className="form-section-header">{t('mitigationInfoTitle')}</div>
            <div className="form-section-sub-header">{t('emmissionInfoTitle')}</div>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('achieved')}</label>}
                  name="achievedReduct"
                  rules={[validation.required]}
                >
                  <Input type="number" className="form-input-box" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('expected')}</label>}
                  name="expectedReduct"
                  rules={[validation.required]}
                >
                  <Input type="number" className="form-input-box" />
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
                isEditable={false}
                inputFontSize={inputFontSize}
                gutterSize={gutterSize}
                headerNames={[t('kpiName'), t('kpiUnit'), t('achieved'), t('expected')]}
                updateKPI={updateKPI}
                removeKPI={removeKPI}
              ></KpiGrid>
            ))}
            {newKpiList.map((kpi: any) => (
              <KpiGrid
                key={kpi.index}
                form={form}
                rules={[validation.required]}
                index={kpi.index}
                isEditable={!isView && !kpi.visibility}
                inputFontSize={inputFontSize}
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
                  label={<label className="form-item-header">{t('programmeCommentsTitle')}</label>}
                  name="comments"
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
                  name="recievedUSD"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('recievedLCLHeader')}</label>}
                  name="recievedLCL"
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
          <div className="form-section-card">
            <Row>
              <Col span={6}>
                <div className="form-section-header">{t('supportInfoTitle')}</div>
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
            <div className="form-section-card">
              <div className="form-section-header">{t('updatesInfoTitle')}</div>
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
    </div>
  );
};

export default ProjectForm;
