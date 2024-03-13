import { useTranslation } from 'react-i18next';
import './actionForm.scss';

const actionForm = () => {
  const { t } = useTranslation(['actionList']);

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('Add New Action')}</div>
        <div className="body-sub-title">
          {t('Lorem ipsum dolor sit amet, consectetur adipiscing elit,')}
        </div>
      </div>
      <div className="form-card">
        <div className="body-title">{t('Add New Action')}</div>
      </div>
      <div className="form-card">
        <div className="body-title">{t('Add New Action')}</div>
      </div>
      <div className="form-card">
        <div className="body-title">{t('Add New Action')}</div>
      </div>
    </div>
  );
};

export default actionForm;
