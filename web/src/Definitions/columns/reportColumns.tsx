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
    { title: t('sector'), dataIndex: 'sector', key: 'sector', width: 150 },
    {
      title: t('subSectors'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportSixRecord) => {
        return <ScrollableList listToShow={record.subSectors}></ScrollableList>;
      },
    },
    {
      title: t('titleOfActivity'),
      dataIndex: 'titleOfActivity',
      key: 'titleOfActivity',
      width: 250,
    },
    { title: t('descriptionOfActivity'), dataIndex: 'description', key: 'description', width: 150 },
    {
      title: t('amountRequiredTitle'),
      children: [
        {
          title: t('domestic'),
          dataIndex: 'requiredAmountDomestic',
          key: 'requiredAmountDomestic',
          width: 50,
        },
        {
          title: t('usd'),
          dataIndex: 'requiredAmount',
          key: 'requiredAmount',
          width: 50,
        },
      ],
    },
    {
      title: t('expectedTimeFrame'),
      children: [
        {
          title: t('startYear'),
          dataIndex: 'startYear',
          key: 'startYear',
          width: 50,
        },
        {
          title: t('endYear'),
          dataIndex: 'endYear',
          key: 'endYear',
          width: 50,
        },
      ],
    },
    {
      title: t('expectedFinancialInstrument'),
      dataIndex: 'financialInstrument',
      key: 'financialInstrument',
      width: 100,
    },
    { title: t('type'), dataIndex: 'type', key: 'type', width: 150 },
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
    {
      title: t('natAnchor'),
      dataIndex: 'anchoredInNationalStrategy',
      key: 'anchoredInNationalStrategy',
      width: 1000,
    },
    { title: t('supportChannel'), dataIndex: 'supportChannel', key: 'supportChannel', width: 100 },
    { title: t('additionalInfo'), dataIndex: 'additionalInfo', key: 'additionalInfo', width: 100 },
  ];

  return reportSixColumns;
};

