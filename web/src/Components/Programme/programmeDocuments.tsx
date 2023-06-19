import { Col, Row } from 'antd';
import { DateTime } from 'luxon';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { dateFormat } from '../../Pages/Common/configs';
import './programmeDocuments.scss';
import { FileAddOutlined } from '@ant-design/icons';

export interface ProgrammeDocumentsProps {
  data: any;
  title: any;
  icon: any;
  hiddenColumns?: any;
}

const ProgrammeDocuments: FC<ProgrammeDocumentsProps> = (props: ProgrammeDocumentsProps) => {
  const { data, title, icon, hiddenColumns } = props;
  return (
    <div className="info-view">
      <div className="title">
        <span className="title-icon">{icon}</span>
        <span className="title-text">{title}</span>
      </div>
      <div>
        <Row className="field" key="Design Document">
          <Col span={12} className="field-key">
            Design Document
          </Col>
          <Col span={12} className="field-value">
            <FileAddOutlined className="common-progress-icon" style={{ color: '#cacaca' }} />
          </Col>
        </Row>
        <Row className="field" key="Methodology Document">
          <Col span={12} className="field-key">
            Methodology Document
          </Col>
          <Col span={12} className="field-value">
            <FileAddOutlined className="common-progress-icon" style={{ color: '#cacaca' }} />
          </Col>
        </Row>
      </div>
    </div>
  );
};

ProgrammeDocuments.defaultProps = {
  hiddenColumns: [],
};

export default ProgrammeDocuments;
