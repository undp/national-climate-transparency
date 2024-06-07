import ScrollableList from '../../Components/ScrollableList/scrollableList';
import { ReportFiveRecord } from '../reportDefinitions';

export const getReportFiveColumns = (t: any) => {
  const reportFiveColumns = [
    {
      title: t('titleOfAction'),
      dataIndex: 'titleOfAction',
      key: 'titleOfAction',
      width: 150,
    },
    { title: t('description'), dataIndex: 'description', key: 'description', width: 150 },
    { title: t('objective'), dataIndex: 'objective', key: 'objective', width: 150 },
    {
      title: t('instrumentType'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportFiveRecord) => {
        return <ScrollableList listToShow={record.instrumentType}></ScrollableList>;
      },
    },
    { title: t('status'), dataIndex: 'status', key: 'status', width: 100 },
    { title: t('sector'), dataIndex: 'sector', key: 'sector', width: 150 },
    {
      title: t('ghgsAffected'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportFiveRecord) => {
        return <ScrollableList listToShow={record.ghgsAffected}></ScrollableList>;
      },
    },
    { title: t('startYear'), dataIndex: 'startYear', key: 'startYear', width: 100 },
    {
      title: t('implementingEntities'),
      width: 150,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportFiveRecord) => {
        return <ScrollableList listToShow={record.implementingEntities}></ScrollableList>;
      },
    },
    {
      title: t('ghgCommonTitle'),
      children: [
        {
          title: t('achievedGHGReduction'),
          dataIndex: 'achievedGHGReduction',
          key: 'achievedGHGReduction',
          width: 180,
        },
        {
          title: t('expectedGHGReduction'),
          dataIndex: 'expectedGHGReduction',
          key: 'expectedGHGReduction',
          width: 180,
        },
      ],
    },
  ];

  return reportFiveColumns;
};
