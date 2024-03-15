import { useTranslation } from 'react-i18next';
import './actionForm.scss';
import { Row, Col, Input, Dropdown, MenuProps, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import { useState } from 'react';
import DeleteCard from '../../../Components/Card/deleteCard';

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

  // form state
  const [documentList, setDocumentList] = useState<UploadFile[]>([]);

  // Upload functionality
  const onChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setDocumentList(newFileList);
    console.log(newFileList);
  };

  const handleDelete = (fileId: any) => {
    setDocumentList((prevList) => prevList.filter((file) => file.uid !== fileId));
  };

  const props = {
    onChange,
    fileList: documentList,
    showUploadList: false,
  };

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
          <Col span={6} style={{ height: rowHeight }}>
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
        <Row gutter={[gutterSize, 8]} style={{ marginBottom: rowBottomMargin, marginTop: '20px' }}>
          <Col span={3} style={{ height: fieldHeight }}>
            <Upload {...props}>
              <Button icon={<UploadOutlined />} style={{ width: '120px', height: fieldHeight }}>
                Upload
              </Button>
            </Upload>
          </Col>
          <Col span={21}>
            <Row gutter={[gutterSize, 10]}>
              {documentList.map((file: any) => (
                <Col span={8} style={{ height: fieldHeight }}>
                  <DeleteCard
                    fileName={file.name.slice(0, 26)}
                    fileId={file.uid}
                    handleDelete={handleDelete}
                  ></DeleteCard>
                </Col>
              ))}
            </Row>
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
