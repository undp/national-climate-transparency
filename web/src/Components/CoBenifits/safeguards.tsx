import React, { useEffect, useState } from 'react';
import { FormElementType, RadioButtonStatus2 } from '../../Definitions/commonEnums';
import { useTranslation } from 'react-i18next';
import { Form, Radio } from 'antd';

const Safeguards = (props: any) => {
  const { onFormSubmit } = props;
  const { t } = useTranslation(['safeguards']);
  const [safeguardDetails, setSafeguardDetails] = useState();
  const safeGuardFormElementDetails = [
    {
      type: FormElementType.Label,
      label: t('humanRights'),
    },
    {
      type: FormElementType.Radio,
      label: t('isRespectHumanRights'),
      name: 'isRespectHumanRights',
    },
    {
      type: FormElementType.Radio,
      label: t('isProjectdiscriminate'),
      name: 'isProjectdiscriminate',
    },
    {
      type: FormElementType.Label,
      label: t('genderEquality'),
    },
    {
      type: FormElementType.Radio,
      label: t('genderEqualityQ1'),
      name: 'genderEqualityQ1',
    },
    {
      type: FormElementType.Radio,
      label: t('genderEqualityQ2'),
      name: 'genderEqualityQ2',
    },
    {
      type: FormElementType.Radio,
      label: t('genderEqualityQ3'),
      name: 'genderEqualityQ3',
    },
    {
      type: FormElementType.Radio,
      label: t('genderEqualityQ4'),
      name: 'genderEqualityQ4',
    },
    {
      type: FormElementType.Label,
      label: t('communityHealth'),
    },
    {
      type: FormElementType.Radio,
      label: t('communityHealthQ1'),
      name: 'communityHealthQ1',
    },
    {
      type: FormElementType.Label,
      label: t('historicHeritage'),
    },
    {
      type: FormElementType.Radio,
      label: t('historicHeritageQ1'),
      name: 'historicHeritageQ1',
    },
    {
      type: FormElementType.Label,
      label: t('forcedEviction'),
    },
    {
      type: FormElementType.Radio,
      label: t('forcedEvictionQ1'),
      name: 'forcedEvictionQ1',
    },
    {
      type: FormElementType.Label,
      label: t('landTenure'),
    },
    {
      type: FormElementType.Radio,
      label: t('landTenureQ1'),
      name: 'landTenureQ1',
    },
    {
      type: FormElementType.Radio,
      label: t('landTenureQ2'),
      name: 'landTenureQ2',
    },
    {
      type: FormElementType.Label,
      label: t('indegenousPeople'),
    },
    {
      type: FormElementType.Radio,
      label: t('forcedEvictionQ1'),
      name: 'indegenousPeopleQ1',
    },
    {
      type: FormElementType.Label,
      label: t('corruption'),
    },
    {
      type: FormElementType.Radio,
      label: t('corruptionQ1'),
      name: 'corruptionQ1',
    },
    {
      type: FormElementType.Label,
      label: t('labourRights'),
    },
    {
      type: FormElementType.Radio,
      label: t('labourRightsQ1'),
      name: 'labourRightsQ1',
    },
    {
      type: FormElementType.Radio,
      label: t('labourRightsQ2'),
      name: 'labourRightsQ2',
    },
    {
      type: FormElementType.Label,
      label: t('labourRightsSubLabel'),
      className: 'mg-left-2',
    },
    {
      type: FormElementType.Radio,
      label: t('labourRightsSubQ1'),
      name: 'labourRightsSubQ1',
      className: 'mg-left-4',
    },
    {
      type: FormElementType.Radio,
      label: t('labourRightsSubQ2'),
      name: 'labourRightsSubQ2',
      className: 'mg-left-4',
    },
    {
      type: FormElementType.Radio,
      label: t('labourRightsSubQ3'),
      name: 'labourRightsSubQ3',
      className: 'mg-left-4',
    },
    {
      type: FormElementType.Radio,
      label: t('labourRightsSubQ4'),
      name: 'labourRightsSubQ4',
      className: 'mg-left-4',
    },
    {
      type: FormElementType.Radio,
      label: t('labourRightsSubQ5'),
      name: 'labourRightsSubQ5',
      className: 'mg-left-4',
    },
    {
      type: FormElementType.Radio,
      label: t('labourRightsSubQ6'),
      name: 'labourRightsSubQ6',
      className: 'mg-left-4',
    },
    {
      type: FormElementType.Radio,
      label: t('labourRightsQ3'),
      name: 'labourRightsQ3',
    },
    {
      type: FormElementType.Radio,
      label: t('labourRightsQ4'),
      name: 'labourRightsQ4',
    },
  ];

  useEffect(() => {
    onFormSubmit(safeguardDetails);
  }, [safeguardDetails]);

  const onSafeguardValuesChanged = (changedValues: any) => {
    setSafeguardDetails((pre: any) => ({ ...pre, ...changedValues }));
  };

  return (
    <div className="safeguard-tab-item">
      <Form
        onValuesChange={onSafeguardValuesChanged}
        name="safeguardDetails"
        labelWrap={true}
        labelAlign="left"
        labelCol={{ md: 16, lg: 18, xl: 18 }}
        wrapperCol={{ md: 8, lg: 6, xl: 6 }}
        layout="horizontal"
      >
        {safeGuardFormElementDetails.map((formItem) => {
          if (formItem.type === FormElementType.Radio) {
            return (
              <Form.Item
                label={formItem?.label}
                className={formItem.className ? formItem.className : 'form-item mg-left-2'}
                name={formItem?.name}
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Radio.Group size="middle">
                  <div className="radio-container">
                    <Radio.Button className="radio" value={RadioButtonStatus2.YES}>
                      {t('yes')}
                    </Radio.Button>
                  </div>
                  <div className="radio-container">
                    <Radio.Button className="radio" value={RadioButtonStatus2.MAYBE}>
                      {t('maybe')}
                    </Radio.Button>
                  </div>
                  <div className="radio-container">
                    <Radio.Button className="radio" value={RadioButtonStatus2.NO}>
                      {t('no')}
                    </Radio.Button>
                  </div>
                </Radio.Group>
              </Form.Item>
            );
          } else if (formItem.type === FormElementType.Label) {
            return (
              <Form.Item
                className={formItem.className ? formItem.className : ''}
                label={formItem.label}
              ></Form.Item>
            );
          }
        })}
      </Form>
    </div>
  );
};

export default Safeguards;
