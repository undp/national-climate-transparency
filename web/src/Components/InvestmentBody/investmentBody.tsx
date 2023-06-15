import React, { FC } from 'react';
import './investmentBody.scss';
import { addCommSep } from '@undp/carbon-library';
import { BankOutlined, EyeOutlined, FlagOutlined } from '@ant-design/icons';

export interface InvestmentBodyProps {
  data: any;
  progressIcon: any;
}

const InvestmentBody: FC<InvestmentBodyProps> = (props: InvestmentBodyProps) => {
  const { data, progressIcon } = props;
  return (
    <div className="investment-body">
      <div className="invester">
        <div className="name-and-progress">
          <div className="name">{data?.invester}</div>
          <div className="progress">{progressIcon}</div>
        </div>
        <div className="time">17 May 2022 @ 19:06</div>
      </div>
      <div className="amount">${addCommSep(data?.amount)}</div>
      <div className="actions">
        <div className="actions-icon-container">
          <EyeOutlined className="action-icons" />
        </div>
        <div className="actions-icon-container">
          <FlagOutlined className="action-icons" />
        </div>
        <div className="actions-icon-container">
          <BankOutlined className="action-icons" />
        </div>
      </div>
    </div>
  );
};

export default InvestmentBody;
