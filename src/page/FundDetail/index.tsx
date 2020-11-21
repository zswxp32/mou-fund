import React, { ReactElement, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useLatest } from '../../util/hooks';
import { toPercentString, toPercentColor } from '../../util/number';
import { PageLoading } from '../../component/Loading';
import { Back } from '../../component/Back';
import EastMoneyService from '../../service/eastmoney';

import '../../style/global.scss';
import styles from './index.module.scss';
import { ChartCandle } from '../../component/Chart';

type StockInfo = {
  list: any[],
  stockProportionTotal: string,
  stockIncomeEstimated: string,
}

export default function PageFundDetail(): ReactElement {
  const { fundId } = useParams();
  const [stockInfos, setStockInfos] = useState<StockInfo>(null);
  const [stockTrends, setStockTrends] = useState({});

  const stockTrendsLatest = useLatest(stockTrends);

  useEffect(() => {
    const load = async () => {
      const fundStocks = await EastMoneyService.getFundStocks(fundId);
      const stockInfosRes = await EastMoneyService.getStockList(fundStocks);

      let stockProportionTotal = 0;
      let stockIncomeEstimated = 0;

      const _stockInfos = fundStocks.map((item, index) => {
        stockProportionTotal += parseFloat(item.JZBL);
        stockIncomeEstimated += item.JZBL * stockInfosRes[index].f3 / 100;
        return {
          name: item.GPJC,
          code: item.GPDM,
          proportion: item.JZBL,
          price: stockInfosRes[index].f2,
          change: stockInfosRes[index].f3.toFixed(2),
          type: stockInfosRes[index].f13,
        };
      });

      setStockInfos({
        list: _stockInfos,
        stockProportionTotal: stockProportionTotal.toFixed(2),
        stockIncomeEstimated: stockIncomeEstimated.toFixed(2),
      });
    };
    load();
  }, [fundId]);

  useEffect(() => {
    if (stockInfos === null) return;
    stockInfos.list.forEach(async (item) => {
      if (!stockTrendsLatest.current[item.code]) {
        const stockTrendsRes = await EastMoneyService.getStockTrends(item.type, item.code);
        setStockTrends({
          ...stockTrendsLatest.current,
          [item.code]: stockTrendsRes,
        });
      }
    });
  }, [stockInfos, stockTrendsLatest]);

  if (stockInfos == null) return <PageLoading />;

  return (
    <div className="container">
      <div className={styles.title}>
        <Back />
        <span>重仓股票明细</span>
      </div>

      <div className={styles.list}>
        <div className={styles.list_header}>
          <div className={styles.list_line}>
            <div className="tl">股票名称 (代码)</div>
            <div className={styles.chart}>涨跌走势图</div>
            <div>价格</div>
            <div>涨跌幅</div>
            <div>持仓占比</div>
          </div>
        </div>
        <div className={styles.list_body}>
          {stockInfos.list.map((item, index) => (
            <div key={item.code} className={`${styles.list_line} ${index % 2 === 0 ? styles.even : styles.odd}`}>
              <div className="fs12">
                {item.name} ({item.code})
              </div>
              <div className={styles.chart} style={{ fontSize: 0 }}>
                <ChartCandle stockId={item.code} stockCandleData={stockTrends[item.code]} />
              </div>
              <div className="fs14">{item.price}</div>
              <div className={`bold fs14 ${toPercentColor(item.change)}`}>
                {toPercentString(item.change, true)}
              </div>
              <div className="bold fs14">
                {item.proportion}%
              </div>
            </div>))}
        </div>
        <div className={styles.list_footer}>
          <p>
            <span>重仓股票仓位：</span>
            <span className="bold fs14">{stockInfos.stockProportionTotal}%</span>
          </p>
          <p>
            <span>重仓股票涨跌：</span>
            <span className={`bold fs14 ${toPercentColor(stockInfos.stockIncomeEstimated)}`}>
              {toPercentString(stockInfos.stockIncomeEstimated, true)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
