import React, { ReactElement } from 'react';
import { toNumberColor, toNumberPN, toPercentString } from '../../util/number';
import { BlockLoading } from '../Loading';
import styles from './index.module.scss';

type Stock = {
  f2: number, // 价格
  f3: number, // 涨跌百分比
  f4: number, // 涨跌数值
  f12: string, // 股票代码
  f13: number, // 市场
  f14: string, // 股票名
};

type StockIndexsProps = {
  dataList: Array<Stock>,
};

export function StockIndexs({ dataList }: StockIndexsProps): ReactElement {
  if (dataList === null || dataList.length === 0) {
    return <BlockLoading />;
  }
  return <div className={styles.stock_index}>
    {dataList.map((item) => (<div key={item.f12} className={styles.item}>
      <p className={`bold fs13`}>{item.f14}</p>
      <p className={`bold fs20 ${toNumberColor(item.f4)}`}>{item.f2}</p>
      <p>
        <span className={`bold fs13 mr5 ${toNumberColor(item.f4)}`}>
          {toNumberPN(item.f4)}</span>
        <span className={`bold fs13 ${toNumberColor(item.f4)}`}>
          {toPercentString(item.f3, true)}
        </span>
      </p>
    </div>))}
  </div>;
}