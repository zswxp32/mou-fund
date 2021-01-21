import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useLatest } from '@Util/hooks';
import { toPercentString, toPercentColor } from '@Util/number';
import EastMoneyService from '@Service/eastmoney';
import { PageLoading } from '@Component/Loading';
import { Back } from '@Component/Back';
import { ChartCandle } from '@Component/Chart';

import '../../style/global.scss';
import styles from './index.module.scss';

type StockInfo = {
  list: any[],
  stockProportionTotal: string,
  stockIncomeEstimated: string,
  date: string,
}

const PageFundDetail: React.FC = () => {
  const { fundId } = useParams();
  const [stockInfos, setStockInfos] = useState<StockInfo>(null);
  const [stockTrends, setStockTrends] = useState({});

  const stockTrendsLatest = useLatest(stockTrends);

  useEffect(() => {
    const load = async () => {
      const fundStockInfo = await EastMoneyService.getFundStocks(fundId);
      const stockInfosRes = await EastMoneyService.getStockList(fundStockInfo.stocks);

      let stockProportionTotal = 0;
      let stockIncomeEstimated = 0;

      const _stockInfos = stockInfosRes.map((item) => {
        const stock = fundStockInfo.stocks.find(s => s.GPDM === item.f12);
        stockProportionTotal += parseFloat(stock.JZBL);
        stockIncomeEstimated += stock.JZBL * item.f3 / 100;
        return {
          name: item.f14,
          code: item.f12,
          proportion: stock.JZBL,
          price: item.f2,
          change: item.f3.toFixed(2),
          type: item.f13,
        };
      });

      setStockInfos({
        list: _stockInfos,
        stockProportionTotal: stockProportionTotal.toFixed(2),
        stockIncomeEstimated: stockIncomeEstimated.toFixed(2),
        date: fundStockInfo.date,
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
        <span>重仓股票明细 ({stockInfos.date})</span>
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
                <ChartCandle data={stockTrends[item.code]} />
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

export default PageFundDetail;