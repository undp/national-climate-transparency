import { Row, Col, DatePicker, Upload, Button, message, Collapse, Input } from 'antd';
import './emissionForm.scss';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import { AcceptedMimeTypes } from '../../Definitions/fileTypes';
import { FileCard } from '../FileCard/fileCard';
import { getBase64, getCollapseIcon, parseNumber } from '../../Utils/utilServices';
import {
  AgriLevels,
  EmissionUnits,
  EnergyLevels,
  EnergyOne,
  EnergyThree,
  EnergyTwo,
  IndustryLevels,
  OtherLevels,
  WasteLevels,
} from '../../Enums/emission.enum';
import NumberChip from '../NumberChip/numberChip';
import {
  AgricultureSection,
  EmissionData,
  EnergySection,
  IndustrySection,
  OtherSection,
  SectionDefinition,
  SubSectionsDefinition,
  WasteSection,
  agricultureSectionInit,
  emissionInitData,
  emissionSections,
  energySectionInit,
  industrySectionInit,
  otherSectionInit,
  wasteSectionInit,
} from '../../Definitions/emissionDefinitions';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface Props {
  index: number;
}

const { Panel } = Collapse;

export const EmissionForm: React.FC<Props> = ({ index }) => {
  // context Usage
  const { t } = useTranslation(['emission']);

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<{
    key: string;
    title: string;
    data: string;
    url: string;
  }>();

  // Energy Section State

  const [energySection, setEnergySection] = useState<EnergySection>(energySectionInit);

  // Industry Section State

  const [industrySection, setIndustrySection] = useState<IndustrySection>(industrySectionInit);

  // Agriculture Section State

  const [agriSection, setAgriSection] = useState<AgricultureSection>(agricultureSectionInit);

  // Waste Waste

  const [wasteSection, setWasteSection] = useState<WasteSection>(wasteSectionInit);

  // Other State

  const [otherSection, setOtherSection] = useState<OtherSection>(otherSectionInit);

  // General State

  const [eqWithout, setEqWithout] = useState<EmissionData>({ ...emissionInitData });
  const [eqWith, setEqWith] = useState<EmissionData>({ ...emissionInitData });

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
        const agriculture = levelTwo as AgriLevels;
        setAgriSection((prevState) => ({
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
        const agriculture = levelTwo as AgriLevels;
        return agriculture ? agriSection[agriculture][unit] : undefined;
      case '4':
        const waste = levelTwo as WasteLevels;
        return waste ? wasteSection[waste][unit] : undefined;
      case '5':
        const other = levelTwo as OtherLevels;
        return other ? otherSection[other][unit] : undefined;
    }
  };

  // File Uploading Handling
  const beforeUpload = async (file: RcFile): Promise<boolean> => {
    if (!AcceptedMimeTypes.includes(file.type)) {
      message.open({
        type: 'error',
        content: t('fileNotSupported'),
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      return Upload.LIST_IGNORE as any;
    } else {
      const base64 = await getBase64(file);
      setUploadedFile({ key: file.uid, title: file.name, data: base64, url: '' });
    }
    return false;
  };

  const onDelete = (fileId: string) => {
    console.log('Deleting File with ID:', fileId);
    setUploadedFile(undefined);
  };

  const props = {
    showUploadList: false,
    beforeUpload,
    accept: '.xlsx',
    multiple: false,
  };

  return (
    <div key={index} className="emission-form">
      <Row gutter={30} className="first-row" align={'middle'}>
        <Col span={8} className="height-column">
          <DatePicker className="year-picker" picker="year" size="middle" />
        </Col>
        <Col span={3} className="height-column">
          <Upload {...props}>
            <Button className="upload-button" icon={<UploadOutlined />}>
              {'Upload'}
            </Button>
          </Upload>
        </Col>
        <Col span={13} className="height-column">
          {uploadedFile && (
            <FileCard
              file={uploadedFile}
              usedIn={'create'}
              deleteFile={(fileId) => onDelete(fileId)}
            />
          )}
        </Col>
      </Row>
      <Row gutter={25} className="unit-row" align={'middle'}>
        {Object.values(EmissionUnits).map((unit) => (
          <Col key={`unit_${unit}`} span={3}>
            <div className="unit-div">{unit}</div>
          </Col>
        ))}
      </Row>
      <Row gutter={25} className="total-row" align={'middle'}>
        <Col className="total-div" span={12}>
          {'Total National Emissions and Removals '}
        </Col>
        {Object.values(EmissionUnits).map((unit) => (
          <Col key={`total_${unit}`} span={3}>
            <NumberChip value={100} valueType={unit} />
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
                        <NumberChip value={100} valueType={unit} />
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
                          <Input
                            value={getIndividualEntry(section.id, mainSection, null, unit)}
                            onChange={(e) =>
                              setIndividualEntry(
                                parseNumber(e.target.value),
                                section.id,
                                mainSection,
                                null,
                                unit
                              )
                            }
                            type="number"
                            min={0}
                            step={0.01}
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
                            <NumberChip value={100} valueType={unit} />
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
                                <Input
                                  value={getIndividualEntry(
                                    section.id,
                                    subSection.id,
                                    secondarySection,
                                    unit
                                  )}
                                  onChange={(e) =>
                                    setIndividualEntry(
                                      parseNumber(e.target.value),
                                      section.id,
                                      subSection.id,
                                      secondarySection,
                                      unit
                                    )
                                  }
                                  type="number"
                                  min={0}
                                  step={0.01}
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
          {'Total CO2 equivalent emissions without land use, land-use change and forestry'}
        </Col>
        {Object.values(EmissionUnits).map((unit) => (
          <Col key={`eqWithout_${unit}`} span={3} className="number-column">
            <Input
              value={eqWithout[unit]}
              onChange={(e) =>
                setIndividualEntry(parseFloat(e.target.value), 'eqWithout', null, null, unit)
              }
              type="number"
              min={0}
              step={0.01}
              className="input-emission"
            />
          </Col>
        ))}
      </Row>
      <Row gutter={25} className="input-number-row" align={'middle'}>
        <Col className="title-div" span={12}>
          {'Total CO2 equivalent emissions with land use, land-use change and forestry'}
        </Col>
        {Object.values(EmissionUnits).map((unit) => (
          <Col key={`eqWith_${unit}`} span={3} className="number-column">
            <Input
              value={eqWith[unit]}
              onChange={(e) =>
                setIndividualEntry(parseFloat(e.target.value), 'eqWith', null, null, unit)
              }
              type="number"
              min={0}
              step={0.01}
              className="input-emission"
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};
