import { Col, List, Popover, Row, Tag } from 'antd';
import './scrollableList.scss';
import { useState } from 'react';

interface Props {
  listToShow: any[];
}

interface ListDataType {
  key: number;
  label: string;
  value: string;
  color: string;
}

const ScrollableList: React.FC<Props> = ({ listToShow }) => {
  const [fullListVisible, setFullListVisible] = useState<boolean>(false);

  const options: ListDataType[] = [];
  listToShow.map((item: string, index: number) =>
    options.push({
      key: index,
      label: item.length > 15 ? `${item.slice(0, 15)}...` : item,
      value: item,
      color: '#F1E9FF',
    })
  );

  const fullList = () => {
    return (
      <List
        style={{ padding: '0px', overflowY: 'auto', maxHeight: '100px' }}
        dataSource={options}
        renderItem={(item) => (
          <List.Item style={{ height: '25px', fontSize: '12px' }} key={item.key}>
            {item.value}
          </List.Item>
        )}
      />
    );
  };

  return (
    <div>
      <Row
        gutter={[30, 5]}
        onClick={() => {
          setFullListVisible(true);
        }}
      >
        {options.map((listValue: any, index: number) => (
          <Col key={index} span={24}>
            <Tag
              color={listValue.color}
              style={{
                maxWidth: '130px',
                width: listValue.label.length === 18 ? '130px' : 'auto',
                color: '#605c66',
                margin: '0px',
                borderRadius: '2px',
              }}
            >
              {listValue.label}
            </Tag>
          </Col>
        ))}
      </Row>
      <Popover
        open={fullListVisible}
        placement="bottom"
        trigger="click"
        showArrow={false}
        content={fullList()}
        onOpenChange={() => {
          setFullListVisible(false);
        }}
      ></Popover>
    </div>
  );
};

export default ScrollableList;
