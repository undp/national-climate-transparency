import { Select } from 'antd';
import './scrollableList.scss';

interface Props {
  listToShow: any[];
}

const ScrollableList: React.FC<Props> = ({ listToShow }) => {
  const options: any[] = [];
  listToShow.map((item: string, index: number) =>
    options.push({
      key: index,
      label: item,
      value: item,
      disabled: true,
    })
  );

  return (
    <Select
      showSearch={false}
      mode="multiple"
      style={{ width: '150px' }}
      options={options}
      value={options}
      bordered={false}
      popupClassName="scrollable-list"
      dropdownMatchSelectWidth={false}
      className="has-options"
    />
  );
};

export default ScrollableList;
