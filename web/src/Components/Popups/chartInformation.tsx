import { Modal } from 'antd';
import './chartInformation.scss';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  content: { title: string; body: string } | undefined;
}

const ChartInformation: React.FC<Props> = ({ open, setOpen, content }) => {
  const attachCancel = () => {
    setOpen(false);
  };

  return (
    <Modal open={open} onCancel={attachCancel} footer={false}>
      <div className="chart-info-title">
        <strong>{content?.title}</strong>
      </div>
      <div className="chart-info-body">{content?.body}</div>
    </Modal>
  );
};

export default ChartInformation;
