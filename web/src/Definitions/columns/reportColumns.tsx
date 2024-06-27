import ScrollableList from '../../Components/ScrollableList/scrollableList';
import {
  ReportEightRecord,
  ReportElevenRecord,
  ReportFiveRecord,
  ReportNineRecord,
  ReportSevenRecord,
  ReportSixRecord,
  ReportThirteenRecord,
  ReportTwelveRecord,
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
      title: t('titleOfProject'),
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
    {
      title: t('internationalSupportChannel'),
      width: 150,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportSixRecord) => {
        return <ScrollableList listToShow={record.internationalSupportChannel}></ScrollableList>;
      },
    },
    {
      title: t('supportDirection'),
      dataIndex: 'supportDirection',
      key: 'supportDirection',
      width: 1000,
    },
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
      title: t('titleOfProject'),
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
        return <ScrollableList listToShow={record.natImplementers}></ScrollableList>;
      },
    },
    {
      title: t('internationalImplementingEntities'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportSevenRecord) => {
        return <ScrollableList listToShow={record.intImplementers}></ScrollableList>;
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
    {
      title: t('internationalSupportChannel'),
      width: 150,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportSevenRecord) => {
        return <ScrollableList listToShow={record.internationalSupportChannel}></ScrollableList>;
      },
    },
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
      title: t('titleOfProject'),
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
    {
      title: t('techType'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportEightRecord) => {
        return <ScrollableList listToShow={record.techType}></ScrollableList>;
      },
    },
    {
      title: t('supportDirection'),
      dataIndex: 'supportDirection',
      key: 'supportDirection',
      width: 250,
    },
    { title: t('startYear'), dataIndex: 'startYear', key: 'startYear', width: 100 },
    { title: t('endYear'), dataIndex: 'endYear', key: 'endYear', width: 100 },
  ];

  return reportEightColumns;
};

export const getReportNineColumns = (t: any) => {
  const reportNineColumns = [
    {
      title: t('titleOfProject'),
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
    {
      title: t('techType'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportNineRecord) => {
        return <ScrollableList listToShow={record.techType}></ScrollableList>;
      },
    },
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
        return <ScrollableList listToShow={record.natImplementers}></ScrollableList>;
      },
    },
    { title: t('projectStatus'), dataIndex: 'projectStatus', key: 'projectStatus', width: 150 },
    {
      title: t('supportDirection'),
      dataIndex: 'supportDirection',
      key: 'supportDirection',
      width: 250,
    },
    { title: t('startYear'), dataIndex: 'startYear', key: 'startYear', width: 100 },
    { title: t('endYear'), dataIndex: 'endYear', key: 'endYear', width: 100 },
  ];

  return reportNineColumns;
};

export const getReportTenColumns = (t: any) => {
  const reportTenColumns = [
    {
      title: t('titleOfProject'),
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
    {
      title: t('supportDirection'),
      dataIndex: 'supportDirection',
      key: 'supportDirection',
      width: 100,
    },
    { title: t('startYear'), dataIndex: 'startYear', key: 'startYear', width: 100 },
    { title: t('endYear'), dataIndex: 'endYear', key: 'endYear', width: 100 },
  ];

  return reportTenColumns;
};

export const getReportElevenColumns = (t: any) => {
  const reportElevenColumns = [
    {
      title: t('titleOfProject'),
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
        return <ScrollableList listToShow={record.natImplementers}></ScrollableList>;
      },
    },
    {
      title: t('internationalImplementingEntities'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportSevenRecord) => {
        return <ScrollableList listToShow={record.intImplementers}></ScrollableList>;
      },
    },
    {
      title: t('projectStatus'),
      dataIndex: 'projectStatus',
      key: 'projectStatus',
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

export const getReportThirteenColumns = (t: any) => {
  const reportThirteenColumns = [
    {
      title: t('titleOfProject'),
      dataIndex: 'title',
      key: 'title',
      width: 150,
    },
    { title: t('descriptionOfProject'), dataIndex: 'description', key: 'description', width: 150 },
    {
      title: t('recipientEntities'),
      width: 150,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportThirteenRecord) => {
        return <ScrollableList listToShow={record.recipientEntities}></ScrollableList>;
      },
    },
    { title: t('statusOfProject'), dataIndex: 'projectStatus', key: 'projectStatus', width: 100 },
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

  return reportThirteenColumns;
};
