import { useTranslation } from 'react-i18next';

export const getSupportTableColumns = () => {
  const { t } = useTranslation(['formTable']);

  const supportTableColumns = [
    { title: t('supportIdTitle'), dataIndex: 'supportId', key: 'activityId' },
    { title: t('financeNatureTitle'), dataIndex: 'financeNature', key: 'financeNature' },
    { title: t('directionTitle'), dataIndex: 'direction', key: 'direction' },
    { title: t('finInstrumentTitle'), dataIndex: 'finInstrument', key: 'finInstrument' },
    { title: t('neededUSDHeader'), dataIndex: 'estimatedUSD', key: 'estimatedUSD' },
    { title: t('neededLCLHeader'), dataIndex: 'estimatedLC', key: 'estimatedLC' },
    { title: t('recievedUSDHeader'), dataIndex: 'recievedUSD', key: 'recievedUSD' },
    { title: t('recievedLCLHeader'), dataIndex: 'recievedLC', key: 'recievedLC' },
  ];

  return supportTableColumns;
};
