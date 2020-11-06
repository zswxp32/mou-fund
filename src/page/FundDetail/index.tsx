import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { toPercentString, toPercentColor } from '../../util/number';
import { PageLoading } from '../../component/Loading';
import { Back } from '../../component/Back';
import EastMoneyService from '../../service/eastmoney';

import '../../style/global.scss';
import styles from './index.module.scss';

export default function PageFundDetail() {
  const { fundId } = useParams();
  const [fundInfo, setFundInfo] = useState(null);

  useEffect(() => {
    const load = async () => {
      const fundStocks = await EastMoneyService.getFundStocks(fundId);
      const stockListRes = await EastMoneyService.getStockList(fundStocks);

      let stockProportionTotal = 0;
      let stockIncomeEstimated = 0;

      const stockList = fundStocks.map((item, index) => {
        stockProportionTotal += parseFloat(item.JZBL);
        stockIncomeEstimated += item.JZBL * stockListRes[index].f3 / 100;
        return {
          name: item.GPJC,
          code: item.GPDM,
          price: stockListRes[index].f2,
          change: stockListRes[index].f3.toFixed(2),
          proportion: item.JZBL,
        };
      });

      setFundInfo({
        stockList,
        stockProportionTotal: stockProportionTotal.toFixed(2),
        stockIncomeEstimated: stockIncomeEstimated.toFixed(2),
      });
    };
    load();
  }, [fundId]);

  if (fundInfo == null) return <PageLoading />;

  return (
    <div className="container">
      <Back />
      <div className={styles.title}>
        重仓股票明细
      </div>
      <table className={styles.stock_list}>
        <thead>
          <tr>
            <th className="tl">股票名称 (代码)</th>
            <th>价格</th>
            <th>涨跌幅</th>
            <th>持仓占比</th>
          </tr>
        </thead>
        <tbody>
          {fundInfo.stockList.map((item, index) => (
            <tr className={index % 2 === 0 ? styles.even : styles.odd} key={item.code}>
              <td className="tl bold">{item.name} ({item.code})</td>
              <td>{item.price}</td>
              <td className={`bold ${toPercentColor(item.change)}`}>
                {toPercentString(item.change, true)}
              </td>
              <td>{item.proportion} %</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="tl bold" colSpan={2}>
              <span>重仓股票仓位：</span>
              <span>{fundInfo.stockProportionTotal} %</span>
            </td>
            <td className={`tr bold`} colSpan={2}>
              <span>重仓股票涨跌：</span>
              <span className={`${toPercentColor(fundInfo.stockIncomeEstimated)}`}>
                {toPercentString(fundInfo.stockIncomeEstimated, true)}
                </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
