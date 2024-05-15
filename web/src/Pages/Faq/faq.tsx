import { useTranslation } from 'react-i18next';
import './faq.scss';
import { Collapse } from 'antd';

const { Panel } = Collapse;

const faq = () => {
  const { t } = useTranslation(['faq']);

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('faqMenu')}</div>
      </div>
      <div className="content-card">
        <div className="section-header">{t('freqAskedQ')}</div>
        <div className="questions">
          <Collapse bordered={false}>
            <Panel header={t('question1')} key="1">
              <div className="answers">{t('answer1')}</div>
            </Panel>
            <Panel header={t('question2')} key="2">
              <div className="answers">{t('answer2')}</div>
            </Panel>
            <Panel header={t('question3')} key="3">
              <div className="answers">{t('answer3')}</div>
            </Panel>
            <Panel header={t('question4')} key="4">
              <div className="answers">{t('answer4')}</div>
            </Panel>
          </Collapse>
        </div>
      </div>
    </div>
  );
};

export default faq;
