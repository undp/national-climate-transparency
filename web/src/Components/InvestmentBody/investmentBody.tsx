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
  LikeOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { InvestmentType } from '../../Casl/enums/investment.type';
import { InvestmentLevel } from '../../Casl/enums/investment.level';
import { InvestmentStream } from '../../Casl/enums/investment.stream';
import moment from 'moment';
import { InvestmentStatus } from '../../Casl/enums/investment.status';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { Skeleton, message } from 'antd';
import { DocumentStatus } from '../../Casl/enums/document.status';
import RejectDocumentationConfirmationModel from '../Models/rejectDocumentForm';
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
  const [openRejectDocConfirmationModal, setOpenRejectDocConfirmationModal] = useState(false);
  const [actionInfo, setActionInfo] = useState<any>({});
  const [rejectDocData, setRejectDocData] = useState<any>({});

  useEffect(() => {
    setInvestmentData(data);
    console.log(data);
  }, [data]);

  const investmentAction = async (type: any, id: any) => {
    setLoading(true);
    try {
      if (type === InvestmentStatus.APPROVED) {
        const response: any = await post('national/programme/investmentApprove', {
          requestId: id,
        });
        message.open({
          type: 'success',
          content: response?.message,
          duration: 4,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        investmentData.status = InvestmentStatus.APPROVED;
        setInvestmentData({ ...investmentData });
      } else if (type === InvestmentStatus.REJECTED) {
        const response: any = await post('national/programme/investmentReject', {
          requestId: id,
        });
        message.open({
          type: 'success',
          content: response?.message,
          duration: 4,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        investmentData.status = InvestmentStatus.REJECTED;
        setInvestmentData({ ...investmentData });
      }
    } catch (error: any) {
      message.open({
        type: 'error',
        content: error?.message,
        duration: 4,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } finally {
      setLoading(false);
      setOpenRejectDocConfirmationModal(false);
    }
  };

  const handleOk = () => {
    investmentAction(InvestmentStatus.REJECTED, rejectDocData?.id);
  };

  const handleCancel = () => {
    setOpenRejectDocConfirmationModal(false);
  };

  return loading ? (
    <Skeleton />
  ) : (
    <>
      <div className="investment-body">
        <div className="invester">
          <div className="name-and-progress">
            <div className="name">{investmentData?.invester}</div>
            <div className="progress">
              {investmentData?.status === InvestmentStatus.APPROVED ? (
                <CheckCircleOutlined
                  className="common-progress-icon"
                  style={{ color: '#5DC380' }}
                />
              ) : investmentData?.status === InvestmentStatus.PENDING ? (
                <>
                  <LikeOutlined
                    onClick={() =>
                      investmentAction(InvestmentStatus.APPROVED, investmentData?.requestId)
                    }
                    className="common-progress-icon"
                    style={{ color: '#976ED7' }}
                  />
                  <DislikeOutlined
                    onClick={() => {
                      setRejectDocData({ id: investmentData?.requestId });
                      setActionInfo({
                        action: 'Reject',
                        headerText: `${t('programme:rejectInvestmentHeader')}`,
                        text: `${t('programme:rejectDocBody')}`,
                        type: 'reject',
                        icon: <DislikeOutlined />,
                      });
                      setOpenRejectDocConfirmationModal(true);
                    }}
                    className="common-progress-icon margin-left-1"
                    style={{ color: '#FD6F70' }}
                  />
                </>
              ) : null}
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
      <RejectDocumentationConfirmationModel
        actionInfo={actionInfo}
        onActionConfirmed={handleOk}
        onActionCanceled={handleCancel}
        openModal={openRejectDocConfirmationModal}
        errorMsg={''}
        loading={loading}
      />
    </>
  );
};

export default InvestmentBody;
