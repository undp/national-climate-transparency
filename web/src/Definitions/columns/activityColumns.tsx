import { EllipsisOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import { useTranslation } from 'react-i18next';
import { detachMenu } from '../../Components/Popups/tableAction';
import ScrollableList from '../../Components/ScrollableList/scrollableList';

export const getActivityTableColumns = (
  isView: boolean,
  detachActivity: (arg0: string) => void
) => {
  const { t } = useTranslation(['formTable']);

  const activityTableColumns = [
    { title: t('activityIdTitle'), dataIndex: 'activityId', key: 'activityId' },
    { title: t('titleTitle'), dataIndex: 'title', key: 'title' },
    { title: t('redMeasuresTitle'), dataIndex: 'reductionMeasures', key: 'reductionMeasures' },
    { title: t('statusTitle'), dataIndex: 'status', key: 'status' },
    {
      title: t('natImplementorTitle'),
      width: 250,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.natImplementor}></ScrollableList>;
      },
    },
    {
      title: '',
      key: 'activityId',
      align: 'right' as const,
      width: 6,
      render: (record: any) => {
        return (
          <>
            {!isView && (
              <Popover
                key={`${record.activityId}_act_detach`}
                showArrow={false}
                trigger={'click'}
                placement="bottomRight"
                content={detachMenu(record.activityId, t, detachActivity)}
              >
                <EllipsisOutlined
                  rotate={90}
                  style={{ fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
                />
              </Popover>
            )}
          </>
        );
      },
    },
  ];

  return activityTableColumns;
};
