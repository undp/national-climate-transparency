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
          <div className="title">Status</div>
        </Col>
      </Row>
      <Row justify="center">
        <Col span={20}>
          <div className="text">
            We as members, contributors, and leaders pledge to make participation in our community a
            harassment-free experience for everyone, regardless of age, body size, visible or
            invisible disability, ethnicity, sex characteristics, gender identity and expression,
            level of experience, education, socio-economic status, nationality, personal appearance,
            race, religion, or sexual identity and orientation.
            <br />
            We pledge to act and interact in ways that contribute to an open, welcoming, diverse,
            inclusive, and healthy community.
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Status;
