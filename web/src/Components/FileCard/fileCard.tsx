import { Tooltip, Row, Col } from 'antd';
import './fileCard.scss';
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';

interface Props {
  file: { key: string; title: string; data: string; url: string };
  usedIn: 'create' | 'view' | 'edit';
  deleteFile: (fileId: string) => void;
}

export const FileCard: React.FC<Props> = ({ file, usedIn, deleteFile }) => {
  // Download the current file
  const handleDownloadClick = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.title;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <Tooltip placement="topLeft" title={file.title} showArrow={false}>
      <div className="upload-file-card">
        <Row className="file-content">
          <Col span={20} style={{ marginLeft: '30px' }}>
            <span>{file.title}</span>
          </Col>
          <Col span={1}>
            {usedIn !== 'create' && (
              <DownloadOutlined className="download-icon" onClick={() => handleDownloadClick()} />
            )}
          </Col>
          <Col span={1}>
            {usedIn !== 'view' && (
              <DeleteOutlined className="delete-icon" onClick={() => deleteFile(file.key)} />
            )}
          </Col>
        </Row>
      </div>
    </Tooltip>
  );
};
