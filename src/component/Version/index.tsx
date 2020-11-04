import React from 'react';
import styles from './index.module.scss';

export function Version({ version }) {
  return <div className={styles.version}>
    <span>大牛基金助手</span>
    <span>Version {version}</span>
    <span className={styles.feedback}>反馈</span>
  </div>;
}