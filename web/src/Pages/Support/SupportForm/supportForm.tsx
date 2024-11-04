import { useTranslation } from 'react-i18next';
import { Row, Col, Input, Button, Form, Select, message, Spin, Tooltip } from 'antd';
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
import { delay, doesUserHaveValidatePermission, getFormTitle } from '../../../Utils/utilServices';
import { Action } from '../../../Enums/action.enum';
import { SupportEntity } from '../../../Entities/support';
import { useAbilityContext } from '../../../Casl/Can';
import { processOptionalFields } from '../../../Utils/optionalValueHandler';
import {
  halfColumnBps,
  quarterColumnBps,
  shortButtonBps,
} from '../../../Definitions/breakpoints/breakpoints';
import { displayErrorMessage } from '../../../Utils/errorMessageHandler';
import { useUserContext } from '../../../Context/UserInformationContext/userInformationContext';
import ConfirmPopup from '../../../Components/Popups/Confirmation/confirmPopup';
import { DeleteOutlined } from '@ant-design/icons';

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
  const { t } = useTranslation(['supportForm', 'entityAction', 'error']);

  const isView: boolean = method === 'view' ? true : false;
  const formTitle = getFormTitle('Support', method);

  const navigate = useNavigate();
  const { get, post, put, delete: del } = useConnection();
  const ability = useAbilityContext();
  const { isValidationAllowed, setIsValidationAllowed } = useUserContext();
  const { entId } = useParams();

  // Form Validation Rules

  const validation = getValidationRules(method);

  // First Render Check

  const [isFirstRenderDone, setIsFirstRenderDone] = useState<boolean>(false);

  // Entity Validation Status

  const [isValidated, setIsValidated] = useState<boolean>(false);

  // Form General State

  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);

  // Spinner When Form Submit Occurs

  const [waitingForBE, setWaitingForBE] = useState<boolean>(false);
  const [waitingForValidation, setWaitingForValidation] = useState<boolean>(false);

  // Popup Definition

  const [openDeletePopup, setOpenDeletePopup] = useState<boolean>(false);

  // Detach Entity Data

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

  // Function to set conditional field rendering

  const renderNatureBasedFields = (financeNature: string) => {
    if (financeNature === 'International') {
      setIsInternational(true);
      setIsNational(false);
    } else if (financeNature === 'National') {
      setIsInternational(false);
      setIsNational(true);
    } else {
      setIsInternational(false);
      setIsNational(false);
    }
  };

  // DB Queries

  const fetchNonValidatedActivities = async () => {
    try {
      const payload = {
        sort: {
          key: 'activityId',
          order: 'ASC',
        },
      };
      const response: any = await post('national/activities/query', payload);
      const tempActivityData: ParentData[] = [];
      response.data.forEach((activity: any) => {
        tempActivityData.push({
          id: activity.activityId,
          title: activity.title,
        });
      });
      setParentList(tempActivityData);
    } catch (error: any) {
      displayErrorMessage(error);
    }
  };

  const fetchSupportData = async () => {
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
            internationalFinancialInstrument:
              entityData.internationalFinancialInstrument ?? undefined,
            nationalFinancialInstrument: entityData.nationalFinancialInstrument ?? undefined,
            financingStatus: entityData.financingStatus,
            internationalSource: entityData.internationalSource ?? undefined,
            nationalSource: entityData.nationalSource ?? undefined,
            requiredAmount: entityData.requiredAmount,
            receivedAmount: entityData.receivedAmount,
            exchangeRate: entityData.exchangeRate,
          });

          setAmountNeeded(entityData.requiredAmount ?? undefined);
          setAmountReceived(entityData.receivedAmount ?? undefined);
          setExchangeRate(entityData.exchangeRate ?? undefined);

          // Setting the field rendering conditions

          renderNatureBasedFields(entityData.financeNature);

          if (entityData.direction === 'Received') {
            setIsReceived(true);
          }

          // Setting validation status

          setIsValidated(entityData.validated ?? false);
        }
      } catch {
        navigate('/support');
      }
      setIsSaveButtonDisabled(true);
    }
  };

  // Form Submit

  const handleSubmit = async (payload: any) => {
    try {
      setWaitingForBE(true);

      payload.exchangeRate = parseFloat(payload.exchangeRate);
      payload.requiredAmount = parseFloat(payload.requiredAmount);
      payload.receivedAmount = parseFloat(payload.receivedAmount);

      let response: any;

      if (method === 'create') {
        response = await post('national/supports/add', processOptionalFields(payload, 'support'));
      } else if (method === 'update') {
        payload.supportId = entId;
        response = await put('national/supports/update', processOptionalFields(payload, 'support'));
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
      displayErrorMessage(error);
    } finally {
      setWaitingForBE(false);
    }
  };

  // Entity Validate

  const validateEntity = async () => {
    try {
      setWaitingForValidation(true);

      if (entId) {
        const payload = {
          entityId: entId,
          validateStatus: !isValidated,
        };
        const response: any = await post('national/supports/validateStatus', payload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content: isValidated ? t('supportUnvalidateSuccess') : t('supportValidateSuccess'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          navigate('/support');
        }
      }
    } catch (error: any) {
      if (error?.status) {
        if (error.status === 403) {
          setIsValidationAllowed(await doesUserHaveValidatePermission(get));
        }
        displayErrorMessage(error);
      } else {
        displayErrorMessage(error, `${entId} Validation Failed`);
      }
    } finally {
      setWaitingForValidation(false);
    }
  };

  // Entity Delete

  const deleteClicked = () => {
    setOpenDeletePopup(true);
  };

  const deleteEntity = async () => {
    try {
      setWaitingForBE(true);
      await delay(1000);

      if (entId) {
        const payload = {
          entityId: entId,
        };
        const response: any = await del('national/supports/delete', payload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content: t('supportDeleteSuccess'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          navigate('/support');
        }
      }
    } catch (error: any) {
      if (error?.message) {
        displayErrorMessage(error);
      } else {
        displayErrorMessage(error, `${entId} Delete Failed`);
      }
    }
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

  const handleValuesChange = () => {
    setIsSaveButtonDisabled(false);
  };

  // Dynamic Updates

  useEffect(() => {
    const updatedNeeded = (amountNeeded ?? 0) / (exchangeRate ?? 0);
    const updatedReceived = (amountReceived ?? 0) / (exchangeRate ?? 0);
    form.setFieldsValue({
      neededLocal: updatedNeeded > 0 ? parseFloat(updatedNeeded.toFixed(2)) : null,
      receivedLocal: updatedReceived > 0 ? parseFloat(updatedReceived.toFixed(2)) : null,
    });
  }, [exchangeRate, amountNeeded, amountReceived]);

  // Init Job

  useEffect(() => {
    Promise.all([fetchNonValidatedActivities(), fetchSupportData()]).then(() => {
      setIsFirstRenderDone(true);
    });
  }, []);

  return (
    <div className="content-container">
      <ConfirmPopup
        key={'delete_popup'}
        icon={<DeleteOutlined style={{ color: '#ff4d4f', fontSize: '120px' }} />}
        isDanger={true}
        content={{
          primaryMsg: `${t('deletePrimaryMsg')} ${entId}`,
          secondaryMsg: t('deleteSecondaryMsg'),
          cancelTitle: t('entityAction:cancel'),
          actionTitle: t('entityAction:delete'),
        }}
        actionRef={entId}
        doAction={deleteEntity}
        open={openDeletePopup}
        setOpen={setOpenDeletePopup}
      />
      <div className="title-bar">
        <div className="body-title">{t(formTitle)}</div>
      </div>
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        onValuesChange={handleValuesChange}
      >
        {!waitingForBE && isFirstRenderDone ? (
          <div className="support-form">
            <div className="form-section-card">
              <div className="form-section-header">{t('generalInfoTitle')}</div>
              {method !== 'create' && entId && (
                <EntityIdCard
                  calledIn="Support"
                  entId={entId}
                  isValidated={isValidated}
                ></EntityIdCard>
              )}
              <Row gutter={gutterSize}>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('selectActivityTitle')}</label>}
                    name="activityId"
                    rules={[validation.required]}
                  >
                    <Select
                      size={'large'}
                      style={{ fontSize: inputFontSize }}
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
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('supportDirectionTitle')}</label>}
                    name="direction"
                    rules={[validation.required]}
                  >
                    <Select
                      size={'large'}
                      style={{ fontSize: inputFontSize }}
                      disabled={isView}
                      showSearch
                      onChange={(direction) => {
                        form.setFieldsValue({
                          financingStatus: undefined,
                        });
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
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('financeNatureTitle')}</label>}
                    name="financeNature"
                    rules={[validation.required]}
                  >
                    <Select
                      size={'large'}
                      style={{ fontSize: inputFontSize }}
                      disabled={isView}
                      showSearch
                      onChange={(nature) => {
                        form.setFieldsValue({
                          internationalFinancialInstrument: undefined,
                          nationalFinancialInstrument: undefined,
                          internationalSource: undefined,
                          nationalSource: undefined,
                        });
                        renderNatureBasedFields(nature);
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
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('supportChannelTitle')}</label>}
                    name="internationalSupportChannel"
                    rules={[{ required: !isView, message: 'Required Field' }]}
                  >
                    <Select
                      size={'large'}
                      style={{ fontSize: inputFontSize }}
                      disabled={isView}
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
                {isInternational && (
                  <Col {...halfColumnBps}>
                    <Form.Item
                      label={
                        <label className="form-item-header">
                          {t('intFinancialInstrumentTitle')}
                        </label>
                      }
                      name="internationalFinancialInstrument"
                      rules={[{ required: !isView && isInternational, message: 'Required Field' }]}
                    >
                      <Select
                        size="large"
                        style={{ fontSize: inputFontSize }}
                        disabled={isView}
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
                )}
                {isNational && (
                  <Col {...halfColumnBps}>
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
                        disabled={isView}
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
                )}
                {isInternational && (
                  <Col {...halfColumnBps}>
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
                )}
                {isNational && (
                  <Col {...halfColumnBps}>
                    <Form.Item
                      label={<label className="form-item-header">{t('nationalSourceTitle')}</label>}
                      name="nationalSource"
                    >
                      <Input
                        className="form-input-box"
                        disabled={isView}
                        onChange={(e) => {
                          if (e.target.value === '') {
                            form.setFieldsValue({ nationalSource: undefined });
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                )}
              </Row>
              <Row gutter={gutterSize}>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('financeStatus')}</label>}
                    name="financingStatus"
                    rules={[{ required: !isView && isReceived, message: 'Required Field' }]}
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
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
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('exchangeRateTitle')}</label>}
                    name="exchangeRate"
                    rules={[validation.greaterThanZero, validation.required]}
                  >
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
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
              <Row gutter={gutterSize}>
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('neededUSDTitle')}</label>}
                    name="requiredAmount"
                    rules={[validation.required]}
                  >
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
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
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={
                      <label className="form-item-header-small">{t('neededLocalTitle')}</label>
                    }
                    name="neededLocal"
                  >
                    <Input type="number" className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                <Col {...quarterColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('receivedUSDTitle')}</label>}
                    name="receivedAmount"
                    rules={[validation.required]}
                  >
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
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
                <Col {...quarterColumnBps}>
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
            </div>
            {method === 'create' && (
              <Row className="sticky-footer" gutter={20} justify={'end'}>
                <Col>
                  <Button
                    type="default"
                    size="large"
                    block
                    onClick={() => {
                      navigate('/support');
                    }}
                  >
                    {t('entityAction:cancel')}
                  </Button>
                </Col>
                <Col {...shortButtonBps}>
                  <Form.Item>
                    <Button type="primary" size="large" block htmlType="submit">
                      {t('entityAction:add')}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            )}
            {method === 'view' && (
              <Row className="sticky-footer" gutter={20} justify={'end'}>
                <Col>
                  <Button
                    type="default"
                    size="large"
                    block
                    onClick={() => {
                      navigate('/support');
                    }}
                  >
                    {t('entityAction:back')}
                  </Button>
                </Col>
                {ability.can(Action.Validate, SupportEntity) && (
                  <Col>
                    <Form.Item>
                      <Tooltip
                        placement="topRight"
                        title={
                          !isValidationAllowed ? t('error:validationPermissionRequired') : undefined
                        }
                        showArrow={false}
                      >
                        <Button
                          type="primary"
                          size="large"
                          block
                          onClick={() => {
                            validateEntity();
                          }}
                          loading={waitingForValidation}
                          disabled={!isValidationAllowed}
                        >
                          {isValidated ? t('entityAction:unvalidate') : t('entityAction:validate')}
                        </Button>
                      </Tooltip>
                    </Form.Item>
                  </Col>
                )}
              </Row>
            )}
            {method === 'update' && (
              <Row className="sticky-footer" gutter={20} justify={'end'}>
                <Col>
                  <Button
                    type="default"
                    size="large"
                    block
                    onClick={() => {
                      navigate('/support');
                    }}
                  >
                    {t('entityAction:cancel')}
                  </Button>
                </Col>
                {ability.can(Action.Delete, SupportEntity) && (
                  <Col>
                    <Button
                      type="default"
                      size="large"
                      block
                      onClick={() => {
                        deleteClicked();
                      }}
                      style={{ color: 'red', borderColor: 'red' }}
                    >
                      {t('entityAction:delete')}
                    </Button>
                  </Col>
                )}
                <Col {...shortButtonBps}>
                  <Form.Item>
                    <Button
                      type="primary"
                      size="large"
                      block
                      htmlType="submit"
                      disabled={isSaveButtonDisabled}
                    >
                      {t('entityAction:update')}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            )}
          </div>
        ) : (
          <Spin className="loading-center" size="large" />
        )}
      </Form>
    </div>
  );
};

export default SupportForm;
