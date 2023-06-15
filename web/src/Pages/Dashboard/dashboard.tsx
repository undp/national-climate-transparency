import React, { useEffect, useRef, useState } from 'react';
import { Col, DatePicker, Radio, Row, Skeleton, Tooltip, message } from 'antd';
import './dashboard.scss';
import {
  optionDonutPieA,
  optionDonutPieB,
  totalCreditsCertifiedOptions,
  totalCreditsOptions,
  totalProgrammesOptions,
  totalProgrammesOptionsSub,
} from './CHART_OPTIONS';
import ProgrammeRejectAndTransfer from './ProgrammeRejectAndTransfer';
import moment from 'moment';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import {
  ClockHistory,
  BoxArrowInRight,
  ShieldX,
  ShieldExclamation,
  BoxArrowRight,
  ShieldCheck,
  Gem,
  InfoCircle,
} from 'react-bootstrap-icons';
import PieChartsStat from './pieChartStat';
import BarChartsStat from './barChartStats';
import {
  ChartSeriesItem,
  totalCertifiedCreditsSeriesInitialValues,
  totalCreditsSeriesInitialValues,
  getTotalProgrammesInitialValues,
  getTotalProgrammesSectorInitialValues,
} from './dashboardTypesInitialValues';
import { Sector } from '../../Casl/enums/sector.enum';
import { ProgrammeStage, ProgrammeStageLegend } from '../../Casl/enums/programme-status.enum';
import { CompanyRole } from '../../Casl/enums/company.role.enum';
import { useUserContext } from '../../Context/UserInformationContext/userInformationContext';
import { useTranslation } from 'react-i18next';
import {
  MapSourceData,
  MapTypes,
  MarkerData,
  addCommSep,
  addRoundNumber,
  MapComponent,
  LegendItem,
  StasticCard,
} from '@undp/carbon-library';

const { RangePicker } = DatePicker;

const Dashboard = () => {
  return <div></div>;
};

export default Dashboard;
