import { useState } from 'react';
import { Button, Modal, Select, SelectProps } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

interface Props {
  isDisabled: boolean;
  content: {
    buttonName: string;
    contentTitle: string;
    listTitle: string;
    cancel: string;
    attach: string;
  };
  options: string[];
  alreadyAttached: string[];
  currentAttachments: string[];
  setCurrentAttachments: React.Dispatch<React.SetStateAction<string[]>>;
  icon: React.ReactNode;
}

const AttachEntity: React.FC<Props> = ({
  isDisabled,
  content,
  options,
  alreadyAttached,
  currentAttachments,
  setCurrentAttachments,
  icon,
}) => {
  const [open, setOpen] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);

  const optionsList: SelectProps['options'] = [];

  options.forEach((entityId) => {
    if (!currentAttachments.includes(entityId)) {
      optionsList.push({
        key: entityId,
        label: entityId,
        value: entityId,
        disabled: false,
      });
    }
  });

  alreadyAttached.forEach((entityId) => {
    if (!currentAttachments.includes(entityId)) {
      optionsList.push({
        key: entityId,
        label: entityId,
        value: entityId,
        disabled: false,
      });
    }
  });

  currentAttachments.forEach((entityId) => {
    optionsList.push({
      key: entityId,
      label: entityId,
      value: entityId,
      disabled: true,
    });
  });

  const showModal = () => {
    setOpen(true);
    setPendingAttachments(currentAttachments);
  };

  const attachProject = () => {
    setOpen(false);
    setCurrentAttachments(pendingAttachments);
  };

  const attachCancel = () => {
    setOpen(false);
  };

  const handleItemSelect = (prjIds: string[]) => {
    setPendingAttachments(prjIds);
  };
  return (
    <>
      {!isDisabled && (
        <Button
          type="primary"
          size="large"
          block
          icon={<LinkOutlined />}
          style={{ padding: 0 }}
          onClick={showModal}
        >
          {content.buttonName}
        </Button>
      )}
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
          allowClear
          value={pendingAttachments}
          onChange={handleItemSelect}
          options={optionsList}
        />
      </Modal>
    </>
  );
};

export default AttachEntity;
