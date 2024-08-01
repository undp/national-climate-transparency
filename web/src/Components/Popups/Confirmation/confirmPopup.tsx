import { Button, Modal } from 'antd';
import './confirmPopup.scss';

interface Props {
  icon: React.ReactNode;
  isDanger: boolean;
  content: {
    primaryMsg: string;
    secondaryMsg: string;
    cancelTitle: string;
    actionTitle: string;
  };
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  actionRef: any;
  doAction: (data: any) => void;
}

const ConfirmPopup: React.FC<Props> = ({
  icon,
  isDanger,
  content,
  actionRef,
  doAction,
  open,
  setOpen,
}) => {
  const executeAction = () => {
    doAction(actionRef);
    setOpen(false);
  };

  const attachCancel = () => {
    setOpen(false);
  };

  return (
    <Modal
      zIndex={1050}
      open={open}
      onCancel={attachCancel}
      footer={[
        <Button key={'cancelButton'} onClick={attachCancel}>
          {content.cancelTitle}
        </Button>,
        <Button key={'attachButton'} type="primary" onClick={executeAction} danger={isDanger}>
          {content.actionTitle}
        </Button>,
      ]}
    >
      <div className="confirmation-popup">
        <div className="icon">{icon}</div>
        <div className="primary-message">
          <strong>{content.primaryMsg}</strong>
        </div>
        <div className="secondary-message">{content.secondaryMsg}</div>
      </div>
    </Modal>
  );
};

export default ConfirmPopup;
