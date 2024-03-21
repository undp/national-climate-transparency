import { useTranslation } from 'react-i18next';
import { Row, Col, Input, Button, Form, Select, Card, Modal, SelectProps, message } from 'antd';
import {
  AppstoreAddOutlined,
  DeleteOutlined,
  LinkOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { useNavigate } from 'react-router-dom';
import UploadFileGrid from '../../../Components/Upload/uploadFiles';
import { useConnection } from '@undp/carbon-library';
import { Sector } from '../../../Enums/sector.enum';
import { SubSector, NatImplementor } from '../../../Enums/shared.enum';
import { ProgrammeStatus } from '../../../Enums/programme.enum';

const { Option } = Select;
const { TextArea } = Input;

const gutterSize = 30;
const rowHeight = '75px';
const rowBottomMargin = '10px';
const multiLineHeight = '114px';
const fieldHeight = '32px';

const validation = {
  required: { required: false, message: 'Required Field' },
  number: { pattern: /^[0-9]+$/, message: 'Please enter a valid number' },
};

interface Props {
  method: 'create' | 'view' | 'update';
}

type ActionData = {
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

type ProjectData = {
  projectId: string;
  projectName: string;
};

const ProgrammeForm: React.FC<Props> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['programmeForm']);
  const isView: boolean = method === 'view' ? true : false;

  const yearsList: number[] = [];

  for (let year = 2013; year <= 2050; year++) {
    yearsList.push(year);
  }

  const navigate = useNavigate();
  const { post } = useConnection();

  // form state

  const [actionList, setActionList] = useState<ActionData[]>([]);
  const [programIdList, setProgramIdList] = useState<SelectProps['options']>([]);

  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; title: string; data: string }[]>(
    []
  );
  const [kpiList, setKpiList] = useState<KpiData[]>([]);

  const [pendingProjects, setPendingProjects] = useState<string[]>([]);
  const [projectList, setProjectList] = useState<ProjectData[]>([]);

  const [currentPage, setCurrentPage] = useState<any>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // TODO : Connect to the BE Endpoints for data fetching
  // Initialization Logic

  useEffect(() => {
    const actionData: ActionData[] = [];
    for (let i = 0; i < 1; i++) {
      actionData.push({
        id: 'A001',
        title: 'MB Solar',
      });
    }
    setActionList(actionData);
  }, []);

  useEffect(() => {
    const newProgramIdList: SelectProps['options'] = [];
    for (let i = 0; i < 20; i++) {
      newProgramIdList.push({
        label: `P00${i}`,
        value: `P00${i}`,
      });
    }
    setProgramIdList(newProgramIdList);
  }, [projectList]);

  useEffect(() => {
    if (method !== 'create') {
      console.log('Get the Action Information and load them');
    }

    form.setFieldsValue({
      type: 'Mitigation',
      instrumentType: 'Policy',
      intImplementor: 'AFDB',
      recipientEntity: 'Ministry of Agriculture, Climate Change and Environment',
      ghgsAffected: ['CO2', 'N2O'],
      achievedReduct: 6,
      expectedReduct: 100,
    });
  }, [projectList, kpiList]);

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

      payload.linkedProjects = [];
      projectList.forEach((project) => {
        payload.linkedProgrammes.push(project.projectId);
      });

      payload.investment = parseFloat(payload.investment);

      const response = await post('national/programme/add', payload);
      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: t('actionCreationSuccess'),
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

  // Attach Project

  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const attachProject = () => {
    setOpen(false);
    const updatedPrjData: ProjectData[] = [];

    for (const prjId of pendingProjects) {
      updatedPrjData.push({
        projectId: prjId,
        projectName: 'project name',
      });
    }
    setProjectList(updatedPrjData);
  };

  const attachCancel = () => {
    setOpen(false);
  };

  const handleProjSelect = (prjIds: string[]) => {
    setPendingProjects(prjIds);
  };

  // Add New KPI

  const createKPI = () => {
    const newItem: KpiData = {
      index: kpiList.length,
      name: '',
      unit: '',
      creatorType: 'action',
      expected: 0,
      achieved: 0,
    };
    setKpiList((prevList) => [...prevList, newItem]);
  };

  const removeKPI = (kpiIndex: number) => {
    setKpiList(kpiList.filter((obj) => obj.index !== kpiIndex));
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

  // Column Definition
  const projTableColumns = [
    { title: t('projectId'), dataIndex: 'projectId', key: 'projectId' },
    { title: t('projectName'), dataIndex: 'projectName', key: 'projectName' },
  ];

  // Table Behaviour

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
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
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={6} style={{ height: rowHeight }}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('selectActionHeader')}
                  </label>
                }
                name="actionId"
                rules={[validation.required]}
              >
                <Select allowClear disabled={isView} showSearch>
                  {actionList.map((action) => (
                    <Option key={action.id} value={action.id}>
                      {action.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6} style={{ height: rowHeight }}>
              <Form.Item
                label={<label style={{ color: '#3A3541', opacity: 0.8 }}>{t('typesHeader')}</label>}
                name="type"
                rules={[validation.required]}
              >
                <Input style={{ height: fieldHeight }} disabled />
              </Form.Item>
            </Col>
            <Col span={12} style={{ height: rowHeight }}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('progTitleHeader')}</label>
                }
                name="title"
                rules={[validation.required]}
              >
                <Input style={{ height: fieldHeight }} disabled={isView} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={12} style={{ height: multiLineHeight }}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('progDescTitle')}</label>
                }
                name="description"
                rules={[validation.required]}
              >
                <TextArea rows={3} disabled={isView} />
              </Form.Item>
            </Col>
            <Col span={12} style={{ height: multiLineHeight }}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('progObjectivesTitle')}
                  </label>
                }
                name="objective"
                rules={[validation.required]}
              >
                <TextArea rows={3} disabled={isView} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={6} style={{ height: rowHeight }}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('instrTypeTitle')}</label>
                }
                name="instrumentType"
              >
                <Input style={{ height: fieldHeight }} disabled />
              </Form.Item>
            </Col>
            <Col span={6} style={{ height: rowHeight }}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('progStatusTitle')}</label>
                }
                name="status"
                rules={[validation.required]}
              >
                <Select allowClear disabled={isView} showSearch>
                  {Object.values(ProgrammeStatus).map((instrument) => (
                    <Option key={instrument} value={instrument}>
                      {instrument}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6} style={{ height: rowHeight }}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('sectorsAffTitle')}</label>
                }
                name="affectedSectors"
                rules={[validation.required]}
              >
                <Select mode="multiple" allowClear disabled={isView} showSearch>
                  {Object.values(Sector).map((instrument) => (
                    <Option key={instrument} value={instrument}>
                      {instrument}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6} style={{ height: rowHeight }}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('subSectorsAffTitle')}
                  </label>
                }
                name="affectedSubSector"
                rules={[validation.required]}
              >
                <Select mode="multiple" allowClear disabled={isView} showSearch>
                  {Object.values(SubSector).map((instrument) => (
                    <Option key={instrument} value={instrument}>
                      {instrument}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={6} style={{ height: rowHeight }}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('startYearTitle')}</label>
                }
                name="startYear"
                rules={[validation.required]}
              >
                <Select allowClear disabled={isView} showSearch>
                  {yearsList.map((year) => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6} style={{ height: rowHeight }}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('intImplementorTitle')}
                  </label>
                }
                name="intImplementor"
              >
                <Input style={{ height: fieldHeight }} disabled />
              </Form.Item>
            </Col>
            <Col span={12} style={{ height: rowHeight }}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('recipientEntityTitle')}
                  </label>
                }
                name="recipientEntity"
              >
                <Input style={{ height: fieldHeight }} disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={12} style={{ height: rowHeight }}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('natImplementorTitle')}
                  </label>
                }
                name="natImplementor"
                rules={[validation.required]}
              >
                <Select mode="multiple" allowClear disabled={isView} showSearch>
                  {Object.values(NatImplementor).map((instrument) => (
                    <Option key={instrument} value={instrument}>
                      {instrument}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12} style={{ height: rowHeight }}>
              <Form.Item<number>
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('investmentNeedsTitle')}
                  </label>
                }
                name="investment"
                rules={[validation.required]}
              >
                <Input type="number" style={{ height: fieldHeight }} disabled={isView} />
              </Form.Item>
            </Col>
          </Row>
          <UploadFileGrid
            uploadedFiles={uploadedFiles}
            horizontalGutter={gutterSize}
            verticalGutter={10}
            buttonText={t('upload')}
            height={fieldHeight}
            acceptedFiles=".xlsx,.xls,.ppt,.pptx,.docx,.csv,.png,.jpg"
            style={{ marginBottom: '25px', marginTop: '20px' }}
            setUploadedFiles={setUploadedFiles}
            isView={isView}
          ></UploadFileGrid>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={24} style={{ height: multiLineHeight }}>
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
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={12}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('projectListTitle')}
              </div>
              <LayoutTable
                tableData={projectList}
                columns={projTableColumns}
                loading={false}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: projectList.length,
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
            <Col
              span={5}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
            >
              {!isView && (
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<LinkOutlined />}
                  style={{ padding: 0 }}
                  onClick={showModal}
                >
                  {t('attachProjects')}
                </Button>
              )}
              <Modal
                open={open}
                onCancel={attachCancel}
                footer={[
                  <Button onClick={attachCancel}>Cancel</Button>,
                  <Button type="primary" onClick={attachProject}>
                    {t('attach')}
                  </Button>,
                ]}
              >
                <div style={{ color: '#16B1FF', marginTop: '15px' }}>
                  <AppstoreAddOutlined style={{ fontSize: '120px' }} />
                </div>
                <div
                  style={{ color: '#3A3541', opacity: 0.8, marginTop: '30px', fontSize: '15px' }}
                >
                  <strong>{t('attachProjects')}</strong>
                </div>
                <div
                  style={{
                    color: '#3A3541',
                    opacity: 0.8,
                    marginTop: '20px',
                    marginBottom: '8px',
                    textAlign: 'left',
                  }}
                >
                  {t('projectList')}
                </div>
                <Select
                  showSearch
                  mode="multiple"
                  allowClear
                  style={{ width: '100%' }}
                  value={pendingProjects}
                  onChange={handleProjSelect}
                  options={programIdList}
                />
              </Modal>
            </Col>
          </Row>
        </div>
        <div className="form-card">
          <div style={{ color: '#3A3541', opacity: 0.8, marginBottom: '25px', fontWeight: 'bold' }}>
            {t('mitigationInfoTitle')}
          </div>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={12} style={{ height: rowHeight }}>
              <Form.Item
                label={<label style={{ color: '#3A3541', opacity: 0.8 }}>{t('ghgAffected')}</label>}
                name="ghgsAffected"
              >
                <Input style={{ height: fieldHeight }} disabled />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ color: '#3A3541', opacity: 0.8, marginTop: '25px', marginBottom: '10px' }}>
            {t('emmissionInfoTitle')}
          </div>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={12} style={{ height: rowHeight }}>
              <Form.Item
                label={<label style={{ color: '#3A3541', opacity: 0.8 }}>{t('achieved')}</label>}
                name="achievedReduct"
              >
                <Input style={{ height: fieldHeight }} disabled />
              </Form.Item>
            </Col>
            <Col span={12} style={{ height: rowHeight }}>
              <Form.Item
                label={<label style={{ color: '#3A3541', opacity: 0.8 }}>{t('expected')}</label>}
                name="expectedReduct"
              >
                <Input style={{ height: fieldHeight }} disabled />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ color: '#3A3541', opacity: 0.8, marginTop: '25px', marginBottom: '10px' }}>
            {t('kpiInfoTitle')}
          </div>
          {kpiList.map((kpi: any) => (
            <Row key={kpi.index} gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
              <Col span={12} style={{ height: rowHeight }}>
                <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
                  <Col span={12} style={{ height: rowHeight }}>
                    <Form.Item
                      label={
                        <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('kpiName')}</label>
                      }
                      name={`kpi_name_${kpi.index}`}
                      rules={[validation.required]}
                    >
                      <Input
                        style={{ height: fieldHeight }}
                        disabled={isView}
                        onChange={(e) => {
                          updateKPI(kpi.index, 'name', e.target.value);
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12} style={{ height: rowHeight }}>
                    <Form.Item
                      label={
                        <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('kpiUnit')}</label>
                      }
                      name={`kpi_unit_${kpi.index}`}
                      rules={[{ required: true, message: 'Required Field' }]}
                    >
                      <Input
                        style={{ height: fieldHeight }}
                        disabled={isView}
                        onChange={(e) => {
                          updateKPI(kpi.index, 'unit', e.target.value);
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={12} style={{ height: rowHeight }}>
                <Row gutter={15} style={{ marginBottom: rowBottomMargin }}>
                  <Col span={11} style={{ height: rowHeight }}>
                    <Form.Item
                      label={
                        <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('achieved')}</label>
                      }
                      name={`kpi_ach_${kpi.index}`}
                    >
                      <Input style={{ height: fieldHeight }} value={kpi.achieved} disabled={true} />
                    </Form.Item>
                  </Col>
                  <Col span={11} style={{ height: rowHeight }}>
                    <Form.Item
                      label={
                        <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('expected')}</label>
                      }
                      name={`kpi_exp_${kpi.index}`}
                      rules={[validation.required, validation.number]}
                    >
                      <Input
                        style={{ height: fieldHeight }}
                        value={kpi.achieved}
                        disabled={isView}
                        onChange={(e) => {
                          updateKPI(kpi.index, 'expected', e.target.value);
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2} style={{ height: rowHeight }}>
                    <Card
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '0px',
                        width: '31px',
                        height: '31px',
                        marginTop: '38px',
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
            <Col span={2} style={{ height: fieldHeight }}>
              {!isView && (
                <Button
                  type="default"
                  size="large"
                  block
                  icon={<PlusCircleOutlined />}
                  style={{
                    border: 'none',
                    color: '#3A3541',
                    opacity: 0.8,
                    marginTop: '15px',
                    padding: 0,
                  }}
                  onClick={createKPI}
                >
                  {t('addKPI')}
                </Button>
              )}
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
            <Col span={2} style={{ height: fieldHeight }}>
              <Button
                type="default"
                size="large"
                block
                onClick={() => {
                  navigate('/actions');
                }}
              >
                {t('cancel')}
              </Button>
            </Col>
            <Col span={2} style={{ height: fieldHeight }}>
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

export default ProgrammeForm;
