import React, { useEffect, useState, useCallback, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { useLatest } from '../../util/hooks';
import { StockIndexCodeList } from '../../config';
import { toPercentString, toPercentColor, toNumberColor, toNumberPN } from '../../util/number';
import { FundDetail, FundList } from '../../model/fund';
import { PageLoading } from '../../component/Loading';
import { ChartMini } from '../../component/Chart';
import { Version } from '../../component/Version';
import SearchResult from '../../component/SearchResult';
import EastMoneyService from '../../service/eastmoney';
import StorageService from '../../service/storage';

import '../../style/global.scss';
import styles from './index.module.scss';
import { StockIndexs } from '../../component/Indexs';

import noDataImg from '../../images/no_data.jpg';

export default function PageFundList(): ReactElement {
  const [refreshing, setRefreshing] = useState(0);
  const [editing, setEditing] = useState(false);
  const [searchStr, setSearchStr] = useState('');
  const [searchList, setSearchList] = useState(null);
  const [searchBoxShow, setSearchBoxShow] = useState(false);

  const [stockIndexs, setStockIndexs] = useState([]);
  const [fundListData, setFundListData] = useState<FundList>(null);
  const [fundGzDetails, setFundGzDetails] = useState({});
  const fundGzDetailsLatest = useLatest(fundGzDetails);

  const fundIds = StorageService.getFundIds();
  const fundHolds = StorageService.getFundHolds();

  useEffect(() => {
    const loadStockIndexs = async () => {
      const stockInfosRes = await EastMoneyService.getStockList(StockIndexCodeList);
      setStockIndexs(stockInfosRes);
    }

    const loadFundListData = async () => {
      if (fundIds.length > 0) {
        const data = await EastMoneyService.getFundList(fundIds);
        setFundListData(new FundList({
          gzrq: data.Expansion.GZTIME.substr(5),
          jzrq: data.Expansion.FSRQ.substr(5),
          ids: fundIds,
          list: data.Datas,
        }));
      } else {
        setFundListData(new FundList());
      }
    };

    const loadFundDetails = () => {
      if (fundIds.length === 0) return;
      fundIds.forEach(async (fundId: string) => {
        if (!fundGzDetailsLatest.current[fundId]) {
          const { gzDetail, fundBaseInfo } = await EastMoneyService.getFundGzDetail(fundId);
          setFundGzDetails({
            ...fundGzDetailsLatest.current,
            [fundId]: {
              gzDetail,
              fundBaseInfo,
            },
          });
        }
      });
    };

    loadStockIndexs();
    loadFundListData();
    loadFundDetails();
  }, [refreshing, fundGzDetailsLatest]);

  useEffect(() => {
    const str = searchStr.trim();

    if (searchStr.trim() === '') {
      setSearchBoxShow(false);
      return;
    }
    const startSearch = async (str) => {
      const searchList = await EastMoneyService.searchFund(str);
      setSearchList(searchList);
    };

    setSearchList(null);
    setSearchBoxShow(true);

    const searchTimer = setTimeout(() => {
      startSearch(str);
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [searchStr]);

  const onDragEnd = useCallback((result) => {
    if (!result.destination || !result.source) return;
    const idsCopyed = Array.from(fundListData.ids);
    const [removed] = idsCopyed.splice(result.source.index, 1);
    idsCopyed.splice(result.destination.index, 0, removed);
    setFundListData(fundListData.reorderFunds(idsCopyed));
  }, [fundListData]);

  const onSearchCancle = useCallback(() => {
    setTimeout(() => setSearchStr(''), 100);
  }, []);

  const onAdd = useCallback(async (fundId) => {
    setSearchStr('');
    const data = await fundListData.addFund(fundId);
    setFundListData(data);
    const { gzDetail, fundBaseInfo } = await EastMoneyService.getFundGzDetail(fundId);
    setFundGzDetails({
      ...fundGzDetailsLatest.current,
      [fundId]: {
        gzDetail,
        fundBaseInfo,
      },
    });
    try {
      chrome.runtime.sendMessage({
        type: 'hold_changed',
        value: data.totalGainedExpectedString,
      });
    } catch (e) { console.log(e); }
  }, [fundListData, fundGzDetailsLatest]);

  const onDelete = useCallback((fundId) => {
    const data = fundListData.deleteFund(fundId);
    setFundListData(data);
    try {
      chrome.runtime.sendMessage({
        type: 'hold_changed',
        value: data.totalGainedExpectedString,
      });
    } catch (e) { console.log(e); }
  }, [fundListData]);

  const onHoldChange = useCallback((fundId, key, value) => {
    const data = fundListData.updateHold(fundId, key, value);
    setFundListData(data);
    try {
      chrome.runtime.sendMessage({
        type: 'hold_changed',
        value: data.totalGainedExpectedString,
      });
    } catch (e) { console.log(e); }
  }, [fundListData]);

  const onRefresh = useCallback(() => {
    setFundGzDetails({});
    setRefreshing(refreshing + 1);
  }, [refreshing]);

  const buildTips = (item: FundDetail) => {
    if (editing || item.gzing) return null;
    if (item.gainedExpected !== null) {
      if (item.updated) {
        return <span className={`${styles.tips} ${styles.updated}`}>净值已更新</span>;
      }
      return <span className={`${styles.tips} ${styles.un_updated}`}>净值待更新</span>;
    }
    return <span className={`${styles.tips} ${styles.cant_updated}`}>暂无估值</span>;
  };

  if (fundListData == null) return <PageLoading />;

  return <div className="container">
    <div className={styles.stock_indexs}>
      <StockIndexs dataList={stockIndexs} />
    </div>
    <div className={styles.tool_bar}>
      <div className={styles.search}>
        <input
          type="text"
          className={styles.search_input}
          value={searchStr}
          placeholder="请输入基金代码/名称进行搜索"
          onChange={(e) => setSearchStr(e.target.value)}
        />
        {searchStr && <span className={styles.search_cancle} onClick={onSearchCancle}>×</span>}
      </div>
      {searchBoxShow && <SearchResult list={searchList} onItemClick={onAdd} />}
      {fundListData.ids.length > 0 && <div className={styles.buttons}>
        <span className="button" onClick={() => setEditing(!editing)}>
          {!editing ? '编辑' : '完成'}
        </span>
        {!editing && <span className="button" onClick={onRefresh}>刷新</span>}
      </div>}
    </div>

    <div className={styles.list}>
      <div className={styles.list_header}>
        <div className={styles.list_line}>
          <div className="tl">基金</div>
          {!editing && <div className={styles.chart}>涨跌走势图</div>}
          <div>持有总额</div>
          <div>持有收益</div>
          {!editing && <div>
            <p>最新净值</p>
            {fundListData.jzrq && <p className={styles.gz_data}>{fundListData.jzrq}</p>}
          </div>}
          {!editing && <div>
            <p>实时估值</p>
            {fundListData.gzrq && <p className={styles.gz_data}>{fundListData.gzrq}</p>}
          </div>}
          {!editing && <div>
            <p>预估收益</p>
            {fundListData.gzrq && <p className={styles.gz_data}>{fundListData.gzrq}</p>}
          </div>}
          {editing ? <div>持有份额</div> : null}
          {editing ? <div>持有单价</div> : null}
          {editing ? <div>删除</div> : null}
        </div>
      </div>

      {fundListData.items.size > 0
        ? <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div
                className={styles.list_body}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                { fundListData.ids.map((id, index) => {
                  const item = fundListData.items.get(id);
                  const { code, name, jz, jzzzl, gz, gzzzl, money, gained, gainedPercent, gainedExpected, isETF } = item;
                  const { cost, count } = fundHolds[id];
                  return <Draggable key={code} draggableId={code} index={index}>
                    {(provided) => (
                      <div
                        className={`${styles.list_line} ${index % 2 === 0 ? styles.even : styles.odd}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {/** 基金 */}
                        <div>
                          <p className="bold">
                            <Link className={styles.fund_link} title={name} to={`/fund/detail/${code}`}>{name}</Link>
                          </p>
                          <p className="fs14">
                            <span>{code}</span>
                            {isETF && <span className={styles.etf}>场内ETF</span>}
                          </p>
                        </div>
                        {/** 涨跌走势图 */}
                        { !editing && <div className={styles.chart} style={{ fontSize: 0 }}>
                          <ChartMini fundId={code} fundGzDetail={fundGzDetails[code]} />
                        </div>}
                        {/** 持有总额 */}
                        <div className={`bold fs14`}>
                          {money.toFixed(2)}
                        </div>
                        {/** 持有收益 */}
                        <div>
                          <p className={`bold fs16 ${toNumberColor(gainedPercent)}`}>
                            {gainedPercent ? toPercentString(gainedPercent, true) : '--'}
                          </p>
                          <p className={`bold fs14 ${toNumberColor(gained)}`}>
                            {gained ? toNumberPN(gained) : '--'}
                          </p>
                        </div>
                        {/** 最新净值 */}
                        { !editing && <div>
                          <p className={`bold fs16 ${toNumberColor(jzzzl)}`}>
                            {toPercentString(jzzzl, true)}
                          </p>
                          <p className='fs14'>{jz}</p>
                        </div>}
                        {/** 实时估值 */}
                        { !editing && <div>
                          <p className={`bold fs16 ${toPercentColor(gzzzl)}`}>
                            {gzzzl ? toPercentString(gzzzl, true) : '--'}
                          </p>
                          <p className='fs14'>
                            {gz ? gz : '--'}
                          </p>
                        </div>}
                        {/** 预估收益 */}
                        { !editing && <div className={`bold fs18 ${toNumberColor(gainedExpected)}`}>
                          {toNumberPN(gainedExpected)}
                        </div>}

                        {/** 持有份额 */}
                        { editing && <div>
                          <input type="text" className={styles.edit_input} defaultValue={count}
                            onChange={(e) => onHoldChange(code, 'count', e.target.value)} />
                        </div>}
                        {/** 持有单价 */}
                        { editing && <div>
                          <input type="text" className={styles.edit_input} defaultValue={cost}
                            onChange={(e) => onHoldChange(code, 'cost', e.target.value)} />
                        </div>}
                        {/** 删除 */}
                        { editing && <div>
                          <span className={styles.delete_button} onClick={() => onDelete(code)}>🗑️</span>
                        </div>}
                        {/** 净值更新角标 */}
                        { buildTips(item)}
                      </div>
                    )}
                  </Draggable>;
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        : <div className={styles.list_body}>
          <div className={styles.no_data}>
            <img src={noDataImg} />
            <span>老铁，基金都被你删没了~ 赶紧添加你看好的基金吧！</span>
          </div>
        </div>
      }

      {fundListData.items.size > 0 && <div className={styles.list_footer}>
        <div className={styles.list_line}>
          <div className="tl">总览</div>
          {!editing && <div className={styles.chart}></div>}
          <div className={`bold fs14`}>
            {fundListData.totalMoney.toFixed(2)}
          </div>
          <div>
            <p className={`bold fs16 ${toNumberColor(fundListData.totalGained)}`}>
              {fundListData.totalPercent}
            </p>
            <p className={`bold fs14 ${toNumberColor(fundListData.totalGained)}`}>
              {toNumberPN(fundListData.totalGained)}
            </p>
          </div>
          {!editing && <div></div>}
          {!editing && <div></div>}
          {!editing && <div className={`bold fs18 ${toNumberColor(fundListData.totalGainedExpected)}`}>
            {toNumberPN(fundListData.totalGainedExpected)}
          </div>}
          {editing && <div></div>}
          {editing && <div></div>}
          {editing && <div></div>}
        </div>
      </div>}
    </div>

    <Version product={PRODUCT} version={VERSION} />
  </div>;
}
