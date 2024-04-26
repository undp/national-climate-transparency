import { useEffect, useState } from 'react';
import { RcFile, UploadFile } from 'antd/lib/upload/interface';
import { Button, Card, Col, Row, Upload } from 'antd';
import {
  CloseCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import ConfirmPopup from '../Popups/Confirmation/confirmPopup';
import './uploadFiles.scss';
import { XOctagon } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

interface Props {
  isSingleColumn: boolean;
  buttonText: string;
  acceptedFiles: string;
  usedIn: 'create' | 'view' | 'update';
  storedFiles: { key: string; title: string; url: string }[];
  uploadedFiles: { key: string; title: string; data: string }[];
  setUploadedFiles: React.Dispatch<
    React.SetStateAction<{ key: string; title: string; data: string }[]>
  >;
  removedFiles: string[];
  setRemovedFiles: React.Dispatch<React.SetStateAction<string[]>>;
}

const UploadFileGrid: React.FC<Props> = ({
  isSingleColumn,
  buttonText,
  acceptedFiles,
  usedIn,
  storedFiles,
  uploadedFiles,
  setUploadedFiles,
  removedFiles,
  setRemovedFiles,
}) => {
  const { t } = useTranslation(['uploadGrid']);

  // Upload Grid State

  const [documentList, setDocumentList] = useState<UploadFile[]>([]);
  const [storedVisibleList, setStoredVisibleList] = useState<
    { key: string; title: string; url: string }[]
  >([]);

  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [whichFile, setWhichFile] = useState<string>();

  // Hook to update the visible files shown after deleting

  useEffect(() => {
    const toShow = storedFiles.filter((item) => !removedFiles.includes(item.key));
    setStoredVisibleList(toShow);
  }, [removedFiles, storedFiles]);

  // File Upload functionality

  const handleFileRead = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const beforeUpload = async (file: RcFile): Promise<boolean> => {
    const base64 = await handleFileRead(file);
    setUploadedFiles([...uploadedFiles, { key: file.uid, title: file.name, data: base64 }]);
    return false;
  };

  const onChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setDocumentList(newFileList);
  };

  const props = {
    onChange,
    fileList: documentList,
    showUploadList: false,
    beforeUpload,
    accept: acceptedFiles,
  };

  // Delete function for stored files

  const handleDeleteClick = (fileId: string) => {
    setConfirmOpen(true);
    setWhichFile(fileId);
  };

  const handleStoredDelete = (fileId: string) => {
    setRemovedFiles((prevState) => [...prevState, fileId]);
  };

  // Download functionality for stored files

  const handleDownloadClick = (file: { key: string; title: string; url: string }) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.title;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Remove Functionality for uploaded not stored files

  const handleUploadDelete = (fileId: any) => {
    setDocumentList((prevList) => prevList.filter((file) => file.uid !== fileId));
    setUploadedFiles((prevList) => prevList.filter((file) => file.key !== fileId));
  };

  return (
    <div className="upload-files">
      <ConfirmPopup
        icon={<XOctagon style={{ color: '#ff4d4f', fontSize: '120px' }} />}
        isDanger={true}
        content={{
          primaryMsg: t('primaryMsg'),
          secondaryMsg: t('secondaryMsg'),
          cancelTitle: t('cancelTitle'),
          actionTitle: t('actionTitle'),
        }}
        actionRef={whichFile}
        doAction={handleStoredDelete}
        open={confirmOpen}
        setOpen={setConfirmOpen}
      />
      {/* Section to show the already uploaded files */}
      {storedVisibleList.length > 0 && (
        <Row gutter={[30, 10]} style={{ marginBottom: '25px' }}>
          {storedVisibleList.map((file) => (
            <Col key={file.key} span={8} className="file-column">
              {/* <Tooltip placement="topLeft" title={file.title} showArrow={false}> */}
              <Card className="file-card">
                <div className="file-content">
                  <span>{file.title.slice(0, 20)}</span>
                  {usedIn !== 'create' && (
                    <DownloadOutlined
                      className="download-icon"
                      onClick={() => handleDownloadClick(file)}
                    />
                  )}
                  {usedIn !== 'view' && (
                    <DeleteOutlined
                      className="delete-icon"
                      onClick={() => handleDeleteClick(file.key)}
                    />
                  )}
                </div>
              </Card>
              {/* </Tooltip> */}
            </Col>
          ))}
        </Row>
      )}
      {/* Section to upload files */}
      {usedIn !== 'view' && (
        <div className="upload-box">
          <Row gutter={[30, 10]}>
            <Col span={isSingleColumn ? 6 : 3}>
              <Upload {...props}>
                <Button className="upload-button" icon={<UploadOutlined />}>
                  {buttonText}
                </Button>
              </Upload>
            </Col>
            <Col span={isSingleColumn ? 18 : 21}>
              <Row gutter={[30, 10]}>
                {documentList.map((file: any) => (
                  <Col key={file.uid} span={isSingleColumn ? 24 : 8} className="file-column">
                    {/* <Tooltip placement="topLeft" title={file.name} showArrow={false}> */}
                    <Card className="file-card">
                      <div className="file-content">
                        <span>{file.name.slice(0, 20)}</span>
                        <CloseCircleOutlined
                          className="close-icon"
                          onClick={() => handleUploadDelete(file.uid)}
                        />
                      </div>
                    </Card>
                    {/* </Tooltip> */}
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default UploadFileGrid;
