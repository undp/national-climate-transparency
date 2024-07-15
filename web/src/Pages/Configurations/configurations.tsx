import { Button, Col, Form, Input, message, Row, Tabs } from 'antd';
import './configurations.scss';
import { useTranslation } from 'react-i18next';
import { BaselineForm } from '../../Components/Inventory/baselineForm';
import { getValidationRules } from '../../Utils/validationRules';
import { GWPGasses } from '../../Enums/configuration.enum';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { displayErrorMessage } from '../../Utils/errorMessageHandler';
import { useEffect } from 'react';
import { ProjectionType } from '../../Enums/projection.enum';

const GhgConfigurations = () => {
  // Page Context

  const [form] = Form.useForm();
  const { t } = useTranslation(['configuration']);
  const { get, post } = useConnection();

  // Form Validation Rules

  const validation = getValidationRules('update');

  const items = [
    {
      key: '1',
      label: t('withMeasuresTitle'),
      children: <BaselineForm index={1} projectionType={ProjectionType.WITH_MEASURES} />,
    },
    {
      key: '2',
      label: t('withAdditionalMeasuresTitle'),
      children: <BaselineForm index={1} projectionType={ProjectionType.WITH_ADDITIONAL_MEASURES} />,
    },
    {
      key: '3',
      label: t('withoutMeasuresTitle'),
      children: <BaselineForm index={1} projectionType={ProjectionType.WITHOUT_MEASURES} />,
    },
  ];

  const saveGWP = async (payload: any) => {
    try {
      const gwpPayload = {
        id: 'GWP',
        settingValue: { gwp_ch4: payload.gwp_ch4, gwp_n2o: payload.gwp_n2o },
      };

      const response: any = await post('national/settings/update', gwpPayload);

      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: t('gwpUpdateSuccess'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
      }
    } catch (error: any) {
      displayErrorMessage(error);
    }
  };

  // Init Loading

  const getGWP = async () => {
    try {
      const response = await get('national/settings/GWP');

      if (response.status === 200 || response.status === 201) {
        form.setFieldsValue({
          gwp_ch4: response.data.gwp_ch4,
          gwp_n2o: response.data.gwp_n2o,
        });
      }
    } catch (error) {
      console.log(error, 'GWP Settings Not Found');
    }
  };

  useEffect(() => {
    getGWP();
  }, []);

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('configurationTitle')}</div>
      </div>
      <div className="configuration-section-card">
        <div className="form-section-header">{t('gwpConfigurationTitle')}</div>
        <Form form={form} onFinish={saveGWP} layout="vertical">
          <Row className="gwp-values">
            <Col span={18}>
              <Row gutter={20}>
                <Col span={8}>
                  <Form.Item
                    label={<label className="form-item-header">{t(`gwp_${GWPGasses.CO2}`)}</label>}
                  >
                    <Input disabled className="form-input-box" type="number" value={1} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={<label className="form-item-header">{t(`gwp_${GWPGasses.CH4}`)}</label>}
                    name="gwp_ch4"
                    rules={[validation.required]}
                  >
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      className="form-input-box"
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e' || e.key === '+') {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={<label className="form-item-header">{t(`gwp_${GWPGasses.N2O}`)}</label>}
                    name="gwp_n2o"
                    rules={[validation.required]}
                  >
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      className="form-input-box"
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e' || e.key === '+') {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={6}>
              <Row justify={'end'}>
                <Col span={8}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    htmlType="submit"
                    className="gwp-save-button"
                  >
                    {t('entityAction:save')}
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </div>
      <div className="configuration-section-card">
        <div className="form-section-header">{t('growthRateConfigurationTitle')}</div>
        <Tabs defaultActiveKey="1" centered items={items} />
      </div>
    </div>
  );
};

export default GhgConfigurations;
