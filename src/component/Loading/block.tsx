import React, { ReactElement } from 'react';
import styles from './block.module.scss';

type BlockLoadingProps = {
  width?: string,
  height?: string,
}

export function BlockLoading({ width = "100%", height = "100%" }: BlockLoadingProps): ReactElement {
  return <div className={styles.block_loading} style={{ width, height }}>
    <div className={styles.block_loading_circle}></div>
  </div>;
}