import { Row, Col, DatePicker, Button, message, Collapse, InputNumber } from 'antd';
import './emissionForm.scss';
import { getCollapseIcon } from '../../Utils/utilServices';
import {
  AgrLevels,
  EmissionUnits,
  EnergyLevels,
  EnergyOne,
  EnergyThree,
  EnergyTwo,
  IndustryLevels,
  OtherLevels,
  SectionLevels,
  WasteLevels,
} from '../../Enums/emission.enum';
import NumberChip from '../NumberChip/numberChip';
import {
  AgricultureSection,
  EmissionData,
  EmissionTotals,
  EnergySection,
  IndustrySection,
  OtherSection,
  SectionDefinition,
  SubSectionsDefinition,
  WasteSection,
  agricultureSectionInit,
  emissionInitData,
  emissionSections,
  emissionTotals,
  energySectionInit,
  indSectionInit,
  otherSectionInit,
  processAgrEmissionData,
  processEnergyEmissionData,
  processIndividualEmissionData,
  processIndustryEmissionData,
  processOtherEmissionData,
  processWasteEmissionData,
  wasteSectionInit,
} from '../../Definitions/emissionDefinitions';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { getEmissionCreatePayload } from '../../Utils/payloadCreators';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { displayErrorMessage } from '../../Utils/errorMessageHandler';
import moment, { Moment } from 'moment';

interface Props {
  index: number;
  year: string | null;
  finalized: boolean;
  availableYears: number[];
  setActiveYear: React.Dispatch<React.SetStateAction<string | undefined>>;
  getAvailableEmissionReports: () => void;
}

const { Panel } = Collapse;

