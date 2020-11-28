import React, { memo } from 'react';
import ReactEcharts from 'echarts-for-react';

import { FundTrends } from '@Model/fund';
import { BlockLoading } from '@Component/Loading';

import { miniEchartOption, candleEchartOption } from './options';

export const ChartMini = memo(
  ({ trendsData }: { trendsData: FundTrends }) => {
    if (!trendsData) return <BlockLoading width='240px' height="50px" />;
    if (trendsData.list.length === 0) return <div style={{ color: 'grey' }}>暂无走势图</div>;
    return <ReactEcharts
      style={{ display: 'inline-block', width: '240px', height: '50px', margin: '0 auto' }}
      option={miniEchartOption(trendsData)}
    />;
  },
  ({ trendsData }, { trendsData: newRrendsData }) => trendsData === newRrendsData
);

export const ChartCandle = memo(
  ({ stockCandleData }: { stockCandleData: any }) => {
    if (!stockCandleData) return <BlockLoading width='240px' height="32px" />;
    return <ReactEcharts
      style={{ display: 'inline-block', width: '240px', height: '32px', margin: '0 auto' }}
      option={candleEchartOption(stockCandleData)}
    />;
  },
  ({ stockCandleData }, { stockCandleData: newStockCandleData }) => stockCandleData === newStockCandleData
);
