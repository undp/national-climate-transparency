import { useTranslation } from 'react-i18next';
import ScrollableList from '../../Components/ScrollableList/scrollableList';

export const getProgrammeTableColumns = () => {
  const { t } = useTranslation(['formTable']);

  const programmeTableColumns = [
    { title: t('programmeId'), dataIndex: 'programmeId', key: 'programmeId' },
    { title: t('actionId'), dataIndex: 'actionId', key: 'actionId' },
    { title: t('programmeTitle'), dataIndex: 'title', key: 'title' },
    { title: t('programmeType'), dataIndex: 'type', key: 'title' },
    { title: t('programmeStatus'), dataIndex: 'status', key: 'status' },
    {
      title: t('subSectorAffected'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.subSectorsAffected}></ScrollableList>;
      },
    },
    {
      title: t('investmentNeeds'),
      dataIndex: 'estimatedInvestment',
      key: 'estimatedInvestment',
    },
  ];

  return programmeTableColumns;
};
