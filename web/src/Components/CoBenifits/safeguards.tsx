import React, { useEffect, useState } from 'react';
import { FormElementType, RadioButtonStatus2 } from '../../Definitions/commonEnums';
import { useTranslation } from 'react-i18next';
import { Empty, Form, Radio } from 'antd';

const Safeguards = (props: any) => {
  const { onFormSubmit, safeGuardViewData, viewOnly } = props;
  const { t } = useTranslation(['safeguards']);
  const [safeguardDetails, setSafeguardDetails] = useState();
  const [form] = Form.useForm();
  const initialFormElementList = [
    {
      type: FormElementType.Label,
      label: t('humanRights'),
      items: [
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
      ],
    },
    {
      type: FormElementType.Label,
      label: t('genderEquality'),
      items: [
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
      ],
    },
    {
      type: FormElementType.Label,
      label: t('communityHealth'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('communityHealthQ1'),
          name: 'communityHealthQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('historicHeritage'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('historicHeritageQ1'),
          name: 'historicHeritageQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('forcedEviction'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('forcedEvictionQ1'),
          name: 'forcedEvictionQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('landTenure'),
      items: [
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
      ],
    },
    {
      type: FormElementType.Label,
      label: t('indegenousPeople'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('forcedEvictionQ1'),
          name: 'indegenousPeopleQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('corruption'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('corruptionQ1'),
          name: 'corruptionQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('labourRights'),
      items: [
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
          items: [
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
          ],
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
      ],
    },
    {
      type: FormElementType.Label,
      label: t('economicConsequences'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('economicConsequencesQ1'),
          name: 'economicConsequencesQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('emissions'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('emissionsQ1'),
          name: 'emissionsQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('energySupply'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('energySupplyQ1'),
          name: 'energySupplyQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('waterPattern'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('waterPatternQ1'),
          name: 'waterPatternQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('erosoin'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('erosoinQ1'),
          name: 'erosoinQ1',
        },
        {
          type: FormElementType.Radio,
          label: t('erosoinQ2'),
          name: 'erosoinQ2',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('landscape'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('landscapeQ1'),
          name: 'landscapeQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('naturalDisaster'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('naturalDisasterQ1'),
          name: 'naturalDisasterQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('genetic'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('geneticQ1'),
          name: 'geneticQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('pollutants'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('pollutantsQ1'),
          name: 'pollutantsQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('hazardousWaste'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('hazardousWasteQ1'),
          name: 'hazardousWasteQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('pesticides'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('pesticidesQ1'),
          name: 'pesticidesQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('harvestForests'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('harvestForestsQ1'),
          name: 'harvestForestsQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('food'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('foodQ1'),
          name: 'foodQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('animalHusbandry'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('animalHusbandryQ1'),
          name: 'animalHusbandryQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('criticalHabitats'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('criticalHabitatsQ1'),
          name: 'criticalHabitatsQ1',
        },
      ],
    },
    {
      type: FormElementType.Label,
      label: t('endangeredSpecies'),
      items: [
        {
          type: FormElementType.Radio,
          label: t('endangeredSpeciesQ1'),
          name: 'endangeredSpeciesQ1',
        },
        {
          type: FormElementType.Radio,
          label: t('endangeredSpeciesQ2'),
          name: 'endangeredSpeciesQ2',
        },
      ],
    },
  ];
  const [updatedFormElementList, setUpdatedFormElementList] =
    useState<any[]>(initialFormElementList);

  useEffect(() => {
    onFormSubmit(safeguardDetails);
  }, [safeguardDetails]);

  const checkFormItemValueAvailable = (valueitem: any) => {
    if (valueitem && safeGuardViewData) {
      if (safeGuardViewData.hasOwnProperty(valueitem.name)) {
        return true;
      }
    }
    return false;
  };

  const checkFormSubHeaderVisible = (labelItem: any) => {
    let updatedLabelItem: any = labelItem;
    let isItemVisible = false;
    if (labelItem && labelItem.items) {
      labelItem.items.forEach((item: any) => {
        if (item.type === FormElementType.Radio) {
          if (checkFormItemValueAvailable(item)) {
            updatedLabelItem = { ...labelItem, isVisible: true };
            isItemVisible = true;
          }
        } else {
          const updated = checkFormSubHeaderVisible(item);
          if (updated.isVisible) isItemVisible = true;
          const objIndex = labelItem.items.findIndex(
            (obj: any) => obj.type === FormElementType.Label
          );
          labelItem.items[objIndex] = updated;
          updatedLabelItem = { ...labelItem };
        }
      });
    }
    return { ...updatedLabelItem, isVisible: isItemVisible };
  };

  useEffect(() => {
    if (viewOnly && safeGuardViewData) {
      const updatedList = initialFormElementList.map((headerItem: any) => {
        return checkFormSubHeaderVisible(headerItem);
      });
      setUpdatedFormElementList(updatedList);
    } else {
      if (safeGuardViewData) {
        setSafeguardDetails(safeGuardViewData);
        form.setFieldsValue(safeGuardViewData);
      }
    }
  }, [safeGuardViewData]);

  const onSafeguardValuesChanged = (changedValues: any) => {
    setSafeguardDetails((pre: any) => ({ ...pre, ...changedValues }));
  };

  return (
    <>
      {viewOnly && !safeGuardViewData && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      {((viewOnly && safeGuardViewData) || !viewOnly) && (
        <div className="safeguard-tab-item">
          <Form
            onValuesChange={onSafeguardValuesChanged}
            name="safeguardDetails"
            labelWrap={true}
            labelAlign="left"
            labelCol={{ md: 16, lg: 18, xl: 18 }}
            wrapperCol={{ md: 8, lg: 6, xl: 6 }}
            layout="horizontal"
            form={form}
          >
            {updatedFormElementList.map((sectionItem: any) => {
              return (
                <>
                  {(sectionItem.isVisible || !viewOnly) && (
                    <div style={{ marginBottom: '15px' }}>
                      <label className="co-sub-title-text">{sectionItem.label}</label>
                    </div>
                  )}
                  {sectionItem.items.map((item: any) => {
                    if (item.type === FormElementType.Radio) {
                      return (
                        <>
                          {!viewOnly && (
                            <Form.Item
                              label={item?.label}
                              className={item.className ? item.className : 'form-item mg-left-2'}
                              name={item?.name}
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
                          )}
                          {viewOnly && safeGuardViewData.hasOwnProperty(item?.name) && (
                            <div className="view-section">
                              <Form.Item
                                label={item?.label}
                                className={item.className ? item.className : 'form-item mg-left-2'}
                                name={item?.name}
                              >
                                <Radio.Group size="middle" disabled>
                                  <div className="radio-container">
                                    <Radio.Button className="radio">
                                      {safeGuardViewData[item?.name]}
                                    </Radio.Button>
                                  </div>
                                </Radio.Group>
                              </Form.Item>
                            </div>
                          )}
                        </>
                      );
                    } else if (item.type === FormElementType.Label) {
                      return (
                        <>
                          {(item.isVisible || !viewOnly) && (
                            <div style={{ marginBottom: '15px' }}>
                              <label className="co-sub-title-text mg-left-2">{item.label}</label>
                            </div>
                          )}
                          {item.items.map((subItem: any) => {
                            return (
                              <>
                                {!viewOnly && (
                                  <Form.Item
                                    label={subItem?.label}
                                    className={
                                      subItem.className ? subItem.className : 'form-item mg-left-2'
                                    }
                                    name={subItem?.name}
                                    rules={[
                                      {
                                        required: false,
                                      },
                                    ]}
                                  >
                                    <Radio.Group size="middle">
                                      <div className="radio-container">
                                        <Radio.Button
                                          className="radio"
                                          value={RadioButtonStatus2.YES}
                                        >
                                          {t('yes')}
                                        </Radio.Button>
                                      </div>
                                      <div className="radio-container">
                                        <Radio.Button
                                          className="radio"
                                          value={RadioButtonStatus2.MAYBE}
                                        >
                                          {t('maybe')}
                                        </Radio.Button>
                                      </div>
                                      <div className="radio-container">
                                        <Radio.Button
                                          className="radio"
                                          value={RadioButtonStatus2.NO}
                                        >
                                          {t('no')}
                                        </Radio.Button>
                                      </div>
                                    </Radio.Group>
                                  </Form.Item>
                                )}
                                {viewOnly && safeGuardViewData.hasOwnProperty(subItem?.name) && (
                                  <div className="view-section">
                                    <Form.Item
                                      label={subItem?.label}
                                      className={
                                        subItem.className
                                          ? subItem.className
                                          : 'form-item mg-left-2'
                                      }
                                      name={subItem?.name}
                                    >
                                      <Radio.Group size="middle" disabled>
                                        <div className="radio-container">
                                          <Radio.Button className="radio">
                                            {safeGuardViewData[subItem?.name]}
                                          </Radio.Button>
                                        </div>
                                      </Radio.Group>
                                    </Form.Item>
                                  </div>
                                )}
                              </>
                            );
                          })}
                        </>
                      );
                    }
                  })}
                </>
              );
            })}
          </Form>
        </div>
      )}
    </>
  );
};

export default Safeguards;
