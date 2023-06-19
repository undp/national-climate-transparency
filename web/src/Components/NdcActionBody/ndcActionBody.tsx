import React, { FC, useEffect, useRef } from 'react';
import './ndcActionBody.scss';
import { CheckCircleOutlined, FileAddOutlined, LinkOutlined } from '@ant-design/icons';

export interface NdcActionBodyProps {
  data?: any;
  progressIcon?: any;
}

const NdcActionBody: FC<NdcActionBodyProps> = (props: NdcActionBodyProps) => {
  const { data, progressIcon } = props;
  const fileInputRef: any = useRef(null);

  const handleFileUpload = () => {
    fileInputRef?.current?.click();
  };
  const textStyle = {
    color: data?.monitoringReport === '' && '#d8d5dd', // Green if verified, red otherwise
  };
  useEffect(() => {
    console.log(data);
  }, []);
  return (
    <div className="ndc-action-body">
      <div className="report-details">
        <div className="report-type">
          <div className="name">Monitoring Report</div>
          <div className="icon">
            {data?.monitoringReport !== '' ? (
              <CheckCircleOutlined className="common-progress-icon" style={{ color: '#5DC380' }} />
            ) : (
              <>
                <FileAddOutlined
                  className="common-progress-icon"
                  style={{ color: '#3F3A47', cursor: 'pointer' }}
                  onClick={handleFileUpload}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf"
                  onChange={(e: any) => {
                    const selectedFile = e.target.files[0];
                    // Handle the selected file here
                  }}
                />
              </>
            )}
          </div>
        </div>
        {data?.monitoringReport !== '' && (
          <div className="report-link">
            <div className="version">V1.0</div>
            <div className="link">
              <a href={data?.monitoringReport} target="_blank" rel="noopener noreferrer" download>
                <LinkOutlined className="common-progress-icon" style={{ color: '#3F3A47' }} />
              </a>
            </div>
          </div>
        )}
      </div>
      <div className="report-details">
        <div className="report-type">
          <div className={data?.monitoringReport !== '' ? 'name' : 'empty'}>
            Verification Report
          </div>
          <div className="icon">
            {data?.verificationReport !== '' ? (
              <CheckCircleOutlined className="common-progress-icon" style={{ color: '#5DC380' }} />
            ) : (
              <FileAddOutlined className="common-progress-icon" style={{ color: '#cacaca' }} />
            )}
          </div>
        </div>
        {data?.verificationReport !== '' && (
          <div className="report-link">
            <div className="version">V1.1</div>
            <div className="link">
              <a href={data?.verificationReport} target="_blank" rel="noopener noreferrer" download>
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
