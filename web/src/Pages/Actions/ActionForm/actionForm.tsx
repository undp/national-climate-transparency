import { useTranslation } from 'react-i18next';
import './actionForm.scss';
import { Row, Col, Input, Button, Popover, List, Typography, Form, Select, message } from 'antd';
import {
  AppstoreOutlined,
  CloseCircleOutlined,
  EllipsisOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { InstrumentType, ActionStatus, NatAnchor } from '../../../Enums/action.enum';
import { useNavigate } from 'react-router-dom';
import { useConnection } from '@undp/carbon-library';
import UploadFileGrid from '../../../Components/Upload/uploadFiles';
import AttachEntity from '../../../Components/Popups/attach';
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

type NewKpiData = {
  index: number;
  name: string;
  unit: string;
  creatorType: string;
  expected: number;
};

type ProgrammeData = {
  key: string;
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

  const navigate = useNavigate();
  const { post } = useConnection();

  // form state

  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; title: string; data: string }[]>(
    []
  );

  // Popover state

  const [detachOpen, setDetachOpen] = useState<boolean[]>([]);

  // projects state

  const [allProgramIds, setAllProgramIdList] = useState<string[]>([]);
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([]);
  const [programData, setProgramData] = useState<ProgrammeData[]>([]);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [pageSize, setPageSize] = useState<number>(10);

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
    const progIds: string[] = [];
    for (let i = 0; i < 15; i++) {
      progIds.push(`P00${i}`);
    }
    setAllProgramIdList(progIds);
  }, []);

  useEffect(() => {
    const tempProgData: ProgrammeData[] = [];
    selectedProgramIds.forEach((progId) => {
      tempProgData.push({
        key: progId,
        programmeId: progId,
        actionId: 'action id',
        title: 'test title',
        type: 'test type',
        status: 'test status',
        subSectorsAffected: 'sub sec',
        estimatedInvestment: 500,
      });
    });

    setProgramData(tempProgData);
    setDetachOpen(Array(selectedProgramIds.length).fill(false));
  }, [selectedProgramIds]);

  useEffect(() => {
    console.log('Running Migration Update');

    if (method !== 'create') {
      console.log('Get the Action Information and load them');
    }

    form.setFieldsValue({
      type: ['Mitigation'],
      ghgsAffected: ['CO2', 'N2O'],
      natImplementor: 'Department of Energy',
      sectorsdAffected: ['Energy'],
      estimatedInvestment: 1000,
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
  }, [programData]);

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

      payload.linkedProgrammes = [];
      programData.forEach((program) => {
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

  // Dettach Programme

  const handleDetachOpen = (record: any) => {
    const newOpenList = Array(selectedProgramIds.length).fill(false);
    newOpenList[selectedProgramIds.indexOf(record.programmeId)] = true;
    setDetachOpen(newOpenList);
  };

  const detachProgramme = (prgId: string) => {
    const filteredData = programData.filter((prg) => prg.programmeId !== prgId);
    const filteredIds = selectedProgramIds.filter((id) => id !== prgId);
    setProgramData(filteredData);
    setSelectedProgramIds(filteredIds);
  };

  // Add New KPI

  const createKPI = () => {
    const kpiIndex = Math.floor(Date.now() / 1000);
    const newItem: NewKpiData = {
      index: kpiIndex,
      name: '',
      unit: '',
      creatorType: 'action',
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
      key: 'programmeAcion',
      align: 'right' as const,
      width: 6,
      render: (record: any) => {
        return (
          <Popover
            placement="bottomRight"
            trigger="click"
            content={actionMenu(record)}
            open={detachOpen[selectedProgramIds.indexOf(record.programmeId)]}
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
        <div className="body-title">{t('addActionTitle')}</div>
        <div className="body-sub-title">{t('addActionDesc')}</div>
      </div>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <div className="form-card">
          <div style={{ color: '#3A3541', opacity: 0.8, marginBottom: '25px', fontWeight: 'bold' }}>
            {t('generalInfoTitle')}
          </div>
          <Row gutter={gutterSize}>
            <Col span={12}>
              <Form.Item
                label={<label style={{ color: '#3A3541', opacity: 0.8 }}>{t('typesTitle')}</label>}
                name="type"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<label style={{ color: '#3A3541', opacity: 0.8 }}>{t('actionTitle')}</label>}
                name="title"
                rules={[validation.required]}
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled={isView} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutterSize}>
            <Col span={12}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('actionDescTitle')}</label>
                }
                name="description"
                rules={[validation.required]}
              >
                <TextArea rows={3} disabled={isView} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('actionObjectivesTitle')}
                  </label>
                }
                name="objective"
                rules={[validation.required]}
              >
                <TextArea rows={3} disabled={isView} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutterSize}>
            <Col span={12}>
              <Form.Item
                label={<label style={{ color: '#3A3541', opacity: 0.8 }}>{t('ghgAffected')}</label>}
                name="ghgsAffected"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('instrTypeTitle')}</label>
                }
                name="instrumentType"
                rules={[validation.required]}
              >
                <Select
                  size="large"
                  style={{ fontSize: inputFontSize }}
                  allowClear
                  disabled={isView}
                  showSearch
                >
                  {Object.values(InstrumentType).map((instrument) => (
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
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('actionStatusTitle')}</label>
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
                  {Object.values(ActionStatus).map((instrument) => (
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
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('natImplementorTitle')}
                  </label>
                }
                name="natImplementor"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>
                    {t('sectorsAffectedTitle')}
                  </label>
                }
                name="sectorsdAffected"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
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
          </Row>
          <Row gutter={gutterSize}>
            <Col span={12}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('investmentNeeds')}</label>
                }
                name="estimatedInvestment"
              >
                <Input style={{ fontSize: inputFontSize, height: '40px' }} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <label style={{ color: '#3A3541', opacity: 0.8 }}>{t('natAnchorTitle')}</label>
                }
                name="natAnchor"
                rules={[validation.required]}
              >
                <Select
                  size="large"
                  style={{ fontSize: inputFontSize }}
                  allowClear
                  disabled={isView}
                  showSearch
                >
                  {Object.values(NatAnchor).map((instrument) => (
                    <Option key={instrument} value={instrument}>
                      {instrument}
                    </Option>
                  ))}
                </Select>
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
        </div>
        <div className="form-card">
          <Row>
            <Col span={6} style={{ paddingTop: '6px' }}>
              <div
                style={{ color: '#3A3541', opacity: 0.8, marginBottom: '25px', fontWeight: 'bold' }}
              >
                {t('programInfoTitle')}
              </div>
            </Col>
            <Col span={4}>
              <AttachEntity
                isDisabled={isView}
                options={allProgramIds}
                content={{
                  buttonName: t('attachProgramme'),
                  attach: t('attach'),
                  contentTitle: t('attachProgramme'),
                  listTitle: t('programmeList'),
                  cancel: t('cancel'),
                }}
                attachedUnits={selectedProgramIds}
                setAttachedUnits={setSelectedProgramIds}
                icon={<AppstoreOutlined style={{ fontSize: '120px' }} />}
              ></AttachEntity>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <LayoutTable
                tableData={programData}
                columns={progTableColumns}
                loading={false}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: programData.length,
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
          <div style={{ color: '#3A3541', opacity: 0.8, marginTop: '25px', marginBottom: '10px' }}>
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
          <div style={{ color: '#3A3541', opacity: 0.8, marginTop: '25px', marginBottom: '10px' }}>
            {t('kpiInfoTitle')}
          </div>
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
                  navigate('/actions');
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

export default actionForm;
