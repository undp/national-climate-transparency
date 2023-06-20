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

export interface NdcActionBodyProps {
  data?: any;
  progressIcon?: any;
  programmeId?: any;
}

const NdcActionBody: FC<NdcActionBodyProps> = (props: NdcActionBodyProps) => {
  const { data, progressIcon, programmeId } = props;
  const { t } = useTranslation(['programme']);
  const { userInfoState } = useUserContext();
  const fileInputMonitoringRef: any = useRef(null);
  const fileInputVerificationRef: any = useRef(null);
  const { get, put, post } = useConnection();
  const [loading, setLoading] = useState<boolean>(false);
  const [monitoringReportData, setMonitoringReportData] = useState<any>();
  const [verificationReportData, setVerificationReportData] = useState<any>();

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

  const textStyle = {
    color: data?.monitoringReport === '' && '#d8d5dd', // Green if verified, red otherwise
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
        actionId: data?.id,
      });
      if (response?.data) {
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
      message.open({
        type: 'error',
        content: error?.message,
        duration: 4,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } finally {
      setLoading(false);
    }
  };

  const approveDoc = async (id: any, status: any, actionId: any, type: any) => {
    setLoading(true);
    try {
      const response: any = await post('national/programme/docAction', {
        id: id,
        status: DocumentStatus.ACCEPTED,
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
      if (type === DocType.MONITORING_REPORT) {
        monitoringReportData.status = DocumentStatus.ACCEPTED;
        setMonitoringReportData({ ...monitoringReportData });
      } else if (type === DocType.VERIFICATION_REPORT) {
        verificationReportData.status = DocumentStatus.ACCEPTED;
        setVerificationReportData({ ...verificationReportData });
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    data?.map((item: any) => {
      if (item?.monitoringReport) {
        setMonitoringReportData(item?.monitoringReport);
      }
      if (item?.verificationReportData) {
        setVerificationReportData(item?.verificationReportData);
      }
    });
  }, []);

  return loading ? (
    <Skeleton />
  ) : (
    <div className="ndc-action-body">
      <div className="report-details">
        <div className="report-type">
          <div className="name">Monitoring Report</div>
          <div className="icon">
            {monitoringReportData?.url ? (
              monitoringReportData?.status === DocumentStatus.PENDING ? (
                (userInfoState?.companyRole === CompanyRole.GOVERNMENT ||
                  userInfoState?.companyRole === CompanyRole.CERTIFIER) && (
                  <>
                    <LikeOutlined
                      onClick={() =>
                        approveDoc(
                          monitoringReportData?.id,
                          monitoringReportData?.status,
                          monitoringReportData?.actionId,
                          monitoringReportData?.type
                        )
                      }
                      className="common-progress-icon"
                      style={{ color: '#976ED7' }}
                    />
                    <DislikeOutlined
                      className="common-progress-icon margin-left-1"
                      style={{ color: '#FD6F70' }}
                    />
                  </>
                )
              ) : (
                monitoringReportData?.status === DocumentStatus.ACCEPTED && (
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
                  style={{ color: '#3F3A47', cursor: 'pointer' }}
                  onClick={() => handleFileUploadMonitor()}
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
          </div>
        )}
      </div>
      <div className="report-details">
        <div className="report-type">
          <div
            className={monitoringReportData?.status === DocumentStatus.ACCEPTED ? 'name' : 'empty'}
          >
            Verification Report
          </div>
          <div className="icon">
            {verificationReportData?.url ? (
              <CheckCircleOutlined className="common-progress-icon" style={{ color: '#5DC380' }} />
            ) : (
              <>
                <FileAddOutlined
                  className="common-progress-icon"
                  style={
                    monitoringReportData?.status === DocumentStatus.ACCEPTED
                      ? { color: '#3F3A47', cursor: 'pointer' }
                      : { color: '#cacaca' }
                  }
                  onClick={() => {
                    if (monitoringReportData?.status === DocumentStatus.ACCEPTED) {
                      handleFileUploadVerification();
                    }
                  }}
                />
                {monitoringReportData?.status === DocumentStatus.ACCEPTED && (
                  <input
                    type="file"
                    ref={fileInputMonitoringRef}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default NdcActionBody;