export const getReportSevenColumns = (t: any) => {
  const reportSevenColumns = [
    {
      title: t('titleOfActivity'),
      dataIndex: 'titleOfActivity',
      key: 'titleOfActivity',
      width: 250,
    },
    { title: t('descriptionOfActivity'), dataIndex: 'description', key: 'description', width: 150 },
    { title: t('supportChannel'), dataIndex: 'supportChannel', key: 'supportChannel', width: 100 },
    {
      title: t('recipientEntities'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportSevenRecord) => {
        return <ScrollableList listToShow={record.recipientEntities}></ScrollableList>;
      },
    },
    {
      title: t('implementingEntities'),
      children: [
        {
          title: t('national'),
          width: 100,
          // eslint-disable-next-line no-unused-vars
          render: (_: any, record: ReportSevenRecord) => {
            return (
              <ScrollableList listToShow={record.nationalImplementingEntities}></ScrollableList>
            );
          },
        },
        {
          title: t('international'),
          width: 100,
          // eslint-disable-next-line no-unused-vars
          render: (_: any, record: ReportSevenRecord) => {
            return (
              <ScrollableList
                listToShow={record.internationalImplementingEntities}
              ></ScrollableList>
            );
          },
        },
      ],
    },
    {
      title: t('amountReceivedTitle'),
      children: [
        {
          title: t('domestic'),
          dataIndex: 'receivedAmountDomestic',
          key: 'receivedAmountDomestic',
          width: 50,
        },
        {
          title: t('usd'),
          dataIndex: 'receivedAmount',
          key: 'receivedAmount',
          width: 50,
        },
      ],
    },
    {
      title: t('timeFrame'),
      children: [
        {
          title: t('startYear'),
          dataIndex: 'startYear',
          key: 'startYear',
          width: 50,
        },
        {
          title: t('endYear'),
          dataIndex: 'endYear',
          key: 'endYear',
          width: 50,
        },
      ],
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
    { title: t('type'), dataIndex: 'type', key: 'type', width: 150 },
    { title: t('sector'), dataIndex: 'sector', key: 'sector', width: 150 },
    {
      title: t('subSectors'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportSevenRecord) => {
        return <ScrollableList listToShow={record.subSectors}></ScrollableList>;
      },
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
    { title: t('activityStatus'), dataIndex: 'activityStatus', key: 'activityStatus', width: 150 },
    { title: t('additionalInfo'), dataIndex: 'additionalInfo', key: 'additionalInfo', width: 150 },
  ];

  return reportSevenColumns;
};

export const getReportEightColumns = (t: any) => {
  const reportEightColumns = [
    { title: t('sector'), dataIndex: 'sector', key: 'sector', width: 150 },
    {
      title: t('subSectors'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportEightRecord) => {
        return <ScrollableList listToShow={record.subSectors}></ScrollableList>;
      },
    },
    {
      title: t('titleOfActivity'),
      dataIndex: 'titleOfActivity',
      key: 'titleOfActivity',
      width: 250,
    },
    { title: t('descriptionOfActivity'), dataIndex: 'description', key: 'description', width: 150 },

    { title: t('type'), dataIndex: 'type', key: 'type', width: 150 },
    { title: t('techType'), dataIndex: 'technologyType', key: 'technologyType', width: 150 },
    {
      title: t('expectedTimeFrame'),
      children: [
        {
          title: t('startYear'),
          dataIndex: 'startYear',
          key: 'startYear',
          width: 50,
        },
        {
          title: t('endYear'),
          dataIndex: 'endYear',
          key: 'endYear',
          width: 50,
        },
      ],
    },
    { title: t('additionalInfo'), dataIndex: 'additionalInfo', key: 'additionalInfo', width: 150 },
  ];

  return reportEightColumns;
};

export const getReportNineColumns = (t: any) => {
  const reportNineColumns = [
    {
      title: t('titleOfActivity'),
      dataIndex: 'titleOfActivity',
      key: 'titleOfActivity',
      width: 250,
    },
    { title: t('descriptionOfActivity'), dataIndex: 'description', key: 'description', width: 150 },
    { title: t('techType'), dataIndex: 'technologyType', key: 'technologyType', width: 150 },
    {
      title: t('timeFrame'),
      children: [
        {
          title: t('startYear'),
          dataIndex: 'startYear',
          key: 'startYear',
          width: 50,
        },
        {
          title: t('endYear'),
          dataIndex: 'endYear',
          key: 'endYear',
          width: 50,
        },
      ],
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
      title: t('implementingEntities'),
      children: [
        {
          title: t('national'),
          width: 100,
          // eslint-disable-next-line no-unused-vars
          render: (_: any, record: ReportNineRecord) => {
            return (
              <ScrollableList listToShow={record.nationalImplementingEntities}></ScrollableList>
            );
          },
        },
        {
          title: t('international'),
          width: 100,
          // eslint-disable-next-line no-unused-vars
          render: (_: any, record: ReportNineRecord) => {
            return (
              <ScrollableList
                listToShow={record.internationalImplementingEntities}
              ></ScrollableList>
            );
          },
        },
      ],
    },
    { title: t('type'), dataIndex: 'type', key: 'type', width: 150 },
    { title: t('sector'), dataIndex: 'sector', key: 'sector', width: 150 },
    {
      title: t('subSectors'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportNineRecord) => {
        return <ScrollableList listToShow={record.subSectors}></ScrollableList>;
      },
    },

    { title: t('activityStatus'), dataIndex: 'activityStatus', key: 'activityStatus', width: 150 },
    { title: t('additionalInfo'), dataIndex: 'additionalInfo', key: 'additionalInfo', width: 150 },
  ];

  return reportNineColumns;
};

export const getReportTenColumns = (t: any) => {
  const reportTenColumns = [
    { title: t('sector'), dataIndex: 'sector', key: 'sector', width: 150 },
    {
      title: t('subSectors'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportSixRecord) => {
        return <ScrollableList listToShow={record.subSectors}></ScrollableList>;
      },
    },
    {
      title: t('titleOfActivity'),
      dataIndex: 'titleOfActivity',
      key: 'titleOfActivity',
      width: 150,
    },
    { title: t('descriptionOfActivity'), dataIndex: 'description', key: 'description', width: 150 },
    { title: t('type'), dataIndex: 'type', key: 'type', width: 150 },
    {
      title: t('expectedTimeFrame'),
      children: [
        {
          title: t('startYear'),
          dataIndex: 'startYear',
          key: 'startYear',
          width: 50,
        },
        {
          title: t('endYear'),
          dataIndex: 'endYear',
          key: 'endYear',
          width: 50,
        },
      ],
    },
    { title: t('additionalInfo'), dataIndex: 'additionalInfo', key: 'additionalInfo', width: 150 },
  ];

  return reportTenColumns;
};

export const getReportElevenColumns = (t: any) => {
  const reportElevenColumns = [
    {
      title: t('titleOfActivity'),
      dataIndex: 'titleOfActivity',
      key: 'titleOfActivity',
      width: 150,
    },
    { title: t('descriptionOfActivity'), dataIndex: 'description', key: 'description', width: 150 },
    {
      title: t('timeFrame'),
      children: [
        {
          title: t('startYear'),
          dataIndex: 'startYear',
          key: 'startYear',
          width: 50,
        },
        {
          title: t('endYear'),
          dataIndex: 'endYear',
          key: 'endYear',
          width: 50,
        },
      ],
    },
    {
      title: t('recipientEntities'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportElevenRecord) => {
        return <ScrollableList listToShow={record.recipientEntities}></ScrollableList>;
      },
    },
    {
      title: t('implementingEntities'),
      children: [
        {
          title: t('national'),
          width: 100,
          // eslint-disable-next-line no-unused-vars
          render: (_: any, record: ReportElevenRecord) => {
            return (
              <ScrollableList listToShow={record.nationalImplementingEntities}></ScrollableList>
            );
          },
        },
        {
          title: t('international'),
          width: 100,
          // eslint-disable-next-line no-unused-vars
          render: (_: any, record: ReportElevenRecord) => {
            return (
              <ScrollableList
                listToShow={record.internationalImplementingEntities}
              ></ScrollableList>
            );
          },
        },
      ],
    },
    { title: t('type'), dataIndex: 'type', key: 'type', width: 150 },
    { title: t('sector'), dataIndex: 'sector', key: 'sector', width: 150 },
    {
      title: t('subSectors'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportElevenRecord) => {
        return <ScrollableList listToShow={record.subSectors}></ScrollableList>;
      },
    },
    {
      title: t('activityStatus'),
      dataIndex: 'activityStatus',
      key: 'activityStatus',
      width: 100,
    },
    { title: t('additionalInfo'), dataIndex: 'additionalInfo', key: 'additionalInfo', width: 150 },
  ];

  return reportElevenColumns;
};

export const getReportTwelveColumns = (t: any) => {
  const reportTwelveColumns = [
    {
      title: t('titleOfActivity'),
      dataIndex: 'titleOfActivity',
      key: 'titleOfActivity',
      width: 150,
    },
    { title: t('descriptionOfActivity'), dataIndex: 'description', key: 'description', width: 150 },
    {
      title: t('expectedTimeFrame'),
      children: [
        {
          title: t('startYear'),
          dataIndex: 'startYear',
          key: 'startYear',
          width: 50,
        },
        {
          title: t('endYear'),
          dataIndex: 'endYear',
          key: 'endYear',
          width: 50,
        },
      ],
    },
    {
      title: t('recipientEntities'),
      width: 100,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportTwelveRecord) => {
        return <ScrollableList listToShow={record.recipientEntities}></ScrollableList>;
      },
    },
    { title: t('supportChannel'), dataIndex: 'supportChannel', key: 'supportChannel', width: 100 },
    {
      title: t('amount'),
      children: [
        {
          title: t('domestic'),
          dataIndex: 'requiredAmountDomestic',
          key: 'requiredAmountDomestic',
          width: 50,
        },
        {
          title: t('usd'),
          dataIndex: 'requiredAmount',
          key: 'requiredAmount',
          width: 50,
        },
      ],
    },
    { title: t('activityStatus'), dataIndex: 'activityStatus', key: 'activityStatus', width: 100 },
    { title: t('additionalInfo'), dataIndex: 'additionalInfo', key: 'additionalInfo', width: 150 },
  ];

  return reportTwelveColumns;
};

export const getReportThirteenColumns = (t: any) => {
  const reportThirteenColumns = [
    {
      title: t('titleOfActivity'),
      dataIndex: 'titleOfActivity',
      key: 'titleOfActivity',
      width: 150,
    },
    { title: t('descriptionOfActivity'), dataIndex: 'description', key: 'description', width: 150 },
    {
      title: t('timeFrame'),
      children: [
        {
          title: t('startYear'),
          dataIndex: 'startYear',
          key: 'startYear',
          width: 50,
        },
        {
          title: t('endYear'),
          dataIndex: 'endYear',
          key: 'endYear',
          width: 50,
        },
      ],
    },
    {
      title: t('recipientEntities'),
      width: 150,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: ReportThirteenRecord) => {
        return <ScrollableList listToShow={record.recipientEntities}></ScrollableList>;
      },
    },
    { title: t('supportChannel'), dataIndex: 'supportChannel', key: 'supportChannel', width: 100 },
    {
      title: t('amount'),
      children: [
        {
          title: t('domestic'),
          dataIndex: 'receivedAmountDomestic',
          key: 'receivedAmountDomestic',
          width: 50,
        },
        {
          title: t('usd'),
          dataIndex: 'receivedAmount',
          key: 'receivedAmount',
          width: 50,
        },
      ],
    },
    { title: t('activityStatus'), dataIndex: 'activityStatus', key: 'activityStatus', width: 100 },
    { title: t('additionalInfo'), dataIndex: 'additionalInfo', key: 'additionalInfo', width: 150 },
  ];

  return reportThirteenColumns;
};
