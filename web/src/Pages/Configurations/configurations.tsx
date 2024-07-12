import { Button, Col, Form, Input, Row, Tabs } from 'antd';
import './configurations.scss';
import { useTranslation } from 'react-i18next';
import { BaselineForm } from '../../Components/Inventory/baselineForm';
import { getValidationRules } from '../../Utils/validationRules';
import { GWPGasses } from '../../Enums/configuration.enum';

const GhgConfigurations = () => {
  // Page Context

  const [form] = Form.useForm();
  const { t } = useTranslation(['configuration']);

  // Form Validation Rules

  const validation = getValidationRules('update');

  const items = [
    {
      key: '1',
      label: t('withMeasuresTitle'),
      children: <BaselineForm index={1} projectionType="withMeasures" />,
    },
    {
      key: '2',
      label: t('withAdditionalMeasuresTitle'),
      children: <BaselineForm index={1} projectionType="withAdditionalMeasures" />,
    },
    {
      key: '3',
      label: t('withoutMeasuresTitle'),
      children: <BaselineForm index={1} projectionType="withoutMeasures" />,
    },
  ];

  const saveGWP = async (payload: any) => {
    console.log('Clicked on Save GWP', payload);
  };

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
