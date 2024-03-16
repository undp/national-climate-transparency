import { useTranslation } from 'react-i18next';
import './actionForm.scss';
import {
  Row,
  Col,
  Input,
  Dropdown,
  MenuProps,
  Button,
  Upload,
  Popover,
  List,
  Typography,
  Form,
} from 'antd';
import {
  CloseCircleOutlined,
  EllipsisOutlined,
  LinkOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import { useState } from 'react';
import DeleteCard from '../../../Components/Card/deleteCard';
import KpiGrid from '../../../Components/KPI/KpiGrid';
import LayoutTable from '../../../Components/common/Table/layout.table';

const gutterSize = 30;
const rowHeight = '85px';
const rowBottomMargin = '10px';
const multiLineHeight = '114px';
const fieldHeight = '40px';

const validation = { required: { required: true, message: 'Required Field' } };

const { TextArea } = Input;

type ActionMigratedData = {
  type: string[];
  ghgsAffected: string[];
  natImplementor: string;
  sectoredAffected: string[];
  estimatedInvestment: number;
  achievedReduct: number;
  expectedReduct: number;
};

enum InstrumentType {
  POLICY = 'Policy',
  REGULATORY = 'Regulatory',
  ECONOMIC = 'Economic',
  OTHER = 'Other',
}

const items: MenuProps['items'] = Object.keys(InstrumentType).map((key) => ({
  key,
  label: InstrumentType[key as keyof typeof InstrumentType],
}));

const actionForm = () => {
  const { t } = useTranslation(['actionList']);

  // form state

  const [documentList, setDocumentList] = useState<UploadFile[]>([]);
  const [kpiList, setKpiList] = useState<any[]>([]);
  const [migratedData, setMigratedData] = useState<ActionMigratedData>({
    type: ['Mitigation'],
    ghgsAffected: ['CO2', 'N2O'],
    natImplementor: 'Department of Energy',
    sectoredAffected: ['Energy'],
    estimatedInvestment: 1000,
    achievedReduct: 6,
    expectedReduct: 100,
  });

  const [programList, setProgramList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Form Submit

  const handleSubmit = (values: any) => {
    console.log('Form submitted with values:', values);
  };

  // Upload functionality

  const onChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setDocumentList(newFileList);
    console.log(newFileList);
  };

  const handleDelete = (fileId: any) => {
    setDocumentList((prevList) => prevList.filter((file) => file.uid !== fileId));
  };

  const props = {
    onChange,
    fileList: documentList,
    showUploadList: false,
  };

  // Add New KPI

  const createKPI = () => {
    const newItem = { name: 'name', unit: 'ktco2', ach: 0, exp: 0 };
    setKpiList((prevList) => [...prevList, newItem]);
  };

  // Action Menu definition

  const actionMenu = () => {
    return (
      <List
        className="action-menu"
        size="small"
        dataSource={[
          {
            text: 'Detach',
            icon: <CloseCircleOutlined style={{ color: 'red' }} />,
            isDisabled: false,
            click: () => {
              {
              }
            },
          },
        ]}
        renderItem={(item) =>
          !item.isDisabled && (
            <List.Item onClick={item.click}>
              <Typography.Text className="action-icon">{item.icon}</Typography.Text>
              <span>{item.text}</span>
            </List.Item>
          )
        }
      />
    );
  };

  // Column Definition
  const columns = [
    { title: t('Programme ID'), dataIndex: 'programmeId', key: 'actionId' },
    { title: t('Action ID'), dataIndex: 'actionId', key: 'activityId' },
    { title: t('Title of Index'), dataIndex: 'title', key: 'titleOfAction' },
    { title: t('Type'), dataIndex: 'type', key: 'actionType' },
    { title: t('Programme Status'), dataIndex: 'activityId', key: 'activityId' },
    {
      title: t('Sub-Sector Affected'),
      dataIndex: 'titleOfAction',
      key: 'titleOfAction',
    },
    {
      title: t('Esimated investment needs (USD)'),
      dataIndex: 'actionType',
      key: 'actionType',
    },
    {
      title: '',
      key: 'activityId',
      align: 'right' as const,
      width: 6,
      render: () => {
        return (
          <Popover placement="bottomRight" trigger="click" content={actionMenu()}>
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
    console.log('Pagination:', pagination);
  };

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('Add New Action')}</div>
        <div className="body-sub-title">
          {t('Lorem ipsum dolor sit amet, consectetur adipiscing elit,')}
        </div>
      </div>
      <Form onFinish={handleSubmit}>
        <div className="form-card">
          <div style={{ color: '#3A3541', opacity: 0.8, marginBottom: '25px', fontWeight: 'bold' }}>
            {'General Action Information'}
          </div>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{'Type (s)'}</div>
              <Dropdown
                menu={{
                  items,
                  selectable: true,
                }}
                trigger={['click']}
                disabled={true}
              >
                <Input style={{ height: fieldHeight }} value={migratedData?.type} />
              </Dropdown>
            </Col>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {'Title of Action'}
              </div>
              <Form.Item name="title" rules={[validation.required]}>
                <Input style={{ height: fieldHeight }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={12} style={{ height: multiLineHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {'Short Description of Action'}
              </div>
              <Form.Item name="description" rules={[validation.required]}>
                <TextArea rows={3} />
              </Form.Item>
            </Col>
            <Col span={12} style={{ height: multiLineHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {'Action Objectives'}
              </div>
              <Form.Item name="objective" rules={[validation.required]}>
                <TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {'GHG (s) Affected'}
              </div>
              <Dropdown
                menu={{
                  items,
                  selectable: true,
                }}
                disabled={true}
              >
                <Input style={{ height: fieldHeight }} value={migratedData?.ghgsAffected[0]} />
              </Dropdown>
            </Col>
            <Col span={6} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {'Type of Instruments'}
              </div>
              <Dropdown
                menu={{
                  items,
                  selectable: true,
                }}
                trigger={['click']}
              >
                <Form.Item name="instrumentType" rules={[validation.required]}>
                  <Input style={{ height: fieldHeight }} />
                </Form.Item>
              </Dropdown>
            </Col>
            <Col span={6} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {'Action Status'}
              </div>
              <Dropdown
                menu={{
                  items,
                  selectable: true,
                }}
              >
                <Form.Item name="actionStatus" rules={[validation.required]}>
                  <Input style={{ height: fieldHeight }} />
                </Form.Item>
              </Dropdown>
            </Col>
          </Row>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {'National Implementing Entity (s)'}
              </div>
              <Dropdown
                menu={{
                  items,
                  selectable: true,
                }}
                disabled={true}
              >
                <Input style={{ height: fieldHeight }} value={migratedData?.natImplementor} />
              </Dropdown>
            </Col>
            <Col span={6} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {'Sector (s) Affected'}
              </div>
              <Dropdown
                menu={{
                  items,
                  selectable: true,
                }}
                disabled={true}
              >
                <Input style={{ height: fieldHeight }} value={migratedData?.sectoredAffected[0]} />
              </Dropdown>
            </Col>
            <Col span={6} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{'Start Year'}</div>
              <Dropdown
                menu={{
                  items,
                  selectable: true,
                }}
              >
                <Form.Item name="startYear" rules={[validation.required]}>
                  <Input style={{ height: fieldHeight }} />
                </Form.Item>
              </Dropdown>
            </Col>
          </Row>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {'Estimated Investment Needs (USD)'}
              </div>
              <Dropdown
                menu={{
                  items,
                  selectable: true,
                }}
                disabled={true}
              >
                <Input style={{ height: fieldHeight }} value={migratedData?.estimatedInvestment} />
              </Dropdown>
            </Col>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {'Anchored in a National Strategy'}
              </div>
              <Dropdown
                menu={{
                  items,
                  selectable: true,
                }}
              >
                <Form.Item name="natAnchor" rules={[validation.required]}>
                  <Input style={{ height: fieldHeight }} />
                </Form.Item>
              </Dropdown>
            </Col>
          </Row>
          <Row
            gutter={[gutterSize, 8]}
            style={{ marginBottom: rowBottomMargin, marginTop: '20px' }}
          >
            <Col span={3} style={{ height: fieldHeight }}>
              <Upload {...props}>
                <Button icon={<UploadOutlined />} style={{ width: '120px', height: fieldHeight }}>
                  Upload
                </Button>
              </Upload>
            </Col>
            <Col span={21}>
              <Row gutter={[gutterSize, 10]}>
                {documentList.map((file: any) => (
                  <Col span={8} style={{ height: fieldHeight }}>
                    <DeleteCard
                      fileName={file.name.slice(0, 26)}
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
                {'List of Programme under the Action'}
              </div>
            </Col>
            <Col span={4}>
              <Button
                type="primary"
                size="large"
                block
                icon={<LinkOutlined />}
                style={{ padding: 0 }}
              >
                {t('ATTACH PROGRAMMES')}
              </Button>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <LayoutTable
                tableData={programList}
                columns={columns}
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
                emptyMessage={'No Programmes Attached'}
              />
            </Col>
          </Row>
        </div>
        <div className="form-card">
          <div style={{ color: '#3A3541', opacity: 0.8, marginBottom: '25px', fontWeight: 'bold' }}>
            {'Mitigation Information'}
          </div>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                {'GHG(s) Affected'}
              </div>
              <Dropdown
                menu={{
                  items,
                  selectable: true,
                }}
                disabled={true}
              >
                <Input
                  style={{ height: fieldHeight }}
                  value={migratedData?.ghgsAffected[0]}
                  disabled={true}
                />
              </Dropdown>
            </Col>
          </Row>
          <div style={{ color: '#3A3541', opacity: 0.8, marginTop: '25px', marginBottom: '10px' }}>
            {'Estimates of GHG emission reductions (ktCO2e)'}
          </div>
          <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{'Achieved'}</div>
              <Input
                style={{ height: fieldHeight }}
                value={migratedData?.achievedReduct}
                disabled={true}
              />
            </Col>
            <Col span={12} style={{ height: rowHeight }}>
              <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{'Expected'}</div>
              <Input
                style={{ height: fieldHeight }}
                value={migratedData?.expectedReduct}
                disabled={true}
              />
            </Col>
          </Row>
          <div style={{ color: '#3A3541', opacity: 0.8, marginTop: '25px', marginBottom: '10px' }}>
            {'Other Programme KPI Value'}
          </div>
          {kpiList.map((kpi: any) => (
            <KpiGrid
              kpiData={kpi}
              gutterSize={gutterSize}
              rowHeight={rowHeight}
              fieldHeight={fieldHeight}
              rowBottomMargin={rowBottomMargin}
              shownAt="creator"
            ></KpiGrid>
          ))}
          <Row justify={'start'}>
            <Col span={2} style={{ height: fieldHeight }}>
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
                {t('Add KPI')}
              </Button>
            </Col>
          </Row>
        </div>
        <Row gutter={20} justify={'end'}>
          <Col span={2} style={{ height: fieldHeight }}>
            <Button type="default" size="large" block>
              {t('CANCEL')}
            </Button>
          </Col>
          <Col span={2} style={{ height: fieldHeight }}>
            <Form.Item>
              <Button type="primary" size="large" block htmlType="submit">
                {t('ADD')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default actionForm;
