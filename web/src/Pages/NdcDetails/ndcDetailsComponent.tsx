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

type Period = {
  start: number;
  end: number;
};

const NdcDetailsComponent = (props: any) => {
  const { t, useConnection } = props;
  const { RangePicker } = DatePicker;
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalNdcDetails, setTotalNdcDetails] = useState<number>();
  const [periodItems, setPeriodItems] = useState([] as any[]);
  const [selectedPeriod, setSelectedPeriod] = useState({} as any);
  const rangePickerRef = useRef(null);

  console.log('d1 rendered');

  const { post } = useConnection();
  const columns: any = [
    {
      title: t('ndc:ndcColumnsDateRange'),
      dataIndex: 'dateRange',
      key: 'dateRange',
      align: 'left' as const,
    },
    {
      title: t('ndc:ndcColumnsNationalPlanObj'),
      dataIndex: 'nationalPlanObj',
      key: 'nationalPlanObj',
      align: 'left' as const,
    },
  ];

  const ndcDetailsTableContent = () => {
    return <div>Table</div>;
  };

  const onCancelPeriod = () => {};

  const onAddNewPeriod = () => {
    console.log('d1 selectedPeriod', selectedPeriod);
    if (selectedPeriod) {
      const newPeriodItem = {
        key: `${selectedPeriod.start}-${selectedPeriod.end}`,
        label: `${selectedPeriod.start}-${selectedPeriod.end}`,
        children: ndcDetailsTableContent(),
      };
      setPeriodItems((items: any) => [...items, newPeriodItem]);
    }
  };

  const onDateRangeChanged = (range: any) => {
    console.log('onDateRangeChanged', range);
    const start = Number(moment(range[0]).year());
    const end = Number(moment(range[1]).year());
    const period = {
      start: start,
      end: end,
    };
    console.log('d1 setSelectedPeriod', period);
    setSelectedPeriod(period);
  };

  const addNewPeriodContent = () => {
    return (
      <div>
        <Row>
          <RangePicker ref={rangePickerRef} onChange={onDateRangeChanged} picker="year" />
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
  };

  const onTabChange = (key: string) => {
    console.log(key);
  };

  const onChange: PaginationProps['onChange'] = (page: any, size: any) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const getNdcDetails = async () => {
    try {
      const response: any = await post('national/programme/queryNdcDetails', {
        page: currentPage,
        size: pageSize,
      });

      setTableData(response.data);
      setTotalNdcDetails(response.response.data.total);
      setLoading(false);
    } catch (error: any) {
      message.open({
        type: 'error',
        content: error.message,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('d1 useEffect');
    const addNewItem = {
      key: 'add_new',
      label: 'Add New',
      children: (
        <div>
          <Row>
            <RangePicker ref={rangePickerRef} onChange={onDateRangeChanged} picker="year" />
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
      ),
    };
    setPeriodItems((items) => [addNewItem]);
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
      <div className="content-card">
        <Row>
          <Col span={24}>
            <div className="programmeManagement-table-container">
              <Table
                dataSource={tableData}
                columns={columns}
                className="common-table-class"
                loading={loading}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: totalNdcDetails,
                  showQuickJumper: true,
                  showSizeChanger: true,
                  onChange: onChange,
                }}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={tableData.length === 0 ? t('ndc:noNdcDetails') : null}
                    />
                  ),
                }}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default NdcDetailsComponent;
