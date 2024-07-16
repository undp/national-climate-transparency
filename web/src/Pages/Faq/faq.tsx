import { useTranslation } from 'react-i18next';
import './faq.scss';
import { Button, Col, Collapse, Row } from 'antd';
import { faqButtonBps, faqHeaderBps, faqVideoBps } from '../../Definitions/breakpoints/breakpoints';
import { SystemResourceCategory, SystemResourceType } from '../../Enums/systemResource.enum';
import { useState } from 'react';
import { StoredData, UploadData } from '../../Definitions/uploadDefinitions';
import UploadFileGrid from '../../Components/Upload/uploadFiles';

const { Panel } = Collapse;

const faq = () => {
  const { t } = useTranslation(['faq', 'entityAction']);

  const [isGhgEditEnabled, setIsGhgEditEnabled] = useState<boolean>(false);
  const [isTemplateEditEnabled, setIsTemplateEditEnabled] = useState<boolean>(false);

  const [uploadedGHGFiles, setUploadedGHGFiles] = useState<UploadData[]>([]);
  const [storedGHGFiles, setStoredGHGFiles] = useState<StoredData[]>([]);
  const [ghgFilesToRemove, setGhgFilesToRemove] = useState<string[]>([]);

  const [uploadedTemplateFiles, setUploadedTemplateFiles] = useState<UploadData[]>([]);
  const [storedTemplateFiles, setStoredTemplateFiles] = useState<StoredData[]>([]);
  const [templateFilesToRemove, setTemplateFilesToRemove] = useState<string[]>([]);

  const videos = [
    { key: '1', title: 'Video 1', url: 'https://www.youtube.com/embed/_Y9vM4e9XaM' },
    { key: '2', title: 'Video 2', url: 'https://www.youtube.com/embed/cf1uzuXOJJw' },
    { key: '3', title: 'Video 3', url: 'https://www.youtube.com/embed/XfGSs4lN8Es' },
  ];

  const getResource = (
    resourceCategory: SystemResourceCategory,
    resourceType: SystemResourceType
  ) => {
    console.log(resourceType, resourceCategory);
  };

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
        <Row>
          <Col {...faqHeaderBps} style={{ paddingTop: '6px' }}>
            <div className="section-header">{t('ghgResourcesSection')}</div>
          </Col>
          <Col {...faqButtonBps}>
            <Button
              type="primary"
              size="large"
              block
              style={{ padding: 0 }}
              onClick={() => {
                setIsGhgEditEnabled(!isGhgEditEnabled);
                if (isGhgEditEnabled) {
                  getResource(SystemResourceCategory.GHG, SystemResourceType.DOCUMENT);
                }
              }}
            >
              {isGhgEditEnabled ? t('entityAction:update') : t('entityAction:edit')}
            </Button>
          </Col>
        </Row>
        <UploadFileGrid
          isSingleColumn={false}
          usedIn={isGhgEditEnabled ? 'update' : 'view'}
          buttonText={t('entityAction:upload')}
          storedFiles={storedGHGFiles}
          uploadedFiles={uploadedGHGFiles}
          setUploadedFiles={setUploadedGHGFiles}
          removedFiles={ghgFilesToRemove}
          setRemovedFiles={setGhgFilesToRemove}
          setIsSaveButtonDisabled={console.log}
        ></UploadFileGrid>
      </div>
      <div className="content-card">
        <Row>
          <Col {...faqHeaderBps} style={{ paddingTop: '6px' }}>
            <div className="section-header">{t('docsAndTemplates')}</div>
          </Col>
          <Col {...faqButtonBps}>
            <Button
              type="primary"
              size="large"
              block
              style={{ padding: 0 }}
              onClick={() => {
                setIsTemplateEditEnabled(!isTemplateEditEnabled);
                if (isTemplateEditEnabled) {
                  getResource(SystemResourceCategory.FAQ, SystemResourceType.DOCUMENT);
                }
              }}
            >
              {isTemplateEditEnabled ? t('entityAction:update') : t('entityAction:edit')}
            </Button>
          </Col>
        </Row>
        <UploadFileGrid
          isSingleColumn={false}
          usedIn={isTemplateEditEnabled ? 'update' : 'view'}
          buttonText={t('entityAction:upload')}
          storedFiles={storedTemplateFiles}
          uploadedFiles={uploadedTemplateFiles}
          setUploadedFiles={setUploadedTemplateFiles}
          removedFiles={templateFilesToRemove}
          setRemovedFiles={setTemplateFilesToRemove}
          setIsSaveButtonDisabled={console.log}
        ></UploadFileGrid>
      </div>
      <div className="content-card">
        <div className="section-header">{t('trainingVideos')}</div>
        <Row gutter={30} className="videos">
          {videos.map((video) => (
            <Col key={video.key} {...faqVideoBps} className="grid-column">
              <iframe
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
