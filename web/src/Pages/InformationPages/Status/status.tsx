import { Col, Row } from 'antd';
import { useEffect } from 'react';
import i18next from 'i18next';
import './status.scss';

const Status = () => {
  useEffect(() => {
    if (localStorage.getItem('i18nextLng')!.length > 2) {
      i18next.changeLanguage('en');
    }
  }, []);
  return (
    <div className="status-container">
      <Row>
        <Col md={24} lg={24}>
          <div className="title">Status analytics can be linked here</div>
        </Col>
      </Row>
      <Row justify="center">
        <Col span={20}>
          <div className="text">
            For more information please contact UNDP at{' '}
            <a href="mailto:vu.hanh.dung.nguyen@undp.org">vu.hanh.dung.nguyen@undp.org</a>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Status;
