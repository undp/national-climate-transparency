import { useTranslation } from 'react-i18next';
import './actionForm.scss';
import { Row, Col, Input, Dropdown, MenuProps, Button } from 'antd';

const gutterSize = 30;
const rowHeight = '80px';
const rowBottomMargin = '10px';
const multiLineHeight = '114px';
const fieldHeight = '40px';

const { TextArea } = Input;

const items: MenuProps['items'] = [
  {
    key: '1',
    label: 'Item 1',
  },
  {
    key: '2',
    label: 'Item 2',
  },
  {
    key: '3',
    label: 'Item 3',
  },
];

const actionForm = () => {
  const { t } = useTranslation(['actionList']);
  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('Add New Action')}</div>
        <div className="body-sub-title">
          {t('Lorem ipsum dolor sit amet, consectetur adipiscing elit,')}
        </div>
      </div>
      <div className="form-card">
        <div style={{ color: '#3A3541', opacity: 0.8, marginBottom: '25px', fontWeight: 'bold' }}>
          {'General Action Information'}
        </div>
        <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
          <Col span={12} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{'Type (s)'}</div>
            <Dropdown
              menu={{
                items,
                selectable: true,
              }}
            >
              <Input style={{ height: fieldHeight }} />
            </Dropdown>
          </Col>
          <Col span={12} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
              {'Title of Action'}
            </div>
            <Input style={{ height: fieldHeight }} />
          </Col>
        </Row>
        <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
          <Col span={12} style={{ height: multiLineHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
              {'Short Description of Action'}
            </div>
            <TextArea rows={3} />
          </Col>
          <Col span={12} style={{ height: multiLineHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
              {'Action Objectives'}
            </div>
            <TextArea rows={3} />
          </Col>
        </Row>
        <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
          <Col span={12} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
              {'Type of Instruments'}
            </div>
            <Dropdown
              menu={{
                items,
                selectable: true,
              }}
            >
              <Input style={{ height: fieldHeight }} />
            </Dropdown>
          </Col>
          <Col span={12} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{'Action Status'}</div>
            <Dropdown
              menu={{
                items,
                selectable: true,
              }}
            >
              <Input style={{ height: fieldHeight }} />
            </Dropdown>
          </Col>
        </Row>
        <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
          <Col span={12} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
              {'GHG (s) Affected'}
            </div>
            <Dropdown
              menu={{
                items,
                selectable: true,
              }}
            >
              <Input style={{ height: fieldHeight }} />
            </Dropdown>
          </Col>
          <Col span={6} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
              {'Sector (s) Affected'}
            </div>
            <Dropdown
              menu={{
                items,
                selectable: true,
              }}
            >
              <Input style={{ height: fieldHeight }} />
            </Dropdown>
          </Col>
          <Col span={6} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{'Start Year'}</div>
            <Dropdown
              menu={{
                items,
                selectable: true,
              }}
            >
              <Input style={{ height: fieldHeight }} />
            </Dropdown>
          </Col>
        </Row>
        <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
          <Col span={12} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
              {'National Implementing Entity (s)'}
            </div>
            <Dropdown
              menu={{
                items,
                selectable: true,
              }}
            >
              <Input style={{ height: fieldHeight }} />
            </Dropdown>
          </Col>
          <Col span={12} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
              {'Anchored in a National Strategy'}
            </div>
            <Dropdown
              menu={{
                items,
                selectable: true,
              }}
            >
              <Input style={{ height: fieldHeight }} />
            </Dropdown>
          </Col>
        </Row>
        <Row gutter={gutterSize} style={{ marginBottom: rowBottomMargin }}>
          <Col span={12} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
              {'Estimated Investment Needs (USD)'}
            </div>
            <Dropdown
              menu={{
                items,
                selectable: true,
              }}
            >
              <Input style={{ height: fieldHeight }} />
            </Dropdown>
          </Col>
          <Col span={2} style={{ height: rowHeight }}>
            <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>{'Documents'}</div>
            <Button style={{ height: fieldHeight }}>Upload</Button>
          </Col>
          <Col span={10} style={{ height: rowHeight }}>
            <Button
              style={{ marginTop: '38px', height: fieldHeight, width: '100%', overflow: 'hidden' }}
            >
              Seychelles’ Updated Nationally Determined Contribution July 2021.pdf
            </Button>
          </Col>
        </Row>
      </div>
      <div className="form-card">
        <div style={{ color: '#3A3541', opacity: 0.8, marginBottom: '25px', fontWeight: 'bold' }}>
          {'List of Programme under the Action'}
        </div>
      </div>
      <div className="form-card">
        <div style={{ color: '#3A3541', opacity: 0.8, marginBottom: '25px', fontWeight: 'bold' }}>
          {'Mitigation Information'}
        </div>
      </div>
    </div>
  );
};

export default actionForm;
