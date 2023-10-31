import {
  Button,
  Col,
  DatePicker,
  Empty,
  PaginationProps,
  Row,
  Table,
  Tabs,
  TabsProps,
  message,
} from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { EditableRow, EditableCell } from '../../Components/AntComponents/antTableComponents';

type Period = {
  start: number;
  end: number;
};

const NdcDetailsComponent = (props: any) => {
  const { t, useConnection } = props;
  const { RangePicker } = DatePicker;
  const [ndcDetailsData, setNdcDetailsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [periodItems, setPeriodItems] = useState([] as any[]);
  const selectedPeriod = useRef({} as any);

  console.log('d1 rendered');

  const { post } = useConnection();
  const columns: any = [
    {
      title: t('ndc:ndcColumnsStartDate'),
      dataIndex: 'startDate',
      key: 'startDate',
      align: 'left' as const,
    },
    {
      title: t('ndc:ndcColumnsEndDate'),
      dataIndex: 'endDate',
      key: 'endDate',
      align: 'left' as const,
    },
    {
      title: t('ndc:ndcColumnsNationalPlanObj'),
      dataIndex: 'nationalPlanObj',
      key: 'nationalPlanObj',
      align: 'left' as const,
    },
    {
      title: t('ndc:ndcColumnsKpi'),
      dataIndex: 'kpi',
      key: 'kpi',
      align: 'left' as const,
    },
  ];

  function onAddNewNdcDetail() {
    const newData = {
      startDate: '2023-03-25',
      endDate: '2024-03-25',
      nationalPlanObj: 'sample text2',
      kpi: 34,
    };

    setNdcDetailsData([...ndcDetailsData, newData]);
  }

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  function ndcDetailsTableContent() {
    return (
      <div>
        <Button
          onClick={onAddNewNdcDetail}
          type="primary"
          style={{
            marginBottom: 16,
          }}
        >
          Add a row
        </Button>
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={ndcDetailsData}
          columns={columns}
        />
      </div>
    );
  }

  const onCancelPeriod = () => {};

  const onAddNewPeriod = () => {
    if (selectedPeriod && selectedPeriod.current) {
      const newPeriodItem = {
        key: `${selectedPeriod.current.start}-${selectedPeriod.current.end}`,
        label: `${selectedPeriod.current.start}-${selectedPeriod.current.end}`,
        children: ndcDetailsTableContent(),
      };
      setPeriodItems((items: any) => [...items, newPeriodItem]);
    }
  };

  const onDateRangeChanged = (range: any) => {
    const period = {
      start: Number(moment(range[0]).year()),
      end: Number(moment(range[1]).year()),
    };
    selectedPeriod.current = period;
  };

  function addNewPeriodContent() {
    return (
      <div>
        <Row>
          <RangePicker onChange={onDateRangeChanged} picker="year" />
        </Row>
        <Row>
          <div className="steps-actions">
            <Button type="primary" onClick={onAddNewPeriod} htmlType="submit" loading={loading}>
              {t('ndc:submit')}
            </Button>
            <Button className="back-btn" onClick={onCancelPeriod} loading={loading}>
              {t('ndc:back')}
            </Button>
          </div>
        </Row>
      </div>
    );
  }

  const onTabChange = (key: string) => {
    console.log(key);
  };

  useEffect(() => {
    const addNewItem = {
      key: 'add_new',
      label: 'Add New',
      children: addNewPeriodContent(),
    };
    setPeriodItems([addNewItem]);
    setNdcDetailsData([
      {
        startDate: '2022-03-25',
        endDate: '2023-03-25',
        nationalPlanObj: 'sample text1',
        kpi: 23,
      },
      {
        startDate: '2023-03-25',
        endDate: '2024-03-25',
        nationalPlanObj: 'sample text2',
        kpi: 34,
      },
      {
        startDate: '2024-03-25',
        endDate: '2025-03-25',
        nationalPlanObj: 'sample text3',
        kpi: 25,
      },
    ]);
  }, []);

  return (
    <div className="ndc-management content-container">
      <div className="title-bar">
        <Row justify="space-between" align="middle">
          <Col span={20}>
            <div className="body-title">{t('ndc:NdcTitle')}</div>
            <div className="body-sub-title">{t('ndc:NdcSubTitle')}</div>
          </Col>
        </Row>
      </div>
      <div>
        <Tabs defaultActiveKey="1" items={periodItems} onChange={onTabChange} />
      </div>
    </div>
  );
};

export default NdcDetailsComponent;
