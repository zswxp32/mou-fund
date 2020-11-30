import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FundsMode } from '@Type/index';
import { Switch } from '@Component/Switch';

import { Dispatch, RootState } from '../../store';
import { SearchResult } from '../SearchResult';
import styles from './index.module.scss';

export const ToolBar: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const { searchStr, searchBoxShow, searchResult, searchStatus } = useSelector(
    (state: RootState) => state.toolBar
  );
  const { editing, codes, mode } = useSelector(
    (state: RootState) => state.funds,
    (prev, next) =>
      prev.editing === next.editing
      && prev.codes.length === next.codes.length
      && prev.mode === next.mode
  );
  
  const onModeSwitch = () => {
    dispatch.funds.switchMode();
  }

  const onEditClick = () => {
    dispatch.funds.switchEditing();
  };

  const onRefreshClick = () => {
    dispatch.stockIndexs.load();
    dispatch.funds.loadFunds();
    dispatch.funds.loadTrends();
  };

  const onSearchInputChange = (e) => {
    const str = e.target.value.trim();
    if (str === '') {
      dispatch.toolBar.resetSearch();
      return;
    }
    dispatch.toolBar.startSearch(str);
  };

  const onSearchCancleClick = () => {
    dispatch.toolBar.resetSearch();
  };

  const onAddClick = (code: string) => {
    dispatch.toolBar.resetSearch();
    dispatch.funds.loadFundAndAdd(code);
  };

  return <div className={styles.tool_bar}>
    <div className={styles.search}>
      <input type="text" className={styles.search_input} value={searchStr}
        placeholder="请输入基金代码/名称进行搜索"
        onChange={onSearchInputChange} />
      {searchStr && <span className={styles.search_cancle} onClick={onSearchCancleClick}>×</span>}
    </div>
    {searchBoxShow && <SearchResult status={searchStatus} list={searchResult} onAddClick={onAddClick} />}
    {codes.length > 0 && <div className={styles.tools}>
      {!editing && <Switch
        options={['标准', '简洁']}
        selected={mode === FundsMode.simplify ? '简洁' : '标准'}
        onSwitch={onModeSwitch}
      />}
      <span className="button mr5" onClick={onEditClick}>
        {!editing ? '编辑' : '完成'}
      </span>
      {!editing && <span className="button" onClick={onRefreshClick}>刷新</span>}
    </div>}
  </div>;
}
