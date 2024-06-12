import { useTranslation } from 'react-i18next';
import './faq.scss';
import { Col, Collapse, Row } from 'antd';
import FAQDocuments from '../../Components/FAQ/faqDocument';
import { faqDocumentBps, faqVideoBps } from '../../Definitions/breakpoints/breakpoints';

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
    <div className="content-container faq-container">
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
        <Row gutter={30} className="documents">
          {documents.map((doc) => (
            <Col {...faqDocumentBps} className="grid-column">
              <FAQDocuments key={doc.key} title={doc.title} format={doc.format} url={doc.url} />
            </Col>
          ))}
        </Row>
      </div>
      <div className="content-card">
        <div className="section-header">{t('trainingVideos')}</div>
        <Row gutter={30} className="videos">
          {videos.map((video) => (
            <Col {...faqVideoBps} className="grid-column">
              <iframe
                key={video.key}
                width="300"
                height="200"
                src={`${video.url}?rel=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default faq;
