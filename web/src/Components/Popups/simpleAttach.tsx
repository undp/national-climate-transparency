import { useEffect, useState } from 'react';
import { Button, Modal, Select, SelectProps } from 'antd';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  content: {
    buttonName: string;
    contentTitle: string;
    listTitle: string;
    cancel: string;
    attach: string;
  };
  options: string[];
  attachedUnits: string[];
  setToBeAttached: React.Dispatch<React.SetStateAction<string[]>>;
  icon: React.ReactNode;
}

const SimpleAttachEntity: React.FC<Props> = ({
  open,
  setOpen,
  content,
  options,
  attachedUnits,
  setToBeAttached,
  icon,
}) => {
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);

  const optionsList: SelectProps['options'] = [];

  options.forEach((entityId) => {
    optionsList.push({
      key: entityId,
      label: entityId,
      value: entityId,
      disabled: false,
    });
  });

  attachedUnits.forEach((entityId) => {
    optionsList.push({
      key: entityId,
      label: entityId,
      value: entityId,
      disabled: true,
    });
  });

  useEffect(() => {
    setPendingAttachments(attachedUnits);
  }, [attachedUnits]);

  const attachProject = () => {
    setToBeAttached(pendingAttachments.filter((entity) => !attachedUnits.includes(entity)));
    setOpen(false);
  };

  const attachCancel = () => {
    setOpen(false);
  };

  const handleItemSelect = (prjIds: string[]) => {
    setPendingAttachments(prjIds);
  };
  return (
    <Modal
      open={open}
      onCancel={attachCancel}
      footer={[
        <Button key={'cancelButton'} onClick={attachCancel}>
          {content.cancel}
        </Button>,
        <Button key={'attachButton'} type="primary" onClick={attachProject}>
          {content.attach}
        </Button>,
      ]}
    >
      <div style={{ color: '#16B1FF', marginTop: '15px' }}>{icon}</div>
      <div style={{ color: '#3A3541', opacity: 0.8, marginTop: '30px', fontSize: '15px' }}>
        <strong>{content.contentTitle}</strong>
      </div>
      <div
        style={{
          color: '#3A3541',
          opacity: 0.8,
          marginTop: '20px',
          marginBottom: '8px',
          textAlign: 'left',
        }}
      >
        {content.listTitle}
      </div>
      <Select
        style={{ fontSize: '13px', width: '100%' }}
        showSearch
        maxTagCount={'responsive'}
        mode="multiple"
        value={pendingAttachments}
        onChange={handleItemSelect}
        options={optionsList}
      />
    </Modal>
  );
};

export default SimpleAttachEntity;
