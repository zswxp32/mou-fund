import React, { useCallback } from 'react';
import styles from './index.module.scss';

type VersionProps = {
  product: string,
  version: string,
};

export const Version: React.FC<VersionProps> = ({ product, version }: VersionProps) => {
  const feecBack = useCallback(() => {
    window.open('https://github.com/zswxp32/mou-fund/issues');
  }, []);

  return <div className={styles.version}>
    <div>{product}</div>
    <div>v{version}</div>
    <div className={styles.feedback} onClick={feecBack}>反馈</div>
  </div>;
}