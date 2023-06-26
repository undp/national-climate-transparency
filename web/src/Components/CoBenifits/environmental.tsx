import { Form, Radio } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RadioButtonStatus } from '../../Definitions/commonEnums';

const Environmental = (props: any) => {
  const { onFormSubmit } = props;
  const { t } = useTranslation(['environment']);
  const environmentalDetailsInitial: any[] = [
    {
      section: t('air'),
      fields: [
        {
          name: 'air1',
          label: t('air1'),
          hide: false,
        },
        {
          name: 'air2',
          label: t('air2'),
          hide: true,
        },
        {
          name: 'air3',
          label: t('air3'),
          hide: true,
        },
        {
          name: 'air4',
          label: t('air4'),
          hide: true,
        },
        {
          name: 'air5',
          label: t('air5'),
          hide: true,
        },
        {
          name: 'air6',
          label: t('air6'),
          hide: true,
        },
        {
          name: 'air7',
          label: t('air7'),
          hide: true,
        },
        {
          name: 'air8',
          label: t('air8'),
          hide: true,
        },
        {
          name: 'air9',
          label: t('air9'),
          hide: true,
        },
      ],
    },
    {
      section: t('land'),
      fields: [
        {
          name: 'land1',
          label: t('land1'),
          hide: false,
        },
        {
          name: 'land2',
          label: t('land2'),
          hide: true,
        },
        {
          name: 'land3',
          label: t('land3'),
          hide: true,
        },
        {
          name: 'land4',
          label: t('land4'),
          hide: true,
        },
        {
          name: 'land5',
          label: t('land5'),
          hide: true,
        },
        {
          name: 'land6',
          label: t('land6'),
          hide: true,
        },
        {
          name: 'land7',
          label: t('land7'),
          hide: true,
        },
        {
          name: 'land8',
          label: t('land8'),
          hide: true,
        },
      ],
    },
    {
      section: t('water'),
      fields: [
        {
          name: 'water1',
          label: t('water1'),
          hide: false,
        },
        {
          name: 'water2',
          label: t('water2'),
          hide: true,
        },
        {
          name: 'water3',
          label: t('water3'),
          hide: true,
        },
        {
          name: 'water4',
          label: t('water4'),
          hide: true,
        },
        {
          name: 'water5',
          label: t('water5'),
          hide: true,
        },
        {
          name: 'water6',
          label: t('water6'),
          hide: true,
        },
        {
          name: 'water7',
          label: t('water7'),
          hide: true,
        },
      ],
    },
    {
      section: t('naturalResource'),
      fields: [
        {
          name: 'naturalResource1',
          label: t('naturalResource1'),
          hide: false,
        },
        {
          name: 'naturalResource2',
          label: t('naturalResource2'),
          hide: true,
        },
        {
          name: 'naturalResource3',
          label: t('naturalResource3'),
          hide: true,
        },
        {
          name: 'naturalResource4',
          label: t('naturalResource4'),
          hide: true,
        },
        {
          name: 'naturalResource5',
          label: t('naturalResource5'),
          hide: true,
        },
        {
          name: 'naturalResource6',
          label: t('naturalResource6'),
          hide: true,
        },
      ],
    },
  ];
  const [formOne] = Form.useForm();
  const [environmentalDetails, setEnvironmentalDetails] = useState<any[]>(
    environmentalDetailsInitial
  );
  const [environmentalFormDetails, setEnvironmentalFormDetails] = useState<any>();
  const onFieldsChange = (changedFields: any) => {
    const changedFieldName = changedFields[0]?.name[0];
    const changedFieldValue = changedFields[0]?.value;
    if (changedFieldName.includes('1')) {
      const sectionName = changedFieldName.replace(/\d/g, '');
      const updatedEnvironmentalDetails = [...environmentalDetails];
      const sectionIndex = updatedEnvironmentalDetails.findIndex(
        (section) => section.section === t(sectionName)
      );

      updatedEnvironmentalDetails[sectionIndex].fields.forEach((field: any) => {
        if (field.name !== changedFieldName) {
          field.hide = changedFieldValue !== RadioButtonStatus.YES;
        }
      });

      setEnvironmentalDetails(updatedEnvironmentalDetails);
    }
  };

  useEffect(() => {
    onFormSubmit(environmentalFormDetails);
  }, [environmentalFormDetails]);

  const onEnvironmentalValuesChanged = (changedValues: any) => {
    setEnvironmentalFormDetails((pre: any) => ({ ...pre, ...changedValues }));
  };

  return (
    <div className="co-benifits-tab-item">
      <Form
        name="environmental-details"
        className="benifits-details-environmental"
        labelCol={{ md: 16, lg: 19, xl: 19 }}
        wrapperCol={{ md: 8, lg: 5, xl: 5 }}
        layout="horizontal"
        requiredMark={true}
        form={formOne}
        onFieldsChange={onFieldsChange}
        onValuesChange={onEnvironmentalValuesChanged}
      >
        <div className="section">
          {environmentalDetails?.map((environmentalDetail: any) => (
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
                          required: false,
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

export default Environmental;
