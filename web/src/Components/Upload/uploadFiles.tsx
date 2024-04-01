import { useState } from 'react';
import { RcFile, UploadFile } from 'antd/lib/upload/interface';
import { Button, Col, Row, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import DeleteCard from '../Card/deleteCard';

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
    <Row gutter={[horizontalGutter, verticalGutter]} style={style}>
      <Col span={3} style={{ height: height }}>
        <Upload {...props}>
          <Button
            icon={<UploadOutlined />}
            style={{ width: '120px', height: height, color: '#3A3541', opacity: 0.8 }}
            disabled={isView}
          >
            {buttonText}
          </Button>
        </Upload>
      </Col>
      <Col span={21}>
        <Row gutter={[horizontalGutter, verticalGutter]}>
          {documentList.map((file: any) => (
            <Col key={file.uid} span={8} style={{ height: height }}>
              <DeleteCard
                fileName={file.name.slice(0, 20)}
                fileId={file.uid}
                handleDelete={handleDelete}
              ></DeleteCard>
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  );
};

export default UploadFileGrid;
