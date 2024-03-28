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
import { Sector } from '../../../Enums/sector.enum';
import { SubSector, NatImplementor } from '../../../Enums/shared.enum';
import { ProgrammeStatus } from '../../../Enums/programme.enum';
import { Layers } from 'react-bootstrap-icons';
import './programmeForm.scss';

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
  migrated: boolean;
};

type ProjectData = {
  key: string;
  projectId: string;
  projectName: string;
};

const ProgrammeForm: React.FC<Props> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['programmeForm']);
  const isView: boolean = method === 'view' ? true : false;

  const navigate = useNavigate();
  const { post } = useConnection();

  // form state

  const [actionList, setActionList] = useState<ActionData[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; title: string; data: string }[]>(
    []
  );

  // Popover state

  const [detachOpen, setDetachOpen] = useState<boolean[]>([]);

  // projects state

  const [allProjectIds, setAllProjectIdList] = useState<string[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [projectData, setProjectData] = useState<ProjectData[]>([]);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // KPI State

  const [kpiList, setKpiList] = useState<KpiData[]>([]);

  // TODO : Connect to the BE Endpoints for data fetching
  // Initialization Logic

  const yearsList: number[] = [];

  for (let year = 2013; year <= 2050; year++) {
    yearsList.push(year);
  }

  useEffect(() => {
    const actionData: ActionData[] = [];
    for (let i = 0; i < 1; i++) {
      actionData.push({
        id: 'A001',
        title: 'MB Solar',
      });
    }
    setActionList(actionData);

    const projIds: string[] = [];
    for (let i = 0; i < 15; i++) {
      projIds.push(`J00${i}`);
    }
    setAllProjectIdList(projIds);
  }, []);

  useEffect(() => {
    const tempProjectData: ProjectData[] = [];
    selectedProjectIds.forEach((projId) => {
      tempProjectData.push({ key: projId, projectId: projId, projectName: `${projId}_name` });
    });
    setProjectData(tempProjectData);
    setDetachOpen(Array(selectedProjectIds.length).fill(false));
  }, [selectedProjectIds]);

  useEffect(() => {
    console.log('Running Migration Update');

    if (method !== 'create') {
      console.log('Get the Action Information and load them');
    }

    // Get Migrated Data for the Projects
    form.setFieldsValue({
      type: 'Mitigation',
      instrumentType: 'Policy',
      intImplementor: 'AFGB',
      recipientEntity: 'Ministry of Agriculture, Climate Change and Environment',
      ghgsAffected: 'CO2',
      achievedReduct: 6,
      expectedReduct: 100,
    });
  }, [projectData]);

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

      payload.linkedProjects = selectedProjectIds;

      payload.investment = parseFloat(payload.investment);

      const response = await post('national/programme/add', payload);
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
      migrated: false,
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
    const newOpenList = Array(selectedProjectIds.length).fill(false);
    newOpenList[selectedProjectIds.indexOf(record.projectId)] = true;
    setDetachOpen(newOpenList);
  };

  const detachProject = (prjId: string) => {
    const filteredData = projectData.filter((prj) => prj.projectId !== prjId);
    const filteredIds = selectedProjectIds.filter((id) => id !== prjId);
    setProjectData(filteredData);
    setSelectedProjectIds(filteredIds);
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
                detachProject(record.projectId);
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
  const projTableColumns = [
    { title: t('projectId'), dataIndex: 'projectId', key: 'projectId' },
    { title: t('projectName'), dataIndex: 'projectName', key: 'projectName' },
    {
      title: '',
      key: 'projectAction',
      align: 'right' as const,
      width: 6,
      render: (record: any) => {
        return (
          <Popover
            placement="bottomRight"
            content={actionMenu(record)}
            trigger="click"
            open={detachOpen[selectedProjectIds.indexOf(record.projectId)]}
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
          <Row gutter={gutterSize}>
            <Col span={6}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('selectActionHeader')}
                  </label>
                }
                name="actionId"
                rules={[validation.required]}
              >
                <Select
                  size={'large'}
                  style={{ fontSize: inputFontSize }}
                  allowClear
                  disabled={isView}
                  showSearch
                >
                  {actionList.map((action) => (
                    <Option key={action.id} value={action.id}>
                      {action.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={<label style={{ color: '#3A3541', opacity: 0.8 }}>{t('typesHeader')}</label>}
                name="type"
                rules={[validation.required]}
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('progTitleHeader')}</label>
                }
                name="title"
                rules={[validation.required]}
              >
                <Input
                  style={{ fontSize: inputFontSize, height: '40px' }}
                  maxLength={10}
                  disabled={isView}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutterSize}>
            <Col span={12}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('progDescTitle')}</label>
                }
                name="description"
                rules={[validation.required]}
              >
                <TextArea maxLength={250} rows={3} disabled={isView} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('progObjectivesTitle')}
                  </label>
                }
                name="objective"
                rules={[validation.required]}
              >
                <TextArea maxLength={250} rows={3} disabled={isView} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutterSize}>
            <Col span={6}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('instrTypeTitle')}</label>
                }
                name="instrumentType"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('progStatusTitle')}</label>
                }
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
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('sectorsAffTitle')}</label>
                }
                name="affectedSectors"
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
                  {Object.values(Sector).map((instrument) => (
                    <Option key={instrument} value={instrument}>
                      {instrument}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('subSectorsAffTitle')}
                  </label>
                }
                name="affectedSubSector"
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
                  {Object.values(SubSector).map((instrument) => (
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
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('startYearTitle')}</label>
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
            <Col span={6}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('intImplementorTitle')}
                  </label>
                }
                name="intImplementor"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('recipientEntityTitle')}
                  </label>
                }
                name="recipientEntity"
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
                    {t('natImplementorTitle')}
                  </label>
                }
                name="natImplementor"
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
                  {Object.values(NatImplementor).map((instrument) => (
                    <Option key={instrument} value={instrument}>
                      {instrument}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<number>
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('investmentNeedsTitle')}
                  </label>
                }
                name="investment"
                rules={[validation.required]}
              >
                <Input
                  style={{ fontSize: inputFontSize, height: '40px' }}
                  type="number"
                  disabled={isView}
                />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ color: '#3A3541', opacity: 0.8, marginTop: '10px', marginBottom: '10px' }}>
            {t('documentsHeader')}
          </div>
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
          <Row gutter={gutterSize}>
            <Col span={12}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {t('projectListTitle')}
              </div>
              <LayoutTable
                tableData={projectData}
                columns={projTableColumns}
                loading={false}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: projectData.length,
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
              <AttachEntity
                isDisabled={isView}
                options={allProjectIds}
                content={{
                  buttonName: t('attachProjects'),
                  attach: t('attach'),
                  contentTitle: t('attachProjects'),
                  listTitle: t('projectList'),
                  cancel: t('cancel'),
                }}
                attachedUnits={selectedProjectIds}
                setAttachedUnits={setSelectedProjectIds}
                icon={<Layers style={{ fontSize: '120px' }} />}
              ></AttachEntity>
            </Col>
          </Row>
        </div>
        <div className="form-card">
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
                        disabled={isView || kpi.migrated}
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
                        disabled={isView || kpi.migrated}
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
                  <Col span={isView || kpi.migrated ? 12 : 11}>
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
                  <Col span={isView || kpi.migrated ? 12 : 11}>
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
                        disabled={isView || kpi.migrated}
                        onChange={(e) => {
                          updateKPI(kpi.index, 'expected', e.target.value);
                        }}
                      />
                    </Form.Item>
                  </Col>
                  {!isView && !kpi.migrated ? (
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
                  ) : null}
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
                    marginTop: '15px',
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
  );
};

export default ProgrammeForm;
