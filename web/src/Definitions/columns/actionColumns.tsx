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
      title: t('columnHeader:type'),
      width: 120,
      dataIndex: 'actionType',
      key: 'actionType',
      sorter: false,
    },
    {
      title: t('columnHeader:sectorAffected'),
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
      title: t('columnHeader:nationalImplementingEntity'),
      width: 180,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.nationalImplementingEntity}></ScrollableList>;
      },
    },
    {
      title: t('columnHeader:financeNeeded'),
      width: 120,
      dataIndex: 'financeNeeded',
      key: 'financeNeeded',
      sorter: false,
    },
    {
      title: t('columnHeader:financeReceived'),
      width: 130,
      dataIndex: 'financeReceived',
      key: 'financeReceived',
      sorter: false,
    },
  ];

  return actionTableColumns;
};
