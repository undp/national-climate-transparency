import { Modal } from 'antd';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  content: { title: string; body: string };
}

const ChartInformation: React.FC<Props> = ({ open, setOpen, content }) => {
  const attachCancel = () => {
    setOpen(false);
  };

  return (
    <Modal open={open} onCancel={attachCancel} footer={false}>
      <div style={{ color: '#3A3541', opacity: 0.8, marginTop: '30px', fontSize: '15px' }}>
        <strong>{content.title}</strong>
      </div>
      <div style={{ color: '#3A3541', opacity: 0.8, marginTop: '30px', fontSize: '15px' }}>
        {content.body}
      </div>
    </Modal>
  );
};

export default ChartInformation;
