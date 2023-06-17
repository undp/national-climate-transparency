import React, { useState } from 'react';
import NdcActionDetails from '../../Components/NdcAction/ndcActionDetails';
import { useTranslation } from 'react-i18next';
import { Steps } from 'antd';

const AddNdcAction = () => {
  const { t } = useTranslation(['ndcAction']);
  const [current, setCurrent] = useState<number>(0);

  return (
    <div className="add-company-main-container">
      <div className="title-container">
        <div className="main">{t('ndcAction:addNdcTitle')}</div>
        <div className="sub">{t('ndcAction:addNdcSubTitle')}</div>
      </div>
      <div className="adding-section">
        <div className="form-section">
          <Steps
            progressDot
            direction="vertical"
            current={current}
            items={[
              {
                title: (
                  <div className="step-title-container">
                    <div className="step-count">01</div>
                    <div className="title">{t('ndcAction:ndcActionDetailsTitle')}</div>
                  </div>
                ),
                description: current === 0 && <NdcActionDetails></NdcActionDetails>,
              },
              {
                title: (
                  <div className="step-title-container">
                    <div className="step-count">02</div>
                    <div className="title">{t('ndcAction:coBenefitsTitle')}</div>
                  </div>
                ),
                description: current === 1 && <div></div>,
              },
              {
                title: (
                  <div className="step-title-container">
                    <div className="step-count">03</div>
                    <div className="title">{t('ndcAction:projectReportsTitle')}</div>
                  </div>
                ),
                description: current === 1 && <div></div>,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default AddNdcAction;
