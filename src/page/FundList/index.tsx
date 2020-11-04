import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { useLatest } from '../../util/hooks';
import { toPercentString, toPercentColor } from '../../util/number';
import { PageLoading } from '../../component/Loading';
import { ChartMini } from '../../component/Chart';
import { Version } from '../../component/Version';
import SearchResult from '../../component/SearchResult';
import EastMoneyService from '../../service/eastmoney';
import StorageService from '../../service/storage';

import '../../style/global.scss';
import styles from './index.module.scss';

export default function PageFundList() {
  const [editing, setEditing] = useState(false);
  const [searchStr, setSearchStr] = useState('');
  const [searchList, setSearchList] = useState(null);
  const [searchBoxShow, setSearchBoxShow] = useState(false);

  const [fundIds, setFundIds] = useState(StorageService.getFundIds());
  const [fundList, setFundList] = useState(null);
  const [fundGzDetails, setFundGzDetails] = useState({});

  const fundGzDetailsLatest = useLatest(fundGzDetails);

  useEffect(() => {
    const loadList = async () => {
      let list = [];
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

    const listCopyed = Array.from(fundList);
    const [removed] = listCopyed.splice(result.source.index, 1);
    listCopyed.splice(result.destination.index, 0, removed);

    setFundList(listCopyed);
    StorageService.resetFundIds(listCopyed.map((item: any) => item.FCODE));
  }, [fundList]);

  const onSearchChange = useCallback((e) => {
    setSearchStr(e.target.value);
  }, []);

  const onSearchCancle = useCallback((e) => {
    setTimeout(() => setSearchStr(''), 100);
  }, []);

  const onSearchItemClick = useCallback((fundId) => {
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
        <span className={styles.search_cancle} onClick={onSearchCancle}>×</span>
      </div>
      {searchBoxShow
        ? <SearchResult list={searchList} onItemClick={onSearchItemClick} />
        : null
      }
      {fundList.length > 0
        ? <div className={styles.buttons}>
          <span className="button" onClick={() => onEditClick(!editing)}>
            {!editing ? '编辑' : '完成'}
          </span>
          <span className="button" onClick={onRefreshClick}>刷新</span>
        </div>
        : null
      }
    </div>

    <div className={styles.list}>
      <div className={styles.list_header}>
        <div className={styles.list_line}>
          <div className="tl">基金</div>
          <div className={styles.chart}>涨跌走势图</div>
          <div>净值</div>
          <div>估值</div>
          {editing ? <div>删除</div> : null}
        </div>
      </div>

      {fundList.length > 0
        ? <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div
                className={styles.list_body}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {fundList.map((item, index) => (
                  <Draggable
                    key={item.FCODE}
                    draggableId={item.FCODE}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        className={`${styles.list_line} ${index % 2 === 0 ? styles.even : styles.odd}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div>
                          <p className="bold">
                            <Link className={styles.fund_link} to={`/fund/detail/${item.FCODE}`}>
                              {item.SHORTNAME}
                            </Link>
                          </p>
                          <p>{item.FCODE}</p>
                        </div>
                        <div className={styles.chart} style={{ fontSize: 0 }}>
                          <ChartMini fundId={item.FCODE} fundGzDetail={fundGzDetails[item.FCODE]} />
                        </div>
                        <div>
                          <p>{item.NAV}</p>
                          <p className={`bold ${toPercentColor(item.NAVCHGRT)}`}>{toPercentString(item.NAVCHGRT, true)}</p>
                        </div>
                        <div>
                          <p>{item.GSZ}</p>
                          <p className={`bold ${toPercentColor(item.GSZZL)}`}>
                            {toPercentString(item.GSZZL, true)}
                          </p>
                        </div>
                        { editing && <div>
                          <span className={styles.delete_button} onClick={() => onDelete(item.FCODE)}>
                            🗑️
                            </span>
                        </div>}
                      </div>
                    )}
                  </Draggable>
                ))}
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
    </div>
  
    <Version version={'1.0.0'}/>
  </div>;
}
