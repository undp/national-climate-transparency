import { Col, Row } from 'antd';
import { useEffect } from 'react';
import i18next from 'i18next';
import './help.scss';

const Help = () => {
  useEffect(() => {
    if (localStorage.getItem('i18nextLng')!.length > 2) {
      i18next.changeLanguage('en');
    }
  }, []);
  return (
    <div className="help-container">
      <Row>
        <Col md={24} lg={24}>
          <div className="title">FAQs or Help Bot can be linked here</div>
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

export default Help;
