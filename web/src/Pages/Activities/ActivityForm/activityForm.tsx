import { useTranslation } from 'react-i18next';
import { Row, Col, Input, Button, Form, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { useNavigate, useParams } from 'react-router-dom';
import UploadFileGrid from '../../../Components/Upload/uploadFiles';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import './activityForm.scss';
import { KpiGrid } from '../../../Components/KPI/kpiGrid';
import { ParentType } from '../../../Enums/parentType.enum';
import TimelineTable from '../../../Components/Timeline/timeline';
import {
  ActualRows,
  ActualTimeline,
  ExpectedRows,
  ExpectedTimeline,
} from '../../../Definitions/mtgTimeline.definition';
import {
  ActivityStatus,
  ImplMeans,
  Measure,
  SupportType,
  TechnologyType,
} from '../../../Enums/activity.enum';
import { IntImplementor, NatImplementor } from '../../../Enums/shared.enum';
import EntityIdCard from '../../../Components/EntityIdCard/entityIdCard';
import { SupportData } from '../../../Definitions/supportDefinitions';
import { ParentData } from '../../../Definitions/activityDefinitions';
import { FormLoadProps } from '../../../Definitions/InterfacesAndType/formInterface';
import { getValidationRules } from '../../../Utils/validationRules';

const { Option } = Select;
const { TextArea } = Input;

const gutterSize = 30;
const inputFontSize = '13px';

const ActivityForm: React.FC<FormLoadProps> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['activityForm']);
  const isView: boolean = method === 'view' ? true : false;

  const navigate = useNavigate();
  const { post } = useConnection();
  const { entId } = useParams();

  // Form Validation Rules

  const validation = getValidationRules(method);

  // form state

  const [uploadedFiles, setUploadedFiles] = useState<
    { key: string; title: string; data: string }[]
  >([]);
  const [storedFiles, setStoredFiles] = useState<{ key: string; title: string; url: string }[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

  // Methodology Doc state

  const [uploadedMthFiles, setUploadedMthFiles] = useState<
    { key: string; title: string; data: string }[]
  >([]);
  const [storedMthFiles, setStoredMthFiles] = useState<
    { key: string; title: string; url: string }[]
  >([]);
  const [mthFilesToRemove, setMthFilesToRemove] = useState<string[]>([]);

  // Results Doc state

  const [uploadedRstFiles, setUploadedRstFiles] = useState<
    { key: string; title: string; data: string }[]
  >([]);
  const [storedRstFiles, setStoredRstFiles] = useState<
    { key: string; title: string; url: string }[]
  >([]);
  const [rstFilesToRemove, setRstFilesToRemove] = useState<string[]>([]);

  // Parent Selection State

  const [parentType, setParentType] = useState<string>();
  const [parentList, setParentList] = useState<ParentData[]>([]);

  // Support state

  const [supportData, setSupportData] = useState<SupportData[]>([]);
  const [supportCurrentPage, setCurrentPage] = useState<any>(1);
  const [supportPageSize, setPageSize] = useState<number>(10);

  // KPI State

  const [migratedKpiList, setMigratedKpiList] = useState<number[]>([]);

  // MTG Timeline State

  const [expectedTimeline, setExpectedTimeline] = useState<ExpectedTimeline[]>([]);
  const [actualTimeline, setActualTimeline] = useState<ActualTimeline[]>([]);

  // TODO : Connect to the BE Endpoints for data fetching
  // Initialization Logic

  const yearsList: number[] = [];

  for (let year = 2013; year <= 2050; year++) {
    yearsList.push(year);
  }

  useEffect(() => {
    if (method !== 'create') {
      const tempFiles: { key: string; title: string; url: string }[] = [];
      for (let i = 0; i < 6; i++) {
        tempFiles.push({ key: `${i}`, title: `title_${i}.pdf`, url: `url_${i}` });
      }
      setStoredFiles(tempFiles);

      // Get the attached supports

      setSupportData([]);
      setStoredMthFiles([]);
      setStoredRstFiles([]);
    }

    if (method === 'create') {
      const tempExpectedEntries: ExpectedTimeline[] = [];
      Object.entries(ExpectedRows).forEach(([key, value]) => {
        const rowData: ExpectedTimeline = { key: key, ghg: value[0], topic: value[1], total: 0 };
        for (let year = 2023; year <= 2050; year++) {
          rowData[year.toString()] = 0;
        }
        tempExpectedEntries.push(rowData);
      });

      const tempActualEntries: ActualTimeline[] = [];
      Object.entries(ActualRows).forEach(([key, value]) => {
        const rowData: ActualTimeline = { key: key, ghg: value[0], topic: value[1], total: 0 };
        for (let year = 2023; year <= 2050; year++) {
          rowData[year.toString()] = 0;
        }
        tempActualEntries.push(rowData);
      });

      setExpectedTimeline(tempExpectedEntries);
      setActualTimeline(tempActualEntries);
    }
  }, []);

  useEffect(() => {
    console.log('Running Migration Update');

    if (method !== 'create') {
      console.log('Get the Action Information and load them');
    }

    // Get Migrated Data for the Activity
    form.setFieldsValue({
      recipient: 'Ministry of Agriculture, Climate Change and Environment',
      affSectors: 'Energy',
      affSubSectors: 'Grid-Connected Generation',
      startYear: 2019,
      endYear: 2020,
      expectedTimeFrame: 2,
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
    form.setFieldsValue({
      parentId: '',
      parentDescription: '',
    });
  };

  const handleParentIdSelect = (id: string) => {
    form.setFieldsValue({
      parentDescription: parentList.find((obj) => obj.id === id)?.desc,
    });
  };

  useEffect(() => {
    console.log('Running Parent Id Population');
    const prefix = parentType?.slice(0, 3);
    const parentIds: ParentData[] = [];
    for (let i = 0; i < 15; i++) {
      parentIds.push({
        id: `${prefix}00${i}`,
        title: `${prefix}00${i}`,
        desc: `This is the description migrated from the parent 00${i}`,
      });
    }
    setParentList(parentIds);
  }, [parentType]);

  // Form Submit

  const handleSubmit = async (payload: any) => {
    try {
      for (const key in payload) {
        if (key.startsWith('kpi_exp') || key.startsWith('kpi_unit')) {
          delete payload[key];
        }
      }
      payload.documents = [];
      uploadedFiles.forEach((file) => {
        payload.documents.push({ title: file.title, data: file.data });
      });

      payload.mth_documents = [];
      uploadedMthFiles.forEach((file) => {
        payload.mth_documents.push({ title: file.title, data: file.data });
      });

      payload.rst_documents = [];
      uploadedRstFiles.forEach((file) => {
        payload.rst_documents.push({ title: file.title, data: file.data });
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

  // Entity Validate

  const validateEntity = () => {
    console.log('Validate Clicked');
  };

  // Entity Delete

  const deleteEntity = () => {
    console.log('Delete Clicked');
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

  // Mtg Data Change

  const onMtgValueEnter = (
    tableType: 'expected' | 'actual',
    rowId: string,
    year: string,
    value: string
  ) => {
    const newValue = value ? parseInt(value) : 0;

    if (tableType === 'expected') {
      setExpectedTimeline((prevState) =>
        prevState.map((entry) => {
          if (entry.topic === rowId) {
            entry[year] = newValue;
            return entry;
          }
          return entry;
        })
      );
    } else {
      setActualTimeline((prevState) =>
        prevState.map((entry) => {
          if (entry.topic === rowId) {
            entry[year] = newValue;
            return entry;
          }
          return entry;
        })
      );
    }
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
            {method !== 'create' && entId && (
              <EntityIdCard calledIn="Activity" entId={entId}></EntityIdCard>
            )}
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
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                    onChange={handleSelectChange}
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
                <Col span={12}>
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
                          {parent.title}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
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
              </Row>
            ) : null}
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('measuresTitle')}</label>}
                  name="measures"
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
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('supportTypeTitle')}</label>}
                  name="supportType"
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {Object.values(SupportType).map((support) => (
                      <Option key={support} value={support}>
                        {support}
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
                >
                  <Select
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
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('intImplementorTitle')}</label>}
                  name="intImplementor"
                >
                  <Select
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
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('affSectorsTitle')}</label>}
                  name="affSectors"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('affSubSectorsTitle')}</label>}
                  name="affSubSectors"
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
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('techTypeTitle')}</label>}
                  name="techType"
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
                rules={[validation.required]}
                index={index}
                calledTo={'add_ach'}
                gutterSize={gutterSize}
                headerNames={[t('kpiName'), t('kpiUnit'), t('achieved'), t('expected')]}
              ></KpiGrid>
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
                  expectedTimeline={expectedTimeline}
                  actualTimeline={actualTimeline}
                  loading={false}
                  onValueEnter={onMtgValueEnter}
                />
              </Col>
            </Row>
          </div>
          {isView && (
            <div className="form-section-card">
              <div className="form-section-header">{t('updatesInfoTitle')}</div>
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
                    navigate('/activities');
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
                    navigate('/activities');
                  }}
                >
                  {t('back')}
                </Button>
              </Col>
              <Col span={2.5}>
                <Form.Item>
                  <Button
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
                    navigate('/activities');
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
    </div>
  );
};

export default ActivityForm;
