import ScrollableList from '../../Components/ScrollableList/scrollableList';
import {
  ReportEightRecord,
  ReportElevenRecord,
  ReportFiveRecord,
  ReportNineRecord,
  ReportSevenRecord,
  ReportSixRecord,
  ReportThirteenRecord,
} from '../reportIndividualDefinitions';

export const getReportFiveColumns = (t: any) => {
  const reportFiveColumns = [
    {
      title: t('titleOfAction'),
      dataIndex: 'titleOfAction',
      key: 'titleOfAction',
      width: 200,
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

export const getReportSixColumns = (t: any) => {
  const reportSixColumns = [
    {
      title: t('titleOfActivity'),
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    { title: t('description'), dataIndex: 'description', key: 'description', width: 150 },
    { title: t('sector'), dataIndex: 'sector', key: 'sector', width: 150 },
    {
      title: t('subSectors'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportSixRecord) => {
        return <ScrollableList listToShow={record.subSectors}></ScrollableList>;
      },
    },
    { title: t('type'), dataIndex: 'type', key: 'type', width: 150 },
    { title: t('natAnchor'), dataIndex: 'natAnchor', key: 'natAnchor', width: 1000 },
    {
      title: t('techDevelopment'),
      dataIndex: 'techDevelopment',
      key: 'techDevelopment',
      width: 500,
    },
    {
      title: t('capacityBuilding'),
      dataIndex: 'capacityBuilding',
      key: 'capacityBuilding',
      width: 500,
    },
    { title: t('startYear'), dataIndex: 'startYear', key: 'startYear', width: 100 },
    { title: t('endYear'), dataIndex: 'endYear', key: 'endYear', width: 100 },
    { title: t('supportChannel'), dataIndex: 'supportChannel', key: 'supportChannel', width: 100 },
    {
      title: t('amountCommonTitle'),
      children: [
        {
          title: t('usd'),
          dataIndex: 'receivedAmount',
          key: 'receivedAmount',
          width: 50,
        },
        {
          title: t('domestic'),
          dataIndex: 'receivedAmountDomestic',
          key: 'receivedAmountDomestic',
          width: 50,
        },
      ],
    },
  ];

  return reportSixColumns;
};

export const getReportSevenColumns = (t: any) => {
  const reportSevenColumns = [
    {
      title: t('titleOfActivity'),
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    { title: t('description'), dataIndex: 'description', key: 'description', width: 150 },
    { title: t('sector'), dataIndex: 'sector', key: 'sector', width: 150 },
    {
      title: t('subSectors'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportSevenRecord) => {
        return <ScrollableList listToShow={record.subSectors}></ScrollableList>;
      },
    },
    { title: t('type'), dataIndex: 'type', key: 'type', width: 150 },
    {
      title: t('recipientEntities'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportSevenRecord) => {
        return <ScrollableList listToShow={record.recipientEntities}></ScrollableList>;
      },
    },
    {
      title: t('nationalImplementingEntities'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportSevenRecord) => {
        return <ScrollableList listToShow={record.nationalImplementingEntities}></ScrollableList>;
      },
    },
    {
      title: t('internationalImplementingEntities'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportSevenRecord) => {
        return (
          <ScrollableList listToShow={record.internationalImplementingEntities}></ScrollableList>
        );
      },
    },
    {
      title: t('supportDirection'),
      dataIndex: 'supportDirection',
      key: 'supportDirection',
      width: 250,
    },
    {
      title: t('techDevelopment'),
      dataIndex: 'techDevelopment',
      key: 'techDevelopment',
      width: 600,
    },
    {
      title: t('capacityBuilding'),
      dataIndex: 'capacityBuilding',
      key: 'capacityBuilding',
      width: 500,
    },
    { title: t('startYear'), dataIndex: 'startYear', key: 'startYear', width: 100 },
    { title: t('endYear'), dataIndex: 'endYear', key: 'endYear', width: 100 },
    {
      title: t('amountCommonTitle'),
      children: [
        {
          title: t('usd'),
          dataIndex: 'receivedAmount',
          key: 'receivedAmount',
          width: 50,
        },
        {
          title: t('domestic'),
          dataIndex: 'receivedAmountDomestic',
          key: 'receivedAmountDomestic',
          width: 50,
        },
      ],
    },
    { title: t('supportChannel'), dataIndex: 'supportChannel', key: 'supportChannel', width: 100 },
    {
      title: t('financialInstrument'),
      dataIndex: 'financialInstrument',
      key: 'financialInstrument',
      width: 100,
    },
    {
      title: t('financingStatus'),
      dataIndex: 'financingStatus',
      key: 'financingStatus',
      width: 100,
    },
  ];

  return reportSevenColumns;
};

export const getReportEightColumns = (t: any) => {
  const reportEightColumns = [
    {
      title: t('titleOfActivity'),
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    { title: t('description'), dataIndex: 'description', key: 'description', width: 150 },
    { title: t('sector'), dataIndex: 'sector', key: 'sector', width: 150 },
    {
      title: t('subSectors'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportEightRecord) => {
        return <ScrollableList listToShow={record.subSectors}></ScrollableList>;
      },
    },
    { title: t('type'), dataIndex: 'type', key: 'type', width: 150 },
    { title: t('techType'), dataIndex: 'technologyType', key: 'technologyType', width: 150 },
    { title: t('startYear'), dataIndex: 'startYear', key: 'startYear', width: 100 },
    { title: t('endYear'), dataIndex: 'endYear', key: 'endYear', width: 100 },
  ];

  return reportEightColumns;
};

export const getReportNineColumns = (t: any) => {
  const reportNineColumns = [
    {
      title: t('titleOfActivity'),
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    { title: t('description'), dataIndex: 'description', key: 'description', width: 150 },
    { title: t('sector'), dataIndex: 'sector', key: 'sector', width: 150 },
    {
      title: t('subSectors'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportNineRecord) => {
        return <ScrollableList listToShow={record.subSectors}></ScrollableList>;
      },
    },
    { title: t('type'), dataIndex: 'type', key: 'type', width: 150 },
    { title: t('techType'), dataIndex: 'technologyType', key: 'technologyType', width: 150 },
    {
      title: t('recipientEntities'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportNineRecord) => {
        return <ScrollableList listToShow={record.recipientEntities}></ScrollableList>;
      },
    },
    {
      title: t('nationalImplementingEntities'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportNineRecord) => {
        return <ScrollableList listToShow={record.nationalImplementingEntities}></ScrollableList>;
      },
    },
    { title: t('activityStatus'), dataIndex: 'status', key: 'status', width: 150 },
    { title: t('startYear'), dataIndex: 'startYear', key: 'startYear', width: 100 },
    { title: t('endYear'), dataIndex: 'endYear', key: 'endYear', width: 100 },
  ];

  return reportNineColumns;
};

export const getReportTenColumns = (t: any) => {
  const reportTenColumns = [
    {
      title: t('titleOfActivity'),
      dataIndex: 'title',
      key: 'title',
      width: 150,
    },
    { title: t('description'), dataIndex: 'description', key: 'description', width: 150 },
    { title: t('sector'), dataIndex: 'sector', key: 'sector', width: 150 },
    {
      title: t('subSectors'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportSixRecord) => {
        return <ScrollableList listToShow={record.subSectors}></ScrollableList>;
      },
    },
    { title: t('type'), dataIndex: 'type', key: 'type', width: 150 },
    { title: t('startYear'), dataIndex: 'startYear', key: 'startYear', width: 100 },
    { title: t('endYear'), dataIndex: 'endYear', key: 'endYear', width: 100 },
  ];

  return reportTenColumns;
};

export const getReportElevenColumns = (t: any) => {
  const reportElevenColumns = [
    {
      title: t('titleOfActivity'),
      dataIndex: 'title',
      key: 'title',
      width: 150,
    },
    { title: t('description'), dataIndex: 'description', key: 'description', width: 150 },
    { title: t('sector'), dataIndex: 'sector', key: 'sector', width: 150 },
    {
      title: t('subSectors'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportElevenRecord) => {
        return <ScrollableList listToShow={record.subSectors}></ScrollableList>;
      },
    },
    { title: t('type'), dataIndex: 'type', key: 'type', width: 150 },
    {
      title: t('recipientEntities'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportSevenRecord) => {
        return <ScrollableList listToShow={record.recipientEntities}></ScrollableList>;
      },
    },
    {
      title: t('nationalImplementingEntities'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportSevenRecord) => {
        return <ScrollableList listToShow={record.nationalImplementingEntities}></ScrollableList>;
      },
    },
    {
      title: t('internationalImplementingEntities'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportSevenRecord) => {
        return (
          <ScrollableList listToShow={record.internationalImplementingEntities}></ScrollableList>
        );
      },
    },
    {
      title: t('activityStatus'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
    },
    {
      title: t('supportDirection'),
      dataIndex: 'supportDirection',
      key: 'supportDirection',
      width: 100,
    },
    { title: t('startYear'), dataIndex: 'startYear', key: 'startYear', width: 100 },
    { title: t('endYear'), dataIndex: 'endYear', key: 'endYear', width: 100 },
  ];

  return reportElevenColumns;
};

export const getReportTwelveColumns = (t: any) => {
  const reportTwelveColumns = [
    {
      title: t('titleOfActivity'),
      dataIndex: 'title',
      key: 'title',
      width: 150,
    },
    { title: t('description'), dataIndex: 'description', key: 'description', width: 150 },
    { title: t('activityStatus'), dataIndex: 'status', key: 'status', width: 100 },
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
    { title: t('supportChannel'), dataIndex: 'supportChannel', key: 'supportChannel', width: 100 },
  ];

  return reportTwelveColumns;
};

export const getReportThirteenColumns = (t: any) => {
  const reportThirteenColumns = [
    {
      title: t('titleOfActivity'),
      dataIndex: 'title',
      key: 'title',
      width: 150,
    },
    { title: t('description'), dataIndex: 'description', key: 'description', width: 150 },
    {
      title: t('recipientEntities'),
      width: 150,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportThirteenRecord) => {
        return <ScrollableList listToShow={record.recipientEntities}></ScrollableList>;
      },
    },
    { title: t('activityStatus'), dataIndex: 'status', key: 'status', width: 100 },
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
    { title: t('supportChannel'), dataIndex: 'supportChannel', key: 'supportChannel', width: 100 },
  ];

  return reportThirteenColumns;
};
