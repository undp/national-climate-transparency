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

interface Props {
  buttonText: string;
  acceptedFiles: string;
  usedIn: 'create' | 'view' | 'update';
  storedFiles: { id: number; title: string; url: string }[];
  uploadedFiles: { id: string; title: string; data: string }[];
  setUploadedFiles: React.Dispatch<
    React.SetStateAction<{ id: string; title: string; data: string }[]>
  >;
  removedFiles: number[];
  setRemovedFiles: React.Dispatch<React.SetStateAction<number[]>>;
}

const UploadFileGrid: React.FC<Props> = ({
  buttonText,
  acceptedFiles,
  usedIn,
  storedFiles,
  uploadedFiles,
  setUploadedFiles,
  removedFiles,
  setRemovedFiles,
}) => {
  const [documentList, setDocumentList] = useState<UploadFile[]>([]);
  const [storedVisibleList, setStoredVisibleList] = useState<
    { id: number; title: string; url: string }[]
  >([]);

  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [whichFile, setWhichFile] = useState<number>();

  useEffect(() => {
    const toShow = storedFiles.filter((item) => !removedFiles.includes(item.id));
    setStoredVisibleList(toShow);
  }, [removedFiles, storedFiles]);

  const handleFileRead = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const onChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setDocumentList(newFileList);
  };

  const handleDeleteClick = (fileId: any) => {
    setConfirmOpen(true);
    setWhichFile(fileId);
  };

  const handleDownloadClick = (file: { id: number; title: string; url: string }) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.title;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadDelete = (fileId: any) => {
    setDocumentList((prevList) => prevList.filter((file) => file.uid !== fileId));
    setUploadedFiles((prevList) => prevList.filter((file) => file.id !== fileId));
  };

  const handleStoredDelete = (fileId: any) => {
    setRemovedFiles((prevState) => [...prevState, fileId]);
  };

  const beforeUpload = async (file: RcFile): Promise<boolean> => {
    const base64 = await handleFileRead(file);
    setUploadedFiles([...uploadedFiles, { id: file.uid, title: file.name, data: base64 }]);
    return false;
  };

  const props = {
    onChange,
    fileList: documentList,
    showUploadList: false,
    beforeUpload,
    accept: acceptedFiles,
  };

  return (
    <div className="upload-files">
      <ConfirmPopup
        icon={<XOctagon style={{ color: '#ff4d4f', fontSize: '120px' }} />}
        isDanger={true}
        content={{
          primaryMsg: 'Are you sure you want to remove this document?',
          secondaryMsg: 'You can’t undo this action',
          cancelTitle: 'cancel',
          actionTitle: 'remove',
        }}
        actionRef={whichFile}
        doAction={handleStoredDelete}
        open={confirmOpen}
        setOpen={setConfirmOpen}
      />
      {/* Section to show the already uploaded files */}
      {storedVisibleList.length > 0 && (
        <Row gutter={[30, 10]} style={{ marginBottom: '25px' }}>
          {storedVisibleList.map((file: any) => (
            <Col key={file.id} span={8} className="file-column">
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
                      onClick={() => handleDeleteClick(file.id)}
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
            <Col span={3}>
              <Upload {...props}>
                <Button className="upload-button" icon={<UploadOutlined />}>
                  {buttonText}
                </Button>
              </Upload>
            </Col>
            <Col span={21}>
              <Row gutter={[30, 10]}>
                {documentList.map((file: any) => (
                  <Col key={file.uid} span={8} className="file-column">
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
