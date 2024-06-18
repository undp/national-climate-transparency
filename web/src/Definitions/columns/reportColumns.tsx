import ScrollableList from '../../Components/ScrollableList/scrollableList';
import { ReportFiveRecord, ReportTwelveRecord } from '../reportIndividualDefinitions';

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
          width: 100,
        },
        {
          title: t('expectedGHGReduction'),
          dataIndex: 'expectedGHGReduction',
          key: 'expectedGHGReduction',
          width: 100,
        },
      ],
    },
  ];

  return reportFiveColumns;
};

export const getReportTwelveColumns = (t: any) => {
  const reportTwelveColumns = [
    {
      title: t('titleOfProject'),
      dataIndex: 'title',
      key: 'title',
      width: 150,
    },
    { title: t('descriptionOfProject'), dataIndex: 'description', key: 'description', width: 150 },
    { title: t('statusOfProject'), dataIndex: 'status', key: 'status', width: 100 },
    {
      title: t('supportDirection'),
      dataIndex: 'supportDirection',
      key: 'supportDirection',
      width: 100,
    },
    {
      title: t('isEnhancingTransparency'),
      dataIndex: 'isEnhancingTransparency',
      key: 'isEnhancingTransparency',
      width: 100,
    },
    { title: t('startYear'), dataIndex: 'startYear', key: 'startYear', width: 100 },
    { title: t('endYear'), dataIndex: 'endYear', key: 'endYear', width: 100 },
    {
      title: t('amountCommonTitle'),
      children: [
        {
          title: t('usd'),
          dataIndex: 'fundUsd',
          key: 'fundUsd',
          width: 50,
        },
        {
          title: t('domestic'),
          dataIndex: 'fundDomestic',
          key: 'fundDomestic',
          width: 50,
        },
      ],
    },
    {
      title: t('internationalSupportChannel'),
      width: 150,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportTwelveRecord) => {
        return <ScrollableList listToShow={record.internationalSupportChannel}></ScrollableList>;
      },
    },
  ];

  return reportTwelveColumns;
};
