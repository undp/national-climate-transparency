import { Row, Col, DatePicker, Upload, Button, message, Collapse } from 'antd';
import './emissionForm.scss';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import { AcceptedMimeTypes } from '../../../Definitions/fileTypes';
import { FileCard } from '../../FileCard/fileCard';
import { getBase64, getCollapseIcon } from '../../../Utils/utilServices';
import { EmissionSectorTitles } from '../../../Enums/emission.enum';

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
      <Row key={index} gutter={30} className="first-row">
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
      <Row className="collapsing-row">
        <Col span={24}>
          <Collapse ghost={true} expandIcon={({ isActive }) => getCollapseIcon(isActive ?? false)}>
            {Object.values(EmissionSectorTitles).map((sectorTitle) => (
              <Panel header={sectorTitle} key={sectorTitle}>
                <p>Content of panel 1</p>
              </Panel>
            ))}
          </Collapse>
        </Col>
      </Row>
    </div>
  );
};
