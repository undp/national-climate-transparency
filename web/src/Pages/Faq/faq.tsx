import { useTranslation } from 'react-i18next';
import './faq.scss';
import { Collapse } from 'antd';
import FAQDocuments from '../../Components/FAQ/faqDocument';

const { Panel } = Collapse;

const faq = () => {
  const { t } = useTranslation(['faq']);

  const documents = [
    { key: '1', title: 'Document 1', format: 'docx', url: '/Assets/FAQ/Document1.docx' },
    { key: '2', title: 'Document 2', format: 'xlsx', url: '/Assets/FAQ/Document2.xlsx' },
    { key: '3', title: 'Document 3', format: 'txt', url: '/Assets/FAQ/Document3.txt' },
    { key: '4', title: 'Document 4', format: 'pdf', url: '/Assets/FAQ/Document4.pdf' },
  ];

  const videos = [
    { key: '1', title: 'Video 1', url: 'https://www.youtube.com/embed/_Y9vM4e9XaM' },
    { key: '2', title: 'Video 2', url: 'https://www.youtube.com/embed/cf1uzuXOJJw' },
    { key: '3', title: 'Video 3', url: 'https://www.youtube.com/embed/XfGSs4lN8Es' },
  ];

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
      <div className="content-card">
        <div className="section-header">{t('docsAndTemplates')}</div>
        <div className="documents">
          {documents.map((doc) => (
            <FAQDocuments key={doc.key} title={doc.title} format={doc.format} url={doc.url} />
          ))}
        </div>
      </div>
      <div className="content-card">
        <div className="section-header">{t('trainingVideos')}</div>
        <div className="videos">
          {videos.map((video) => (
            <iframe
              key={video.key}
              width="300"
              height="200"
              src={`${video.url}?rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ))}
        </div>
      </div>
    </div>
  );
};

export default faq;
