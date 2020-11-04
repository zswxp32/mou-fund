import React, { useCallback } from 'react';
import styles from './index.module.scss';

export function Version({ version }) {
  const feecBack = useCallback(() => {
    window.open('https://github.com/zswxp32/mou-fund/issues');
  }, []);

  return <div className={styles.version}>
    <span>大牛基金助手</span>
    <span>Version {version}</span>
    <span className={styles.feedback} onClick={feecBack}>反馈</span>
  </div>;
}