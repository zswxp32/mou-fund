import React from 'react';
import { memo } from 'react';
import { BlockLoading } from '../../component/Loading';

import styles from './index.module.scss';

type SearchResultProps = {
  list: any,
  onItemClick: any,
}

const SearchResult = memo<SearchResultProps>(({ list, onItemClick }: SearchResultProps) => {
  if (list === null) return <div className={styles.search_result}>
    <BlockLoading />
  </div>;

  if (list.length === 0) {
    return <div className={styles.search_result}>
      <div className={styles.no_result}><span>未搜索到相关基金</span></div>
    </div>;
  }

  return <div className={styles.search_result}>
    <ul>
      {
        list.map(item =>
          <li key={item.CODE}>
            <span className={styles.code}>{item.CODE}</span>
            <span className={styles.name}>{item.NAME}</span>
            <span className={styles.add} onClick={() => onItemClick(item.CODE)}>＋</span>
          </li>
        )
      }
    </ul>
  </div>;
});

export default SearchResult;
