import { Card } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

interface Props {
  fileName: string;
  fileId: number;
  handleDelete: (fileId: number) => void;
}

const DeleteCard: React.FC<Props> = ({ fileName, fileId, handleDelete }) => {
  return (
    <Card
      style={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: '1px',
        borderRadius: '4px',
        borderColor: '#d9d9d9',
        position: 'relative',
      }}
    >
      <div style={{ color: '#3A3541', opacity: '0.8' }}>
        <span style={{ flex: 1 }}>{fileName}</span>
        <DeleteOutlined
          style={{
            cursor: 'pointer',
            position: 'absolute',
            top: '8px',
            right: '20px',
          }}
          onClick={() => handleDelete(fileId)}
        />
      </div>
    </Card>
  );
};

export default DeleteCard;
