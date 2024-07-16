import { useTranslation } from 'react-i18next';
import './faq.scss';
import { Button, Col, Collapse, Row, Spin } from 'antd';
import { faqButtonBps, faqHeaderBps, faqVideoBps } from '../../Definitions/breakpoints/breakpoints';
import { SystemResourceCategory, SystemResourceType } from '../../Enums/systemResource.enum';
import { useEffect, useState } from 'react';
import { StoredData, UploadData } from '../../Definitions/uploadDefinitions';
import UploadFileGrid from '../../Components/Upload/uploadFiles';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { displayErrorMessage } from '../../Utils/errorMessageHandler';
import { delay } from '../../Utils/utilServices';
import { Action } from '../../Enums/action.enum';
import { useAbilityContext } from '../../Casl/Can';
import { ResourceEntity } from '../../Entities/resourceEntity';

const { Panel } = Collapse;

const faq = () => {
  const { t } = useTranslation(['faq', 'entityAction']);
  const { post, delete: del } = useConnection();
  const ability = useAbilityContext();

  const [isGhgLoading, setIsGhgLoading] = useState<boolean>(false);
  const [isTemplateLoading, setIsTemplateLoading] = useState<boolean>(false);

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

  const getResource = async (
    resourceCategory: SystemResourceCategory,
    resourceType: SystemResourceType
  ) => {
    try {
      const payload = {
        filterAnd: [
          {
            key: 'resourceCategory',
            operation: '=',
            value: resourceCategory,
          },
          {
            key: 'resourceType',
            operation: '=',
            value: resourceType,
          },
        ],
        sort: {
          key: 'id',
          order: 'DESC',
        },
      };
      const response: any = await post('national/resources/query', payload);

      if (response.status === 200 || response.status === 201) {
        const resources: any = response.data;

        // Setting up uploaded files

        if (resources?.length > 0) {
          const tempFiles: StoredData[] = [];
          resources.forEach((resource: any) => {
            tempFiles.push({
              key: resource.id,
              title: resource.title,
              url: resource.dataValue,
            });
          });

          if (resourceCategory === SystemResourceCategory.GHG) {
            setStoredGHGFiles(tempFiles);
            setUploadedGHGFiles([]);
            setGhgFilesToRemove([]);
          } else if (resourceCategory === SystemResourceCategory.FAQ) {
            setStoredTemplateFiles(tempFiles);
            setUploadedTemplateFiles([]);
            setTemplateFilesToRemove([]);
          }
        }
      }
    } catch (error: any) {
      displayErrorMessage(error);
    }
  };

  const setResource = async (
    resourceCategory: SystemResourceCategory,
    resourceType: SystemResourceType
  ) => {
    try {
      const uploadedFiles =
        resourceCategory === SystemResourceCategory.FAQ ? uploadedTemplateFiles : uploadedGHGFiles;

      uploadedFiles.forEach(async (file) => {
        const payload = {
          resourceCategory: resourceCategory,
          resourceType: resourceType,
          title: file.title,
          data: file.data,
        };

        await post('national/resources/add', payload);
      });
    } catch (error: any) {
      displayErrorMessage(error);
    }
  };

  const deleteResource = async (resourceCategory: SystemResourceCategory) => {
    try {
      const removedFiles =
        resourceCategory === SystemResourceCategory.FAQ ? templateFilesToRemove : ghgFilesToRemove;

      removedFiles.forEach(async (file) => {
        await del(`national/resources/delete/${file}`);
      });
    } catch (error: any) {
      displayErrorMessage(error);
    }
  };

  useEffect(() => {
    getResource(SystemResourceCategory.FAQ, SystemResourceType.DOCUMENT);
    getResource(SystemResourceCategory.GHG, SystemResourceType.DOCUMENT);
  }, []);

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
            {!isGhgLoading && ability.can(Action.Update, ResourceEntity) && (
              <Button
                type="primary"
                size="large"
                block
                style={{ padding: 0 }}
                disabled={
                  isGhgEditEnabled
                    ? uploadedGHGFiles.length === 0 && ghgFilesToRemove.length === 0
                    : false
                }
                onClick={async () => {
                  if (isGhgEditEnabled) {
                    setIsGhgLoading(true);
                    await deleteResource(SystemResourceCategory.GHG);
                    await setResource(SystemResourceCategory.GHG, SystemResourceType.DOCUMENT);
                    await delay(2000);
                    await getResource(SystemResourceCategory.GHG, SystemResourceType.DOCUMENT);
                    setIsGhgLoading(false);
                  }
                  setIsGhgEditEnabled(!isGhgEditEnabled);
                }}
              >
                {isGhgEditEnabled ? t('entityAction:update') : t('entityAction:edit')}
              </Button>
            )}
          </Col>
        </Row>
        {!isGhgLoading ? (
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
        ) : (
          <div className="loading-resources">
            <Spin size="large" />
          </div>
        )}
      </div>
      <div className="content-card">
        <Row>
          <Col {...faqHeaderBps} style={{ paddingTop: '6px' }}>
            <div className="section-header">{t('docsAndTemplates')}</div>
          </Col>
          <Col {...faqButtonBps}>
            {!isTemplateLoading && ability.can(Action.Update, ResourceEntity) && (
              <Button
                type="primary"
                size="large"
                block
                disabled={
                  isTemplateEditEnabled
                    ? uploadedTemplateFiles.length === 0 && templateFilesToRemove.length === 0
                    : false
                }
                style={{ padding: 0 }}
                onClick={async () => {
                  if (isTemplateEditEnabled) {
                    setIsTemplateLoading(true);
                    await deleteResource(SystemResourceCategory.FAQ);
                    await setResource(SystemResourceCategory.FAQ, SystemResourceType.DOCUMENT);
                    await delay(2000);
                    await getResource(SystemResourceCategory.FAQ, SystemResourceType.DOCUMENT);
                    setIsTemplateLoading(false);
                  }
                  setIsTemplateEditEnabled(!isTemplateEditEnabled);
                }}
              >
                {isTemplateEditEnabled ? t('entityAction:update') : t('entityAction:edit')}
              </Button>
            )}
          </Col>
        </Row>
        {!isTemplateLoading ? (
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
        ) : (
          <div className="loading-resources">
            <Spin size="large" />
          </div>
        )}
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
