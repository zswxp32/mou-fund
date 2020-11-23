export const toPercentString = (value: string | number, percent = false): string => {
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
  if (value == null || value === 0) return 'grey';
  return value > 0 ? 'red' : 'green';
}

export const toNumberPN = (value: number): string => {
  if (value == null || value === 0) return `0.00`;
  return value > 0 ? `+${value.toFixed(2)}` : `${value.toFixed(2)}`;
}

const _min3Str = (value: number) : string => {
  if (value < 10) {
    return value.toFixed(2);
  } else if (value >= 10 && value < 100) {
    return value.toFixed(1);
  } else if (value > 100 && value < 1000) {
    return value.toFixed(0)
  }
}

export const toNumberBadge = (value: number): [string, string] => {
  const pn = value > 0 ? 1 : -1;
  const num = Math.abs(value);
  let numStr = '0';
  const colorStr = pn >= 0 ? '#F56C6C' : '#4eb61b';

  const K = 1000;
  const M = 1000 * 1000;
  const B = 1000 * 1000 * 1000;
  const T = 1000 * 1000 * 1000 * 1000;

  if (value !== 0) {
    if (num < K) {
      numStr = _min3Str(num);
    } else if (num >= K && num < M) {
      numStr = `${_min3Str(num / K)}k`;
    } else if (num >= M && num < B) {
      numStr = `${_min3Str(num / M)}m`;
    } else if (num >= B && num < T) {
      numStr = `${_min3Str(num / B)}b`;
    } else {
      numStr = `别闹`;
    }
  }

  return [numStr, colorStr];
};