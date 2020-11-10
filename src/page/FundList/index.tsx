import React, { useEffect, useState, useCallback, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { useLatest } from '../../util/hooks';
import { toPercentString, toPercentColor, toGainPercentString, toNumberColor } from '../../util/number';
import { Fund, FundList } from '../../model/fund';
import { PageLoading } from '../../component/Loading';
import { ChartMini } from '../../component/Chart';
import { Version } from '../../component/Version';
import SearchResult from '../../component/SearchResult';
import EastMoneyService from '../../service/eastmoney';
import StorageService from '../../service/storage';

import '../../style/global.scss';
import styles from './index.module.scss';

export default function PageFundList(): ReactElement {
  const [editing, setEditing] = useState(false);
  const [searchStr, setSearchStr] = useState('');
  const [searchList, setSearchList] = useState(null);
  const [searchBoxShow, setSearchBoxShow] = useState(false);

  const [fundIds, setFundIds] = useState(StorageService.getFundIds());
  const [fundHolds, setFundHolds] = useState(StorageService.getFundHolds());
  const [fundList, setFundList] = useState<FundList>(null);
  const [fundGzDetails, setFundGzDetails] = useState({});

  const fundGzDetailsLatest = useLatest(fundGzDetails);

  useEffect(() => {
    const loadList = async () => {
      let list: FundList = new FundList('', []);
      if (fundIds.length !== 0) {
        list = await EastMoneyService.getFundList(fundIds);
      }
      setFundList(list);
    };

    const loadGzDetails = () => {
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

    loadList();
    loadGzDetails();
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
    StorageService.resetFundIds(itemsCopyed.map((item: Fund) => item.code));
  }, [fundList]);

  const onSearchChange = useCallback((e) => {
    setSearchStr(e.target.value);
  }, []);

  const onSearchCancle = useCallback(() => {
    setTimeout(() => setSearchStr(''), 100);
  }, []);

  const onSearchItemClick = useCallback((fundId) => {
    setFundHolds(StorageService.addFundHold({ code: fundId, hold: 0, cost: 0 }));
    setFundIds(StorageService.addFundById(fundId));
    setSearchStr('');
  }, []);

  const onRefreshClick = useCallback(() => {
    setFundIds(StorageService.getFundIds());
    setFundGzDetails({});
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
    <div className={styles.tool_bar}>
      <div className={styles.search}>
        <input
          type="text"
          className={styles.search_input}
          value={searchStr}
          placeholder="请输入想添加的基金代码"
          onChange={onSearchChange}
        />
        {searchStr !== '' && <span className={styles.search_cancle} onClick={onSearchCancle}>×</span>}
      </div>
      {searchBoxShow && <SearchResult list={searchList} onItemClick={onSearchItemClick} />}
      {fundList.items.length > 0
        ? <div className={styles.buttons}>
          <span className="button" onClick={() => onEditClick(!editing)}>
            {!editing ? '编辑' : '完成'}
          </span>
          {!editing && <span className="button" onClick={onRefreshClick}>刷新</span>}
        </div>
        : null
      }
    </div>

    <div className={styles.list}>
      <div className={styles.list_header}>
        <div className={styles.list_line}>
          <div className="tl">基金</div>

          {!editing && <div className={styles.chart}>涨跌走势图</div>}

          <div>持有总额</div>
          <div>持有收益</div>

          {!editing && <div>
            <p>净值</p>
            {fundList.jzrq && <p className={styles.gz_data}>{fundList.jzrq}</p>}
          </div>}
          {!editing && <div>
            <p>估值</p>
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
                  const { hold, cost } = fundHolds[item.code];
                  const { code, name, jz, jzzzl, gz, gzzzl, gzing, updated } = item;
                  return <Draggable key={code} draggableId={code} index={index}>
                    {(provided) => (
                      <div
                        className={`${styles.list_line} ${index % 2 === 0 ? styles.even : styles.odd}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div>
                          <p className="bold">
                            <Link className={styles.fund_link} to={`/fund/detail/${code}`}>{name}</Link>
                          </p>
                          <p>{code}</p>
                        </div>

                        { !editing && <div className={styles.chart} style={{ fontSize: 0 }}>
                          <ChartMini fundId={code} fundGzDetail={fundGzDetails[code]} />
                        </div>}

                        <div>{(jz * hold).toFixed(2)}</div>
                        <div>
                          {(cost != 0 && hold != 0) && <p className={`bold ${toNumberColor((jz - cost) * hold)}`}>
                            {((jz - cost) * hold).toFixed(2)}
                          </p>}
                          <p className={`bold ${toPercentColor(toGainPercentString(jz, cost))}`}>
                            {toGainPercentString(jz, cost, true) || '未配置'}
                          </p>
                        </div>

                        { !editing && <div>
                          <p>{jz}</p>
                          <p className={`bold ${toPercentColor(jzzzl)}`}>
                            {toPercentString(jzzzl, true)}
                          </p>
                        </div>}
                        { !editing && <div>
                          <p>{gz}</p>
                          <p className={`bold ${toPercentColor(gzzzl)}`}>
                            {toPercentString(gzzzl, true)}
                          </p>
                        </div>}
                        { !editing && (updated
                          ? <div className={`bold ${toNumberColor((jz - jz / (1 + jzzzl / 100)) * hold)}`}>
                            {((jz - jz / (1 + jzzzl / 100)) * hold).toFixed(2)}
                          </div>
                          : <div className={`bold ${toNumberColor((gz - jz) * hold)}`}>
                            {((gz - jz) * hold).toFixed(2)}
                          </div>)}

                        { editing && <div>
                          <input
                            type="text"
                            className={styles.edit_input}
                            defaultValue={hold}
                            onChange={(e) => onHoldChange(code, 'hold', e.target.value)}
                          />
                        </div>}
                        { editing && <div>
                          <input
                            type="text"
                            className={styles.edit_input}
                            defaultValue={cost}
                            onChange={(e) => onHoldChange(code, 'cost', e.target.value)}
                          />
                        </div>}
                        { editing && <div>
                          <span className={styles.delete_button} onClick={() => onDelete(code)}>🗑️</span>
                        </div>}
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
            <span>老铁，基金都被你删没了~ 赶紧添加你看好的基金吧！</span>
          </div>
        </div>
      }

      <div className={styles.list_footer}>
        <div className={styles.list_line}>
          <div className="tl">汇总</div>

          {!editing && <div className={styles.chart}></div>}

          <div>
            {fundList.totalMoney.toFixed(2)}
          </div>
          <div>
            <p className={`bold ${toNumberColor(fundList.totalGained)}`}>
              {fundList.totalGained.toFixed(2)}
            </p>
            <p className={`bold ${toNumberColor(fundList.totalGained)}`}>
              {fundList.totalPercent}
            </p>
          </div>

          {!editing && <div></div>}
          {!editing && <div></div>}
          {!editing && <div>
            <p className={`bold ${toNumberColor(fundList.totalGainedExpected)}`}>{fundList.totalGainedExpected.toFixed(2)}</p>
          </div>}

          {editing ? <div></div> : null}
          {editing ? <div></div> : null}
          {editing ? <div></div> : null}
        </div>
      </div>
    </div>

    <Version product={PRODUCT} version={VERSION} />
  </div>;
}
