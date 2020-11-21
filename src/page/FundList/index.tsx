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
  const [editing, setEditing] = useState(false);
  const [searchStr, setSearchStr] = useState('');
  const [searchList, setSearchList] = useState(null);
  const [searchBoxShow, setSearchBoxShow] = useState(false);

  const [fundIds, setFundIds] = useState(StorageService.getFundIds());
  const [fundHolds, setFundHolds] = useState(StorageService.getFundHolds());
  const [fundList, setFundList] = useState<FundList>(null);
  const [fundGzDetails, setFundGzDetails] = useState({});
  const [stockIndexs, setStockIndexs] = useState([]);

  const fundGzDetailsLatest = useLatest(fundGzDetails);

  useEffect(() => {
    const loadFundList = async () => {
      let list: FundList = new FundList('', []);
      if (fundIds.length !== 0) {
        list = await EastMoneyService.getFundList(fundIds);
      }
      setFundList(list);
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

    const loadStockIndexs = async () => {
      const stockInfosRes = await EastMoneyService.getStockList(StockIndexCodeList);
      setStockIndexs(stockInfosRes);
    }

    loadFundList();
    loadFundDetails();
    loadStockIndexs();
  }, [fundIds, fundGzDetailsLatest]);

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

    const itemsCopyed = Array.from(fundList.items);
    const [removed] = itemsCopyed.splice(result.source.index, 1);
    itemsCopyed.splice(result.destination.index, 0, removed);

    setFundList(fundList.setItems(itemsCopyed));
    StorageService.resetFundIds(itemsCopyed.map((item: FundDetail) => item.code));
  }, [fundList]);

  const onSearchChange = useCallback((e) => {
    setSearchStr(e.target.value);
  }, []);

  const onSearchCancle = useCallback(() => {
    setTimeout(() => setSearchStr(''), 100);
  }, []);

  const onSearchItemClick = useCallback((fundId) => {
    setFundHolds(StorageService.addFundHold({ code: fundId, count: 0, cost: 0 }));
    setFundIds(StorageService.addFundById(fundId));
    setSearchStr('');
  }, []);

  const onRefreshClick = useCallback(() => {
    setFundIds(StorageService.getFundIds());
    setFundGzDetails({});
    setStockIndexs([]);
  }, []);

  const onEditClick = useCallback((isEditing) => {
    setEditing(isEditing);
  }, []);

  const onDelete = useCallback((fundId) => {
    setFundIds(StorageService.deleteFundById(fundId));
  }, []);

  const onHoldChange = useCallback((fundId, key, value) => {
    const val = value.trim();
    if (isNaN(val / 1)) return;
    setFundHolds(StorageService.updateFundHold({
      code: fundId,
      [key]: val / 1,
    }));
  }, []);

  if (fundList == null) return <PageLoading />;

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
          onChange={onSearchChange}
        />
        {searchStr && <span className={styles.search_cancle} onClick={onSearchCancle}>×</span>}
      </div>
      {searchBoxShow && <SearchResult list={searchList} onItemClick={onSearchItemClick} />}
      {fundList.items.length > 0 && <div className={styles.buttons}>
        <span className="button" onClick={() => onEditClick(!editing)}>
          {!editing ? '编辑' : '完成'}
        </span>
        {!editing && <span className="button" onClick={onRefreshClick}>刷新</span>}
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
            {fundList.jzrq && <p className={styles.gz_data}>{fundList.jzrq}</p>}
          </div>}
          {!editing && <div>
            <p>实时估值</p>
            {fundList.gzrq && <p className={styles.gz_data}>{fundList.gzrq}</p>}
          </div>}
          {!editing && <div>
            <p>预估收益</p>
            {fundList.gzrq && <p className={styles.gz_data}>{fundList.gzrq}</p>}
          </div>}
          {editing ? <div>持有份额</div> : null}
          {editing ? <div>持有单价</div> : null}
          {editing ? <div>删除</div> : null}
        </div>
      </div>

      {fundList.items.length > 0
        ? <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div
                className={styles.list_body}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                { fundList.items.map((item, index) => {
                  const { cost, count } = fundHolds[item.code];
                  const { code, name, jz, jzzzl, gz, gzzzl, gzing, updated, money, gained, gainedPercent, gainedExpected } = item;
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
                            <Link className={styles.fund_link} to={`/fund/detail/${code}`}>{name}</Link>
                          </p>
                          <p className="fs14">{code}</p>
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
                            {gainedPercent ? toPercentString(gainedPercent, true) : '-'}
                          </p>
                          {gained && <p className={`bold fs14 ${toNumberColor(gained)}`}>
                            {toNumberPN(gained)}
                          </p>}
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
                            {toPercentString(gzzzl, true)}
                          </p>
                          <p className='fs14'>{gz}</p>
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
                        { !editing && !gzing && (updated
                          ? <span className={styles.updated}>净值已更新</span>
                          : <span className={styles.un_updated}>净值未更新</span>)}
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

      {fundList.items.length > 0 && <div className={styles.list_footer}>
        <div className={styles.list_line}>
          <div className="tl">总览</div>
          {!editing && <div className={styles.chart}></div>}
          <div className={`bold fs14`}>
            {fundList.totalMoney.toFixed(2)}
          </div>
          <div>
            <p className={`bold fs16 ${toNumberColor(fundList.totalGained)}`}>
              {fundList.totalPercent}
            </p>
            <p className={`bold fs14 ${toNumberColor(fundList.totalGained)}`}>
              {toNumberPN(fundList.totalGained)}
            </p>
          </div>
          {!editing && <div></div>}
          {!editing && <div></div>}
          {!editing && <div className={`bold fs18 ${toNumberColor(fundList.totalGainedExpected)}`}>
            {toNumberPN(fundList.totalGainedExpected)}
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
