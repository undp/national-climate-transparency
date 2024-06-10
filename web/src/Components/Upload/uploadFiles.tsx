import { useEffect, useState } from 'react';
import { RcFile, UploadFile } from 'antd/lib/upload/interface';
import { Button, Card, Col, Row, Tooltip, Upload, message } from 'antd';
import {
  CloseCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileSearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import ConfirmPopup from '../Popups/Confirmation/confirmPopup';
import './uploadFiles.scss';
import { XOctagon } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { AcceptedMimeTypes } from '../../Definitions/fileTypes';

interface Props {
  isSingleColumn: boolean;
  buttonText: string;
  usedIn: 'create' | 'view' | 'update';
  storedFiles: { key: string; title: string; url: string }[];
  uploadedFiles: { key: string; title: string; data: string }[];
  setUploadedFiles: React.Dispatch<
    React.SetStateAction<{ key: string; title: string; data: string }[]>
  >;
  removedFiles: string[];
  setRemovedFiles: React.Dispatch<React.SetStateAction<string[]>>;
  setIsSaveButtonDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const UploadFileGrid: React.FC<Props> = ({
  isSingleColumn,
  buttonText,
  usedIn,
  storedFiles,
  uploadedFiles,
  setUploadedFiles,
  removedFiles,
  setRemovedFiles,
  setIsSaveButtonDisabled,
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
    if (!AcceptedMimeTypes.includes(file.type)) {
      message.open({
        type: 'error',
        content: t('fileNotSupported'),
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      return Upload.LIST_IGNORE as any;
    } else {
      const base64 = await handleFileRead(file);
      setUploadedFiles([...uploadedFiles, { key: file.uid, title: file.name, data: base64 }]);
      setIsSaveButtonDisabled(false);
    }
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
    accept: '.xlsx,.xls,.ppt,.pptx,.docx,.csv,.png,.jpg',
  };

  // Delete function for stored files

  const handleDeleteClick = (fileId: string) => {
    setConfirmOpen(true);
    setWhichFile(fileId);
  };

  const handleStoredDelete = (fileId: string) => {
    setRemovedFiles((prevState) => [...prevState, fileId]);
    setIsSaveButtonDisabled(false);
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
      {storedVisibleList.length > 0 ? (
        <Row gutter={[30, 10]} style={{ marginBottom: '25px' }}>
          {storedVisibleList.map((file) => (
            <Col key={file.key} span={isSingleColumn ? 12 : 8} className="file-column">
              <Tooltip placement="topLeft" title={file.title} showArrow={false}>
                <Card className="file-card">
                  <div className="file-content">
                    <span>
                      {isSingleColumn
                        ? file.title.length > 12
                          ? `${file.title.slice(0, 12)}...`
                          : file.title
                        : file.title.length > 20
                        ? `${file.title.slice(0, 20)}...`
                        : file.title}
                    </span>
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
              </Tooltip>
            </Col>
          ))}
        </Row>
      ) : usedIn === 'view' ? (
        <div className="no-documents-box">
          <FileSearchOutlined />
          <span style={{ marginLeft: '15px' }}>{'No Documents Found'}</span>
        </div>
      ) : null}
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
                    <Tooltip placement="topLeft" title={file.name} showArrow={false}>
                      <Card className="file-card">
                        <div className="file-content">
                          <span>
                            {file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}
                          </span>
                          <CloseCircleOutlined
                            className="close-icon"
                            onClick={() => handleUploadDelete(file.uid)}
                          />
                        </div>
                      </Card>
                    </Tooltip>
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
