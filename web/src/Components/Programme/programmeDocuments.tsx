import { Col, Row, Skeleton, message } from 'antd';
import { DateTime } from 'luxon';
import React, { FC, useEffect, useRef, useState } from 'react';
import './programmeDocuments.scss';
import {
  CheckCircleOutlined,
  DislikeOutlined,
  FileAddOutlined,
  LikeOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import moment from 'moment';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { DocType } from '../../Casl/enums/document.type';
import { useTranslation } from 'react-i18next';
import { DocumentStatus } from '../../Casl/enums/document.status';
import { useUserContext } from '../../Context/UserInformationContext/userInformationContext';
import { CompanyRole } from '../../Casl/enums/company.role.enum';
import RejectDocumentationConfirmationModel from '../Models/rejectDocumentForm';

export interface ProgrammeDocumentsProps {
  data: any;
  title: any;
  icon: any;
  programmeId: any;
  getDocumentDetails: any;
  hiddenColumns?: any;
}

const ProgrammeDocuments: FC<ProgrammeDocumentsProps> = (props: ProgrammeDocumentsProps) => {
  const { data, title, icon, programmeId, getDocumentDetails, hiddenColumns } = props;
  const { t } = useTranslation(['programme']);
  const { userInfoState } = useUserContext();
  const { delete: del, post } = useConnection();
  const fileInputRef: any = useRef(null);
  const fileInputRefMeth: any = useRef(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [designDocUrl, setDesignDocUrl] = useState<any>('');
  const [noObjectionDocUrl, setNoObjectionDocUrl] = useState<any>('');
  const [methodologyDocUrl, setMethodologyDocUrl] = useState<any>('');
  const [designDocDate, setDesignDocDate] = useState<any>('');
  const [noObjectionDate, setNoObjectionDate] = useState<any>('');
  const [methodologyDate, setMethodologyDate] = useState<any>('');
  const [designDocStatus, setDesignDocStatus] = useState<any>('');
  const [methodDocStatus, setMethodDocStatus] = useState<any>('');
  const [designDocId, setDesignDocId] = useState<any>('');
  const [methDocId, setMethDocId] = useState<any>('');
  const [docData, setDocData] = useState<any[]>([]);
  const [openRejectDocConfirmationModal, setOpenRejectDocConfirmationModal] = useState(false);
  const [actionInfo, setActionInfo] = useState<any>({});
  const [rejectDocData, setRejectDocData] = useState<any>({});

  const handleDesignDocFileUpload = () => {
    fileInputRef?.current?.click();
  };

  const handleMethodologyFileUpload = () => {
    fileInputRefMeth?.current?.click();
  };

  useEffect(() => {
    setDocData(data);
  }, [data]);

  useEffect(() => {
    if (docData?.length) {
      docData?.map((item: any) => {
        if (item?.url?.includes('DESIGN')) {
          setDesignDocUrl(item?.url);
          setDesignDocDate(item?.txTime);
          setDesignDocStatus(item?.status);
          setDesignDocId(item?.id);
        }
        if (item?.url?.includes('METHODOLOGY')) {
          setMethodologyDocUrl(item?.url);
          setMethodologyDate(item?.txTime);
          setMethodDocStatus(item?.status);
          setMethDocId(item?.id);
        }
        if (item?.url?.includes('OBJECTION')) {
          setNoObjectionDocUrl(item?.url);
          setNoObjectionDate(item?.txTime);
        }
      });
    }
  }, [docData]);

  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const onUploadDocument = async (file: any, type: any) => {
    setLoading(true);
    const logoBase64 = await getBase64(file as RcFile);
    const logoUrls = logoBase64.split(',');
    console.log(logoUrls[1], file);
    try {
      const response: any = await post('national/programme/addDocument', {
        type: type,
        data: logoUrls[1],
        programmeId: programmeId,
      });
      fileInputRefMeth.current = null;
      if (response?.data) {
        setDocData([...docData, response?.data]);
        message.open({
          type: 'success',
          content:
            type === DocType.DESIGN_DOCUMENT
              ? `${t('programme:designDoc')}`
              : `${t('programme:methDoc')}` + ' ' + `${t('programme:isUploaded')}`,
          duration: 4,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
      }
    } catch (error: any) {
      fileInputRefMeth.current = null;
      message.open({
        type: 'error',
        content: error?.message,
        duration: 4,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } finally {
      getDocumentDetails();
      setLoading(false);
    }
  };

  const approveDoc = async (id: any, status: any) => {
    setLoading(true);
    try {
      const response: any = await post('national/programme/docAction', {
        id: id,
        status: DocumentStatus.ACCEPTED,
      });
      message.open({
        type: 'success',
        content: response?.message,
        duration: 4,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } catch (error: any) {
      message.open({
        type: 'error',
        content: error?.message,
        duration: 4,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } finally {
      getDocumentDetails();
      setLoading(false);
    }
  };

  const rejectDocument = async (rejectDoc: any) => {
    setLoading(true);
    try {
      const response: any = await post('national/programme/docAction', {
        id: rejectDoc?.id,
        status: DocumentStatus.REJECTED,
      });
      if (response?.message.includes('Successfully')) {
        message.open({
          type: 'success',
          content: response.message,
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        setOpenRejectDocConfirmationModal(false);
      }
    } catch (error: any) {
      message.open({
        type: 'error',
        content: error.message,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } finally {
      getDocumentDetails();
      setLoading(false);
    }
  };

  const handleOk = () => {
    rejectDocument(rejectDocData);
  };

  const handleCancel = () => {
    setOpenRejectDocConfirmationModal(false);
  };

  const companyRolePermission =
    userInfoState?.companyRole === CompanyRole.GOVERNMENT ||
    userInfoState?.companyRole === CompanyRole.CERTIFIER;

  const designDocPending = designDocStatus === DocumentStatus.PENDING;

  return loading ? (
    <Skeleton />
  ) : (
    <>
      <div className="info-view">
        <div className="title">
          <span className="title-icon">{icon}</span>
          <span className="title-text">{title}</span>
        </div>
        <div>
          <Row className="field" key="Design Document" gutter={[16, 16]}>
            <Col span={14} className="field-key">
              <div className="label-container">
                <div className={designDocUrl !== '' ? 'label-uploaded' : 'label'}>
                  {t('programme:designDoc')}
                </div>
                {designDocPending && companyRolePermission && (
                  <>
                    <LikeOutlined
                      onClick={() => approveDoc(designDocId, designDocStatus)}
                      className="common-progress-icon"
                      style={{ color: '#976ED7' }}
                    />
                    <DislikeOutlined
                      onClick={() => {
                        setRejectDocData({ id: designDocId });
                        setActionInfo({
                          action: 'Reject',
                          headerText: `${t('programme:rejectDocHeader')}`,
                          text: `${t('programme:rejectDocBody')}`,
                          type: 'reject',
                          icon: <DislikeOutlined />,
                        });
                        setOpenRejectDocConfirmationModal(true);
                      }}
                      className="common-progress-icon margin-left-1"
                      style={{ color: '#FD6F70' }}
                    />
                  </>
                )}
                {designDocStatus === DocumentStatus.ACCEPTED && (
                  <CheckCircleOutlined
                    className="common-progress-icon"
                    style={{ color: '#5DC380' }}
                  />
                )}
              </div>
              {designDocUrl !== '' && (
                <div className="time">
                  {moment(parseInt(designDocDate)).format('DD MMMM YYYY @ HH:mm')}
                </div>
              )}
            </Col>
            <Col span={10} className="field-value">
              {designDocUrl !== '' ? (
                <div className="link">
                  <a href={designDocUrl} target="_blank" rel="noopener noreferrer" download>
                    <LinkOutlined className="common-progress-icon" style={{ color: '#3F3A47' }} />
                  </a>
                  {designDocStatus !== DocumentStatus.ACCEPTED && (
                    <>
                      <FileAddOutlined
                        className="common-progress-icon margin-left-1"
                        style={{ color: '#3F3A47', cursor: 'pointer' }}
                        onClick={handleDesignDocFileUpload}
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".pdf"
                        onChange={(e: any) => {
                          const selectedFile = e.target.files[0];
                          onUploadDocument(selectedFile, DocType.DESIGN_DOCUMENT);
                          // Handle the selected file here
                        }}
                      />
                    </>
                  )}
                </div>
              ) : (
                <>
                  <FileAddOutlined
                    className="common-progress-icon"
                    style={{ color: '#3F3A47', cursor: 'pointer' }}
                    onClick={handleDesignDocFileUpload}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".pdf"
                    onChange={(e: any) => {
                      const selectedFile = e.target.files[0];
                      onUploadDocument(selectedFile, DocType.DESIGN_DOCUMENT);
                      // Handle the selected file here
                    }}
                  />
                </>
              )}
            </Col>
          </Row>
          {noObjectionDocUrl !== '' && (
            <Row className="field" key="Objection Document" gutter={[16, 16]}>
              <Col span={14} className="field-key">
                <div className="label-uploaded">{t('programme:objectionLett')}</div>
                <div className="time">
                  {moment(parseInt(noObjectionDate)).format('DD MMMM YYYY @ HH:mm')}
                </div>
              </Col>
              <Col span={10} className="field-value">
                <div className="link">
                  <a href={noObjectionDocUrl} target="_blank" rel="noopener noreferrer" download>
                    <LinkOutlined className="common-progress-icon" style={{ color: '#3F3A47' }} />
                  </a>
                </div>
              </Col>
            </Row>
          )}
          <Row className="field" key="Methodology Document" gutter={[16, 16]}>
            <Col span={14} className="field-key">
              <div className="label-container">
                <div className={methodologyDocUrl !== '' ? 'label-uploaded' : 'label'}>
                  {t('programme:methDoc')}
                </div>
                {methodDocStatus === DocumentStatus.PENDING && companyRolePermission && (
                  <>
                    <LikeOutlined
                      onClick={() => approveDoc(methDocId, methodDocStatus)}
                      className="common-progress-icon"
                      style={{ color: '#976ED7' }}
                    />
                    <DislikeOutlined
                      onClick={() => {
                        setRejectDocData({ id: methDocId });
                        setActionInfo({
                          action: 'Reject',
                          headerText: `${t('programme:rejectDocHeader')}`,
                          text: `${t('programme:rejectDocBody')}`,
                          type: 'reject',
                          icon: <DislikeOutlined />,
                        });
                        setOpenRejectDocConfirmationModal(true);
                      }}
                      className="common-progress-icon margin-left-1"
                      style={{ color: '#FD6F70' }}
                    />
                  </>
                )}
                {methodDocStatus === DocumentStatus.ACCEPTED && (
                  <CheckCircleOutlined
                    className="common-progress-icon"
                    style={{ color: '#5DC380' }}
                  />
                )}
              </div>
              {methodologyDocUrl !== '' && (
                <div className="time">
                  {moment(parseInt(methodologyDate)).format('DD MMMM YYYY @ HH:mm')}
                </div>
              )}
            </Col>
            <Col span={10} className="field-value">
              {methodologyDocUrl !== '' ? (
                <div className="link">
                  <a href={methodologyDocUrl} target="_blank" rel="noopener noreferrer" download>
                    <LinkOutlined className="common-progress-icon" style={{ color: '#3F3A47' }} />
                  </a>
                  {methodDocStatus !== DocumentStatus.ACCEPTED && (
                    <>
                      <FileAddOutlined
                        className="common-progress-icon margin-left-1"
                        style={
                          designDocStatus === DocumentStatus.ACCEPTED
                            ? { color: '#3F3A47', cursor: 'pointer' }
                            : { color: '#cacaca' }
                        }
                        onClick={handleMethodologyFileUpload}
                      />
                      <input
                        type="file"
                        ref={fileInputRefMeth}
                        style={{ display: 'none' }}
                        accept=".xlsx"
                        onChange={(e: any) => {
                          const selectedFile = e.target.files[0];
                          if (designDocStatus === DocumentStatus.ACCEPTED)
                            onUploadDocument(selectedFile, DocType.METHODOLOGY_DOCUMENT);
                          // Handle the selected file here
                        }}
                      />
                    </>
                  )}
                </div>
              ) : (
                <>
                  <FileAddOutlined
                    className="common-progress-icon"
                    style={
                      designDocStatus === DocumentStatus.ACCEPTED
                        ? { color: '#3F3A47', cursor: 'pointer' }
                        : { color: '#cacaca' }
                    }
                    onClick={handleMethodologyFileUpload}
                  />
                  <input
                    type="file"
                    ref={fileInputRefMeth}
                    style={{ display: 'none' }}
                    accept=".xlsx"
                    onChange={(e: any) => {
                      const selectedFile = e.target.files[0];
                      if (designDocStatus === DocumentStatus.ACCEPTED)
                        onUploadDocument(selectedFile, DocType.METHODOLOGY_DOCUMENT);
                      // Handle the selected file here
                    }}
                  />
                </>
              )}
            </Col>
          </Row>
        </div>
      </div>
      <RejectDocumentationConfirmationModel
        actionInfo={actionInfo}
        onActionConfirmed={handleOk}
        onActionCanceled={handleCancel}
        openModal={openRejectDocConfirmationModal}
        errorMsg={''}
        loading={loading}
      />
    </>
  );
};

export default ProgrammeDocuments;
