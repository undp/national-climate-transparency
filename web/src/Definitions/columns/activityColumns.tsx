import { CloseCircleOutlined, EllipsisOutlined } from '@ant-design/icons';
import { List, Popover, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { ActivityData } from '../activityDefinitions';

export const getActivityTableColumns = () => {
  const { t } = useTranslation(['projectForm']);

  const actionMenu = (record: ActivityData) => {
    return (
      <List
        className="action-menu"
        size="small"
        dataSource={[
          {
            text: t('detach'),
            icon: <CloseCircleOutlined style={{ color: 'red' }} />,
            click: () => {
              {
                // detachActivity(record.activityId);
              }
            },
          },
        ]}
        renderItem={(item) => (
          <List.Item onClick={item.click}>
            <Typography.Text className="action-icon">{item.icon}</Typography.Text>
            <span>{item.text}</span>
          </List.Item>
        )}
      />
    );
  };

  const activityTableColumns = [
    { title: t('activityIdTitle'), dataIndex: 'activityId', key: 'activityId' },
    { title: t('titleTitle'), dataIndex: 'title', key: 'title' },
    { title: t('redMeasuresTitle'), dataIndex: 'reductionMeasures', key: 'reductionMeasures' },
    { title: t('statusTitle'), dataIndex: 'status', key: 'status' },
    { title: t('startYearHeader'), dataIndex: 'startYear', key: 'startYear' },
    { title: t('endYearHeader'), dataIndex: 'endYear', key: 'endYear' },
    { title: t('natImplementorTitle'), dataIndex: 'natImplementor', key: 'natImplementor' },
    {
      title: '',
      key: 'activityAction',
      align: 'right' as const,
      width: 6,
      render: (record: any) => {
        return (
          <Popover
            placement="bottomRight"
            content={actionMenu(record)}
            trigger="click"
            // open={detachOpen[tempActivityIds.indexOf(record.activityId)]}
          >
            <EllipsisOutlined
              rotate={90}
              style={{ fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
              //   onClick={() => handleDetachOpen(record)}
            />
          </Popover>
        );
      },
    },
  ];

  return activityTableColumns;
};
