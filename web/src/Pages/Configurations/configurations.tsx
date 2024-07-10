import { useTranslation } from 'react-i18next';

const GhgConfigurations = () => {
  const { t } = useTranslation(['configuration']);
  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('configurationTitle')}</div>
      </div>
    </div>
  );
};

export default GhgConfigurations;
