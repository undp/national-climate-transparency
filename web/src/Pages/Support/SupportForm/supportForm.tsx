import { useTranslation } from 'react-i18next';
import { Row, Col, Input, Button, Form, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import './supportForm.scss';
import {
  ActivityStatus,
  ImplMeans,
  Measure,
  SupportType,
  TechnologyType,
} from '../../../Enums/activity.enum';
import { IntImplementor, NatImplementor } from '../../../Enums/shared.enum';

const { Option } = Select;

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

const SupportForm: React.FC<Props> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['supportForm']);
  const isView: boolean = method === 'view' ? true : false;

  const navigate = useNavigate();
  const { post } = useConnection();

  // Parent Selection State

  const [parentList, setParentList] = useState<ParentData[]>([]);

  // TODO : Connect to the BE Endpoints for data fetching
  // Initialization Logic

  useEffect(() => {
    console.log('Running Parent Id Population');
    const prefix = 'T';
    const parentIds: ParentData[] = [];
    for (let i = 0; i < 15; i++) {
      parentIds.push({
        id: `${prefix}00${i}`,
        title: `${prefix}00${i}`,
      });
    }
    setParentList(parentIds);
  }, []);

  // Form Submit

  const handleSubmit = async (payload: any) => {
    try {
      const response = await post('national/supports/add', payload);
      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: t('supportCreationSuccess'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        navigate('/support');
      }
    } catch (error: any) {
      console.log('Error in Support creation', error);
      message.open({
        type: 'error',
        content: `${error.message}`,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    }
  };

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('addSupportTitle')}</div>
        <div className="body-sub-title">{t('addSupportDesc')}</div>
      </div>
      <div className="support-form">
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <div className="form-section-card">
            <div className="form-section-header">{t('generalInfoTitle')}</div>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('selectActivityTitle')}</label>}
                  name="activityId"
                  rules={[validation.required]}
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
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('activityDescTitle')}</label>}
                  name="description"
                  rules={[validation.required]}
                >
                  <Select
                    size={'large'}
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
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('selectActivityTitle')}</label>}
                  name="activityId"
                  rules={[validation.required]}
                >
                  <Select
                    size={'large'}
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
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('activityDescTitle')}</label>}
                  name="description"
                  rules={[validation.required]}
                >
                  <Select
                    size={'large'}
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
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('affSectorsTitle')}</label>}
                  name="affSectors"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
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
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('affSectorsTitle')}</label>}
                  name="affSectors"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
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
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('affSectorsTitle')}</label>}
                  name="affSectors"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
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
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('affSectorsTitle')}</label>}
                  name="affSectors"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={gutterSize}>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('anchoredTitle')}</label>}
                  name="isAnchored"
                >
                  <Input type="number" className="form-input-box" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('anchoredTitle')}</label>}
                  name="isAnchored"
                >
                  <Input type="number" className="form-input-box" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('anchoredTitle')}</label>}
                  name="isAnchored"
                >
                  <Input type="number" className="form-input-box" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('anchoredTitle')}</label>}
                  name="isAnchored"
                >
                  <Input type="number" className="form-input-box" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('techTypeTitle')}</label>}
                  name="techType"
                >
                  <Input type="number" className="form-input-box" />
                </Form.Item>
              </Col>
            </Row>
          </div>
          {method !== 'create' && (
            <div className="form-section-card">
              <Row>
                <Col span={6}>
                  <div className="form-section-header">{t('supportTableHeader')}</div>
                </Col>
              </Row>
              <Row></Row>
            </div>
          )}
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
        </Form>
      </div>
    </div>
  );
};

export default SupportForm;
