import React from 'react';
import styles from './index.module.scss';
import { useHistory } from "react-router-dom";

export function Back() {
  const history = useHistory();

  return <div className={styles.back}>
    <span className="button" onClick={() => history.goBack()}>
      {'< 返回'}
    </span>
  </div>;
}