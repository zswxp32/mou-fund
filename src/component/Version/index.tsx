import React, { useCallback } from 'react';
import styles from './index.module.scss';

export function Version({ product, version }) {
  const feecBack = useCallback(() => {
    window.open('https://github.com/zswxp32/mou-fund/issues');
  }, []);

  return <div className={styles.version}>
    <span>{product}</span>
    <span>v{version}</span>
    <span className={styles.feedback} onClick={feecBack}>反馈</span>
  </div>;
}