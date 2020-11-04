import React, { memo } from 'react';
import ReactEcharts from 'echarts-for-react';

import { BlockLoading } from '../../component/Loading';
import { miniEchartOption } from './options';

export const ChartMini = memo<any>(({ fundId, fundGzDetail }) => {
  if (!fundGzDetail)
    return <BlockLoading width='260px' height="50px" />;
  if (fundGzDetail.gzDetail.length === 0)
    return <div style={{ color: 'grey' }}>暂无走势图</div>;

  console.log('[Chart rebuild]', fundId, fundGzDetail.fundBaseInfo.SHORTNAME);

  return <ReactEcharts
    style={{ display: 'inline-block', width: '260px', height: '50px', margin: '0 auto' }}
    option={miniEchartOption(fundGzDetail)}
  />;
},(
  { fundId, fundGzDetail },
  { fundId: newFundId, fundGzDetail: newFundGzDetail }
) => {
  return fundId === newFundId && fundGzDetail === newFundGzDetail;
});