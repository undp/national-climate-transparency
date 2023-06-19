import React, { FC } from 'react';
import './investmentBody.scss';
import { addCommSep } from '@undp/carbon-library';
import {
  BankOutlined,
  CheckCircleOutlined,
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

export interface InvestmentBodyProps {
  data: any;
}

const InvestmentBody: FC<InvestmentBodyProps> = (props: InvestmentBodyProps) => {
  const { data } = props;
  return (
    <div className="investment-body">
      <div className="invester">
        <div className="name-and-progress">
          <div className="name">{data?.invester}</div>
          <div className="progress">
            {data?.status === InvestmentStatus.APPROVED && (
              <CheckCircleOutlined className="common-progress-icon" style={{ color: '#5DC380' }} />
            )}
          </div>
        </div>
        <div className="time">
          {moment(parseInt(data?.createdAt)).format('DD MMMM YYYY @ HH:mm')}
        </div>
      </div>
      <div className="amount">${addCommSep(data?.amount)}</div>
      <div className="actions">
        <div className="actions-icon-container">
          {data?.type === InvestmentType.PUBLIC ? (
            <EyeOutlined className="action-icons" />
          ) : (
            <EyeInvisibleOutlined className="action-icons" />
          )}
        </div>
        <div className="actions-icon-container">
          {data?.level === InvestmentLevel.INTERNATIONAL ? (
            <GlobalOutlined className="action-icons" />
          ) : (
            <FlagOutlined className="action-icons" />
          )}
        </div>
        <div className="actions-icon-container">
          {data?.stream === InvestmentStream.CLIMATE_FINANCE ? (
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
