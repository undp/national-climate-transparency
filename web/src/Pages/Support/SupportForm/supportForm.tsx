import { useTranslation } from 'react-i18next';
import { Row, Col, Input, Button, Form, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import './supportForm.scss';
import {
  FinanceNature,
  FinancingStatus,
  IntFinInstrument,
  IntSource,
  IntSupChannel,
  NatFinInstrument,
  SupportDirection,
} from '../../../Enums/support.enum';
import EntityIdCard from '../../../Components/EntityIdCard/entityIdCard';
import { getValidationRules } from '../../../Utils/validationRules';
import { getFormTitle } from '../../../Utils/utilServices';
import { Action } from '../../../Enums/action.enum';
import { SupportEntity } from '../../../Entities/support';
import { useAbilityContext } from '../../../Casl/Can';

const { Option } = Select;

const gutterSize = 30;
const inputFontSize = '13px';

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
  const formTitle = getFormTitle('Support', method);

  const navigate = useNavigate();
  const { post, put } = useConnection();
  const ability = useAbilityContext();
  const { entId } = useParams();

  // Form Validation Rules

  const validation = getValidationRules(method);

  // Entity Validation Status

  const [isValidated, setIsValidated] = useState<boolean>(false);

  // Form General State

  //MARK:TO DO
  // const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);

  // Field Disabling state

  const [isInternational, setIsInternational] = useState<boolean>(false);
  const [isNational, setIsNational] = useState<boolean>(false);
  const [isReceived, setIsReceived] = useState<boolean>(false);

  // Currency Conversion

  const [exchangeRate, setExchangeRate] = useState<number>();
  const [amountNeeded, setAmountNeeded] = useState<number>();
  const [amountReceived, setAmountReceived] = useState<number>();

  // Parent Selection State

  const [parentList, setParentList] = useState<ParentData[]>([]);

  // Initialization Logic

  useEffect(() => {
    // Fetching All Activities which can be the parent
    const fetchAllActivities = async () => {
      const response: any = await post('national/activities/query', {});
      const tempActivityData: ParentData[] = [];
      response.data.forEach((activity: any) => {
        tempActivityData.push({
          id: activity.activityId,
          title: activity.title,
        });
      });
      setParentList(tempActivityData);
    };
    fetchAllActivities();

    // Initially Loading the underlying support data when not in create mode

    const fetchData = async () => {
      if (method !== 'create' && entId) {
        let response: any;
        try {
          const payload = {
            filterAnd: [
              {
                key: 'supportId',
                operation: '=',
                value: entId,
              },
            ],
          };
          response = await post('national/supports/query', payload);

          if (response.response.data.total === 1) {
            const entityData: any = response.data[0];
            // Populating Action owned data fields
            form.setFieldsValue({
              activityId: entityData.activity?.activityId ?? undefined,
              direction: entityData.direction,
              financeNature: entityData.financeNature,
              internationalSupportChannel: entityData.internationalSupportChannel,
              otherInternationalSupportChannel: entityData.otherInternationalSupportChannel,
              internationalFinancialInstrument: entityData.internationalFinancialInstrument,
              otherInternationalFinancialInstrument:
                entityData.otherInternationalFinancialInstrument,
              nationalFinancialInstrument: entityData.nationalFinancialInstrument,
              otherNationalFinancialInstrument: entityData.otherNationalFinancialInstrument,
              financingStatus: entityData.financingStatus,
              internationalSource: entityData.internationalSource ?? undefined,
              nationalSource: entityData.nationalSource,
              requiredAmount: entityData.requiredAmount,
              receivedAmount: entityData.receivedAmount,
              exchangeRate: entityData.exchangeRate,
            });

            setAmountNeeded(entityData.requiredAmount ?? undefined);
            setAmountReceived(entityData.receivedAmount ?? undefined);
            setExchangeRate(entityData.exchangeRate ?? undefined);
            setIsValidated(entityData.validated ?? false);
          }
        } catch {
          navigate('/support');
          message.open({
            type: 'error',
            content: t('noSuchEntity'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });
        }
        // setIsSaveButtonDisabled(true);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const updatedNeeded = (amountNeeded ?? 0) / (exchangeRate ?? 0);
    const updatedReceived = (amountReceived ?? 0) / (exchangeRate ?? 0);
    form.setFieldsValue({
      neededLocal: updatedNeeded > 0 ? parseFloat(updatedNeeded.toFixed(3)) : null,
      receivedLocal: updatedReceived > 0 ? parseFloat(updatedReceived.toFixed(3)) : null,
    });
  }, [exchangeRate, amountNeeded, amountReceived]);

  // Form Submit

  const handleSubmit = async (payload: any) => {
    try {
      payload.exchangeRate = parseFloat(payload.exchangeRate);
      payload.requiredAmount = parseFloat(payload.requiredAmount);
      payload.receivedAmount = parseFloat(payload.receivedAmount);

      let response: any;

      if (method === 'create') {
        response = await post('national/supports/add', payload);
      } else if (method === 'update') {
        payload.supportId = entId;
        response = await put('national/supports/update', payload);
      }

      const successMsg =
        method === 'create' ? t('supportCreationSuccess') : t('supportUpdateSuccess');

      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: successMsg,
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        navigate('/support');
      }
    } catch (error: any) {
      message.open({
        type: 'error',
        content: `${error.message}`,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    }
  };

  // Entity Validate

  const validateEntity = async () => {
    try {
      if (entId) {
        const payload = {
          entityId: entId,
        };
        const response: any = await post('national/supports/validate', payload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content: 'Successfully Validated !',
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          navigate('/support');
        }
      }
    } catch {
      message.open({
        type: 'error',
        content: `${entId} Validation Failed`,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    }
  };

  // Entity Delete

  const deleteEntity = () => {
    console.log('Delete Clicked');
  };

  // State update for currency inputs

  const handleCurrencyChange = (value: number, whichField: 'needed' | 'received' | 'rate') => {
    switch (whichField) {
      case 'needed':
        setAmountNeeded(value);
        break;
      case 'received':
        setAmountReceived(value);
        break;
      case 'rate':
        setExchangeRate(value);
        break;
    }
  };

  // Save Button Enable when form value change

  // const handleValuesChange = () => {
  //   setIsSaveButtonDisabled(false);
  // };

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t(formTitle)}</div>
      </div>
      <div className="support-form">
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          // onValuesChange={handleValuesChange}
        >
          <div className="form-section-card">
            <div className="form-section-header">{t('generalInfoTitle')}</div>
            {method !== 'create' && entId && (
              <EntityIdCard calledIn="Support" entId={entId}></EntityIdCard>
            )}
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
                        {parent.id}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('supportDirectionTitle')}</label>}
                  name="direction"
                  rules={[validation.required]}
                >
                  <Select
                    size={'large'}
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                    onChange={(direction) => {
                      if (direction === 'Received') {
                        setIsReceived(true);
                      } else {
                        setIsReceived(false);
                      }
                    }}
                  >
                    {Object.values(SupportDirection).map((support) => (
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
                  label={<label className="form-item-header">{t('financeNatureTitle')}</label>}
                  name="financeNature"
                  rules={[validation.required]}
                >
                  <Select
                    size={'large'}
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                    onChange={(nature) => {
                      if (nature === 'International') {
                        setIsInternational(true);
                        setIsNational(false);
                      } else if (nature === 'National') {
                        setIsInternational(false);
                        setIsNational(true);
                      } else {
                        setIsInternational(false);
                        setIsNational(false);
                      }
                    }}
                  >
                    {Object.values(FinanceNature).map((nature) => (
                      <Option key={nature} value={nature}>
                        {nature}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('intSupportChannelTitle')}</label>}
                  name="internationalSupportChannel"
                  rules={[{ required: !isView && isInternational, message: 'Required Field' }]}
                >
                  <Select
                    size={'large'}
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView || !isInternational}
                    showSearch
                  >
                    {Object.values(IntSupChannel).map((channel) => (
                      <Option key={channel} value={channel}>
                        {channel}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('otherIntSupportChannel')}</label>}
                  name="otherInternationalSupportChannel"
                  rules={[validation.required]}
                >
                  <Input className="form-input-box" disabled={isView} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <label className="form-item-header">{t('intFinancialInstrumentTitle')}</label>
                  }
                  name="internationalFinancialInstrument"
                  rules={[{ required: !isView && isInternational, message: 'Required Field' }]}
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView || !isInternational}
                    showSearch
                  >
                    {Object.values(IntFinInstrument).map((instrument) => (
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
                    <label className="form-item-header">
                      {t('otherIntFinanceInstrumentTitle')}
                    </label>
                  }
                  name="otherInternationalFinancialInstrument"
                  rules={[validation.required]}
                >
                  <Input className="form-input-box" disabled={isView} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <label className="form-item-header">{t('nationalFinanceInstrument')}</label>
                  }
                  name="nationalFinancialInstrument"
                  rules={[{ required: !isView && isNational, message: 'Required Field' }]}
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView || !isNational}
                    showSearch
                  >
                    {Object.values(NatFinInstrument).map((instrument) => (
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
                    <label className="form-item-header">
                      {t('otherNatFinanceInstrumentTitle')}
                    </label>
                  }
                  name="otherNationalFinancialInstrument"
                >
                  <Input className="form-input-box" disabled={isView} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('financeStatus')}</label>}
                  name="financingStatus"
                  rules={[{ required: !isView && isReceived, message: 'Required Field' }]}
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView || !isReceived}
                    showSearch
                  >
                    {Object.values(FinancingStatus).map((status) => (
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
                  label={
                    <label className="form-item-header">{t('internationalSourceTitle')}</label>
                  }
                  name="internationalSource"
                >
                  <Select
                    size="large"
                    mode="multiple"
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {Object.values(IntSource).map((source) => (
                      <Option key={source} value={source}>
                        {source}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('nationalSourceTitle')}</label>}
                  name="nationalSource"
                >
                  <Input className="form-input-box" disabled={isView} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('neededUSDTitle')}</label>}
                  name="requiredAmount"
                  rules={[validation.required]}
                >
                  <Input
                    type="number"
                    min={0}
                    className="form-input-box"
                    onChange={(event) => {
                      const value = parseFloat(event.target.value);
                      handleCurrencyChange(value, 'needed');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === '+') {
                        e.preventDefault();
                      }
                    }}
                    disabled={isView}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header-small">{t('neededLocalTitle')}</label>}
                  name="neededLocal"
                >
                  <Input type="number" className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('receivedUSDTitle')}</label>}
                  name="receivedAmount"
                  rules={[validation.required]}
                >
                  <Input
                    type="number"
                    min={0}
                    className="form-input-box"
                    onChange={(event) => {
                      const value = parseFloat(event.target.value);
                      handleCurrencyChange(value, 'received');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === '+') {
                        e.preventDefault();
                      }
                    }}
                    disabled={isView}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={
                    <label className="form-item-header-small">{t('receivedLocalTitle')}</label>
                  }
                  name="receivedLocal"
                >
                  <Input type="number" className="form-input-box" disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('exchangeRateTitle')}</label>}
                  name="exchangeRate"
                  rules={[validation.greaterThanZero, validation.required]}
                >
                  <Input
                    type="number"
                    min={0}
                    className="form-input-box"
                    onChange={(event) => {
                      const value = parseFloat(event.target.value);
                      handleCurrencyChange(value, 'rate');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === '+') {
                        e.preventDefault();
                      }
                    }}
                    disabled={isView}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
          {method === 'create' && (
            <Row gutter={20} justify={'end'}>
              <Col span={2}>
                <Button
                  type="default"
                  size="large"
                  block
                  onClick={() => {
                    navigate('/support');
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
                    navigate('/support');
                  }}
                >
                  {t('back')}
                </Button>
              </Col>
              {ability.can(Action.Validate, SupportEntity) && (
                <Col span={2.5}>
                  <Form.Item>
                    <Button
                      disabled={isValidated}
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
              )}
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
                    navigate('/support');
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
                  <Button
                    type="primary"
                    size="large"
                    block
                    htmlType="submit"
                    // disabled={isSaveButtonDisabled}
                  >
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

export default SupportForm;
