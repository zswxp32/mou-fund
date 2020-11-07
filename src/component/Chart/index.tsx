import React, { memo } from 'react';
import ReactEcharts from 'echarts-for-react';

import { BlockLoading } from '../../component/Loading';
import { miniEchartOption, candleEchartOption } from './options';

type ChartMiniProps = {
  fundId: string,
  fundGzDetail: any,
};

type ChartCandleProps = {
  stockId: string,
  stockCandleData: any,
};

export const ChartMini = memo<ChartMiniProps>(({ fundId, fundGzDetail }: ChartMiniProps) => {
  if (!fundGzDetail) return <BlockLoading width='260px' height="50px" />;
  if (fundGzDetail.gzDetail.length === 0)
    return <div style={{ color: 'grey' }}>暂无走势图</div>;

  return <ReactEcharts
    style={{ display: 'inline-block', width: '260px', height: '50px', margin: '0 auto' }}
    option={miniEchartOption(fundGzDetail)}
  />;
}, (
  { fundId, fundGzDetail },
  { fundId: newFundId, fundGzDetail: newFundGzDetail }
) => {
  return fundId === newFundId && fundGzDetail === newFundGzDetail;
});

export const ChartCandle = memo<ChartCandleProps>(({ stockId, stockCandleData }: ChartCandleProps) => {
  if (!stockCandleData) return <BlockLoading width='260px' height="32px" />;
  return <ReactEcharts
    style={{ display: 'inline-block', width: '260px', height: '32px', margin: '0 auto' }}
    option={candleEchartOption(stockCandleData)}
  />;
}, (
  { stockId, stockCandleData },
  { stockId: newStockId, stockCandleData: newStockCandleData }
) => {
  return stockId === newStockId && stockCandleData === newStockCandleData;
});
