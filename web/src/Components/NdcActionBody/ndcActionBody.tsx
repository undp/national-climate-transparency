import React, { FC, useEffect, useRef, useState } from 'react';
import './ndcActionBody.scss';
import {
  CheckCircleOutlined,
  DislikeOutlined,
  FileAddOutlined,
  LikeOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { DocType } from '../../Casl/enums/document.type';
import { RcFile } from 'antd/lib/upload';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { Skeleton, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { DocumentStatus } from '../../Casl/enums/document.status';
import { useUserContext } from '../../Context/UserInformationContext/userInformationContext';
import { CompanyRole } from '@undp/carbon-library';
import RejectDocumentationConfirmationModel from '../Models/rejectDocumentForm';
import moment from 'moment';

export interface NdcActionBodyProps {
  data?: any;
  progressIcon?: any;
  programmeId?: any;
  canUploadMonitorReport?: boolean;
  getProgrammeDocs?: any;
}

const NdcActionBody: FC<NdcActionBodyProps> = (props: NdcActionBodyProps) => {
  const { data, progressIcon, programmeId, canUploadMonitorReport, getProgrammeDocs } = props;
  const { t } = useTranslation(['programme']);
  const { userInfoState } = useUserContext();
  const fileInputMonitoringRef: any = useRef(null);
  const fileInputVerificationRef: any = useRef(null);
  const { get, put, post } = useConnection();
  const [loading, setLoading] = useState<boolean>(false);
  const [monitoringReportData, setMonitoringReportData] = useState<any>();
  const [verificationReportData, setVerificationReportData] = useState<any>();
  const [ndcActionId, setNdcActionId] = useState<any>();
  const [openRejectDocConfirmationModal, setOpenRejectDocConfirmationModal] = useState(false);
  const [actionInfo, setActionInfo] = useState<any>({});
  const [rejectDocData, setRejectDocData] = useState<any>({});

  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleFileUploadMonitor = () => {
    fileInputMonitoringRef?.current?.click();
  };

  const handleFileUploadVerification = () => {
    fileInputVerificationRef?.current?.click();
  };

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
        actionId: ndcActionId,
      });
      if (response?.data) {
        message.open({
          type: 'success',
          content:
            (type === DocType.MONITORING_REPORT
              ? `${t('programme:monitorDoc')}`
              : `${t('programme:veriDoc')}`) +
            ' ' +
            `${t('programme:isUploaded')}`,
          duration: 4,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
      }
    } catch (error: any) {
      message.open({
        type: 'error',
        content: error?.message,
        duration: 4,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } finally {
      getProgrammeDocs();
      fileInputMonitoringRef.current = null;
      fileInputVerificationRef.current = null;
      setLoading(false);
    }
  };

  const docAction = async (id: any, status: any, actionId: any, type: any) => {
    setLoading(true);
    try {
      const response: any = await post('national/programme/docAction', {
        id: id,
        status: status,
        actionId: actionId,
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
      getProgrammeDocs();
      setOpenRejectDocConfirmationModal(false);
      setLoading(false);
    }
  };

  const handleOk = () => {
    docAction(
      rejectDocData?.id,
      DocumentStatus.REJECTED,
      rejectDocData?.actionId,
      rejectDocData?.type
    );
  };

  const handleCancel = () => {
    setOpenRejectDocConfirmationModal(false);
  };

  useEffect(() => {
    console.log(canUploadMonitorReport, ' --------------- can upload monitor report ------------');
    data?.map((item: any) => {
      setNdcActionId(item?.id);
      if (item?.monitoringReport) {
        setMonitoringReportData(item?.monitoringReport);
      }
      if (item?.verificationReport) {
        setVerificationReportData(item?.verificationReport);
      }
    });
  }, [data]);

  const companyRolePermission =
    userInfoState?.companyRole === CompanyRole.GOVERNMENT ||
    userInfoState?.companyRole === CompanyRole.CERTIFIER;
  const monitoringReportPending = monitoringReportData?.status === DocumentStatus.PENDING;
  const monitoringReportAccepted = monitoringReportData?.status === DocumentStatus.ACCEPTED;
  const verifcationReportPending = verificationReportData?.status === DocumentStatus.PENDING;
  const verificationReportAccepted = verificationReportData?.status === DocumentStatus.ACCEPTED;

  return loading ? (
    <Skeleton />
  ) : (
    <>
      <div
        className="ndc-action-body"
        style={
          monitoringReportData?.url && verificationReportData?.url
            ? { height: '5.5rem' }
            : monitoringReportData?.url || verificationReportData?.url
            ? { height: '4rem' }
            : { height: '3rem' }
        }
      >
        <div className="report-details">
          <div className="report-type">
            <div className="name-time-container">
              <div className={canUploadMonitorReport ? 'name' : 'empty'}>
                {t('programme:monitoringReport')}
              </div>
              {monitoringReportData?.txTime && (
                <div className="time">
                  {moment(parseInt(monitoringReportData?.txTime)).format('DD MMMM YYYY @ HH:mm')}
                </div>
              )}
            </div>
            <div className="icon">
              {monitoringReportData?.url ? (
                monitoringReportPending ? (
                  companyRolePermission && (
                    <>
                      <LikeOutlined
                        onClick={() =>
                          docAction(
                            monitoringReportData?.id,
                            DocumentStatus.ACCEPTED,
                            monitoringReportData?.actionId,
                            monitoringReportData?.type
                          )
                        }
                        className="common-progress-icon"
                        style={{ color: '#976ED7' }}
                      />
                      <DislikeOutlined
                        onClick={() => {
                          setRejectDocData({
                            id: monitoringReportData?.id,
                            actionId: monitoringReportData?.actionId,
                            type: monitoringReportData?.type,
                          });
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
                  )
                ) : (
                  monitoringReportAccepted && (
                    <CheckCircleOutlined
                      className="common-progress-icon"
                      style={{ color: '#5DC380' }}
                    />
                  )
                )
              ) : (
                <>
                  <FileAddOutlined
                    className="common-progress-icon"
                    style={
                      canUploadMonitorReport
                        ? { color: '#3F3A47', cursor: 'pointer' }
                        : { color: '#cacaca', cursor: 'default' }
                    }
                    onClick={() => {
                      if (canUploadMonitorReport) {
                        handleFileUploadMonitor();
                      }
                    }}
                  />
                  <input
                    type="file"
                    ref={fileInputMonitoringRef}
                    style={{ display: 'none' }}
                    accept=".pdf"
                    onChange={(e: any) => {
                      const selectedFile = e.target.files[0];
                      onUploadDocument(selectedFile, DocType.MONITORING_REPORT);
                    }}
                  />
                </>
              )}
            </div>
          </div>
          {monitoringReportData?.url && (
            <div className="report-link">
              <div className="version">V1.0</div>
              <div className="link">
                <a
                  href={monitoringReportData?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <LinkOutlined className="common-progress-icon" style={{ color: '#3F3A47' }} />
                </a>
              </div>
              {!monitoringReportAccepted && (
                <>
                  <FileAddOutlined
                    className="common-progress-icon margin-left-1"
                    style={
                      canUploadMonitorReport
                        ? { color: '#3F3A47', cursor: 'pointer' }
                        : { color: '#cacaca', cursor: 'default' }
                    }
                    onClick={() => {
                      if (canUploadMonitorReport) {
                        handleFileUploadMonitor();
                      }
                    }}
                  />
                  <input
                    type="file"
                    ref={fileInputMonitoringRef}
                    style={{ display: 'none' }}
                    accept=".pdf"
                    onChange={(e: any) => {
                      const selectedFile = e.target.files[0];
                      onUploadDocument(selectedFile, DocType.MONITORING_REPORT);
                    }}
                  />
                </>
              )}
            </div>
          )}
        </div>
        <div className="report-details">
          <div className="report-type">
            <div className="name-time-container">
              <div className={monitoringReportAccepted ? 'name' : 'empty'}>
                {t('programme:verificationReport')}
              </div>
              {verificationReportData?.txTime && (
                <div className="time">
                  {moment(parseInt(verificationReportData?.txTime)).format('DD MMMM YYYY @ HH:mm')}
                </div>
              )}
            </div>
            <div className="icon">
              {verificationReportData?.url ? (
                verifcationReportPending ? (
                  companyRolePermission && (
                    <>
                      <LikeOutlined
                        onClick={() =>
                          docAction(
                            verificationReportData?.id,
                            verificationReportData?.status,
                            verificationReportData?.actionId,
                            verificationReportData?.type
                          )
                        }
                        className="common-progress-icon"
                        style={{ color: '#976ED7' }}
                      />
                      <DislikeOutlined
                        onClick={() => {
                          setRejectDocData({
                            id: verificationReportData?.id,
                            actionId: verificationReportData?.actionId,
                            type: verificationReportData?.type,
                          });
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
                  )
                ) : (
                  verificationReportData?.status === DocumentStatus.ACCEPTED && (
                    <CheckCircleOutlined
                      className="common-progress-icon"
                      style={{ color: '#5DC380' }}
                    />
                  )
                )
              ) : (
                <>
                  <FileAddOutlined
                    className="common-progress-icon"
                    style={
                      monitoringReportAccepted
                        ? { color: '#3F3A47', cursor: 'pointer' }
                        : { color: '#cacaca', cursor: 'default' }
                    }
                    onClick={() => {
                      handleFileUploadVerification();
                    }}
                  />
                  {monitoringReportAccepted && (
                    <input
                      type="file"
                      ref={fileInputVerificationRef}
                      style={{ display: 'none' }}
                      accept=".pdf"
                      onChange={(e: any) => {
                        const selectedFile = e.target.files[0];
                        onUploadDocument(selectedFile, DocType.VERIFICATION_REPORT);
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
          {verificationReportData?.url && (
            <div className="report-link">
              <div className="version">V1.1</div>
              <div className="link">
                <a
                  href={verificationReportData?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <LinkOutlined className="common-progress-icon" style={{ color: '#3F3A47' }} />
                </a>
              </div>
              {!verificationReportAccepted && monitoringReportAccepted && (
                <>
                  <FileAddOutlined
                    className="common-progress-icon margin-left-1"
                    style={
                      monitoringReportAccepted
                        ? { color: '#3F3A47', cursor: 'pointer' }
                        : { color: '#cacaca', cursor: 'default' }
                    }
                    onClick={() => {
                      handleFileUploadVerification();
                    }}
                  />
                  <input
                    type="file"
                    ref={fileInputVerificationRef}
                    style={{ display: 'none' }}
                    accept=".pdf"
                    onChange={(e: any) => {
                      const selectedFile = e.target.files[0];
                      onUploadDocument(selectedFile, DocType.VERIFICATION_REPORT);
                    }}
                  />
                </>
              )}
            </div>
          )}
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

export default NdcActionBody;
