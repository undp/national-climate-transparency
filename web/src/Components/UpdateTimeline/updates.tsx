import './updates.scss';
import { Skeleton, Steps, message } from 'antd';
import { useEffect, useState } from 'react';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { useTranslation } from 'react-i18next';
import * as Icon from 'react-bootstrap-icons';

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const formattedTime = `${day} ${month} ${year} @ ${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;

  return formattedTime;
};

interface Props {
  recordType: any;
  recordId: any;
}

const UpdatesTimeline: React.FC<Props> = ({ recordType, recordId }) => {
  const { post } = useConnection();
  const { t } = useTranslation(['updateTimeline']);

  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [historyData, setHistoryData] = useState<any>([]);

  const getAllData = async () => {
    setLoadingHistory(true);
    try {
      const payload: any = {
        recordType: recordType,
        recordId: recordId,
      };
      const response: any = await post('national/log/query', payload);
      if (response) {
        setHistoryData(response.data);
        console.log(
          'Updates Component-------------------------------------------------------------------------------',
          response,
          recordId
        );
      }
    } catch (error: any) {
      message.open({
        type: 'error',
        content: error.message,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    getAllData();
  }, []);

  const getClassByEventType = (eventType: string) => {
    switch (eventType) {
      case '0': //created steps
      case '5':
      case '8':
      case '12':
        return (
          <span className="step-icon created-step">
            <Icon.CaretRight />
          </span>
        );
      case '3': //Linked steps
      case '6':
      case '9':
      case '10':
      case '13':
      case '14':
        return (
          <span className="step-icon link-step">
            <Icon.Link45deg />
          </span>
        );
      case '7': //Unlinked steps
      case '11':
        return (
          <span className="step-icon unlink-step">
            <Icon.Link45deg />
          </span>
        );
      case '1': //KPI ADD steps
        return (
          <span className="step-icon addkpi-step">
            <Icon.PlusLg />
          </span>
        );
      default:
        return (
          <span className="step-icon default-step">
            <Icon.RecordCircleFill />
          </span>
        );
    }
  };

  return (
    <div className="info-view">
      <div className="content">
        {loadingHistory ? (
          <Skeleton />
        ) : (
          <Steps direction="vertical" current={0}>
            {historyData.map((item: any, index: number) => (
              <Steps.Step
                key={index}
                title={
                  <span>
                    <strong>{item.user_name} </strong> {t(item.eventType)}{' '}
                    {item.logData && ` - ${item.logData}`}
                    <span className="date">
                      {' - '}
                      {`${formatDate(Number(item.createdTime))}`}
                    </span>
                  </span>
                }
                // subTitle={`${formatDate(Number(item.createdTime))}`}
                // description={
                //   <div>
                //     {/* Add each line of text here */}
                //     <div>scjndkcjdjcsncjdjcskdsdc</div>
                //     <div>scjndkcjdjcsncjdjcskdsdc</div>
                //     {/* Add more lines as needed */}
                //   </div>
                // }
                icon={getClassByEventType(item.eventType)}
                status="process"
              />
            ))}
          </Steps>
        )}
      </div>
    </div>
  );
};

export default UpdatesTimeline;
