import React from 'react';
import styles from './index.module.scss';

export type SwitchProps = {
  options: string[];
  selected: string;
  onSwitch: () => void;
};

export const Switch: React.FC<SwitchProps> = ({ options, selected, onSwitch }: SwitchProps) => {
  const index = options.indexOf(selected);

  return <div className={`${styles.switch} mr5`} onClick={onSwitch}>
    <span className={`${styles.left} ${index === 0 ? styles.selected : ''}`}>{options[0]}</span>
    <span className={`${styles.right} ${index === 1 ? styles.selected : ''}`}>{options[1]}</span>
  </div>;
}