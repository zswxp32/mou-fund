import React from 'react';

import { LoadStatus } from '@Type/index';
import { BlockLoading } from '@Component/Loading';

import styles from './index.module.scss';

type OnAddClick = (code: string) => void;

export type SearchResultProps = {
  status: LoadStatus,
  list: any[],
  onAddClick: OnAddClick,
}

export const SearchResult: React.FC<SearchResultProps> = ({ status, list, onAddClick }: SearchResultProps) => {
  if (status === LoadStatus.loading) return <div className={styles.search_result}>
    <BlockLoading />
  </div>;

  if (list.length === 0) {
    return <div className={styles.search_result}>
      <div className={styles.no_result}><span>未搜索到相关基金</span></div>
    </div>;
  }

  return <div className={styles.search_result}>
    <ul>
      {list.map(item =>
        <li key={item.CODE}>
          <span className={styles.code}>{item.CODE}</span>
          <span className={styles.name}>{item.NAME}</span>
          <span className={styles.add} onClick={() => onAddClick(item.CODE)}>＋</span>
        </li>
      )}
    </ul>
  </div>;
};
