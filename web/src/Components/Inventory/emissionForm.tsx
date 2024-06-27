import { Row, Col, DatePicker, Upload, Button, message, Collapse, Input } from 'antd';
import './emissionForm.scss';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import { AcceptedMimeTypes } from '../../Definitions/fileTypes';
import { FileCard } from '../FileCard/fileCard';
import { getBase64, getCollapseIcon } from '../../Utils/utilServices';
import { EmissionUnits } from '../../Enums/emission.enum';
import NumberChip from '../NumberChip/numberChip';
import {
  SectionDefinition,
  SubSectionsDefinition,
  emissionSections,
} from '../../Definitions/emissionDefinitions';

interface Props {
  index: number;
  t: any;
  uploadedFile: { key: string; title: string; data: string; url: string } | undefined;
  setUploadedFile: React.Dispatch<
    React.SetStateAction<{ key: string; title: string; data: string; url: string } | undefined>
  >;
}

const { Panel } = Collapse;

export const EmissionForm: React.FC<Props> = ({ index, t, uploadedFile, setUploadedFile }) => {
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
    <div className="emission-form">
      <Row key={index} gutter={30} className="first-row" align={'middle'}>
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
          <Col span={3}>
            <div className="unit-div">{unit}</div>
          </Col>
        ))}
      </Row>
      <Row gutter={25} className="total-row" align={'middle'}>
        <Col className="total-div" span={12}>
          {'Total National Emissions and Removals '}
        </Col>
        {Object.values(EmissionUnits).map((unit) => (
          <Col span={3}>
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
                      <Col span={3}>
                        <NumberChip value={100} valueType={unit} />
                      </Col>
                    ))}
                  </Row>
                }
                key={`emission_section${section.id}`}
              >
                {section.mainSections &&
                  section.mainSections.map((mainSection: string) => (
                    <Row
                      key={mainSection}
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
                      {Object.values(EmissionUnits).map(() => (
                        <Col span={3} className="number-column">
                          <Input type="number" min={0} step={0.01} className="input-emission" />
                        </Col>
                      ))}
                    </Row>
                  ))}
                {section.subSections &&
                  section.subSections.map((subSection: SubSectionsDefinition) => (
                    <div key={subSection.id}>
                      <Row gutter={25} className="sector-sub-header-row" align={'middle'}>
                        <Col className="title-div" span={12}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <span>{subSection.id}</span>
                            <span>{t(`${subSection.id}_title`)}</span>
                          </div>
                        </Col>
                        {Object.values(EmissionUnits).map((unit) => (
                          <Col span={3}>
                            <NumberChip value={100} valueType={unit} />
                          </Col>
                        ))}
                      </Row>
                      {subSection.sections &&
                        subSection.sections.map((secondarySection: string) => (
                          <Row gutter={25} className="input-number-row" align={'middle'}>
                            <Col className="title-div" span={12}>
                              <div style={{ display: 'flex', gap: '10px', paddingLeft: '50px' }}>
                                <span>{secondarySection}</span>
                                <span>{t(`${secondarySection}_title`)}</span>
                              </div>
                            </Col>
                            {Object.values(EmissionUnits).map(() => (
                              <Col span={3} className="number-column">
                                <Input
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
        {Object.values(EmissionUnits).map(() => (
          <Col span={3} className="number-column">
            <Input type="number" min={0} step={0.01} className="input-emission" />
          </Col>
        ))}
      </Row>
      <Row gutter={25} className="input-number-row" align={'middle'}>
        <Col className="title-div" span={12}>
          {'Total CO2 equivalent emissions with land use, land-use change and forestry'}
        </Col>
        {Object.values(EmissionUnits).map(() => (
          <Col span={3} className="number-column">
            <Input type="number" min={0} step={0.01} className="input-emission" />
          </Col>
        ))}
      </Row>
    </div>
  );
};
