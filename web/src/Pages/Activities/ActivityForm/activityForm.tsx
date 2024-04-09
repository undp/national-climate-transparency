import { useTranslation } from 'react-i18next';
import { Row, Col, Input, Button, Form, Select, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { useNavigate } from 'react-router-dom';
import UploadFileGrid from '../../../Components/Upload/uploadFiles';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { ProgrammeStatus } from '../../../Enums/programme.enum';
import './activityForm.scss';
import { KpiGrid } from '../../../Components/KPI/kpiGrid';
import { ParentType } from '../../../Enums/parentType.enum';
import TimelineTable from '../../../Components/Timeline/timeline';

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

type ParentData = {
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

const ActivityForm: React.FC<Props> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['activityForm']);
  const isView: boolean = method === 'view' ? true : false;

  const navigate = useNavigate();
  const { post } = useConnection();

  // form state

  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; title: string; data: string }[]>(
    []
  );
  const [storedFiles, setStoredFiles] = useState<{ id: number; title: string; url: string }[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<number[]>([]);

  // Methodology Doc state

  const [uploadedMthFiles, setUploadedMthFiles] = useState<
    { id: string; title: string; data: string }[]
  >([]);
  const [storedMthFiles, setStoredMthFiles] = useState<
    { id: number; title: string; url: string }[]
  >([]);
  const [mthFilesToRemove, setMthFilesToRemove] = useState<number[]>([]);

  // Results Doc state

  const [uploadedRstFiles, setUploadedRstFiles] = useState<
    { id: string; title: string; data: string }[]
  >([]);
  const [storedRstFiles, setStoredRstFiles] = useState<
    { id: number; title: string; url: string }[]
  >([]);
  const [rstFilesToRemove, setRstFilesToRemove] = useState<number[]>([]);

  // Parent Selection State

  const [parentType, setParentType] = useState<string>(ParentType.ACTION);
  const [parentList, setParentList] = useState<ParentData[]>([]);

  // Support state

  const [supportData, setSupportData] = useState<SupportData[]>([]);
  const [supportCurrentPage, setCurrentPage] = useState<any>(1);
  const [supportPageSize, setPageSize] = useState<number>(10);

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
    if (method !== 'create') {
      const tempFiles: { id: number; title: string; url: string }[] = [];
      for (let i = 0; i < 6; i++) {
        tempFiles.push({ id: i, title: `title_${i}.pdf`, url: `url_${i}` });
      }
      setStoredFiles(tempFiles);

      // Get the attached supports

      setSupportData([]);
      setStoredMthFiles([]);
      setStoredRstFiles([]);
    }
  }, []);

  useEffect(() => {
    console.log('Running Migration Update');

    if (method !== 'create') {
      console.log('Get the Action Information and load them');
    }

    // Get Migrated Data for the Activity
    form.setFieldsValue({
      type: 'Mitigation',
      instrumentType: 'Policy',
      intImplementor: 'AFGB',
      recipientEntity: 'Ministry of Agriculture, Climate Change and Environment',
      ghgsAffected: 'CO2',
      achievedReduct: 6,
      expectedReduct: 100,
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
  }, [supportData]);

  // Tracking Parent selection

  const handleSelectChange = (value: string) => {
    setParentType(value);
  };

  useEffect(() => {
    console.log('Running Parent Id Population');
    const prefix = parentType?.slice(0, 3);
    const parentIds: ParentData[] = [];
    for (let i = 0; i < 15; i++) {
      parentIds.push({ id: `${prefix}00${i}`, title: `${prefix}00${i}` });
    }
    setParentList(parentIds);
  }, [parentType]);

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

      const response = await post('national/activity/add', payload);
      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: t('activityCreationSuccess'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        navigate('/programmes');
      }
    } catch (error: any) {
      console.log('Error in activity creation', error);
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
      creatorType: 'activity',
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

  // Column Definition
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

  // Table Behaviour

  const handleSupportTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('addActivityTitle')}</div>
        <div className="body-sub-title">{t('addActivityDesc')}</div>
      </div>
      <div className="activity-form">
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <div className="form-section-card">
            <div className="form-section-header">{t('generalInfoTitle')}</div>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('activityTitle')}</label>}
                  name="title"
                  rules={[validation.required]}
                >
                  <Input className="form-input-box" />
                </Form.Item>
              </Col>
              <Col span={12}>
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
              <Col span={12}>
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
                    onChange={handleSelectChange}
                    defaultValue={ParentType.ACTION}
                  >
                    {Object.values(ParentType).map((parent) => (
                      <Option key={parent} value={parent}>
                        {t(parent)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <label className="form-item-header">
                      {`${t('selectParentTitle')} ${t(parentType)}`}
                    </label>
                  }
                  name="parentId"
                >
                  <Select
                    size={'large'}
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {parentList.map((parent) => (
                      <Option key={parent.id} value={parent.id}>
                        {parent.title}
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
                    <label className="form-item-header">
                      {`${t('parentDescTitle')} ${t(parentType)}`}
                    </label>
                  }
                  name="parentDescription"
                >
                  <TextArea maxLength={250} rows={3} disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('supportTypeTitle')}</label>}
                  name="supportType"
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
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('measuresTitle')}</label>}
                  name="measures"
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
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('activityStatusTitle')}</label>}
                  name="activityStatus"
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
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('recipientEntityTitle')}</label>}
                  name="recipient"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('natImplementorTitle')}</label>}
                  name="natImplementor"
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
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('intImplementorTitle')}</label>}
                  name="intImplementor"
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
                  label={<label className="form-item-header">{t('affSectorsTitle')}</label>}
                  name="affSectorsTitle"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('affSubSectorsTitle')}</label>}
                  name="affSubSectorsTitle"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('startYearTitle')}</label>}
                  name="startYear"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('endYearTitle')}</label>}
                  name="endYear"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('timeFrameTitle')}</label>}
                  name="expectedTimeFrame"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('anchoredTitle')}</label>}
                  name="isAnchored"
                  rules={[validation.required]}
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {Object.values(ParentType).map((parent) => (
                      <Option key={parent} value={parent}>
                        {parent}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('implMeansTitle')}</label>}
                  name="implMeans"
                >
                  <Select
                    size={'large'}
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {parentList.map((parent) => (
                      <Option key={parent.id} value={parent.id}>
                        {parent.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('techTypeTitle')}</label>}
                  name="techType"
                  rules={[validation.required]}
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {Object.values(ParentType).map((parent) => (
                      <Option key={parent} value={parent}>
                        {parent}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('additionalInfoTitle')}</label>}
                  name="addInfo"
                >
                  <TextArea maxLength={250} rows={3} disabled={isView} />
                </Form.Item>
              </Col>
            </Row>
            <div className="form-section-sub-header">{t('documentsHeader')}</div>
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
            <Row gutter={gutterSize}>
              <Col span={24}>
                <Form.Item
                  label={<label className="form-item-header">{t('activityCommentsTitle')}</label>}
                  name="comments"
                  rules={[validation.required]}
                >
                  <TextArea rows={3} disabled={isView} />
                </Form.Item>
              </Col>
            </Row>
            <div className="form-section-header">{t('mitigationInfoTitle')}</div>
            <div className="form-section-sub-header">{t('emissionInfoTitle')}</div>
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
          </div>
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
                  emptyMessage={t('noSupportMessage')}
                />
              </Col>
            </Row>
          </div>
          <div className="form-section-card">
            <div className="form-section-header">{t('mitigationInfoTitle')}</div>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('mtgMethodName')}</label>}
                  name="mtgMethodName"
                >
                  <Input className="form-input-box" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('mtgDocUploadOne')}</label>}
                >
                  <UploadFileGrid
                    isSingleColumn={true}
                    usedIn={method}
                    buttonText={t('upload')}
                    acceptedFiles=".xlsx,.xls,.ppt,.pptx,.docx,.csv,.png,.jpg"
                    storedFiles={storedMthFiles}
                    uploadedFiles={uploadedMthFiles}
                    setUploadedFiles={setUploadedMthFiles}
                    removedFiles={mthFilesToRemove}
                    setRemovedFiles={setMthFilesToRemove}
                  ></UploadFileGrid>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('mtgDescTitle')}</label>}
                  name="mtgMethodDesc"
                >
                  <TextArea rows={3} disabled={isView} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('mtgDocUploadTwo')}</label>}
                >
                  <UploadFileGrid
                    isSingleColumn={true}
                    usedIn={method}
                    buttonText={t('upload')}
                    acceptedFiles=".xlsx,.xls,.ppt,.pptx,.docx,.csv,.png,.jpg"
                    storedFiles={storedRstFiles}
                    uploadedFiles={uploadedRstFiles}
                    setUploadedFiles={setUploadedRstFiles}
                    removedFiles={rstFilesToRemove}
                    setRemovedFiles={setRstFilesToRemove}
                  ></UploadFileGrid>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('mtgCalculateEntityTitle')}</label>}
                  name="mtgCalculateEntity"
                >
                  <Input className="form-input-box" />
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
          <div className="form-section-card">
            <Row>
              <Col span={6}>
                <div className="form-section-header">{t('mitigationTimelineTitle')}</div>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <TimelineTable
                  tableData={supportData}
                  loading={false}
                  handleTableChange={handleSupportTableChange}
                />
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
        </Form>
      </div>
    </div>
  );
};

export default ActivityForm;
