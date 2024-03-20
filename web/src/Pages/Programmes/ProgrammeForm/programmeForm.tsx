import { useTranslation } from 'react-i18next';
import { Row, Col, Input, Button, Upload, Form, Select, Card, Modal, SelectProps } from 'antd';
import {
  AppstoreAddOutlined,
  DeleteOutlined,
  LinkOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { RcFile, UploadFile } from 'antd/lib/upload/interface';
import { useEffect, useState } from 'react';
import DeleteCard from '../../../Components/Card/deleteCard';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { InstrumentType } from '../../../Enums/action.enum';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

const gutterSize = 30;
const rowHeight = '75px';
const rowBottomMargin = '10px';
const multiLineHeight = '114px';
const fieldHeight = '32px';

const validation = {
  required: { required: true, message: 'Required Field' },
  number: { pattern: /^[0-9]+$/, message: 'Please enter a valid number' },
};

interface Props {
  method: 'create' | 'view' | 'update';
}

type ProgrammeMigratedData = {
  intImplementor: string;
  recipientEntity: string;
  ghgsAffected: string[];
  achievedReduct: number;
  expectedReduct: number;
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

  // form state

  const [programIdList, setProgramIdList] = useState<SelectProps['options']>([]);
  const [migratedData, setMigratedData] = useState<ProgrammeMigratedData>();

  const [documentList, setDocumentList] = useState<UploadFile[]>([]);
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
    const updatedMigData = {
      intImplementor: 'AFDB',
      recipientEntity: 'Ministry of Agriculture, Climate Change and Environment',
      ghgsAffected: ['CO2', 'N2O'],
      achievedReduct: 6,
      expectedReduct: 100,
    };

    setMigratedData(updatedMigData);
  }, [projectList, kpiList]);

  // Form Submit

  const handleSubmit = async (payload: any) => {
    console.log(payload);
  };

  // Upload functionality

  const handleFileRead = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const onChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setDocumentList(newFileList);
  };

  const handleDelete = (fileId: any) => {
    setDocumentList((prevList) => prevList.filter((file) => file.uid !== fileId));
    setUploadedFiles((prevList) => prevList.filter((file) => file.id !== fileId));
  };

  const beforeUpload = async (file: RcFile): Promise<boolean> => {
    const base64 = await handleFileRead(file);
    setUploadedFiles([...uploadedFiles, { id: file.uid, title: file.name, data: base64 }]);
    return false;
  };

  const props = {
    onChange,
    fileList: documentList,
    showUploadList: false,
    beforeUpload,
    accept: '.xlsx,.xls,.ppt,.pptx,.docx,.csv,.png,.jpg',
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
        <div className="body-title">{t('addActionTitle')}</div>
        <div className="body-sub-title">{t('addActionDesc')}</div>
      </div>
      <Form form={form} onFinish={handleSubmit}>
        <div className="form-card">
          <div style={{ color: '#3A3541', opacity: 0.8, marginBottom: '25px', fontWeight: 'bold' }}>
            {t('generalInfoTitle')}
          </div>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={6} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('selectActionHeader')}
              </div>
              <Form.Item name="actionId" rules={[validation.required]}>
                <Select allowClear disabled={isView} showSearch>
                  <Option key={'check'} value={'check'}>
                    {'action'}
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('typesHeader')}
              </div>
              <Form.Item name="type" rules={[validation.required]}>
                <Select allowClear disabled={isView} showSearch>
                  {Object.values(InstrumentType).map((instrument) => (
                    <Option key={instrument} value={instrument}>
                      {instrument}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('programmeTitleHeader')}
              </div>
              <Form.Item name="title" rules={[validation.required]}>
                <Input style={{ height: fieldHeight }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={12} style={{ height: multiLineHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('programmeDescTitle')}
              </div>
              <Form.Item name="description" rules={[validation.required]}>
                <TextArea rows={3} disabled={isView} />
              </Form.Item>
            </Col>
            <Col span={12} style={{ height: multiLineHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('programmeObjectivesTitle')}
              </div>
              <Form.Item name="objective" rules={[validation.required]}>
                <TextArea rows={3} disabled={isView} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={6} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('instrumentType')}
              </div>
              <Form.Item name="instrumentType" rules={[validation.required]}>
                <Select allowClear disabled={isView} showSearch>
                  {Object.values(InstrumentType).map((instrument) => (
                    <Option key={instrument} value={instrument}>
                      {instrument}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('programmeStatus')}
              </div>
              <Form.Item name="status" rules={[validation.required]}>
                <Select allowClear disabled={isView} showSearch>
                  {Object.values(InstrumentType).map((instrument) => (
                    <Option key={instrument} value={instrument}>
                      {instrument}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('sectorsAffected')}
              </div>
              <Form.Item name="sectorsAffected" rules={[validation.required]}>
                <Select allowClear disabled={isView} showSearch>
                  {Object.values(InstrumentType).map((instrument) => (
                    <Option key={instrument} value={instrument}>
                      {instrument}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('subSectorsAffected')}
              </div>
              <Form.Item name="subSectorsAffected" rules={[validation.required]}>
                <Select allowClear disabled={isView} showSearch>
                  {Object.values(InstrumentType).map((instrument) => (
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
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('startYearTitle')}
              </div>
              <Form.Item name="startYear" rules={[validation.required]}>
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
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('intImplementorTitle')}
              </div>
              <Input
                style={{ height: fieldHeight }}
                value={migratedData?.intImplementor}
                disabled
              />
            </Col>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('recipientEntityTitle')}
              </div>
              <Input
                style={{ height: fieldHeight }}
                value={migratedData?.recipientEntity}
                disabled
              />
            </Col>
          </Row>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('natImplementorTitle')}
              </div>
              <Form.Item name="natImplementor" rules={[validation.required]}>
                <Input style={{ height: fieldHeight }} />
              </Form.Item>
            </Col>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('investmentNeedsTitle')}
              </div>
              <Form.Item name="investmentNeeds" rules={[validation.required]}>
                <Input style={{ height: fieldHeight }} />
              </Form.Item>
            </Col>
          </Row>
          <Row
            gutter={[gutterSize, 8]}
            style={{ marginBottom: rowBottomMargin, marginTop: '20px' }}
          >
            <Col span={3} style={{ height: fieldHeight }}>
              <Upload {...props}>
                <Button
                  icon={<UploadOutlined />}
                  style={{ width: '120px', height: fieldHeight }}
                  disabled={isView}
                >
                  {t('upload')}
                </Button>
              </Upload>
            </Col>
            <Col span={21}>
              <Row gutter={[gutterSize, 10]}>
                {documentList.map((file: any) => (
                  <Col span={8} style={{ height: fieldHeight }}>
                    <DeleteCard
                      fileName={file.name.slice(0, 20)}
                      fileId={file.uid}
                      handleDelete={handleDelete}
                    ></DeleteCard>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={24} style={{ height: multiLineHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('programmeCommentsTitle')}
              </div>
              <Form.Item name="comments" rules={[validation.required]}>
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
            <Col span={4}>
              {!isView && (
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<LinkOutlined />}
                  style={{ padding: 0 }}
                  onClick={showModal}
                >
                  {t('attachProgramme')}
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
                  <strong>{t('attachProject')}</strong>
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
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('ghgAffected')}
              </div>
              <Input
                style={{ height: fieldHeight }}
                value={migratedData?.ghgsAffected[0]}
                disabled
              />
            </Col>
          </Row>
          <div style={{ color: '#3A3541', opacity: 0.8, marginTop: '25px', marginBottom: '10px' }}>
            {t('emmissionInfoTitle')}
          </div>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{t('achieved')}</div>
              <Input
                style={{ height: fieldHeight }}
                value={migratedData?.achievedReduct}
                disabled
              />
            </Col>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{t('expected')}</div>
              <Input
                style={{ height: fieldHeight }}
                value={migratedData?.expectedReduct}
                disabled
              />
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
                    <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                      {t('kpiName')}
                    </div>
                    <Form.Item name={`kpi_name_${kpi.index}`} rules={[validation.required]}>
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
                    <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                      {t('kpiUnit')}
                    </div>
                    <Form.Item
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
                    <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                      {t('achieved')}
                    </div>
                    <Input style={{ height: fieldHeight }} value={kpi.achieved} disabled={true} />
                  </Col>
                  <Col span={11} style={{ height: rowHeight }}>
                    <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                      {t('expected')}
                    </div>
                    <Form.Item
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
