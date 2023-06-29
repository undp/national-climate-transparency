import React, { useEffect, useState } from 'react';
import './coBenifits.scss';
import { Button, Row, Tabs, message } from 'antd';
import { useTranslation } from 'react-i18next';
import GenderParity from './genderParity';
import Assessment from './assessment';
import SdgGoals from './sdgGoals';
import Safeguards from './safeguards';
import Environmental from './environmental';
import Economic from './economic';
import Social from './social';
import { RadioButtonStatus } from '../../Definitions/commonEnums';

export interface CoBenefitProps {
  onClickedBackBtn?: any;
  onFormSubmit?: any;
  coBenefitsDetails?: any;
  submitButtonText?: any;
  viewOnly?: boolean;
  coBenifitsViewDetails?: any;
  loading?: any;
}

const CoBenifitsComponent = (props: CoBenefitProps) => {
  const {
    onClickedBackBtn,
    onFormSubmit,
    coBenefitsDetails,
    submitButtonText,
    viewOnly,
    coBenifitsViewDetails,
    loading = false,
  } = props;
  const { t } = useTranslation(['coBenifits']);
  const [coBenefitDetails, setCoBenefitDetails] = useState<any>();
  const [isSocialFormValid, setIsSocialFormValid] = useState<any>(false);
  const [isAssessmentFormValid, setIsAssessmentFormValid] = useState<any>(false);

  const onSdgGoalsFormSubmit = (sdgGoalsDetails: any) => {
    setCoBenefitDetails((pre: any) => ({ ...pre, sdgGoals: sdgGoalsDetails }));
  };

  const onGenderParityFormSubmit = (genderParityDetails: any) => {
    setCoBenefitDetails((pre: any) => ({ ...pre, genderPariy: genderParityDetails }));
  };

  const onEnvironmentalFormSubmit = (environmentalsDetails: any) => {
    setCoBenefitDetails((pre: any) => ({ ...pre, environmental: environmentalsDetails }));
  };

  const onEconomicFormSubmit = (economicDetails: any) => {
    setCoBenefitDetails((pre: any) => ({ ...pre, economic: economicDetails }));
  };

  const onAssessmentFormSubmit = (coBenefitsAssessmentDetails: any, isFormValid: boolean) => {
    setCoBenefitDetails((pre: any) => ({ ...pre, assessmentDetails: coBenefitsAssessmentDetails }));
    setIsAssessmentFormValid(isFormValid);
  };

  const onSafeguardFormSubmit = (safeguardDetails: any) => {
    setCoBenefitDetails((pre: any) => ({ ...pre, safeguardDetails: safeguardDetails }));
  };

  const onSocialFormSubmit = (socialValueDetails: any, isFormValid: boolean) => {
    setCoBenefitDetails((pre: any) => ({ ...pre, socialValueDetails: socialValueDetails }));
    setIsSocialFormValid(isFormValid);
  };

  const tabItems = [
    {
      label: t('coBenifits:sdgGoals'),
      key: '1',
      children: (
        <SdgGoals
          onFormSubmit={onSdgGoalsFormSubmit}
          sdgGoalsViewData={
            viewOnly
              ? coBenifitsViewDetails?.sdgGoals
                ? coBenifitsViewDetails?.sdgGoals
                : []
              : coBenefitsDetails?.sdgGoals
          }
          viewOnly={viewOnly || false}
        />
      ),
    },
    {
      label: t('coBenifits:genderPart'),
      key: '2',
      children: (
        <GenderParity
          onFormSubmit={onGenderParityFormSubmit}
          genderParityViewData={viewOnly && coBenifitsViewDetails?.genderPariy}
          viewOnly={viewOnly || false}
        />
      ),
    },
    {
      label: t('coBenifits:safeguards'),
      key: '3',
      children: (
        <Safeguards
          safeGuardViewData={
            (viewOnly && coBenifitsViewDetails?.safeguardDetails) ||
            (!viewOnly && coBenefitsDetails?.safeguardDetails)
          }
          viewOnly={viewOnly || false}
          onFormSubmit={onSafeguardFormSubmit}
        />
      ),
    },
    {
      label: t('coBenifits:environmental'),
      key: '4',
      children: (
        <Environmental
          onFormSubmit={onEnvironmentalFormSubmit}
          environmentalViewData={
            viewOnly
              ? coBenifitsViewDetails?.environmental
                ? coBenifitsViewDetails?.environmental
                : {}
              : undefined
          }
          viewOnly={viewOnly || false}
        />
      ),
    },
    {
      label: t('coBenifits:social'),
      key: '5',
      children: (
        <Social
          onFormSubmit={onSocialFormSubmit}
          socialViewData={
            (viewOnly && coBenifitsViewDetails?.socialValueDetails) ||
            (!viewOnly && coBenefitsDetails?.socialValueDetails)
          }
          viewOnly={viewOnly || false}
        />
      ),
    },
    {
      label: t('coBenifits:economic'),
      key: '6',
      children: (
        <Economic
          onFormSubmit={onEconomicFormSubmit}
          economicViewData={
            viewOnly
              ? coBenifitsViewDetails?.economic
                ? coBenifitsViewDetails?.economic
                : {}
              : undefined
          }
          viewOnly={viewOnly || false}
        />
      ),
    },
    {
      label: t('coBenifits:assessment'),
      key: '7',
      children: (
        <Assessment
          onFormSubmit={onAssessmentFormSubmit}
          assessmentViewData={
            (viewOnly && coBenifitsViewDetails?.assessmentDetails) ||
            (!viewOnly && coBenefitsDetails?.assessmentDetails)
          }
          viewOnly={viewOnly || false}
        />
      ),
    },
  ];

  const onCoBenefitSubmit = () => {
    let economicOverallValidation = true;
    let environmentalOverallValidation = true;
    const economicDetailsFromForm: any = coBenefitDetails?.economic;
    const environmentalDetailsFromForm: any = coBenefitDetails?.environmental;
    const economicSectionValidation: any = {
      growth: { validation: false, fields: 8, filled: 0, firstFieldValue: 'N/A' },
      energy: { validation: false, fields: 5, filled: 0, firstFieldValue: 'N/A' },
      techTransfer: { validation: false, fields: 6, filled: 0, firstFieldValue: 'N/A' },
      balanceOfPayments: { validation: false, fields: 3, filled: 0, firstFieldValue: 'N/A' },
      furtherInfo: { validation: false, fields: 1, filled: 0, firstFieldValue: 'N/A' },
    };
    const environmentalSectionValidation: any = {
      air: { validation: false, fields: 9, filled: 0, firstFieldValue: 'N/A' },
      land: { validation: false, fields: 8, filled: 0, firstFieldValue: 'N/A' },
      water: { validation: false, fields: 7, filled: 0, firstFieldValue: 'N/A' },
      naturalResource: { validation: false, fields: 6, filled: 0, firstFieldValue: 'N/A' },
    };
    console.log(environmentalDetailsFromForm);
    for (const key in economicDetailsFromForm) {
      const sectionName = key.replace(/Q\d+/, '');
      const fieldValue = economicDetailsFromForm[key];

      if (economicSectionValidation.hasOwnProperty(sectionName)) {
        const section = economicSectionValidation[sectionName];

        section.filled += 1;

        if (fieldValue === RadioButtonStatus.YES && key === `${sectionName}Q1`) {
          section.firstFieldValue = RadioButtonStatus.YES;
        } else if (fieldValue === RadioButtonStatus.NO && key === `${sectionName}Q1`) {
          section.firstFieldValue = RadioButtonStatus.NO;
        } else if (fieldValue === RadioButtonStatus.NA && key === `${sectionName}Q1`) {
          section.firstFieldValue = RadioButtonStatus.NA;
        }
      }
    }
    for (const section in economicSectionValidation) {
      if (
        (economicSectionValidation[section].firstFieldValue === RadioButtonStatus.YES &&
          economicSectionValidation[section].fields !==
            economicSectionValidation[section].filled) ||
        economicSectionValidation[section].filled === 0
      ) {
        economicOverallValidation = false;
      }
    }
    for (const key in environmentalDetailsFromForm) {
      const sectionName = key.replace(/Q\d+/, '');
      const fieldValue = environmentalDetailsFromForm[key];

      if (environmentalSectionValidation.hasOwnProperty(sectionName)) {
        const section = environmentalSectionValidation[sectionName];

        section.filled += 1;

        if (fieldValue === RadioButtonStatus.YES && key === `${sectionName}Q1`) {
          section.firstFieldValue = RadioButtonStatus.YES;
        } else if (fieldValue === RadioButtonStatus.NO && key === `${sectionName}Q1`) {
          section.firstFieldValue = RadioButtonStatus.NO;
        } else if (fieldValue === RadioButtonStatus.NA && key === `${sectionName}Q1`) {
          section.firstFieldValue = RadioButtonStatus.NA;
        }
      }
    }
    for (const section in environmentalSectionValidation) {
      if (
        (environmentalSectionValidation[section].firstFieldValue === RadioButtonStatus.YES &&
          environmentalSectionValidation[section].fields !==
            environmentalSectionValidation[section].filled) ||
        environmentalSectionValidation[section].filled === 0
      ) {
        environmentalOverallValidation = false;
      }
    }
    if (environmentalOverallValidation !== true) {
      message.open({
        type: 'error',
        content: `Fill the required fields in Co-benifits Environmental section`,
        duration: 4,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      return;
    }
    if (!isSocialFormValid) {
      message.open({
        type: 'error',
        content: `Fill the required fields in Co-benifits Social section`,
        duration: 4,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      return;
    }
    if (economicOverallValidation !== true) {
      message.open({
        type: 'error',
        content: `Fill the required fields in Co-benifits Economic section`,
        duration: 4,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      return;
    }
    if (!isAssessmentFormValid) {
      message.open({
        type: 'error',
        content: `Fill the required fields in Co-benifits Assessment section`,
        duration: 4,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      return;
    }
    onFormSubmit(coBenefitDetails);
  };

  return (
    <div className="co-benifits-container">
      <div>
        <Tabs className="benifits-tabs" defaultActiveKey="1" centered items={tabItems} />
      </div>
      {!viewOnly && (
        <div className="steps-actions">
          <Row>
            <Button onClick={() => onClickedBackBtn(coBenefitDetails)}>{t('back')}</Button>
            <Button
              className="mg-left-1"
              type="primary"
              loading={loading}
              onClick={onCoBenefitSubmit}
            >
              {submitButtonText ? submitButtonText : t('submit')}
            </Button>
          </Row>
        </div>
      )}
    </div>
  );
};

export default CoBenifitsComponent;
