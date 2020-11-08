import { FundHold } from "../service/storage";

export const toPercentString = (value: string | number, percent = false) : string => {
  if (value === '--') return value;
  const temp: number = typeof value === 'string' ? parseFloat(value) : value;
  if (temp == 0) return percent ? '0.00%' : '0.00';
  const result = temp > 0 ? `+${temp.toFixed(2)}` : temp.toFixed(2);
  return percent ? `${result}%` : result;
};

export const toPercentColor = (value: string | number): string => {
  if (value === '--' || value === null) return 'grey';
  const temp: number = typeof value === 'string' ? parseFloat(value) : value;
  if (temp == 0) return 'grey';
  return temp > 0 ? 'red' : 'green';
};

export const toNumberColor = (value: number): string => {
  if (value == 0) return 'grey';
  return value > 0 ?  'red' : 'green';
}

export const toGainPercentString = (current: number, cost: number, percent = false): string | number => {
  if (cost === 0) return null;
  const perc: number  = 100 * (current - cost) / cost;
  if (percent) return toPercentString(perc, true);
  return perc;
};

export const toGsMoney = (item: any, hold: FundHold): number => {
  return 1;
};

export const toSjMoney = (item: any, hold: FundHold): number => {
  return 2;
};