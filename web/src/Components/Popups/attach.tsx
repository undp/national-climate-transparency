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
  attachedUnits: string[];
  setAttachedUnits: React.Dispatch<React.SetStateAction<string[]>>;
  icon: React.ReactNode;
}

const AttachEntity: React.FC<Props> = ({
  isDisabled,
  content,
  options,
  attachedUnits,
  setAttachedUnits,
  icon,
}) => {
  const [open, setOpen] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);

  const optionsList: SelectProps['options'] = [];

  options.forEach((entityId) => {
    optionsList.push({
      label: entityId,
      value: entityId,
    });
  });

  const showModal = () => {
    setOpen(true);
    setPendingAttachments(attachedUnits);
  };

  const attachProject = () => {
    setOpen(false);
    setAttachedUnits(pendingAttachments);
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
          <Button onClick={attachCancel}>{content.cancel}</Button>,
          <Button type="primary" onClick={attachProject}>
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
          showSearch
          maxTagCount={'responsive'}
          mode="multiple"
          allowClear
          style={{ width: '100%' }}
          value={pendingAttachments}
          onChange={handleItemSelect}
          options={optionsList}
        />
      </Modal>
    </>
  );
};

export default AttachEntity;
