import React, { FC, useEffect, useState } from 'react';
import './investmentBody.scss';
import { addCommSep } from '@undp/carbon-library';
import {
  BankOutlined,
  CheckCircleOutlined,
  DislikeOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FlagOutlined,
  GlobalOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { InvestmentType } from '../../Casl/enums/investment.type';
import { InvestmentLevel } from '../../Casl/enums/investment.level';
import { InvestmentStream } from '../../Casl/enums/investment.stream';
import moment from 'moment';
import { InvestmentStatus } from '../../Casl/enums/investment.status';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';

export interface InvestmentBodyProps {
  data: any;
}

const InvestmentBody: FC<InvestmentBodyProps> = (props: InvestmentBodyProps) => {
  const { data } = props;
  const { get, put, post } = useConnection();
  const { t } = useTranslation(['programme']);
  const [loading, setLoading] = useState<boolean>(false);
  const [investmentData, setInvestmentData] = useState<any>({});

  useEffect(() => {
    setInvestmentData(data);
    console.log(data);
  }, [data]);

  return loading ? (
    <Skeleton />
  ) : (
    <div className="investment-body">
      <div className="invester">
        <div className="name-and-progress">
          <div className="name">{investmentData?.invester}</div>
          <div className="progress">
            {investmentData?.status === InvestmentStatus.APPROVED && (
              <CheckCircleOutlined className="common-progress-icon" style={{ color: '#5DC380' }} />
            )}
          </div>
        </div>
        <div className="time">
          {moment(parseInt(investmentData?.createdAt)).format('DD MMMM YYYY @ HH:mm')}
        </div>
      </div>
      <div className="amount">${addCommSep(investmentData?.amount)}</div>
      <div className="actions">
        <div className="actions-icon-container">
          {investmentData?.type === InvestmentType.PUBLIC ? (
            <EyeOutlined className="action-icons" />
          ) : (
            <EyeInvisibleOutlined className="action-icons" />
          )}
        </div>
        <div className="actions-icon-container">
          {investmentData?.level === InvestmentLevel.INTERNATIONAL ? (
            <GlobalOutlined className="action-icons" />
          ) : (
            <FlagOutlined className="action-icons" />
          )}
        </div>
        <div className="actions-icon-container">
          {investmentData?.stream === InvestmentStream.CLIMATE_FINANCE ? (
            <BankOutlined className="action-icons" />
          ) : (
            <LineChartOutlined className="action-icons" />
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentBody;
