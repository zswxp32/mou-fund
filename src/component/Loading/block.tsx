import React from 'react';
import styles from './block.module.scss';

export function BlockLoading({ width = "100%", height = "100%" }) {
  return <div className={styles.block_loading} style={{ width, height }}>
    <div className={styles.block_loading_circle}></div>
  </div>;
}