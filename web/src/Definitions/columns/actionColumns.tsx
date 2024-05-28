import ScrollableList from '../../Components/ScrollableList/scrollableList';

export const getActionTableColumns = (t: any) => {
  const actionTableColumns = [
    {
      title: t('actionList:actionId'),
      width: 100,
      dataIndex: 'actionId',
      key: 'actionId',
      sorter: false,
    },
    {
      title: t('actionList:titleOfAction'),
      width: 120,
      dataIndex: 'title',
      key: 'title',
      sorter: false,
    },
    {
      title: t('actionList:actionType'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.actionType}></ScrollableList>;
      },
    },
    {
      title: t('actionList:sectorAffected'),
      width: 120,
      dataIndex: 'affectedSectors',
      key: 'affectedSectors',
      sorter: false,
    },
    {
      title: t('actionList:actionStatus'),
      width: 120,
      dataIndex: 'status',
      key: 'status',
      sorter: false,
    },
    {
      title: t('actionList:nationalImplementingEntity'),
      width: 180,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.nationalImplementingEntity}></ScrollableList>;
      },
    },
    {
      title: t('actionList:financeNeeded'),
      width: 120,
      dataIndex: 'financeNeeded',
      key: 'financeNeeded',
      sorter: false,
    },
    {
      title: t('actionList:financeReceived'),
      width: 130,
      dataIndex: 'financeReceived',
      key: 'financeReceived',
      sorter: false,
    },
  ];

  return actionTableColumns;
};