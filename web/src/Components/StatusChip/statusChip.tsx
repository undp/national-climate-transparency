import { useTranslation } from 'react-i18next';
import './statusChip.scss';
import { Tag } from 'antd';

interface Props {
  message: 'pending' | 'validated';
  defaultMessage: 'pending' | 'validated';
}

const StatusChip: React.FC<Props> = ({ message, defaultMessage }) => {
  const { t } = useTranslation(['statusChip']);
  return (
    <div className="status-chip">
      {message === 'validated' ? (
        <Tag className="validated-chip">{t(message)}</Tag>
      ) : (
        <Tag className="pending-chip">{t(defaultMessage)}</Tag>
      )}
    </div>
  );
};

export default StatusChip;
