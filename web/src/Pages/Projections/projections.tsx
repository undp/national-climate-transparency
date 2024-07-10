import { useTranslation } from 'react-i18next';

const GhgProjections = () => {
  const { t } = useTranslation(['projection']);
  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('projectionTitle')}</div>
      </div>
    </div>
  );
};

export default GhgProjections;
