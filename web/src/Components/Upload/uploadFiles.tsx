import { useState } from 'react';
import { RcFile, UploadFile } from 'antd/lib/upload/interface';
import { Button, Card, Col, Row, Upload } from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import ConfirmPopup from '../Popups/Confirmation/confirmPopup';
import './uploadFiles.scss';
import { XOctagon } from 'react-bootstrap-icons';

interface Props {
  uploadedFiles: { id: string; title: string; data: string }[];
  horizontalGutter: number;
  verticalGutter: number;
  style: any;
  buttonText: string;
  height: string;
  acceptedFiles: string;
  setUploadedFiles: React.Dispatch<
    React.SetStateAction<{ id: string; title: string; data: string }[]>
  >;
  isView: boolean;
}

const UploadFileGrid: React.FC<Props> = ({
  uploadedFiles,
  horizontalGutter,
  verticalGutter,
  style,
  buttonText,
  height,
  acceptedFiles,
  setUploadedFiles,
  isView,
}) => {
  const [documentList, setDocumentList] = useState<UploadFile[]>([]);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [whichFile, setWhichFile] = useState<number>();

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

  const handleDelete = (fileId: any) => {
    setDocumentList((prevList) => prevList.filter((file) => file.uid !== fileId));
    setUploadedFiles((prevList) => prevList.filter((file) => file.id !== fileId));
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
        doAction={handleDelete}
        open={confirmOpen}
        setOpen={setConfirmOpen}
      />
      <Row gutter={[horizontalGutter, verticalGutter]} style={style}>
        <Col span={3} style={{ height: height }}>
          <Upload {...props}>
            <Button className="upload-button" icon={<UploadOutlined />} disabled={isView}>
              {buttonText}
            </Button>
          </Upload>
        </Col>
        <Col span={21}>
          <Row gutter={[horizontalGutter, verticalGutter]}>
            {documentList.map((file: any) => (
              <Col key={file.uid} span={8} style={{ height: height }}>
                <Card className="file-card">
                  <div className="file-content">
                    <span>{file.name.slice(0, 20)}</span>
                    <DeleteOutlined
                      className="delete-icon"
                      onClick={() => handleDeleteClick(file.uid)}
                    />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default UploadFileGrid;
