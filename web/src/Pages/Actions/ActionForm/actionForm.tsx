import { useTranslation } from 'react-i18next';
import './actionForm.scss';
import {
  Row,
  Col,
  Input,
  Button,
  Upload,
  Popover,
  List,
  Typography,
  Form,
  Select,
  Card,
  Modal,
  SelectProps,
  message,
} from 'antd';
import {
  AppstoreOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  LinkOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { RcFile, UploadFile } from 'antd/lib/upload/interface';
import { useEffect, useState } from 'react';
import DeleteCard from '../../../Components/Card/deleteCard';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { InstrumentType, ActionStatus, NatAnchor } from '../../../Enums/action.enum';
import { useNavigate } from 'react-router-dom';
import { useConnection } from '@undp/carbon-library';

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

type ActionMigratedData = {
  type: string[];
  ghgsAffected: string[];
  natImplementor: string;
  sectoredAffected: string[];
  estimatedInvestment: number;
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

type ProgrammeData = {
  programmeId: string;
  actionId: string;
  title: string;
  type: string;
  status: string;
  subSectorsAffected: string;
  estimatedInvestment: number;
};

const actionForm: React.FC<Props> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['actionForm']);
  const isView: boolean = method === 'view' ? true : false;

  const yearsList: number[] = [];

  for (let year = 2013; year <= 2050; year++) {
    yearsList.push(year);
  }

  const navigate = useNavigate();
  const { post } = useConnection();

  // form state

  const [programIdList, setProgramIdList] = useState<SelectProps['options']>([]);
  const [migratedData, setMigratedData] = useState<ActionMigratedData>();

  const [documentList, setDocumentList] = useState<UploadFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; title: string; data: string }[]>(
    []
  );
  const [kpiList, setKpiList] = useState<KpiData[]>([]);

  const [pendingProgrammes, setPendingProgrammes] = useState<string[]>([]);
  const [programList, setProgramList] = useState<ProgrammeData[]>([]);

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
  }, [programList]);

  useEffect(() => {
    if (method !== 'create') {
      console.log('Get the Action Information and load them');
    }
    const updatedMigData = {
      type: ['Mitigation'],
      ghgsAffected: ['CO2', 'N2O'],
      natImplementor: 'Department of Energy',
      sectoredAffected: ['Energy'],
      estimatedInvestment: 1000,
      achievedReduct: 6,
      expectedReduct: 100,
    };

    setMigratedData(updatedMigData);
  }, [programList, kpiList]);

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

      payload.linkedProgrammes = [];
      programList.forEach((program) => {
        payload.linkedProgrammes.push(program.programmeId);
      });

      const response = await post('national/action/add', payload);
      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: t('actionCreationSuccess'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        navigate('/actions');
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

  // Attach Programme

  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const attachProgramme = () => {
    setOpen(false);
    const updatedPrgData: ProgrammeData[] = [];
    // Fetch Data from the backend related to the programmes attached
    for (const prgId of pendingProgrammes) {
      updatedPrgData.push({
        programmeId: prgId,
        actionId: 'action id',
        title: 'test title',
        type: 'test type',
        status: 'test status',
        subSectorsAffected: 'sub sec',
        estimatedInvestment: 500,
      });
    }
    setProgramList(updatedPrgData);
  };

  const detachProgramme = (prgId: string) => {
    const filteredData = programList.filter((prg) => prg.programmeId !== prgId);
    setProgramList(filteredData);
    setPendingProgrammes(pendingProgrammes.filter((item) => item !== prgId));
  };

  const attachCancel = () => {
    setOpen(false);
  };

  const handleProgSelect = (pIds: string[]) => {
    setPendingProgrammes(pIds);
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
                detachProgramme(record.programmeId);
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

  // Column Definition
  const progTableColumns = [
    { title: t('programmeId'), dataIndex: 'programmeId', key: 'programmeId' },
    { title: t('actionId'), dataIndex: 'actionId', key: 'actionId' },
    { title: t('programmeTitle'), dataIndex: 'title', key: 'title' },
    { title: t('programmeType'), dataIndex: 'type', key: 'type' },
    { title: t('programmeStatus'), dataIndex: 'status', key: 'status' },
    {
      title: t('subSectorAffected'),
      dataIndex: 'subSectorsAffected',
      key: 'titleOfAction',
    },
    {
      title: t('investmentNeeds'),
      dataIndex: 'estimatedInvestment',
      key: 'estimatedInvestment',
    },
    {
      title: '',
      key: 'programmeId',
      align: 'right' as const,
      width: 6,
      render: (record: any) => {
        return (
          <Popover placement="bottomRight" trigger="click" content={actionMenu(record)}>
            <EllipsisOutlined
              rotate={90}
              style={{ fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
            />
          </Popover>
        );
      },
    },
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
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('typesTitle')}
              </div>
              <Input style={{ height: fieldHeight }} value={migratedData?.type} disabled />
            </Col>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('actionTitle')}
              </div>
              <Form.Item name="title" rules={[validation.required]}>
                <Input style={{ height: fieldHeight }} disabled={isView} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={12} style={{ height: multiLineHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('actionDescTitle')}
              </div>
              <Form.Item name="description" rules={[validation.required]}>
                <TextArea rows={3} disabled={isView} />
              </Form.Item>
            </Col>
            <Col span={12} style={{ height: multiLineHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('actionObjectivesTitle')}
              </div>
              <Form.Item name="objective" rules={[validation.required]}>
                <TextArea rows={3} disabled={isView} />
              </Form.Item>
            </Col>
          </Row>
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
            <Col span={6} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('instrTypeTitle')}
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
                {t('actionStatusTitle')}
              </div>
              <Form.Item name="status" rules={[validation.required]}>
                <Select allowClear disabled={isView} showSearch>
                  {Object.values(ActionStatus).map((instrument) => (
                    <Option key={instrument} value={instrument}>
                      {instrument}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('natImplementorTitle')}
              </div>
              <Input
                style={{ height: fieldHeight }}
                value={migratedData?.natImplementor}
                disabled
              />
            </Col>
            <Col span={6} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('sectorsAffectedTitle')}
              </div>
              <Input
                style={{ height: fieldHeight }}
                value={migratedData?.sectoredAffected[0]}
                disabled
              />
            </Col>
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
          </Row>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('investmentNeeds')}
              </div>
              <Input
                style={{ height: fieldHeight }}
                value={migratedData?.estimatedInvestment}
                disabled
              />
            </Col>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('natAnchorTitle')}
              </div>
              <Form.Item name="natAnchor" rules={[validation.required]}>
                <Select allowClear disabled={isView} showSearch>
                  {Object.values(NatAnchor).map((instrument) => (
                    <Option key={instrument} value={instrument}>
                      {instrument}
                    </Option>
                  ))}
                </Select>
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
        </div>
        <div className="form-card">
          <Row>
            <Col span={6}>
              <div
                style={{ color: '#3A3541', opacity: 0.8, marginBottom: '25px', fontWeight: 'bold' }}
              >
                {t('programInfoTitle')}
              </div>
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
                  <Button type="primary" onClick={attachProgramme}>
                    {t('attach')}
                  </Button>,
                ]}
              >
                <div style={{ color: '#16B1FF', marginTop: '15px' }}>
                  <AppstoreOutlined style={{ fontSize: '120px' }} />
                </div>
                <div
                  style={{ color: '#3A3541', opacity: 0.8, marginTop: '30px', fontSize: '15px' }}
                >
                  <strong>{t('attachProgramme')}</strong>
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
                  {t('programmeList')}
                </div>
                <Select
                  showSearch
                  mode="multiple"
                  allowClear
                  style={{ width: '100%' }}
                  value={pendingProgrammes}
                  onChange={handleProgSelect}
                  options={programIdList}
                />
              </Modal>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <LayoutTable
                tableData={programList}
                columns={progTableColumns}
                loading={false}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: programList.length,
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

export default actionForm;