export const EmissionForm: React.FC<Props> = ({
  index,
  year,
  finalized,
  availableYears,
  setActiveYear,
  getAvailableEmissionReports,
}) => {
  // context Usage
  const { t } = useTranslation(['emission', 'entityAction']);
  const { get, post } = useConnection();

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<{
    key: string;
    title: string;
    data: string;
    url: string;
  }>();

  // Year State

  const [emissionYear, setEmissionYear] = useState<string>();
  const [isYearFixed, setIsYearFixed] = useState<boolean>();

  // Finalized State

  const [isFinalized, setIsFinalized] = useState<boolean>();

  // Section State

  const [energySection, setEnergySection] = useState<EnergySection>(
    JSON.parse(JSON.stringify(energySectionInit))
  );
  const [industrySection, setIndustrySection] = useState<IndustrySection>({ ...indSectionInit });
  const [agrSection, setAgrSection] = useState<AgricultureSection>({ ...agricultureSectionInit });
  const [wasteSection, setWasteSection] = useState<WasteSection>({ ...wasteSectionInit });
  const [otherSection, setOtherSection] = useState<OtherSection>({ ...otherSectionInit });
  const [eqWithout, setEqWithout] = useState<EmissionData>({ ...emissionInitData });
  const [eqWith, setEqWith] = useState<EmissionData>({ ...emissionInitData });

  // Total State

  const [emissionTotal, setEmissionTotal] = useState<EmissionTotals>({ ...emissionTotals });

  // Emission Total Update for Section State Change

  useEffect(() => {
    const currentEmissionTotal = { ...emissionTotal };
    Object.values(EnergyLevels).forEach((mainLevel) => {
      Object.values(EmissionUnits).forEach((unit) => {
        let unitTotal = 0;
        if (mainLevel === EnergyLevels.OneA) {
          Object.values(EnergyOne).forEach((level) => {
            unitTotal = unitTotal + (energySection[mainLevel][level][unit] ?? 0);
          });
        } else if (mainLevel === EnergyLevels.OneB) {
          Object.values(EnergyTwo).forEach((level) => {
            unitTotal = unitTotal + (energySection[mainLevel][level][unit] ?? 0);
          });
        } else {
          Object.values(EnergyThree).forEach((level) => {
            unitTotal = unitTotal + (energySection[mainLevel][level][unit] ?? 0);
          });
        }
        currentEmissionTotal[SectionLevels.One][mainLevel][unit] = unitTotal;
      });
    });
    setEmissionTotal(currentEmissionTotal);
  }, [energySection]);

  useEffect(() => {
    const currentEmissionTotal = { ...emissionTotal };
    Object.values(EmissionUnits).forEach((unit) => {
      let unitTotal = 0;
      Object.values(IndustryLevels).forEach((level) => {
        unitTotal = unitTotal + (industrySection[level][unit] ?? 0);
      });
      currentEmissionTotal[SectionLevels.Two][unit] = unitTotal;
    });
    setEmissionTotal(currentEmissionTotal);
  }, [industrySection]);

  useEffect(() => {
    const currentEmissionTotal = { ...emissionTotal };
    Object.values(EmissionUnits).forEach((unit) => {
      let unitTotal = 0;
      Object.values(AgrLevels).forEach((level) => {
        unitTotal = unitTotal + (agrSection[level][unit] ?? 0);
      });
      currentEmissionTotal[SectionLevels.Three][unit] = unitTotal;
    });
    setEmissionTotal(currentEmissionTotal);
  }, [agrSection]);

  useEffect(() => {
    const currentEmissionTotal = { ...emissionTotal };
    Object.values(EmissionUnits).forEach((unit) => {
      let unitTotal = 0;
      Object.values(WasteLevels).forEach((level) => {
        unitTotal = unitTotal + (wasteSection[level][unit] ?? 0);
      });
      currentEmissionTotal[SectionLevels.Four][unit] = unitTotal;
    });
    setEmissionTotal(currentEmissionTotal);
  }, [wasteSection]);

  useEffect(() => {
    const currentEmissionTotal = { ...emissionTotal };
    Object.values(EmissionUnits).forEach((unit) => {
      let unitTotal = 0;
      Object.values(OtherLevels).forEach((level) => {
        unitTotal = unitTotal + (otherSection[level][unit] ?? 0);
      });
      currentEmissionTotal[SectionLevels.Five][unit] = unitTotal;
    });
    setEmissionTotal(currentEmissionTotal);
  }, [otherSection]);

  // Initializing Function

  // Year Emission Data Loading Function

  const getYearEmission = async () => {
    if (year) {
      try {
        const response = await get(`national/emissions/${year}`);

        if (response.status === 200 || response.status === 201) {
          setEnergySection(processEnergyEmissionData(response.data[0].energyEmissions));
          setIndustrySection(
            processIndustryEmissionData(response.data[0].industrialProcessesProductUse)
          );
          setAgrSection(processAgrEmissionData(response.data[0].agricultureForestryOtherLandUse));
          setWasteSection(processWasteEmissionData(response.data[0].waste));
          setOtherSection(processOtherEmissionData(response.data[0].other));
          setEqWith(processIndividualEmissionData(response.data[0].totalCo2WithLand));
          setEqWithout(processIndividualEmissionData(response.data[0].totalCo2WithoutLand));

          if (response.data[0].emissionDocument !== null) {
            setUploadedFile({
              key: year,
              title: 'GHG Emission Template',
              data: '',
              url: response.data[0].emissionDocument,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching timeline data:', error);
        displayErrorMessage(error, t('errorFetchingEmissionForYear'));
      }
    }
  };

  // Revert All State to Zero

  const revertToInit = () => {
    setEnergySection(JSON.parse(JSON.stringify(energySectionInit)));
    setIndustrySection({ ...indSectionInit });
    setAgrSection({ ...agricultureSectionInit });
    setWasteSection({ ...wasteSectionInit });
    setOtherSection({ ...otherSectionInit });
    setEqWithout({ ...emissionInitData });
    setEqWith({ ...emissionInitData });

    setEmissionTotal({ ...emissionTotals });
    setEmissionYear(undefined);
    setIsFinalized(false);
    setIsYearFixed(false);
  };

  useEffect(() => {
    if (year) {
      setEmissionYear(year);
      setIsFinalized(finalized);
      setIsYearFixed(true);
      getYearEmission();
    }
  }, []);

  // Handle Data Enter

  const setIndividualEntry = (
    newValue: number | undefined,
    section: string,
    levelTwo: any,
    levelThree: any,
    unit: EmissionUnits
  ) => {
    switch (section) {
      case 'eqWithout':
        setEqWithout((prevState) => ({
          ...prevState,
          [unit]: newValue,
        }));
        return;
      case 'eqWith':
        setEqWith((prevState) => ({
          ...prevState,
          [unit]: newValue,
        }));
        return;
      case '1':
        const energy = levelTwo as EnergyLevels;
        let secondLevel;
        const newEnergyState: EnergySection = { ...energySection };

        if (energy === EnergyLevels.OneA) {
          secondLevel = levelThree as EnergyOne;
          newEnergyState[energy][secondLevel][unit] = newValue;
        } else if (energy === EnergyLevels.OneB) {
          secondLevel = levelThree as EnergyTwo;
          newEnergyState[energy][secondLevel][unit] = newValue;
        } else if (energy === EnergyLevels.OneC) {
          secondLevel = levelThree as EnergyThree;
          newEnergyState[energy][secondLevel][unit] = newValue;
        }
        setEnergySection(newEnergyState);
        return;
      case '2':
        const industry = levelTwo as IndustryLevels;
        setIndustrySection((prevState) => ({
          ...prevState,
          [industry]: {
            ...prevState[industry],
            [unit]: newValue,
          },
        }));
        return;
      case '3':
        const agriculture = levelTwo as AgrLevels;
        setAgrSection((prevState) => ({
          ...prevState,
          [agriculture]: {
            ...prevState[agriculture],
            [unit]: newValue,
          },
        }));
        return;
      case '4':
        const waste = levelTwo as WasteLevels;
        setWasteSection((prevState) => ({
          ...prevState,
          [waste]: {
            ...prevState[waste],
            [unit]: newValue,
          },
        }));
        return;
      case '5':
        const other = levelTwo as OtherLevels;
        setOtherSection((prevState) => ({
          ...prevState,
          [other]: {
            ...prevState[other],
            [unit]: newValue,
          },
        }));
        return;
    }
  };

  // Getter for Correct State

  const getIndividualEntry = (
    section: string,
    levelTwo: any,
    levelThree: any,
    unit: EmissionUnits
  ) => {
    switch (section) {
      case '1':
        const energy = levelTwo as EnergyLevels;
        let secondLevel;

        if (energy === EnergyLevels.OneA) {
          secondLevel = levelThree as EnergyOne;
          return energy && secondLevel ? energySection[energy][secondLevel][unit] : undefined;
        } else if (energy === EnergyLevels.OneB) {
          secondLevel = levelThree as EnergyTwo;
          return energy && secondLevel ? energySection[energy][secondLevel][unit] : undefined;
        } else if (energy === EnergyLevels.OneC) {
          secondLevel = levelThree as EnergyThree;
          return energy && secondLevel ? energySection[energy][secondLevel][unit] : undefined;
        } else {
          return undefined;
        }
      case '2':
        const industry = levelTwo as IndustryLevels;
        return industry ? industrySection[industry][unit] : undefined;
      case '3':
        const agriculture = levelTwo as AgrLevels;
        return agriculture ? agrSection[agriculture][unit] : undefined;
      case '4':
        const waste = levelTwo as WasteLevels;
        return waste ? wasteSection[waste][unit] : undefined;
      case '5':
        const other = levelTwo as OtherLevels;
        return other ? otherSection[other][unit] : undefined;
    }
  };

  // Get Section Sum

  const getSubSectionUnitSum = (subSection: EnergyLevels, unit: EmissionUnits) => {
    return emissionTotal[SectionLevels.One][subSection][unit] ?? 0;
  };

  // Get Section Sum

  const getSectionUnitSum = (section: string, unit: EmissionUnits) => {
    switch (section) {
      case '1':
        return (
          getSubSectionUnitSum(EnergyLevels.OneA, unit) +
          getSubSectionUnitSum(EnergyLevels.OneB, unit) +
          getSubSectionUnitSum(EnergyLevels.OneC, unit)
        );
      case '2':
        return emissionTotal[section][unit];
      case '3':
        return emissionTotal[section][unit];
      case '4':
        return emissionTotal[section][unit];
      case '5':
        return emissionTotal[section][unit];
    }
  };

  // Get Overall Sum

  const getOverallUnitSum = (unit: EmissionUnits) => {
    let overallSum = 0;

    Object.values(SectionLevels).map(
      (section) => (overallSum += getSectionUnitSum(section, unit) ?? 0)
    );

    return (overallSum ?? 0) + (eqWith[unit] ?? 0) + (eqWithout[unit] ?? 0);
  };

  // File Uploading Handling
  // const beforeUpload = async (file: RcFile): Promise<boolean> => {
  //   if (!AcceptedMimeTypes.includes(file.type)) {
  //     message.open({
  //       type: 'error',
  //       content: t('fileNotSupported'),
  //       duration: 3,
  //       style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
  //     });
  //     return Upload.LIST_IGNORE as any;
  //   } else {
  //     const base64 = await getBase64(file);
  //     setUploadedFile({ key: file.uid, title: file.name, data: base64, url: '' });
  //   }
  //   return false;
  // };

  // const onDelete = (fileId: string) => {
  //   console.log('Deleting File with ID:', fileId);
  //   setUploadedFile(undefined);
  // };

  // const props = {
  //   showUploadList: false,
  //   beforeUpload,
  //   accept: '.xlsx',
  //   multiple: false,
  // };

  // Handle Submit

  const handleEmissionAction = async (state: 'SAVED' | 'FINALIZED') => {
    try {
      if (emissionYear) {
        const emissionCreatePayload = getEmissionCreatePayload(
          emissionYear,
          energySection,
          industrySection,
          agrSection,
          wasteSection,
          otherSection,
          eqWith,
          eqWithout,
          state
        );

        if (uploadedFile) {
          emissionCreatePayload.emissionDocument = uploadedFile.data;
        } else {
          delete emissionCreatePayload.emissionDocument;
        }
        const response: any = await post('national/emissions/add', emissionCreatePayload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content: t('emissionCreationSuccess'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          getAvailableEmissionReports();

          if (index === 0) {
            revertToInit();
            setActiveYear(emissionYear);
          }
        }
      } else {
        message.open({
          type: 'error',
          content: t('emissionYearRequired'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
      }
    } catch (error: any) {
      displayErrorMessage(error);
    }
  };

  const disabledDate = (current: Moment | null): boolean => {
    return current ? availableYears.includes(current.year()) : false;
  };

  return (
    <div key={index} className="emission-form">
      <Row gutter={30} className="first-row" align={'middle'}>
        <Col span={6} className="height-column">
          <DatePicker
            key={`date_picker_${index}`}
            disabled={isYearFixed}
            value={emissionYear ? moment(emissionYear, 'YYYY') : null}
            onChange={(value) => setEmissionYear(value ? value.format('YYYY') : undefined)}
            className="year-picker"
            picker="year"
            size="middle"
            placeholder="Select Emission Year"
            disabledDate={disabledDate}
          />
        </Col>
        {/* <Col span={8} className="height-column">
          <Upload {...props}>
            <Button
              className="upload-button"
              icon={<UploadOutlined style={{ color: '#a8a8a8' }} />}
            >
              <span className="button-text">{t('emission:upload')}</span>
            </Button>
          </Upload>
        </Col>
        <Col span={10} className="height-column">
          {uploadedFile && (
            <FileCard
              file={uploadedFile}
              usedIn={'edit'}
              deleteFile={(fileId) => onDelete(fileId)}
            />
          )}
        </Col> */}
      </Row>
      <Row gutter={25} className="unit-row" align={'middle'}>
        {Object.values(EmissionUnits).map((unit) => (
          <Col key={`unit_${unit}`} span={3}>
            <div className="unit-div">{t(`${unit}`)}</div>
          </Col>
        ))}
      </Row>
      <Row gutter={25} className="total-row" align={'middle'}>
        <Col className="total-div" span={12}>
          {t('totalRowHeader')}
        </Col>
        {Object.values(EmissionUnits).map((unit) => (
          <Col key={`total_${unit}`} span={3}>
            <NumberChip value={getOverallUnitSum(unit)} valueType={unit} />
          </Col>
        ))}
      </Row>
      <Row className="collapsing-row">
        <Col span={24}>
          <Collapse ghost={true} expandIcon={({ isActive }) => getCollapseIcon(isActive ?? false)}>
            {emissionSections.map((section: SectionDefinition, sectionIndex: number) => (
              <Panel
                header={
                  <Row gutter={25} className="sector-header-row">
                    <Col className="title-div" span={12}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span>{sectionIndex + 1}</span>
                        <span>{t(`${section.id}_title`)}</span>
                      </div>
                    </Col>
                    {Object.values(EmissionUnits).map((unit) => (
                      <Col key={`section_${section.id}_${unit}`} span={3}>
                        <NumberChip
                          value={getSectionUnitSum(section.id, unit) ?? 0}
                          valueType={unit}
                        />
                      </Col>
                    ))}
                  </Row>
                }
                key={`emission_section${section.id}`}
              >
                {section.mainSections &&
                  section.mainSections.map((mainSection: any) => (
                    <Row
                      key={`level_two_${mainSection}`}
                      gutter={25}
                      className="input-number-row"
                      align={'middle'}
                    >
                      <Col span={12} className="title-div">
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <span>{mainSection}</span>
                          <span>{t(`${mainSection}_title`)}</span>
                        </div>
                      </Col>
                      {Object.values(EmissionUnits).map((unit) => (
                        <Col key={`${mainSection}_${unit}`} span={3} className="number-column">
                          <InputNumber
                            disabled={isFinalized}
                            value={getIndividualEntry(section.id, mainSection, null, unit)}
                            onChange={(value) =>
                              setIndividualEntry(
                                value ?? undefined,
                                section.id,
                                mainSection,
                                null,
                                unit
                              )
                            }
                            type="number"
                            min={0}
                            step={0.01}
                            controls={false}
                            className="input-emission"
                          />
                        </Col>
                      ))}
                    </Row>
                  ))}
                {section.subSections &&
                  section.subSections.map((subSection: SubSectionsDefinition) => (
                    <div key={`level_three_${subSection.id}`}>
                      <Row gutter={25} className="sector-sub-header-row" align={'middle'}>
                        <Col className="title-div" span={12}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <span>{subSection.id}</span>
                            <span>{t(`${subSection.id}_title`)}</span>
                          </div>
                        </Col>
                        {Object.values(EmissionUnits).map((unit) => (
                          <Col key={`subsection_${subSection.id}_${unit}`} span={3}>
                            <NumberChip
                              value={getSubSectionUnitSum(subSection.id, unit)}
                              valueType={unit}
                            />
                          </Col>
                        ))}
                      </Row>
                      {subSection.sections &&
                        subSection.sections.map((secondarySection: any) => (
                          <Row
                            key={`level_three_${secondarySection}`}
                            gutter={25}
                            className="input-number-row"
                            align={'middle'}
                          >
                            <Col className="title-div" span={12}>
                              <div style={{ display: 'flex', gap: '10px', paddingLeft: '50px' }}>
                                <span>{secondarySection}</span>
                                <span>{t(`${secondarySection}_title`)}</span>
                              </div>
                            </Col>
                            {Object.values(EmissionUnits).map((unit) => (
                              <Col
                                key={`${secondarySection}_${unit}`}
                                span={3}
                                className="number-column"
                              >
                                <InputNumber
                                  disabled={isFinalized}
                                  value={getIndividualEntry(
                                    section.id,
                                    subSection.id,
                                    secondarySection,
                                    unit
                                  )}
                                  onChange={(value) =>
                                    setIndividualEntry(
                                      value ?? undefined,
                                      section.id,
                                      subSection.id,
                                      secondarySection,
                                      unit
                                    )
                                  }
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  controls={false}
                                  className="input-emission"
                                />
                              </Col>
                            ))}
                          </Row>
                        ))}
                    </div>
                  ))}
              </Panel>
            ))}
          </Collapse>
        </Col>
      </Row>
      <Row gutter={25} className="input-number-row" align={'middle'}>
        <Col className="title-div" span={12}>
          {t('eqWithoutHeader')}
        </Col>
        {Object.values(EmissionUnits).map((unit) => (
          <Col key={`eqWithout_${unit}`} span={3} className="number-column">
            <InputNumber
              disabled={isFinalized}
              value={eqWithout[unit]}
              onChange={(value) =>
                setIndividualEntry(value ?? undefined, 'eqWithout', null, null, unit)
              }
              type="number"
              min={0}
              step={0.01}
              controls={false}
              className="input-emission"
            />
          </Col>
        ))}
      </Row>
      <Row gutter={25} className="input-number-row" align={'middle'}>
        <Col className="title-div" span={12}>
          {t('eqWithHeader')}
        </Col>
        {Object.values(EmissionUnits).map((unit) => (
          <Col key={`eqWith_${unit}`} span={3} className="number-column">
            <InputNumber
              disabled={isFinalized}
              value={eqWith[unit]}
              onChange={(value) =>
                setIndividualEntry(value ?? undefined, 'eqWith', null, null, unit)
              }
              type="number"
              min={0}
              step={0.01}
              controls={false}
              className="input-emission"
            />
          </Col>
        ))}
      </Row>
      <Row gutter={20} className="action-row" justify={'end'}>
        <Col>
          <Button
            disabled={isFinalized}
            type="primary"
            size="large"
            block
            onClick={() => handleEmissionAction('SAVED')}
          >
            {t('entityAction:submit')}
          </Button>
        </Col>
        <Col>
          <Button
            disabled={isFinalized || year === null}
            type="primary"
            size="large"
            block
            htmlType="submit"
            onClick={() => handleEmissionAction('FINALIZED')}
          >
            {t('entityAction:finalize')}
          </Button>
        </Col>
      </Row>
    </div>
  );
};
