import { EllipsisOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import { useTranslation } from 'react-i18next';
import { detachMenu } from '../../Components/Popups/tableAction';

export const getProjectTableColumns = (isView: boolean, detachProject: (arg0: string) => void) => {
  const { t } = useTranslation(['formTable']);

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
                key={`${record.projectId}_prj_detach`}
                showArrow={false}
                trigger={'click'}
                placement="bottomRight"
                content={detachMenu(record.projectId, t, detachProject)}
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
