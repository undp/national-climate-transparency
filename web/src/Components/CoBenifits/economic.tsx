import { Form, Radio } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RadioButtonStatus } from '../../Definitions/commonEnums';

const Economic = (props: any) => {
  const { onFormSubmit } = props;
  const { t } = useTranslation(['economic']);
  const economicDetailsInitial: any[] = [
    {
      section: t('growth'),
      fields: [
        {
          name: 'growthQ1',
          label: t('growthQ1'),
          hide: false,
          required: true,
        },
        {
          name: 'growthQ2',
          label: t('growthQ2'),
          hide: true,
          required: true,
        },
        {
          name: 'growthQ3',
          label: t('growthQ3'),
          hide: true,
          required: true,
        },
        {
          name: 'growthQ4',
          label: t('growthQ4'),
          hide: true,
          required: true,
        },
        {
          name: 'growthQ5',
          label: t('growthQ5'),
          hide: true,
          required: true,
        },
        {
          name: 'growthQ6',
          label: t('growthQ6'),
          hide: true,
          required: true,
        },
        {
          name: 'growthQ7',
          label: t('growthQ7'),
          hide: true,
          required: true,
        },
        {
          name: 'growthQ8',
          label: t('growthQ8'),
          hide: true,
          required: true,
        },
      ],
    },
    {
      section: t('energy'),
      fields: [
        {
          name: 'energyQ1',
          label: t('energyQ1'),
          hide: false,
          required: true,
        },
        {
          name: 'energyQ2',
          label: t('energyQ2'),
          hide: true,
          required: true,
        },
        {
          name: 'energyQ3',
          label: t('energyQ3'),
          hide: true,
          required: true,
        },
        {
          name: 'energyQ4',
          label: t('energyQ4'),
          hide: true,
          required: true,
        },
        {
          name: 'energyQ5',
          label: t('energyQ5'),
          hide: true,
          required: true,
        },
      ],
    },
    {
      section: t('techTransfer'),
      fields: [
        {
          name: 'techTransferQ1',
          label: t('techTransferQ1'),
          hide: false,
          required: true,
        },
        {
          name: 'techTransferQ2',
          label: t('techTransferQ2'),
          hide: true,
          required: true,
        },
        {
          name: 'techTransferQ3',
          label: t('techTransferQ3'),
          hide: true,
          required: true,
        },
        {
          name: 'techTransferQ4',
          label: t('techTransferQ4'),
          hide: true,
          required: true,
        },
        {
          name: 'techTransferQ5',
          label: t('techTransferQ5'),
          hide: true,
          required: true,
        },
        {
          name: 'techTransferQ6',
          label: t('techTransferQ6'),
          hide: true,
          required: true,
        },
      ],
    },
    {
      section: t('balanceOfPayments'),
      fields: [
        {
          name: 'balanceOfPaymentsQ1',
          label: t('balanceOfPaymentsQ1'),
          hide: false,
          required: true,
        },
        {
          name: 'balanceOfPaymentsQ2',
          label: t('balanceOfPaymentsQ2'),
          hide: true,
          required: true,
        },
        {
          name: 'balanceOfPaymentsQ3',
          label: t('balanceOfPaymentsQ3'),
          hide: true,
          required: true,
        },
      ],
    },
    {
      section: t('furtherInfo'),
      fields: [
        {
          name: 'furtherInfoQ1',
          label: t('furtherInfoQ1'),
          hide: false,
          required: true,
        },
      ],
    },
  ];
  const [formOne] = Form.useForm();
  const [economicDetails, setEconomicDetails] = useState<any[]>(economicDetailsInitial);
  const [economicFormDetails, setEconomicFormDetails] = useState<any>();
  const onFieldsChange = (changedFields: any) => {
    const changedFieldName = changedFields[0]?.name[0];
    const changedFieldValue = changedFields[0]?.value;
    if (changedFieldName.includes('1')) {
      const sectionName = changedFieldName.replace(/\d/g, '').replace('Q', '');
      const updatedEconomicDetails = [...economicDetails];
      const sectionIndex = updatedEconomicDetails.findIndex(
        (section) => section.section === t(sectionName)
      );

      updatedEconomicDetails[sectionIndex].fields.forEach((field: any) => {
        if (field.name !== changedFieldName) {
          field.hide = changedFieldValue !== RadioButtonStatus.YES;
        }
      });

      setEconomicDetails(updatedEconomicDetails);
    }
  };

  useEffect(() => {
    onFormSubmit(economicFormDetails);
  }, [economicFormDetails]);

  const onEconomicValuesChanged = (changedValues: any) => {
    setEconomicFormDetails((pre: any) => ({ ...pre, ...changedValues }));
  };

  return (
    <div className="co-benifits-tab-item">
      <Form
        name="economic-details"
        className="benifits-details-economic"
        labelCol={{ md: 16, lg: 19, xl: 19 }}
        wrapperCol={{ md: 8, lg: 5, xl: 5 }}
        layout="horizontal"
        requiredMark={true}
        form={formOne}
        onFieldsChange={onFieldsChange}
        onValuesChange={onEconomicValuesChanged}
      >
        <div className="section">
          {economicDetails?.map((environmentalDetail: any) => (
            <>
              <div className="title">{environmentalDetail?.section}</div>
              {environmentalDetail?.fields?.map(
                (field: any) =>
                  !field?.hide && (
                    <Form.Item
                      label={field?.label}
                      className="form-item"
                      name={field?.name}
                      rules={[
                        {
                          required: field?.required,
                          message: field?.required && `${t(field?.name)} ${t('isRequired')}`,
                        },
                      ]}
                    >
                      <Radio.Group size="middle" onChange={() => {}}>
                        <div className="yes-no-radio-container">
                          <Radio.Button className="yes-no-radio" value={RadioButtonStatus.YES}>
                            {t('yes')}
                          </Radio.Button>
                        </div>
                        <div className="yes-no-radio-container">
                          <Radio.Button className="yes-no-radio" value={RadioButtonStatus.NO}>
                            {t('no')}
                          </Radio.Button>
                        </div>
                        <div className="yes-no-radio-container">
                          <Radio.Button className="yes-no-radio" value={RadioButtonStatus.NA}>
                            {t('na')}
                          </Radio.Button>
                        </div>
                      </Radio.Group>
                    </Form.Item>
                  )
              )}
            </>
          ))}
        </div>
      </Form>
    </div>
  );
};

export default Economic;
