import React from 'react';
import { useSelector } from 'react-redux';

import { LoadStatus } from '@Type/index';
import { toNumberColor, toNumberPN, toPercentString } from '@Util/number';
import { BlockLoading } from '@Component/Loading';

import { RootState } from '../../store';
import styles from './index.module.scss';

export const StockIndexs: React.FC = () => {
  const { status, list } = useSelector((state: RootState) => state.stockIndexs);

  return <div className={styles.stock_indexs}>
    {
      status === LoadStatus.loading
        ? <BlockLoading />
        : list.map((item) => <div key={item.f12} className={styles.item}>
          <p className={`bold fs13`}>{item.f14}</p>
          <p className={`bold fs20 ${toNumberColor(item.f4)}`}>{item.f2}</p>
          <p>
            <span className={`bold fs13 mr5 ${toNumberColor(item.f4)}`}>
              {toNumberPN(item.f4)}</span>
            <span className={`bold fs13 ${toNumberColor(item.f4)}`}>
              {toPercentString(item.f3, true)}
            </span>
          </p>
        </div>)
    }
  </div>;
}