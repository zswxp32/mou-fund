import React, { useCallback, useState } from 'react';
import styles from './index.module.scss';

import qrImg from  '../../images/qun-qr.jpg';

export function Version({ product, version }: any) {
  const [showQr, setShowQr] = useState(false);

  const feecBack = useCallback(() => {
    window.open('https://github.com/zswxp32/mou-fund/issues');
  }, []);

  const toggleQr = useCallback((show: boolean): void => {
    setShowQr(show);
  }, []);

  return <div className={styles.version}>
    <div>{product}</div>
    <div>v{version}</div>
    <div
      className={styles.feedback}
      onClick={feecBack}
      onMouseEnter={() => toggleQr(true)}
      onMouseLeave={() => toggleQr(false)}
    >
      反馈
      {/* { showQr && <div className={styles.qr_pop}>
        <img src={qrImg} />
        <p>扫一扫加入反馈群</p>
      </div>} */}
    </div>
  </div>;
}