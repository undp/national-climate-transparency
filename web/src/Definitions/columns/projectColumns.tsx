import { CloseCircleOutlined, EllipsisOutlined } from '@ant-design/icons';
import { List, Popover, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { ProjectData } from '../projectDefinitions';

export const getProjectTableColumns = (isView: boolean, detachProject: (arg0: string) => void) => {
  const { t } = useTranslation(['programmeForm']);

  const actionMenu = (record: ProjectData) => {
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
                detachProject(record.projectId);
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

  const projTableColumns = [
    { title: t('projectId'), dataIndex: 'projectId', key: 'projectId' },
    { title: t('projectName'), dataIndex: 'projectName', key: 'projectName' },
    {
      title: '',
      key: 'projectAction',
      align: 'right' as const,
      width: 6,
      render: (record: any) => {
        return (
          <>
            {!isView && (
              <Popover
                showArrow={false}
                trigger={'click'}
                placement="bottomRight"
                content={actionMenu(record)}
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

  return projTableColumns;
};
