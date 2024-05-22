import ScrollableList from '../../Components/ScrollableList/scrollableList';

export const getActionTableColumns = (t: any) => {
  const actionTableColumns = [
    { title: t('actionId'), width: 100, dataIndex: 'actionId', key: 'actionId', sorter: false },
    { title: t('titleOfAction'), width: 120, dataIndex: 'title', key: 'title', sorter: false },
    {
      title: t('actionType'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.actionType}></ScrollableList>;
      },
    },
    {
      title: t('sectorAffected'),
      width: 120,
      dataIndex: 'affectedSectors',
      key: 'affectedSectors',
      sorter: false,
    },
    { title: t('actionStatus'), width: 120, dataIndex: 'status', key: 'status', sorter: false },
    {
      title: t('nationalImplementingEntity'),
      width: 180,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.nationalImplementingEntity}></ScrollableList>;
      },
    },
    {
      title: t('financeNeeded'),
      width: 120,
      dataIndex: 'financeNeeded',
      key: 'financeNeeded',
      sorter: false,
    },
    {
      title: t('financeReceived'),
      width: 130,
      dataIndex: 'financeReceived',
      key: 'financeReceived',
      sorter: false,
    },
  ];

  return actionTableColumns;
};
